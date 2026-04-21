import React, { useState, useMemo } from 'react';
import {
  Users, Clock, CheckCircle, AlertCircle, TrendingUp, Search,
  Eye, Mail, Building2, GraduationCap, Target, ChevronDown,
  ArrowUpDown, Layers, ClipboardList, UserCheck, UserX, Percent,
  MapPin, BookOpen, Calendar, X, Award, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { StatusBadge } from '../components/shared/StatusBadge';
import { useLegacyDataBridge } from '../hooks/useLegacyDataBridge';

// ─── Color maps ───
const AREA_COLORS: Record<string, string> = {
  'Asistencia Docente': '#2E7D32', 'Biblioteca': '#1565C0',
  'Bienestar Estudiantil': '#6A1B9A', 'CIDTEA': '#00838F',
  'Extensión Universitaria': '#EF6C00', 'Brigada Ambiental': '#558B2F',
  'Comunicación Institucional': '#C62828', 'Decanatura': '#283593',
  'Educación a Distancia': '#F57F17', 'Registro Académico': '#4E342E',
};
const CARRERA_COLORS: Record<string, string> = {
  ICE: '#6A1B9A', IMS: '#2E7D32', IGI: '#C62828', IME: '#F57F17',
  IEM: '#00838F', IEL: '#1565C0', LAF: '#283593', LCM: '#EF6C00',
};
const getCarreraCode = (c: string) => c.split(' - ')[0];
const getCarreraColor = (c: string) => CARRERA_COLORS[getCarreraCode(c)] || '#66BB6A';
const getAreaColor = (a: string) => AREA_COLORS[a] || '#9E9E9E';

// ─── Pagination ───
function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);
  return { page, setPage, totalPages, paged, total: items.length };
}

// ─── Prog color helper ───
const progColor = (p: number) => p < 30 ? '#EF5350' : p < 60 ? '#FFC107' : '#2E7D32';

