import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import {
  FileSpreadsheet, FileText, Filter, Users, Clock, Award,
  TrendingUp, Search, ChevronDown, ChevronUp, MapPin, BarChart3, X,
  GraduationCap, AlertCircle, Calendar, CheckCircle
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useLegacyDataBridge } from '../hooks/useLegacyDataBridge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

type TabReporte = 'resumen' | 'detalle' | 'docentes' | 'registros';

const CARRERA_COLORS: Record<string, string> = {
  IMS: '#2E7D32',
  IEL: '#1565C0',
  ICE: '#6A1B9A',
  IEM: '#00838F',
  IME: '#F57F17',
  IGI: '#C62828',
  LCM: '#EF6C00',
  LAF: '#283593',
};

const getCarreraColor = (carrera: string) => {
  const code = carrera.split(' - ')[0];
  return CARRERA_COLORS[code] || '#66BB6A';
};

export const Reportes: React.FC = () => {
  const { user } = useAuth();
  const { mockEstudiantes, mockDocentes, mockRegistrosHoras, Periodos, areas, isLoading, error } = useLegacyDataBridge();
  const [filterCarrera, setFilterCarrera] = useState('todas');
  const [filterPeriodo, setFilterPeriodo] = useState('todos');
  const [filterArea, setFilterArea] = useState('todas');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState<TabReporte>('resumen');
  const [sortField, setSortField] = useState<'nombre' | 'horas' | 'progreso'>('nombre');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const isJefatura = user?.role === 'jefatura';
  const carrerasJefe = user?.carrerasAsignadas || (user?.carrera ? [user.carrera] : []);

  const handleExportPDF = () => toast.success('Reporte PDF generado exitosamente', { description: 'El archivo se descargará en breve.' });
  const handleExportExcel = () => toast.success('Reporte Excel generado exitosamente', { description: 'El archivo se descargará en breve.' });

  // Base data: for jefatura, only Asistencia Docente + their careers
  const baseEstudiantes = useMemo(() => {
    if (isJefatura) {
      return mockEstudiantes.filter(e =>
        e.areaActual === 'Asistencia Docente' && carrerasJefe.includes(e.carrera)
      );
    }
    return mockEstudiantes;
  }, [isJefatura, carrerasJefe]);

  const baseDocentes = useMemo(() => {
    if (isJefatura) {
      return mockDocentes.filter(doc =>
        doc.area === 'Asistencia Docente' &&
        doc.carrerasAsignadas?.some(c => carrerasJefe.includes(c))
      );
    }
    return mockDocentes;
  }, [isJefatura, carrerasJefe]);

  const baseRegistros = useMemo(() => {
    const estudianteIds = new Set(baseEstudiantes.map(e => e.id));
    return mockRegistrosHoras.filter(r => estudianteIds.has(r.estudianteId));
  }, [baseEstudiantes]);

  // Available carreras for filters (only what's in baseEstudiantes)
  const availableCarreras = useMemo(() => {
    return [...new Set(baseEstudiantes.map(e => e.carrera))].sort();
  }, [baseEstudiantes]);

  const filteredEstudiantes = useMemo(() => {
    return baseEstudiantes.filter(e => {
      const matchesCarrera = filterCarrera === 'todas' || e.carrera === filterCarrera;
      const matchesPeriodo = filterPeriodo === 'todos' || e.Periodo === filterPeriodo;
      const matchesArea = filterArea === 'todas' || e.areaActual === filterArea;
      const matchesEstado = filterEstado === 'todos' || e.estado === filterEstado;
      const matchesBusqueda = !busqueda ||
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.matricula.toLowerCase().includes(busqueda.toLowerCase());
      return matchesCarrera && matchesPeriodo && matchesArea && matchesEstado && matchesBusqueda;
    });
  }, [baseEstudiantes, filterCarrera, filterPeriodo, filterArea, filterEstado, busqueda]);

  const sortedEstudiantes = useMemo(() => {
    return [...filteredEstudiantes].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'nombre') cmp = a.nombre.localeCompare(b.nombre);
      else if (sortField === 'horas') cmp = a.horasAcumuladas - b.horasAcumuladas;
      else cmp = (a.horasAcumuladas / a.horasRequeridas) - (b.horasAcumuladas / b.horasRequeridas);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredEstudiantes, sortField, sortDir]);

  // Stats
  const totalHoras = filteredEstudiantes.reduce((acc, e) => acc + e.horasAcumuladas, 0);
  const completados = filteredEstudiantes.filter(e => e.estado === 'completado').length;
  const activos = filteredEstudiantes.filter(e => e.estado === 'activo').length;
  const enRiesgo = filteredEstudiantes.filter(e => {
    const prog = (e.horasAcumuladas / e.horasRequeridas) * 100;
    return prog < 30 && e.estado === 'activo';
  }).length;
  const promedioProgreso = filteredEstudiantes.length > 0
    ? Math.round(filteredEstudiantes.reduce((s, e) => s + (e.horasAcumuladas / e.horasRequeridas) * 100, 0) / filteredEstudiantes.length)
    : 0;

  // Chart: hours per student (bar)
  const horasPorEstudiante = useMemo(() => {
    return [...filteredEstudiantes]
      .sort((a, b) => b.horasAcumuladas - a.horasAcumuladas)
      .slice(0, 8)
      .map(e => ({
        id: e.id,
        nombre: e.nombre.split(' ').slice(0, 2).join(' '),
        nombreFull: e.nombre,
        horas: e.horasAcumuladas,
        meta: e.horasRequeridas,
        progreso: Math.round((e.horasAcumuladas / e.horasRequeridas) * 100),
        fill: getCarreraColor(e.carrera),
      }));
  }, [filteredEstudiantes]);

  // Chart: distribution by career (pie)
  const distribucionCarrera = useMemo(() => {
    const map = new Map<string, number>();
    filteredEstudiantes.forEach(e => {
      const code = e.carrera.split(' - ')[0];
      map.set(code, (map.get(code) || 0) + 1);
    });
    return Array.from(map.entries()).map(([code, count]) => ({
      name: code,
      value: count,
      fill: CARRERA_COLORS[code] || '#66BB6A',
    }));
  }, [filteredEstudiantes]);

  // Docentes with their student data
  const docentesConInfo = useMemo(() => {
    return baseDocentes.map(doc => {
      const estudiantesDoc = baseEstudiantes.filter(e => e.docenteResponsableId === doc.id);
      const totalH = estudiantesDoc.reduce((s, e) => s + e.horasAcumuladas, 0);
      const avgProg = estudiantesDoc.length > 0
        ? Math.round(estudiantesDoc.reduce((s, e) => s + (e.horasAcumuladas / e.horasRequeridas) * 100, 0) / estudiantesDoc.length)
        : 0;
      return { ...doc, estudiantesDoc, totalHoras: totalH, promedioProg: avgProg };
    });
  }, [baseDocentes, baseEstudiantes]);

  // Filtered registros
  const registrosFiltrados = useMemo(() => {
    const ids = new Set(filteredEstudiantes.map(e => e.id));
    return baseRegistros.filter(r => ids.has(r.estudianteId));
  }, [baseRegistros, filteredEstudiantes]);

  const registrosPendientes = registrosFiltrados.filter(r => r.estado === 'pendiente').length;
  const registrosAprobados = registrosFiltrados.filter(r => r.estado === 'aprobada').length;
  const registrosRechazados = registrosFiltrados.filter(r => r.estado === 'rechazada').length;

  const hasActiveFilters = filterCarrera !== 'todas' || filterPeriodo !== 'todos' || filterArea !== 'todas' || filterEstado !== 'todos' || busqueda !== '';

  const clearFilters = () => {
    setFilterCarrera('todas');
    setFilterPeriodo('todos');
    setFilterArea('todas');
    setFilterEstado('todos');
    setBusqueda('');
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    sortField === field
      ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
      : <ChevronDown className="w-3 h-3 text-gray-300" />
  );

  const BarTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
          <p className="font-semibold text-gray-800">{d.nombreFull}</p>
          <p className="text-[#2E7D32]">{d.horas}/{d.meta}h ({d.progreso}%)</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
          <p className="font-semibold text-gray-800">{d.name}</p>
          <p style={{ color: d.fill }}>{d.value} estudiante{d.value !== 1 ? 's' : ''}</p>
        </div>
      );
    }
    return null;
  };

  // Period info helper
  const getPeriodoInfo = (horas: number) => {
    if (horas <= 50) return { periodo: 1, horasPeriodo: horas };
    if (horas <= 100) return { periodo: 2, horasPeriodo: horas - 50 };
    return { periodo: 3, horasPeriodo: horas - 100 };
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando reportes...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-white/70" />
              <p className="text-white/70 text-sm">
                {isJefatura ? 'Jefatura de Carrera · Asistencia Docente' : 'Bienestar Estudiantil'}
              </p>
            </div>
            <h2 className="text-2xl font-bold">Reportes y Estadísticas</h2>
            <p className="text-white/80 text-sm mt-1">
              {isJefatura
                ? `Carreras: ${carrerasJefe.map(c => c.split(' - ')[0]).join(' / ')} · ${baseEstudiantes.length} becados en Asistencia Docente`
                : `${baseEstudiantes.length} estudiantes becados · Periodo ENE-ABR 2026`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} className="bg-white/15 hover:bg-white/25 text-white border-white/20 gap-2" variant="outline">
              <FileText className="w-4 h-4" />
              PDF
            </Button>
            <Button onClick={handleExportExcel} className="bg-white/15 hover:bg-white/25 text-white border-white/20 gap-2" variant="outline">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 mr-1">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filtros:</span>
            </div>

            {/* Carrera filter - only if more than 1 carrera available */}
            {availableCarreras.length > 1 && (
              <div className="w-52">
                <Select value={filterCarrera} onValueChange={setFilterCarrera}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las carreras</SelectItem>
                    {availableCarreras.map(c => (
                      <SelectItem key={c} value={c}>{c.split(' - ')[0]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="w-44">
              <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Periodos.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Area filter only for non-jefatura (jefatura is always Asistencia Docente) */}
            {!isJefatura && (
              <div className="w-48">
                <Select value={filterArea} onValueChange={setFilterArea}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las áreas</SelectItem>
                    {areas.map(a => <SelectItem key={a.id} value={a.nombre}>{a.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="w-36">
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="completado">Completados</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar estudiante..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 h-9 gap-1">
                <X className="w-3.5 h-3.5" />
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Becados', value: filteredEstudiantes.length, icon: Users, color: '#2E7D32', bg: 'bg-[#2E7D32]/10' },
          { label: 'Activos', value: activos, icon: TrendingUp, color: '#43A047', bg: 'bg-green-100' },
          { label: 'Completados', value: completados, icon: Award, color: '#1565C0', bg: 'bg-blue-100' },
          { label: 'En Riesgo', value: enRiesgo, icon: AlertCircle, color: '#E65100', bg: 'bg-orange-100' },
          { label: 'Total Horas', value: `${totalHoras}h`, icon: Clock, color: '#66BB6A', bg: 'bg-[#66BB6A]/10' },
          { label: 'Promedio', value: `${promedioProgreso}%`, icon: BarChart3, color: '#F57F17', bg: 'bg-amber-100' },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-white border-none shadow-sm">
            <CardContent className="p-3 flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1.5 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
        {([
          { key: 'resumen' as TabReporte, label: 'Resumen', icon: BarChart3 },
          { key: 'detalle' as TabReporte, label: 'Detalle por Estudiante', icon: Users },
          { key: 'docentes' as TabReporte, label: 'Por Docente', icon: GraduationCap },
          { key: 'registros' as TabReporte, label: 'Registros', icon: Calendar },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
              tab === t.key
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ============ TAB: RESUMEN ============ */}
      {tab === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart - hours per student */}
            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3">
                <CardTitle className="text-[#2E7D32] text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Horas Acumuladas por Estudiante
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-2 px-2">
                {horasPorEstudiante.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={horasPorEstudiante} margin={{ top: 5, right: 15, left: -5, bottom: 60 }} layout="horizontal">
                      <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: '#616161' }} stroke="#E0E0E0" angle={-40} textAnchor="end" interval={0} height={70} />
                      <YAxis stroke="#E0E0E0" tick={{ fontSize: 11, fill: '#9E9E9E' }} domain={[0, 150]} />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(46,125,50,0.06)' }} />
                      <Bar dataKey="horas" radius={[6, 6, 0, 0]} isAnimationActive={false} fillOpacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-400">Sin datos</div>
                )}
              </CardContent>
            </Card>

            {/* Pie chart - distribution by carrera */}
            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3">
                <CardTitle className="text-[#2E7D32] text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Distribución por Carrera
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                {distribucionCarrera.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={distribucionCarrera}
                        cx="50%"
                        cy="45%"
                        outerRadius={100}
                        innerRadius={50}
                        dataKey="value"
                        nameKey="name"
                        isAnimationActive={false}
                        strokeWidth={2}
                        stroke="#fff"
                        id="pie-carrera"
                      >
                        {distribucionCarrera.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend
                        formatter={(value: string) => {
                          const item = distribucionCarrera.find(d => d.name === value);
                          return `${value}: ${item?.value ?? 0}`;
                        }}
                        iconType="circle"
                        iconSize={10}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-400">Sin datos</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress overview + ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General progress summary */}
            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3">
                <CardTitle className="text-[#2E7D32] text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Progreso General
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Horas totales acumuladas</p>
                    <p className="text-3xl font-bold text-[#2E7D32]">{totalHoras}<span className="text-lg text-gray-400 ml-1">/ {filteredEstudiantes.length * 150}h</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-[#2E7D32]">{promedioProgreso}%</p>
                    <p className="text-xs text-gray-500">promedio</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#1B5E20] to-[#66BB6A] transition-all duration-500"
                    style={{ width: `${Math.min(promedioProgreso, 100)}%` }}
                  />
                </div>

                {/* Registros breakdown */}
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Resumen de Registros</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-xs text-gray-500">Pendientes</p>
                      <p className="text-xl font-bold text-amber-600">{registrosPendientes}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-xs text-gray-500">Aprobados</p>
                      <p className="text-xl font-bold text-green-600">{registrosAprobados}</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-xl border border-red-200">
                      <p className="text-xs text-gray-500">Rechazados</p>
                      <p className="text-xl font-bold text-red-600">{registrosRechazados}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top performers */}
            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3">
                <CardTitle className="text-[#2E7D32] text-base flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Ranking de Estudiantes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {[...filteredEstudiantes]
                    .sort((a, b) => (b.horasAcumuladas / b.horasRequeridas) - (a.horasAcumuladas / a.horasRequeridas))
                    .slice(0, 6)
                    .map((est, i) => {
                      const prog = (est.horasAcumuladas / est.horasRequeridas) * 100;
                      const medals = ['🥇', '🥈', '🥉'];
                      const periodo = getPeriodoInfo(est.horasCompletadas);
                      return (
                        <div key={est.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-7 h-7 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {i < 3 ? medals[i] : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{est.nombre}</p>
                            <p className="text-[10px] text-gray-500">{est.carrera.split(' - ')[0]} · {est.cursoAsignado || 'Sin curso'} · P{periodo.periodo}</p>
                          </div>
                          <div className="w-20 flex-shrink-0">
                            <Progress value={prog} className="h-1.5" />
                          </div>
                          <div className="text-right flex-shrink-0 w-14">
                            <p className="text-xs font-bold text-[#2E7D32]">{est.horasAcumuladas}h</p>
                            <p className="text-[10px] text-gray-400">{Math.round(prog)}%</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students at risk */}
          {enRiesgo > 0 && (
            <Card className="bg-white border-none shadow-sm border-l-4 border-l-orange-400">
              <CardHeader className="border-b bg-orange-50 pb-3">
                <CardTitle className="text-orange-700 text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Estudiantes en Riesgo ({enRiesgo})
                  <span className="text-xs font-normal text-orange-500 ml-2">Menos del 30% de progreso</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredEstudiantes
                    .filter(e => (e.horasAcumuladas / e.horasRequeridas) * 100 < 30 && e.estado === 'activo')
                    .map(est => {
                      const prog = (est.horasAcumuladas / est.horasRequeridas) * 100;
                      return (
                        <div key={est.id} className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-xl border border-orange-200">
                          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs flex-shrink-0">
                            {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{est.nombre}</p>
                            <p className="text-xs text-gray-500">{est.matricula} · {est.carrera.split(' - ')[0]} · Responsable: {est.docenteResponsable}</p>
                          </div>
                          <Badge variant="outline" className="bg-white text-orange-600 border-orange-300 text-xs flex-shrink-0">
                            {est.horasAcumuladas}h · {Math.round(prog)}%
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ============ TAB: DETALLE POR ESTUDIANTE ============ */}
      {tab === 'detalle' && (
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3">
            <CardTitle className="text-[#2E7D32] text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Reporte Detallado
              </span>
              <Badge className="bg-[#2E7D32] text-white">{sortedEstudiantes.length} estudiantes</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('nombre')}>
                      <div className="flex items-center gap-1">Estudiante <SortIcon field="nombre" /></div>
                    </TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Carrera</TableHead>
                    <TableHead>Docente</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('progreso')}>
                      <div className="flex items-center gap-1">Progreso <SortIcon field="progreso" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('horas')}>
                      <div className="flex items-center gap-1">Horas <SortIcon field="horas" /></div>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEstudiantes.map((est) => {
                    const prog = est.horasRequeridas > 0 ? (est.horasAcumuladas / est.horasRequeridas) * 100 : 0;
                    const periodo = getPeriodoInfo(est.horasCompletadas);
                    return (
                      <TableRow key={est.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <p className="font-medium text-gray-800 text-sm">{est.nombre}</p>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-600">{est.matricula}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs" style={{ color: getCarreraColor(est.carrera), borderColor: getCarreraColor(est.carrera) }}>
                            {est.carrera.split(' - ')[0]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{est.docenteResponsable || '—'}</TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-[140px] truncate">{est.cursoAsignado || '—'}</TableCell>
                        <TableCell>
                          <span className="text-xs text-gray-600">P{periodo.periodo} · {periodo.horasPeriodo}/50h</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={prog} className="h-1.5 flex-1" />
                            <span className="text-xs font-bold text-[#2E7D32] w-9 text-right">{Math.round(prog)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-gray-700">{est.horasAcumuladas}/{est.horasRequeridas}</span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={est.estado} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {sortedEstudiantes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                        <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p>No hay estudiantes que coincidan con los filtros</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============ TAB: POR DOCENTE ============ */}
      {tab === 'docentes' && (
        <div className="space-y-4">
          {docentesConInfo.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center text-gray-400">
                <GraduationCap className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No hay docentes para mostrar</p>
              </CardContent>
            </Card>
          ) : (
            docentesConInfo.map(doc => (
              <Card key={doc.id} className="bg-white border-none shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#E8F5E9] to-white">
                  <div className="w-11 h-11 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {doc.nombre.split(' ').slice(-2).map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{doc.nombre}</h3>
                    <p className="text-xs text-gray-500">
                      {doc.area}{doc.subarea ? ` · ${doc.subarea}` : ''} · {doc.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Estudiantes</p>
                      <p className="text-lg font-bold text-[#2E7D32]">{doc.estudiantesDoc.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Horas</p>
                      <p className="text-lg font-bold text-[#66BB6A]">{doc.totalHoras}h</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Progreso</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-amber-600">{doc.promedioProg}%</p>
                        <div className="w-16">
                          <Progress value={doc.promedioProg} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {doc.estudiantesDoc.length > 0 && (
                  <div className="divide-y divide-gray-50">
                    {doc.estudiantesDoc.map(est => {
                      const prog = (est.horasAcumuladas / est.horasRequeridas) * 100;
                      const periodo = getPeriodoInfo(est.horasCompletadas);
                      return (
                        <div key={est.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
                            {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{est.nombre}</p>
                            <p className="text-xs text-gray-500">{est.matricula} · {est.carrera.split(' - ')[0]} · {est.cursoAsignado || 'Sin curso'}</p>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="text-xs text-gray-500">P{periodo.periodo}</span>
                            <span className="text-sm font-semibold text-gray-700">{est.horasAcumuladas}/{est.horasRequeridas}h</span>
                            <div className="w-16">
                              <Progress value={prog} className="h-1.5" />
                            </div>
                            <span className="text-xs font-bold w-8 text-right text-[#2E7D32]">{Math.round(prog)}%</span>
                            <StatusBadge status={est.estado} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* ============ TAB: REGISTROS ============ */}
      {tab === 'registros' && (
        <div className="space-y-6">
          {/* Registros stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-amber-50 border-amber-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-amber-700">Pendientes de Validación</p>
                  <p className="text-2xl font-bold text-amber-600">{registrosPendientes}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-700">Aprobados</p>
                  <p className="text-2xl font-bold text-green-600">{registrosAprobados}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-red-700">Rechazados</p>
                  <p className="text-2xl font-bold text-red-600">{registrosRechazados}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registros table */}
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3">
              <CardTitle className="text-[#2E7D32] text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Últimos Registros de Horas
                </span>
                <Badge className="bg-[#2E7D32] text-white">{registrosFiltrados.length} registros</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80">
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrosFiltrados
                      .sort((a, b) => b.fecha.localeCompare(a.fecha))
                      .slice(0, 20)
                      .map(reg => (
                        <TableRow key={reg.id} className="hover:bg-gray-50/50">
                          <TableCell className="text-sm text-gray-600 whitespace-nowrap">{reg.fecha}</TableCell>
                          <TableCell>
                            <p className="font-medium text-gray-800 text-sm">{reg.estudianteNombre}</p>
                            <p className="text-xs text-gray-500">{reg.carrera.split(' - ')[0]}</p>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-[240px] truncate">{reg.descripcion}</TableCell>
                          <TableCell className="text-sm text-gray-500 whitespace-nowrap">{reg.horaInicio} - {reg.horaFin}</TableCell>
                          <TableCell>
                            <span className="font-semibold text-[#2E7D32]">{reg.totalHoras}h</span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={reg.estado} />
                          </TableCell>
                        </TableRow>
                      ))}
                    {registrosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                          <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          <p>No hay registros para mostrar</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
