import React from 'react';
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp, Award, FileText, Target, BookOpen, GraduationCap, Calendar } from 'lucide-react';
import { KPICard } from '../../components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { mockEstudiantes, mockDocentes, mockRegistrosHoras } from '../../data/mockData';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Progress } from '../../components/ui/progress';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

const getCarreraCode = (carrera: string) => carrera.split(' - ')[0];
const getCarreraColor = (carrera: string) => CARRERA_COLORS[getCarreraCode(carrera)] || '#66BB6A';

export const DashboardJefatura: React.FC = () => {
  const { user } = useAuth();

  const carrerasJefe = user?.carrerasAsignadas || (user?.carrera ? [user.carrera] : []);

  // Solo estudiantes de Asistencia Docente de las carreras del jefe
  const estudiantesCarrera = mockEstudiantes.filter(e =>
    carrerasJefe.includes(e.carrera) && e.areaActual === 'Asistencia Docente'
  );

  const estudiantesActivos = estudiantesCarrera.filter(e => e.estado === 'activo').length;
  const estudiantesCompletados = estudiantesCarrera.filter(e => e.estado === 'completado').length;
  const estudiantesInactivos = estudiantesCarrera.filter(e => e.estado === 'inactivo').length;

  const horasTotalesCarrera = estudiantesCarrera.reduce((acc, e) => acc + e.horasAcumuladas, 0);
  const horasRequeridasCarrera = estudiantesCarrera.length * 150;
  const progresoCarrera = horasRequeridasCarrera > 0 ? (horasTotalesCarrera / horasRequeridasCarrera) * 100 : 0;
  const promedioHorasPorEstudiante = estudiantesCarrera.length > 0 ? Math.round(horasTotalesCarrera / estudiantesCarrera.length) : 0;

  const registrosPendientesValidacion = mockRegistrosHoras.filter(r => {
    const estudiante = mockEstudiantes.find(e => e.id === r.estudianteId);
    return r.estado === 'aprobada' && carrerasJefe.includes(estudiante?.carrera || '') && estudiante?.areaActual === 'Asistencia Docente';
  }).length;

  const estudiantesEnRiesgo = estudiantesCarrera.filter(e => {
    const progreso = (e.horasAcumuladas / e.horasRequeridas) * 100;
    return progreso < 30 && e.estado === 'activo';
  });

  // Docentes de Asistencia Docente que manejan estas carreras
  const docentesAsignados = mockDocentes.filter(doc =>
    doc.area === 'Asistencia Docente' &&
    doc.carrerasAsignadas?.some(c => carrerasJefe.includes(c))
  );

  // Registros filtrados
  const estudianteIds = new Set(estudiantesCarrera.map(e => e.id));
  const registrosFiltrados = mockRegistrosHoras.filter(r => estudianteIds.has(r.estudianteId));
  const registrosAprobados = registrosFiltrados.filter(r => r.estado === 'aprobada').length;
  const registrosPendientes = registrosFiltrados.filter(r => r.estado === 'pendiente').length;
  const registrosRechazados = registrosFiltrados.filter(r => r.estado === 'rechazada').length;

  // Chart: progreso individual
  const estudiantesChart = [...estudiantesCarrera]
    .sort((a, b) => b.horasAcumuladas - a.horasAcumuladas)
    .map((e, idx) => ({
      id: e.id,
      nombre: `${e.nombre.split(' ').slice(0, 2).join(' ')} (${e.matricula})`,
      nombreFull: e.nombre,
      horas: e.horasAcumuladas,
      meta: e.horasRequeridas,
      progreso: Math.round((e.horasAcumuladas / e.horasRequeridas) * 100),
      carrera: getCarreraCode(e.carrera),
      fill: getCarreraColor(e.carrera),
    }));

  const ChartTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
          <p className="font-semibold text-gray-800">{d.nombreFull}</p>
          <p className="text-[#2E7D32]">{d.horas}/{d.meta}h ({d.progreso}%)</p>
          <p className="text-xs text-gray-500">{d.carrera}</p>
        </div>
      );
    }
    return null;
  };

  const getPeriodoLabel = (horas: number) => {
    if (horas <= 50) return { num: 1, label: 'P1 (ENE-ABR)', horasPer: horas, meta: 50 };
    if (horas <= 100) return { num: 2, label: 'P2 (MAY-AGO)', horasPer: horas - 50, meta: 50 };
    return { num: 3, label: 'P3 (SEP-DIC)', horasPer: horas - 100, meta: 50 };
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-5 rounded-xl shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm mb-0.5">Jefatura de Carrera · Asistencia Docente</p>
            <h2 className="text-2xl font-bold mb-0.5">Panel de Supervisión</h2>
            <p className="text-white/90 text-sm">{carrerasJefe.map(c => getCarreraCode(c)).join(' / ')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3">
              <p className="text-white/80 text-[10px] uppercase tracking-wider">Becados</p>
              <p className="text-3xl font-bold">{estudiantesCarrera.length}</p>
            </div>
            <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3">
              <p className="text-white/80 text-[10px] uppercase tracking-wider">Docentes</p>
              <p className="text-3xl font-bold">{docentesAsignados.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Estudiantes Activos" value={estudiantesActivos} icon={Users} color="#2E7D32" />
        <KPICard title="Horas Acumuladas" value={`${horasTotalesCarrera}h`} icon={Clock} color="#66BB6A" />
        <KPICard title="Promedio por Becado" value={`${promedioHorasPorEstudiante}h`} icon={TrendingUp} color="#FBC02D" />
        <KPICard title="Pendientes Validar" value={registrosPendientesValidacion} icon={FileText} color="#E65100" />
      </div>

      {/* Progreso General + Estado + Registros en una fila compacta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Progreso General */}
        <Card className="bg-white border-none shadow-sm lg:col-span-5">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Target className="w-4 h-4" />
              Progreso General
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-3xl font-bold text-[#2E7D32]">{horasTotalesCarrera}<span className="text-sm text-gray-400 ml-1">/ {horasRequeridasCarrera}h</span></p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {estudiantesCarrera.length} becados × 150h anuales
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-[#2E7D32]">{Math.round(progresoCarrera)}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-4">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-[#1B5E20] to-[#66BB6A] transition-all duration-500"
                style={{ width: `${Math.min(progresoCarrera, 100)}%` }}
              />
            </div>
            {/* Mini period indicators */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'P1 ENE-ABR', target: estudiantesCarrera.length * 50 },
                { label: 'P2 MAY-AGO', target: estudiantesCarrera.length * 100 },
                { label: 'P3 SEP-DIC', target: estudiantesCarrera.length * 150 },
              ].map((p, i) => {
                const achieved = Math.min(horasTotalesCarrera, p.target);
                const prevTarget = i === 0 ? 0 : (i === 1 ? estudiantesCarrera.length * 50 : estudiantesCarrera.length * 100);
                const periodHours = Math.max(0, achieved - prevTarget);
                const periodTarget = estudiantesCarrera.length * 50;
                const pct = periodTarget > 0 ? Math.round((periodHours / periodTarget) * 100) : 0;
                return (
                  <div key={p.label} className={`text-center p-2 rounded-lg border ${i === 0 ? 'bg-[#E8F5E9] border-[#2E7D32]/20' : 'bg-gray-50 border-gray-100'}`}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{p.label}</p>
                    <p className={`text-sm font-bold ${i === 0 ? 'text-[#2E7D32]' : 'text-gray-400'}`}>{pct}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Estado de Becados */}
        <Card className="bg-white border-none shadow-sm lg:col-span-3">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="w-9 h-9 rounded-lg bg-[#2E7D32] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-gray-500">En Progreso</p>
                <p className="text-xl font-bold text-[#2E7D32]">{estudiantesActivos}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="w-9 h-9 rounded-lg bg-[#66BB6A] flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-gray-500">Completados</p>
                <p className="text-xl font-bold text-[#66BB6A]">{estudiantesCompletados}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-9 h-9 rounded-lg bg-gray-400 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-gray-500">Inactivos</p>
                <p className="text-xl font-bold text-gray-500">{estudiantesInactivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Registros */}
        <Card className="bg-white border-none shadow-sm lg:col-span-4">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <FileText className="w-4 h-4" />
              Registros de Horas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Pendientes</p>
                  <p className="text-xl font-bold text-amber-600">{registrosPendientes}</p>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-amber-300">Revisar</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Aprobados</p>
                <p className="text-lg font-bold text-green-600">{registrosAprobados}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Rechazados</p>
                <p className="text-lg font-bold text-red-600">{registrosRechazados}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Total Registros</p>
              <p className="text-lg font-bold text-gray-700">{registrosFiltrados.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Progreso por Estudiante + Ranking lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Horas por Estudiante
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-2 px-2">
            {estudiantesChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={estudiantesChart} margin={{ top: 5, right: 15, left: -10, bottom: 55 }}>
                  <XAxis
                    dataKey="nombre"
                    tick={{ fontSize: 10, fill: '#616161' }}
                    stroke="#E0E0E0"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={65}
                  />
                  <YAxis stroke="#E0E0E0" tick={{ fontSize: 11, fill: '#9E9E9E' }} domain={[0, 150]} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(46,125,50,0.06)' }} />
                  <Bar name="horas" dataKey="horas" radius={[6, 6, 0, 0]} isAnimationActive={false} fillOpacity={0.85}>
                    {estudiantesChart.map((entry, index) => (
                      <Cell key={`est-bar-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">Sin datos</div>
            )}
            {/* Legend */}
            <div className="flex flex-wrap gap-3 justify-center pb-2 pt-1">
              {[...new Set(estudiantesChart.map(e => e.carrera))].map(code => (
                <div key={code} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CARRERA_COLORS[code] }} />
                  {code}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking / Top Performers */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] text-base flex items-center gap-2">
              <Award className="w-4 h-4" />
              Ranking de Progreso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2.5">
              {[...estudiantesCarrera]
                .sort((a, b) => (b.horasAcumuladas / b.horasRequeridas) - (a.horasAcumuladas / a.horasRequeridas))
                .map((est, index) => {
                  const progreso = (est.horasAcumuladas / est.horasRequeridas) * 100;
                  const medals = ['🥇', '🥈', '🥉'];
                  const periodo = getPeriodoLabel(est.horasCompletadas);
                  return (
                    <div key={est.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-green-50/40 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {index < 3 ? medals[index] : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 text-sm truncate">{est.nombre}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0" style={{ color: getCarreraColor(est.carrera), borderColor: getCarreraColor(est.carrera) }}>
                            {getCarreraCode(est.carrera)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={progreso} className="h-1.5 flex-1" />
                          <span className="text-xs font-bold text-[#2E7D32] w-8 text-right">{Math.round(progreso)}%</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">{est.horasAcumuladas}/{est.horasRequeridas}h · {periodo.label} · {est.cursoAsignado || 'Sin curso'}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalle por Estudiante - tarjetas individuales */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
          <CardTitle className="text-[#2E7D32] text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Detalle por Estudiante
            </span>
            <Badge className="bg-[#2E7D32] text-white">{estudiantesCarrera.length} becados</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estudiantesCarrera.map(est => {
              const prog = (est.horasAcumuladas / est.horasRequeridas) * 100;
              const periodo = getPeriodoLabel(est.horasCompletadas);
              const docente = mockDocentes.find(d => d.id === est.docenteResponsableId);
              return (
                <div key={est.id} className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow hover:border-[#2E7D32]/20">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                      {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{est.nombre}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{est.matricula}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ color: getCarreraColor(est.carrera), borderColor: getCarreraColor(est.carrera) }}>
                          {getCarreraCode(est.carrera)}
                        </Badge>
                        <StatusBadge status={est.estado} />
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Progreso Anual</span>
                      <span className="text-xs font-bold text-[#2E7D32]">{est.horasAcumuladas}/{est.horasRequeridas}h · {Math.round(prog)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(prog, 100)}%`, backgroundColor: getCarreraColor(est.carrera) }}
                      />
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400">Curso</p>
                        <p className="text-gray-700 font-medium truncate">{est.cursoAsignado || 'Sin asignar'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                      <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400">Docente</p>
                        <p className="text-gray-700 font-medium truncate">{docente?.nombre?.split(' ').slice(-2).join(' ') || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400">Periodo</p>
                        <p className="text-gray-700 font-medium">{periodo.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400">Horas Periodo</p>
                        <p className="text-gray-700 font-medium">{periodo.horasPer}/{periodo.meta}h</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Docentes Asignados + En Riesgo + Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Docentes */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Docentes Responsables
              <Badge className="bg-[#2E7D32] text-white ml-auto">{docentesAsignados.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {docentesAsignados.map(doc => {
              const estDoc = estudiantesCarrera.filter(e => e.docenteResponsableId === doc.id);
              const totalH = estDoc.reduce((s, e) => s + e.horasAcumuladas, 0);
              return (
                <div key={doc.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {doc.nombre.split(' ').slice(-2).map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#2E7D32] text-sm truncate">{doc.subarea}</p>
                      <p className="text-[10px] text-gray-400 truncate">{doc.nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{estDoc.length} becado{estDoc.length !== 1 ? 's' : ''}</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{totalH}h total</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Estudiantes en Riesgo */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-red-50 pb-3 pt-4 px-5">
            <CardTitle className="text-[#D32F2F] text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              En Riesgo
              <Badge variant="outline" className="ml-auto bg-white text-[#D32F2F] border-[#D32F2F]">{estudiantesEnRiesgo.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {estudiantesEnRiesgo.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
                <p className="font-medium text-sm">Todos al día</p>
                <p className="text-xs text-gray-400 mt-0.5">No hay becados con menos del 30% de progreso</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {estudiantesEnRiesgo.map(est => {
                  const prog = (est.horasAcumuladas / est.horasRequeridas) * 100;
                  return (
                    <div key={est.id} className="p-3 bg-red-50/70 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                          {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{est.nombre}</p>
                          <p className="text-[10px] text-gray-500">{est.matricula} · Faltan {est.horasRequeridas - est.horasAcumuladas}h</p>
                        </div>
                        <Badge variant="outline" className="bg-white text-red-600 border-red-300 text-[10px]">
                          {Math.round(prog)}%
                        </Badge>
                      </div>
                      <Progress value={prog} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2.5">
              {registrosFiltrados
                .sort((a, b) => b.fecha.localeCompare(a.fecha))
                .slice(0, 5)
                .map(reg => (
                  <div key={reg.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-gray-800 text-sm truncate flex-1">{reg.estudianteNombre.split(' ').slice(0, 3).join(' ')}</p>
                      <StatusBadge status={reg.estado} />
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">{reg.descripcion}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>{reg.fecha}</span>
                      <span>·</span>
                      <span className="font-semibold text-[#2E7D32]">{reg.totalHoras}h</span>
                      <span>·</span>
                      <span>{reg.horaInicio}-{reg.horaFin}</span>
                    </div>
                  </div>
                ))}
              {registrosFiltrados.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">Sin registros recientes</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};