export const Estudiantes: React.FC = () => {
  const { mockEstudiantes, mockDocentes, mockRegistrosHoras, isLoading, error } = useLegacyDataBridge();
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [sortField, setSortField] = useState<'nombre' | 'progreso' | 'horas'>('nombre');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando estudiantes...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  const uniqueAreas = useMemo(() => [...new Set(mockEstudiantes.map(e => e.areaActual).filter(Boolean))].sort() as string[], [mockEstudiantes]);
  const uniqueCarreras = useMemo(() => [...new Set(mockEstudiantes.map(e => getCarreraCode(e.carrera)))].sort(), [mockEstudiantes]);

  const filtered = useMemo(() => {
    let data = mockEstudiantes.filter(e => {
      const ms = !search || e.nombre.toLowerCase().includes(search.toLowerCase()) || e.matricula.includes(search) || e.email.toLowerCase().includes(search.toLowerCase());
      const ma = !filterArea || e.areaActual === filterArea;
      const mc = !filterCarrera || getCarreraCode(e.carrera) === filterCarrera;
      const me = !filterEstado || e.estado === filterEstado;
      return ms && ma && mc && me;
    });
    data.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'nombre') cmp = a.nombre.localeCompare(b.nombre);
      else if (sortField === 'progreso') cmp = (a.horasCompletadas / a.horasRequeridas) - (b.horasCompletadas / b.horasRequeridas);
      else cmp = a.horasCompletadas - b.horasCompletadas;
      return sortAsc ? cmp : -cmp;
    });
    return data;
  }, [search, filterArea, filterCarrera, filterEstado, sortField, sortAsc]);

  const { page, setPage, totalPages, paged, total } = usePagination(filtered, viewMode === 'table' ? 10 : 12);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <ArrowUpDown className={`w-3 h-3 inline ml-1 ${sortField === field ? 'text-[#2E7D32]' : 'text-gray-300'}`} />
  );

  // Global KPIs
  const activos = filtered.filter(e => e.estado === 'activo').length;
  const completados = filtered.filter(e => e.estado === 'completado').length;
  const inactivos = filtered.filter(e => e.estado === 'inactivo').length;
  const enRiesgo = filtered.filter(e => e.estado === 'activo' && (e.horasCompletadas / e.horasRequeridas) < 0.3).length;
  const promedio = filtered.length > 0 ? Math.round(filtered.reduce((s, e) => s + (e.horasCompletadas / e.horasRequeridas) * 100, 0) / filtered.length) : 0;
  const totalHoras = filtered.reduce((s, e) => s + e.horasCompletadas, 0);

  const hasFilters = !!(search || filterArea || filterCarrera || filterEstado);
  const clearFilters = () => { setSearch(''); setFilterArea(''); setFilterCarrera(''); setFilterEstado(''); setPage(1); };

  // ── STUDENT DETAIL VIEW ──
  if (selectedStudent) {
    const est = selectedStudent;
    const prog = (est.horasCompletadas / est.horasRequeridas) * 100;
    const registrosEst = mockRegistrosHoras.filter(r => r.estudianteId === est.id);
    const horasAprobadas = registrosEst.filter(r => r.estado === 'aprobada').reduce((s, r) => s + r.totalHoras, 0);
    const horasPendientes = registrosEst.filter(r => r.estado === 'pendiente').reduce((s, r) => s + r.totalHoras, 0);
    const horasRechazadas = registrosEst.filter(r => r.estado === 'rechazada').reduce((s, r) => s + r.totalHoras, 0);
    const docente = mockDocentes.find(d => d.id === est.docenteResponsableId);
    const cc = getCarreraColor(est.carrera);

    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2E7D32] transition-colors">
          <ChevronDown className="w-4 h-4 rotate-90" /> Volver a la lista
        </button>

        {/* Header card */}
        <Card className="bg-white border-none shadow-sm overflow-hidden">
          <div className="h-2 rounded-t-xl" style={{ backgroundColor: cc }} />
          <CardContent className="p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ backgroundColor: cc }}>
                {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-xl font-bold text-gray-800">{est.nombre}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" style={{ color: cc, borderColor: cc }}>{est.carrera}</Badge>
                  <span className="text-sm text-gray-500 font-mono">{est.matricula}</span>
                  <StatusBadge status={est.estado} />
                </div>
                <a href={`mailto:${est.email}`} className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 hover:underline">
                  <Mail className="w-3.5 h-3.5" /> {est.email}
                </a>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-center px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase">Periodo</p>
                  <p className="text-lg font-bold text-gray-700">{est.periodoActual}/3</p>
                </div>
                <div className="text-center px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase">Cuatrimestre</p>
                  <p className="text-sm font-bold text-gray-700">{est.cuatrimestre}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI mini-cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Progreso Total', value: `${Math.round(prog)}%`, color: progColor(prog), icon: Target, bar: true, barPct: prog },
            { label: 'Horas Completadas', value: `${est.horasCompletadas}/${est.horasRequeridas}`, color: '#2E7D32', icon: Clock },
            { label: 'Aprobadas', value: `${horasAprobadas}h`, color: '#2E7D32', icon: CheckCircle },
            { label: 'Pendientes', value: `${horasPendientes}h`, color: '#F57F17', icon: Clock },
            { label: 'Rechazadas', value: `${horasRechazadas}h`, color: '#D32F2F', icon: AlertCircle },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl p-3.5 shadow-sm border-l-4 flex items-center gap-3" style={{ borderLeftColor: kpi.color }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 uppercase leading-none">{kpi.label}</p>
                <p className="text-lg font-bold mt-0.5" style={{ color: kpi.color }}>{kpi.value}</p>
                {'bar' in kpi && kpi.bar && (
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(kpi.barPct as number, 100)}%`, backgroundColor: kpi.color }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Asignación */}
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
              <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4" /> Asignación Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${getAreaColor(est.areaActual || '')}15` }}>
                  <Building2 className="w-5 h-5" style={{ color: getAreaColor(est.areaActual || '') }} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Área</p>
                  <p className="font-semibold text-gray-800 text-sm">{est.areaActual || 'Sin asignar'}</p>
                  {est.subarea && <p className="text-xs text-gray-500">{est.subarea}</p>}
                </div>
              </div>
              {docente && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {docente.nombre.split(' ').slice(-2).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Docente Responsable</p>
                    <p className="font-semibold text-gray-800 text-sm">{docente.nombre}</p>
                    <a href={`mailto:${docente.email}`} className="text-[10px] text-blue-500 hover:underline">{docente.email}</a>
                  </div>
                </div>
              )}
              {est.cursoAsignado && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Curso Asignado</p>
                    <p className="font-semibold text-gray-800 text-sm">{est.cursoAsignado}</p>
                  </div>
                </div>
              )}
              {/* Progress by period */}
              <div className="p-3 bg-gradient-to-r from-[#E8F5E9] to-white rounded-xl border border-green-100">
                <p className="text-[10px] text-gray-500 uppercase mb-2">Progreso Anual</p>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">{est.horasCompletadas}/{est.horasRequeridas}h</span>
                  <span className="text-sm font-bold" style={{ color: progColor(prog) }}>{Math.round(prog)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(prog, 100)}%`, backgroundColor: progColor(prog) }} />
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                  {[
                    { label: 'P1 ENE-ABR', hrs: Math.min(est.horasCompletadas, 50), meta: 50 },
                    { label: 'P2 MAY-AGO', hrs: Math.max(0, Math.min(est.horasCompletadas - 50, 50)), meta: 50 },
                    { label: 'P3 SEP-DIC', hrs: Math.max(0, Math.min(est.horasCompletadas - 100, 50)), meta: 50 },
                  ].map((p, i) => {
                    const pct = Math.round((p.hrs / p.meta) * 100);
                    const isCurrent = est.periodoActual === i + 1;
                    return (
                      <div key={p.label} className={`text-center p-2 rounded-lg border ${isCurrent ? 'bg-[#E8F5E9] border-[#2E7D32]/30' : 'bg-gray-50 border-gray-100'}`}>
                        <p className="text-[9px] text-gray-500 uppercase leading-none">{p.label}</p>
                        <p className={`text-sm font-bold mt-0.5 ${isCurrent ? 'text-[#2E7D32]' : 'text-gray-400'}`}>{pct}%</p>
                        <p className="text-[9px] text-gray-400">{p.hrs}/{p.meta}h</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Últimos Registros */}
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
              <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
                <ClipboardList className="w-4 h-4" /> Historial de Registros
                <Badge className="bg-[#2E7D32]/10 text-[#2E7D32] ml-auto">{registrosEst.length} total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-h-[400px] overflow-y-auto">
              {/* Mini summary */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Aprobados', val: registrosEst.filter(r => r.estado === 'aprobada').length, color: '#2E7D32', bg: 'bg-green-50' },
                  { label: 'Pendientes', val: registrosEst.filter(r => r.estado === 'pendiente').length, color: '#F57F17', bg: 'bg-amber-50' },
                  { label: 'Rechazados', val: registrosEst.filter(r => r.estado === 'rechazada').length, color: '#D32F2F', bg: 'bg-red-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-lg p-2 text-center border border-gray-100`}>
                    <p className="text-[10px] text-gray-500">{s.label}</p>
                    <p className="text-lg font-bold" style={{ color: s.color }}>{s.val}</p>
                  </div>
                ))}
              </div>
              {registrosEst.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Sin registros aún</p>
              ) : (
                <div className="space-y-2">
                  {registrosEst.slice(0, 10).map(r => (
                    <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors">
                      <div className="text-center min-w-[44px]">
                        <p className="text-[10px] text-gray-400">{r.fecha.split('-').slice(1).join('/')}</p>
                        <p className="text-sm font-bold text-[#2E7D32]">{r.totalHoras}h</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 truncate">{r.descripcion}</p>
                        <p className="text-[10px] text-gray-400">{r.horaInicio} — {r.horaFin}</p>
                      </div>
                      <StatusBadge status={r.estado} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-5 rounded-xl shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm mb-0.5">Bienestar Estudiantil · Gestión</p>
            <h2 className="text-2xl font-bold mb-0.5">Estudiantes Becados</h2>
            <p className="text-white/90 text-sm">Periodo ENE-ABR 2026 · SIBEC</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'Total', value: mockEstudiantes.length },
              { label: 'Activos', value: mockEstudiantes.filter(e => e.estado === 'activo').length },
              { label: 'Completados', value: mockEstudiantes.filter(e => e.estado === 'completado').length },
            ].map(item => (
              <div key={item.label} className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <p className="text-white/80 text-[10px] uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { icon: UserCheck, label: 'Activos', value: activos, color: '#2E7D32', bg: 'from-green-50 to-white', border: 'border-green-100' },
          { icon: CheckCircle, label: 'Completados', value: completados, color: '#1565C0', bg: 'from-blue-50 to-white', border: 'border-blue-100' },
          { icon: UserX, label: 'Inactivos', value: inactivos, color: '#9E9E9E', bg: 'from-gray-50 to-white', border: 'border-gray-200' },
          { icon: AlertCircle, label: 'En Riesgo', value: enRiesgo, color: '#EF5350', bg: 'from-red-50 to-white', border: 'border-red-100' },
          { icon: Percent, label: 'Promedio', value: `${promedio}%`, color: '#EF6C00', bg: 'from-amber-50 to-white', border: 'border-amber-100' },
          { icon: Clock, label: 'Horas Totales', value: `${totalHoras}h`, color: '#6A1B9A', bg: 'from-purple-50 to-white', border: 'border-purple-100' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-xl p-3 border ${s.border} flex items-center gap-2.5`}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase">{s.label}</p>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, matrícula o email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 bg-[#F5F5F5] border-none"
              />
            </div>
            <select value={filterArea} onChange={e => { setFilterArea(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30">
              <option value="">Todas las áreas</option>
              {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filterCarrera} onChange={e => { setFilterCarrera(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30">
              <option value="">Todas las carreras</option>
              {uniqueCarreras.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30">
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="completado">Completado</option>
              <option value="inactivo">Inactivo</option>
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
                <X className="w-3.5 h-3.5" /> Limpiar
              </button>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#2E7D32] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="Vista tabla">
                <ClipboardList className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('cards')} className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-[#2E7D32] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="Vista tarjetas">
                <Layers className="w-4 h-4" />
              </button>
            </div>
            <Badge className="bg-[#2E7D32] text-white">{total} resultado{total !== 1 ? 's' : ''}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── Table View ── */}
      {viewMode === 'table' ? (
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs cursor-pointer select-none" onClick={() => toggleSort('nombre')}>
                      Estudiante <SortIcon field="nombre" />
                    </th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Carrera</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Área</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs cursor-pointer select-none" onClick={() => toggleSort('horas')}>
                      Horas <SortIcon field="horas" />
                    </th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs cursor-pointer select-none" onClick={() => toggleSort('progreso')}>
                      Progreso <SortIcon field="progreso" />
                    </th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Estado</th>
                    <th className="py-3 px-4 text-gray-500 font-medium text-xs w-24 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(est => {
                    const prog = (est.horasCompletadas / est.horasRequeridas) * 100;
                    const isExpanded = expandedRow === est.id;
                    const pc = progColor(prog);
                    return (
                      <React.Fragment key={est.id}>
                        <tr className={`border-b border-gray-100 hover:bg-green-50/30 transition-colors ${isExpanded ? 'bg-green-50/20' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                                {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{est.nombre}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{est.matricula}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-[10px]" style={{ color: getCarreraColor(est.carrera), borderColor: getCarreraColor(est.carrera) }}>
                              {getCarreraCode(est.carrera)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs text-gray-600 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getAreaColor(est.areaActual || '') }} />
                              <span className="truncate max-w-[120px]">{est.areaActual || '—'}</span>
                            </span>
                            {est.subarea && <p className="text-[10px] text-gray-400 ml-3.5 mt-0.5">{est.subarea}</p>}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-[#2E7D32]">{est.horasCompletadas}</span>
                            <span className="text-gray-400 font-normal text-xs">/{est.horasRequeridas}h</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 min-w-[110px]">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.min(prog, 100)}%`, backgroundColor: pc }} />
                              </div>
                              <span className="text-xs font-bold" style={{ color: pc }}>{Math.round(prog)}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4"><StatusBadge status={est.estado} /></td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setExpandedRow(isExpanded ? null : est.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Expandir">
                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              <button onClick={() => setSelectedStudent(est)} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-[#2E7D32] transition-colors" title="Ver detalle">
                                <Eye className="w-4 h-4" />
                              </button>
                              <a href={`mailto:${est.email}`} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title={est.email}>
                                <Mail className="w-4 h-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-gradient-to-r from-green-50/30 to-white">
                            <td colSpan={7} className="px-4 py-3">
                              <div className="flex flex-wrap items-start gap-3 text-xs">
                                <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 flex-1 min-w-[150px]">
                                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Área / Subárea</p>
                                    <p className="text-gray-700 font-medium">{est.areaActual || 'Sin asignar'}</p>
                                    {est.subarea && <p className="text-gray-400">{est.subarea}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 flex-1 min-w-[150px]">
                                  <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Docente Responsable</p>
                                    <p className="text-gray-700 font-medium">{est.docenteResponsable || '—'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 flex-1 min-w-[150px]">
                                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Periodo / Cuatrimestre</p>
                                    <p className="text-gray-700 font-medium">Periodo {est.periodoActual}/3</p>
                                    <p className="text-gray-400">{est.cuatrimestre}</p>
                                  </div>
                                </div>
                                {est.cursoAsignado && (
                                  <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 flex-1 min-w-[150px]">
                                    <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <div>
                                      <p className="text-[9px] text-gray-400 uppercase">Curso Asignado</p>
                                      <p className="text-gray-700 font-medium">{est.cursoAsignado}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No se encontraron estudiantes</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ── Cards View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map(est => {
            const prog = (est.horasCompletadas / est.horasRequeridas) * 100;
            const cc = getCarreraColor(est.carrera);
            const pc = progColor(prog);
            return (
              <Card key={est.id} className="bg-white border-none shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedStudent(est)}>
                <CardContent className="p-0">
                  <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: cc }} />
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: cc }}>
                        {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-[#2E7D32] transition-colors">{est.nombre}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-gray-400 font-mono">{est.matricula}</span>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4" style={{ color: cc, borderColor: cc }}>{getCarreraCode(est.carrera)}</Badge>
                          <StatusBadge status={est.estado} />
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500">{est.horasCompletadas}/{est.horasRequeridas}h</span>
                        <span className="text-xs font-bold" style={{ color: pc }}>{Math.round(prog)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(prog, 100)}%`, backgroundColor: pc }} />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getAreaColor(est.areaActual || '') }} />
                        <span className="text-gray-600 truncate">{est.areaActual || 'Sin área'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                        <GraduationCap className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{est.docenteResponsable?.split(' ').slice(-2).join(' ') || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                        <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">P{est.periodoActual}/3</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                        <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">{est.cuatrimestre}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                      <a href={`mailto:${est.email}`} className="text-[10px] text-blue-500 hover:underline flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Mail className="w-3 h-3" /> {est.email}
                      </a>
                      <Eye className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#2E7D32] transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {paged.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No se encontraron estudiantes</p>
            </div>
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-gray-500">
            Mostrando {Math.min((page - 1) * (viewMode === 'table' ? 10 : 12) + 1, total)}–{Math.min(page * (viewMode === 'table' ? 10 : 12), total)} de {total}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ← Anterior
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page + i - 2;
              if (pg < 1 || pg > totalPages) return null;
              return (
                <button key={pg} onClick={() => setPage(pg)} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${pg === page ? 'bg-[#2E7D32] text-white shadow-sm' : 'border border-gray-200 hover:bg-gray-50'}`}>
                  {pg}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
