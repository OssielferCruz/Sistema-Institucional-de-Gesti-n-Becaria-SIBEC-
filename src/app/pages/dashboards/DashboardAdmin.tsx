import React, { useState, useMemo } from 'react';
import {
  Users, Clock, CheckCircle, AlertCircle, TrendingUp, Award, FileText,
  Target, BookOpen, GraduationCap, Calendar, Building2, Search,
  ChevronDown, Mail, ArrowUpDown, BarChart3, Eye, MapPin,
  UserCheck, UserX, Layers, ClipboardList, ChevronRight, Percent
} from 'lucide-react';
import { KPICard } from '../../components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { StatusBadge } from '../../components/shared/StatusBadge';
// recharts imports removed from TabResumen — now uses CSSBarChart
import { useLegacyDataBridge } from '../../hooks/useLegacyDataBridge';

type BridgeData = ReturnType<typeof useLegacyDataBridge>;
type Estudiante = BridgeData['mockEstudiantes'][number];
type Docente = BridgeData['mockDocentes'][number];
type RegistroHora = BridgeData['mockRegistrosHoras'][number];
type Subarea = BridgeData['areas'][number]['subareas'][number];
type Area = BridgeData['areas'][number];

interface DashboardAdminDataProps {
  mockEstudiantes: Estudiante[];
  mockDocentes: Docente[];
  mockRegistrosHoras: RegistroHora[];
  areas: Area[];
  carreras: string[];
}

// ─── Color maps ───
const AREA_COLORS: Record<string, string> = {
  'Asistencia Docente': '#2E7D32',
  'Biblioteca': '#1565C0',
  'Bienestar Estudiantil': '#6A1B9A',
  'CIDTEA': '#00838F',
  'Extensión Universitaria': '#EF6C00',
  'Brigada Ambiental': '#2E7D32',
  'Comunicación Institucional': '#C62828',
  'Decanatura': '#283593',
  'Educación a Distancia': '#F57F17',
  'Registro Académico': '#4E342E',
};
const CARRERA_COLORS: Record<string, string> = {
  ICE: '#6A1B9A', IMS: '#2E7D32', IGI: '#C62828', IME: '#F57F17',
  IEM: '#00838F', IEL: '#1565C0', LAF: '#283593', LCM: '#EF6C00',
};
const getCarreraCode = (c: string) => c.split(' - ')[0];
const getCarreraColor = (c: string) => CARRERA_COLORS[getCarreraCode(c)] || '#66BB6A';
const getAreaColor = (a: string) => AREA_COLORS[a] || '#9E9E9E';

// ─── Tabs definition ───
type Tab = 'resumen' | 'areas' | 'docentes' | 'estudiantes' | 'registros';
const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'resumen', label: 'Resumen General', icon: BarChart3 },
  { key: 'areas', label: 'Áreas', icon: Building2 },
  { key: 'docentes', label: 'Docentes', icon: GraduationCap },
  { key: 'estudiantes', label: 'Estudiantes', icon: Users },
  { key: 'registros', label: 'Registros', icon: ClipboardList },
];

// ─── Pagination helper ───
function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paged = items.slice((page - 1) * pageSize, page * pageSize);
  return { page, setPage, totalPages, paged, total: items.length };
}

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════
export const DashboardAdmin: React.FC = () => {
  const {
    areas: bridgeAreas,
    carreras: bridgeCarreras,
    mockDocentes: bridgeDocentes,
    mockEstudiantes: bridgeEstudiantes,
    mockRegistrosHoras: bridgeRegistros,
    isLoading,
    error,
  } = useLegacyDataBridge();

  const mockEstudiantes = bridgeEstudiantes;
  const mockDocentes = bridgeDocentes;
  const mockRegistrosHoras = bridgeRegistros;
  const areas = bridgeAreas;
  const carreras = bridgeCarreras;

  const [activeTab, setActiveTab] = useState<Tab>('resumen');

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  if (mockEstudiantes.length === 0) {
    return <div className="p-6 text-sm text-gray-500">No hay datos disponibles para mostrar el dashboard.</div>;
  }

  // ── Global KPIs ──
  const totalEstudiantes = mockEstudiantes.length;
  const estudiantesActivos = mockEstudiantes.filter(e => e.estado === 'activo').length;
  const estudiantesCompletados = mockEstudiantes.filter(e => e.estado === 'completado').length;
  const totalDocentes = mockDocentes.length;
  const horasAprobadas = mockRegistrosHoras.filter(r => r.estado === 'aprobada').reduce((s, r) => s + r.totalHoras, 0);
  const registrosPendientes = mockRegistrosHoras.filter(r => r.estado === 'pendiente').length;
  const cumplimientoPromedio = Math.round(
    mockEstudiantes.reduce((s, e) => s + (e.horasCompletadas / e.horasRequeridas) * 100, 0) / totalEstudiantes
  );
  const totalAreas = [...new Set(mockEstudiantes.map(e => e.areaActual).filter(Boolean))].length;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-5 rounded-xl shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm mb-0.5">Bienestar Estudiantil · Panel Administrativo</p>
            <h2 className="text-2xl font-bold mb-0.5">Centro de Control SIBEC</h2>
            <p className="text-white/90 text-sm">Periodo ENE-ABR 2026 · Gestión integral de horas sociales</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'Becados', value: totalEstudiantes },
              { label: 'Docentes', value: totalDocentes },
              { label: 'Áreas', value: totalAreas },
            ].map(item => (
              <div key={item.label} className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3">
                <p className="text-white/80 text-[10px] uppercase tracking-wider">{item.label}</p>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Estudiantes Activos" value={estudiantesActivos} icon={Users} color="#2E7D32" />
        <KPICard title="Completados" value={estudiantesCompletados} icon={CheckCircle} color="#1B5E20" />
        <KPICard title="Horas Aprobadas" value={`${horasAprobadas}h`} icon={Clock} color="#66BB6A" />
        <KPICard title="Pendientes Revisar" value={registrosPendientes} icon={AlertCircle} color="#FBC02D" />
        <KPICard title="Cumplimiento" value={`${cumplimientoPromedio}%`} icon={Target} color="#2E7D32" />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-[#2E7D32] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'resumen' && (
        <TabResumen
          mockEstudiantes={mockEstudiantes}
          mockRegistrosHoras={mockRegistrosHoras}
        />
      )}
      {activeTab === 'areas' && (
        <TabAreas
          mockEstudiantes={mockEstudiantes}
          mockDocentes={mockDocentes}
          areas={areas}
        />
      )}
      {activeTab === 'docentes' && (
        <TabDocentes
          mockEstudiantes={mockEstudiantes}
          mockDocentes={mockDocentes}
        />
      )}
      {activeTab === 'estudiantes' && (
        <TabEstudiantes
          mockEstudiantes={mockEstudiantes}
          mockDocentes={mockDocentes}
          mockRegistrosHoras={mockRegistrosHoras}
        />
      )}
      {activeTab === 'registros' && <TabRegistros mockRegistrosHoras={mockRegistrosHoras} />}
    </div>
  );
};

// ─── Simple SVG Donut (avoids recharts null-key bug) ───
const DonutChart: React.FC<{ data: { name: string; value: number; fill: string }[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  const size = 160, cx = size / 2, cy = size / 2, r = 60, sw = 30;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex justify-center py-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d) => {
          const pct = d.value / total;
          const dash = pct * circ;
          const off = -offset * circ;
          offset += pct;
          return (
            <circle key={d.name} cx={cx} cy={cy} r={r} fill="none" stroke={d.fill}
              strokeWidth={sw} strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cy})`} />
          );
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-gray-700" style={{ fontSize: 22, fontWeight: 700 }}>{total}</text>
      </svg>
    </div>
  );
};

// ─── Pure CSS Bar Chart (no recharts — avoids internal key conflicts) ───
interface CSSBarItem { label: string; value: number; fill: string; tooltip?: string; }
const CSSBarChart: React.FC<{ data: CSSBarItem[]; maxValue: number; unit?: string; rotateLabels?: boolean }> = ({ data, maxValue, unit = '', rotateLabels = false }) => {
  const [hovered, setHovered] = React.useState<number | null>(null);
  if (data.length === 0) return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Sin datos</div>;
  return (
    <div className="relative">
      <div className="flex items-end gap-2 h-52 px-1">
        {data.map((d, i) => {
          const pct = maxValue > 0 ? Math.min((d.value / maxValue) * 100, 100) : 0;
          return (
            <div
              key={`cssbar-${i}`}
              className="flex-1 flex flex-col items-center justify-end gap-1 h-full relative group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Value label on top */}
              <span className="text-[9px] font-bold text-gray-600 mb-0.5">{d.value}{unit}</span>
              {/* Bar */}
              <div
                className="w-full rounded-t-md transition-opacity"
                style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: d.fill, opacity: hovered === null || hovered === i ? 0.85 : 0.4 }}
              />
              {/* Tooltip */}
              {hovered === i && d.tooltip && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs text-gray-700 whitespace-nowrap z-10 pointer-events-none">
                  {d.tooltip}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex gap-2 px-1 mt-1 border-t border-gray-100 pt-2">
        {data.map((d, i) => (
          <div key={`cssbar-label-${i}`} className={`flex-1 text-center ${rotateLabels ? 'overflow-hidden' : ''}`}>
            <span
              className="text-[9px] text-gray-500 leading-tight block truncate"
              title={d.label}
            >
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: RESUMEN GENERAL
// ═══════════════════════════════════════════════
const TabResumen: React.FC<Pick<DashboardAdminDataProps, 'mockEstudiantes' | 'mockRegistrosHoras'>> = ({
  mockEstudiantes,
  mockRegistrosHoras,
}) => {
  // Data by area
  const dataByArea = useMemo(() => {
    const map: Record<string, { id: string; area: string; estudiantes: number; horas: number; fill: string }> = {};
    mockEstudiantes.forEach(e => {
      const a = e.areaActual || 'Sin asignar';
      if (!map[a]) map[a] = { id: `area-${a}`, area: a, estudiantes: 0, horas: 0, fill: getAreaColor(a) };
      map[a].estudiantes++;
      map[a].horas += e.horasCompletadas;
    });
    return Object.values(map).sort((a, b) => b.estudiantes - a.estudiantes);
  }, [mockEstudiantes]);

  // Data by carrera
  const dataByCarrera = useMemo(() => {
    const map: Record<string, { id: string; carrera: string; code: string; estudiantes: number; promedio: number; fill: string }> = {};
    mockEstudiantes.forEach(e => {
      const code = getCarreraCode(e.carrera);
      if (!map[code]) map[code] = { id: `carrera-${code}`, carrera: e.carrera, code, estudiantes: 0, promedio: 0, fill: getCarreraColor(e.carrera) };
      map[code].estudiantes++;
      map[code].promedio += e.horasCompletadas;
    });
    Object.values(map).forEach(d => { d.promedio = Math.round(d.promedio / d.estudiantes); });
    return Object.values(map).sort((a, b) => b.estudiantes - a.estudiantes);
  }, [mockEstudiantes]);

  // Status pie
  const statusData = useMemo(() => [
    { name: 'Activos', value: mockEstudiantes.filter(e => e.estado === 'activo').length, fill: '#2E7D32' },
    { name: 'Completados', value: mockEstudiantes.filter(e => e.estado === 'completado').length, fill: '#66BB6A' },
    { name: 'Inactivos', value: mockEstudiantes.filter(e => e.estado === 'inactivo').length, fill: '#9E9E9E' },
  ].filter(d => d.value > 0), [mockEstudiantes]);

  // Registros pie
  const registrosData = useMemo(() => [
    { name: 'Aprobados', value: mockRegistrosHoras.filter(r => r.estado === 'aprobada').length, fill: '#2E7D32' },
    { name: 'Pendientes', value: mockRegistrosHoras.filter(r => r.estado === 'pendiente').length, fill: '#FBC02D' },
    { name: 'Rechazados', value: mockRegistrosHoras.filter(r => r.estado === 'rechazada').length, fill: '#D32F2F' },
  ].filter(d => d.value > 0), [mockRegistrosHoras]);

  // Estudiantes en riesgo (<30%)
  const enRiesgo = mockEstudiantes.filter(e => e.estado === 'activo' && (e.horasCompletadas / e.horasRequeridas) < 0.3);

  // Top performers
  const topPerformers = [...mockEstudiantes]
    .sort((a, b) => (b.horasCompletadas / b.horasRequeridas) - (a.horasCompletadas / a.horasRequeridas))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Building2 className="w-4 h-4" /> Estudiantes por Área
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4 px-4">
            <CSSBarChart
              data={dataByArea.map(d => ({ label: d.area, value: d.estudiantes, fill: d.fill, tooltip: `${d.estudiantes} estudiantes · ${d.horas}h` }))}
              maxValue={Math.max(...dataByArea.map(d => d.estudiantes), 1)}
              unit=""
              rotateLabels
            />
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <GraduationCap className="w-4 h-4" /> Promedio de Horas por Carrera
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4 px-4">
            <CSSBarChart
              data={dataByCarrera.map(d => ({ label: d.code, value: d.promedio, fill: d.fill, tooltip: `${d.code}: ${d.estudiantes} estudiantes · Prom. ${d.promedio}h` }))}
              maxValue={150}
              unit="h"
            />
            <div className="flex flex-wrap gap-3 justify-center pb-1 pt-3">
              {dataByCarrera.map(d => (
                <div key={d.code} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                  {d.code} ({d.estudiantes})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pies + Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Status Pie */}
        <Card className="bg-white border-none shadow-sm lg:col-span-3">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Users className="w-4 h-4" /> Estado Becados
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-2">
            <DonutChart data={statusData} />
            <div className="space-y-2 mt-2">
              {statusData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-800">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Registros Pie */}
        <Card className="bg-white border-none shadow-sm lg:col-span-3">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <FileText className="w-4 h-4" /> Estado Registros
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-2">
            <DonutChart data={registrosData} />
            <div className="space-y-2 mt-2">
              {registrosData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-800">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-white border-none shadow-sm lg:col-span-3">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Award className="w-4 h-4" /> Top Progreso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {topPerformers.map((est, i) => {
              const prog = (est.horasCompletadas / est.horasRequeridas) * 100;
              const medals = ['#FFD700', '#C0C0C0', '#CD7F32'];
              return (
                <div key={est.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: i < 3 ? medals[i] : '#9E9E9E' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{est.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Progress value={prog} className="h-1.5 flex-1" />
                      <span className="text-xs font-bold text-[#2E7D32] w-10 text-right">{Math.round(prog)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* En Riesgo */}
        <Card className="bg-white border-none shadow-sm lg:col-span-3">
          <CardHeader className="border-b bg-red-50 pb-3 pt-4 px-5">
            <CardTitle className="text-[#D32F2F] flex items-center gap-2 text-base">
              <AlertCircle className="w-4 h-4" /> En Riesgo
              <Badge variant="outline" className="ml-auto bg-white text-[#D32F2F] border-[#D32F2F]">{enRiesgo.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {enRiesgo.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
                <p className="font-medium text-sm">Todos al dia</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {enRiesgo.slice(0, 5).map(est => {
                  const prog = (est.horasCompletadas / est.horasRequeridas) * 100;
                  return (
                    <div key={est.id} className="p-2.5 bg-red-50/70 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-[10px]">
                          {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{est.nombre}</p>
                          <p className="text-[10px] text-gray-500">{est.areaActual} · {Math.round(prog)}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: ÁREAS
// ═══════════════════════════════════════════════
const TabAreas: React.FC<Pick<DashboardAdminDataProps, 'mockEstudiantes' | 'mockDocentes' | 'areas'>> = ({
  mockEstudiantes,
  mockDocentes,
  areas,
}) => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [areaView, setAreaView] = useState<'grid' | 'ranking'>('grid');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [selectedSubarea, setSelectedSubarea] = useState<string | null>(null);

  const areasData = useMemo(() => {
    return areas.map(area => {
      const docentesArea = mockDocentes.filter(d => d.area === area.nombre);
      const estudiantesArea = mockEstudiantes.filter(e => e.areaActual === area.nombre);
      const horasTotal = estudiantesArea.reduce((s, e) => s + e.horasCompletadas, 0);
      const horasMeta = estudiantesArea.length * 150;
      const activos = estudiantesArea.filter(e => e.estado === 'activo').length;
      const completados = estudiantesArea.filter(e => e.estado === 'completado').length;
      const enRiesgo = estudiantesArea.filter(e => e.estado === 'activo' && (e.horasCompletadas / e.horasRequeridas) < 0.3).length;
      const promedio = estudiantesArea.length > 0 ? Math.round(estudiantesArea.reduce((s, e) => s + (e.horasCompletadas / e.horasRequeridas) * 100, 0) / estudiantesArea.length) : 0;
      return { ...area, docentes: docentesArea, estudiantes: estudiantesArea, horasTotal, horasMeta, activos, completados, enRiesgo, promedio };
    }).filter(a => a.estudiantes.length > 0 || a.docentes.length > 0);
  }, [areas, mockDocentes, mockEstudiantes]);

  const selectedAreaData = areasData.find(a => a.id === selectedArea);
  const totalBecados = areasData.reduce((s, a) => s + a.estudiantes.length, 0);
  const totalDocentesAreas = areasData.reduce((s, a) => s + a.docentes.length, 0);
  const totalHorasAreas = areasData.reduce((s, a) => s + a.horasTotal, 0);
  const areaConMasEstudiantes = areasData.length > 0 ? areasData.reduce((max, a) => a.estudiantes.length > max.estudiantes.length ? a : max, areasData[0]) : null;
  const areasRanked = [...areasData].sort((a, b) => b.promedio - a.promedio);

  // ── DETAIL VIEW ──
  if (selectedAreaData) {
    const prog = selectedAreaData.horasMeta > 0 ? (selectedAreaData.horasTotal / selectedAreaData.horasMeta) * 100 : 0;
    const areaColor = getAreaColor(selectedAreaData.nombre);
    const hasSubareas = selectedAreaData.subareas && selectedAreaData.subareas.length > 0;
    const activeSub = hasSubareas ? selectedAreaData.subareas!.find(s => s.id === selectedSubarea) : null;

    const filteredDocentes = activeSub
      ? selectedAreaData.docentes.filter(d => d.subarea === activeSub.nombre)
      : selectedAreaData.docentes;
    const filteredEstudiantes = activeSub
      ? selectedAreaData.estudiantes.filter(e => e.subarea === activeSub.nombre)
      : selectedAreaData.estudiantes;
    const filteredHoras = filteredEstudiantes.reduce((s, e) => s + e.horasCompletadas, 0);
    const filteredMeta = filteredEstudiantes.length * 150;
    const filteredProg = filteredMeta > 0 ? (filteredHoras / filteredMeta) * 100 : 0;
    const filteredRiesgo = filteredEstudiantes.filter(e => e.estado === 'activo' && (e.horasCompletadas / e.horasRequeridas) < 0.3).length;

    return (
      <div className="space-y-4">
        <button onClick={() => { setSelectedArea(null); setSelectedSubarea(null); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2E7D32] transition-colors">
          <ChevronDown className="w-4 h-4 rotate-90" /> Volver a todas las áreas
        </button>

        <Card className="bg-white border-none shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${areaColor}, ${areaColor}88)` }} />
          <CardContent className="p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${areaColor}15` }}>
                <Building2 className="w-7 h-7" style={{ color: areaColor }} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-xl font-bold text-gray-800">{selectedAreaData.nombre}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{selectedAreaData.descripcion}</p>
              </div>
            </div>

            {hasSubareas && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" style={{ color: areaColor }} />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Subáreas ({selectedAreaData.subareas!.length})</span>
                  {activeSub && (
                    <button onClick={() => setSelectedSubarea(null)} className="ml-auto text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                      <Eye className="w-3 h-3" /> Ver todas
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedAreaData.subareas!.map(sub => {
                    const isActive = selectedSubarea === sub.id;
                    const subDocentes = selectedAreaData.docentes.filter(d => d.subarea === sub.nombre);
                    const subEstudiantes = selectedAreaData.estudiantes.filter(e => e.subarea === sub.nombre);
                    const subHoras = subEstudiantes.reduce((s, e) => s + e.horasCompletadas, 0);
                    const subMeta = subEstudiantes.length * 150;
                    const subProg = subMeta > 0 ? (subHoras / subMeta) * 100 : 0;
                    const subActivos = subEstudiantes.filter(e => e.estado === 'activo').length;
                    const subRiesgo = subEstudiantes.filter(e => e.estado === 'activo' && (e.horasCompletadas / e.horasRequeridas) < 0.3).length;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubarea(isActive ? null : sub.id)}
                        className={`relative rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                          isActive
                            ? 'shadow-lg scale-[1.02] ring-1'
                            : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                        }`}
                        style={isActive ? { borderColor: areaColor, backgroundColor: `${areaColor}05`, ringColor: `${areaColor}30` } : {}}
                      >
                        {/* Top accent bar */}
                        <div className="h-1.5" style={{ backgroundColor: isActive ? areaColor : `${areaColor}25` }} />

                        <div className="p-4">
                          {/* Header */}
                          <div className="flex items-start gap-2.5 mb-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isActive ? areaColor : `${areaColor}15` }}>
                              <Layers className="w-4.5 h-4.5" style={{ color: isActive ? 'white' : areaColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[15px] leading-tight" style={{ color: isActive ? areaColor : '#1f2937' }}>{sub.nombre}</p>
                              {sub.descripcion && (
                                <p className={`text-xs leading-relaxed mt-1 ${isActive ? 'text-gray-600 line-clamp-3' : 'text-gray-400 line-clamp-2'}`}>{sub.descripcion}</p>
                              )}
                            </div>
                            {isActive && (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: areaColor }}>
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>

                          {/* KPI row */}
                          <div className="grid grid-cols-4 gap-1.5 mb-3">
                            {[
                              { label: 'Becados', value: subEstudiantes.length, icon: Users },
                              { label: 'Docentes', value: subDocentes.length, icon: GraduationCap },
                              { label: 'Horas', value: `${subHoras}h`, icon: Clock },
                              { label: 'Activos', value: subActivos, icon: UserCheck },
                            ].map(kpi => (
                              <div key={kpi.label} className={`text-center p-1.5 rounded-lg ${isActive ? 'bg-white/80' : 'bg-gray-50'}`}>
                                <kpi.icon className="w-3 h-3 mx-auto mb-0.5" style={{ color: isActive ? areaColor : '#9ca3af' }} />
                                <p className="text-xs font-bold" style={{ color: isActive ? areaColor : '#374151' }}>{kpi.value}</p>
                                <p className="text-[8px] text-gray-400">{kpi.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* Progress bar */}
                          <div className="flex items-center gap-2.5">
                            <div className={`flex-1 rounded-full overflow-hidden ${isActive ? 'h-2.5' : 'h-2'} bg-gray-200`}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(subProg, 100)}%`, backgroundColor: subProg < 30 ? '#EF5350' : subProg < 60 ? '#FFC107' : '#2E7D32' }} />
                            </div>
                            <span className={`font-bold ${isActive ? 'text-sm' : 'text-xs'}`} style={{ color: subProg < 30 ? '#EF5350' : subProg < 60 ? '#FFC107' : '#2E7D32' }}>{Math.round(subProg)}%</span>
                          </div>

                          {/* Risk indicator */}
                          {subRiesgo > 0 && (
                            <div className={`mt-2 flex items-center gap-1.5 text-[10px] ${isActive ? 'text-red-600' : 'text-red-400'}`}>
                              <AlertCircle className="w-3 h-3" />
                              <span>{subRiesgo} en riesgo</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {activeSub && (
          <div className="flex items-center gap-2 px-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: areaColor }} />
            <span className="text-xs font-semibold" style={{ color: areaColor }}>Filtrando: {activeSub.nombre}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Becados', value: filteredEstudiantes.length, icon: Users, color: areaColor },
            { label: 'Docentes', value: filteredDocentes.length, icon: GraduationCap, color: '#616161' },
            { label: 'Horas Totales', value: `${filteredHoras}h`, icon: Clock, color: '#2E7D32' },
            { label: 'Progreso', value: `${Math.round(filteredProg)}%`, icon: Target, color: filteredProg < 30 ? '#EF5350' : filteredProg < 60 ? '#FFC107' : '#2E7D32' },
            { label: 'En Riesgo', value: filteredRiesgo, icon: AlertCircle, color: filteredRiesgo > 0 ? '#EF5350' : '#9E9E9E' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl p-3.5 shadow-sm border-l-4 flex items-center gap-3" style={{ borderLeftColor: kpi.color }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}12` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">{kpi.label}</p>
                <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Restructured: Students-focused layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Docentes - compact sidebar */}
          <Card className="bg-white border-none shadow-sm lg:col-span-2">
            <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
              <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
                <GraduationCap className="w-4 h-4" /> Docentes {activeSub ? `— ${activeSub.nombre}` : ''}
                <Badge className="bg-[#2E7D32]/10 text-[#2E7D32] ml-2">{filteredDocentes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 max-h-[560px] overflow-y-auto">
              {filteredDocentes.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Sin docentes asignados</p>
              )}
              {(() => {
                // Unified docente rendering for ALL areas
                const hasSubareasLocal = selectedAreaData.subareas && selectedAreaData.subareas.length > 0;
                const relevantSubs = activeSub ? [activeSub] : (hasSubareasLocal ? selectedAreaData.subareas! : []);

                if (relevantSubs.length > 0) {
                  // Group docentes by subarea — show subarea header once, docentes compactly
                  const groups = relevantSubs.map(sub => ({
                    subarea: sub,
                    docentes: filteredDocentes.filter(d => d.subarea === sub.nombre),
                    estudiantes: filteredEstudiantes.filter(e => e.subarea === sub.nombre),
                  })).filter(g => g.docentes.length > 0);

                  return groups.map(group => (
                    <div key={group.subarea.id} className="rounded-xl border border-gray-100 overflow-hidden">
                      {/* Subarea header - compact */}
                      <div className="px-3 py-2 bg-gradient-to-r from-[#E8F5E9] to-white flex items-center gap-2 border-b border-gray-100">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: areaColor }}>
                          <Layers className="w-3 h-3 text-white" />
                        </div>
                        <p className="font-semibold text-xs" style={{ color: areaColor }}>{group.subarea.nombre}</p>
                        <div className="ml-auto flex items-center gap-2 text-[9px] text-gray-400">
                          <span>{group.docentes.length} doc.</span>
                          <span>·</span>
                          <span>{group.estudiantes.length} bec.</span>
                        </div>
                      </div>
                      {/* Docentes compactly */}
                      <div className="divide-y divide-gray-50">
                        {group.docentes.map(doc => {
                          const estDoc = group.estudiantes.filter(e => e.docenteResponsableId === doc.id);
                          const horasDoc = estDoc.reduce((s, e) => s + e.horasCompletadas, 0);
                          return (
                            <div key={doc.id} className="px-3 py-2.5 flex items-center gap-2.5 hover:bg-gray-50/50 transition-colors">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0" style={{ backgroundColor: areaColor }}>
                                {doc.nombre.split(' ').slice(-2).map(n => n[0]).join('')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs text-gray-700 truncate">{doc.nombre}</p>
                                <div className="flex items-center gap-2 text-[9px] text-gray-400 mt-0.5">
                                  {doc.carrerasAsignadas && <span>{doc.carrerasAsignadas.map(c => c.split(' - ')[0]).join(', ')}</span>}
                                  <a href={`mailto:${doc.email}`} className="text-blue-500 hover:underline flex items-center gap-0.5 ml-auto" onClick={e => e.stopPropagation()}>
                                    <Mail className="w-2.5 h-2.5" /> correo
                                  </a>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">{estDoc.length}</span>
                                <p className="text-[8px] text-gray-400 mt-0.5">{horasDoc}h</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                } else {
                  // No subareas — flat docente list
                  return filteredDocentes.map(doc => {
                    const estDoc = filteredEstudiantes.filter(e => e.docenteResponsableId === doc.id);
                    const horasDoc = estDoc.reduce((s, e) => s + e.horasCompletadas, 0);
                    return (
                      <div key={doc.id} className="rounded-xl border border-gray-100 p-3 flex items-center gap-2.5 hover:border-gray-200 transition-all">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: areaColor }}>
                          {doc.nombre.split(' ').slice(-2).map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-700 truncate">{doc.nombre}</p>
                          <a href={`mailto:${doc.email}`} className="text-[9px] text-blue-500 hover:underline flex items-center gap-0.5 mt-0.5">
                            <Mail className="w-2.5 h-2.5" /> {doc.email}
                          </a>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">{estDoc.length}</span>
                          <p className="text-[8px] text-gray-400 mt-0.5">{horasDoc}h</p>
                        </div>
                      </div>
                    );
                  });
                }
              })()}
            </CardContent>
          </Card>

          {/* Becados - main focus, larger panel */}
          <Card className="bg-white border-none shadow-sm lg:col-span-3">
            <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
              <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
                <Users className="w-4 h-4" /> Becados {activeSub ? `— ${activeSub.nombre}` : '— Ranking de Progreso'}
                <Badge className="bg-[#2E7D32]/10 text-[#2E7D32] ml-2">{filteredEstudiantes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 max-h-[560px] overflow-y-auto">
              {filteredEstudiantes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Sin becados asignados a esta subárea</p>
              ) : (
              <div className="space-y-1">
                {[...filteredEstudiantes].sort((a, b) => (b.horasCompletadas / b.horasRequeridas) - (a.horasCompletadas / a.horasRequeridas)).map((est, idx) => {
                  const p = (est.horasCompletadas / est.horasRequeridas) * 100;
                  const isRisk = p < 30;
                  const docResp = mockDocentes.find(d => d.id === est.docenteResponsableId);
                  return (
                    <div key={est.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors border ${
                      isRisk ? 'border-red-100 bg-red-50/30 hover:bg-red-50/60' : 'border-transparent hover:border-gray-100 hover:bg-gray-50'
                    }`}>
                      {/* Rank */}
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                        idx < 3 ? 'bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] text-white shadow-sm' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {idx + 1}
                      </span>
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                        {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      {/* Info block */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{est.nombre}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4" style={{ color: getCarreraColor(est.carrera), borderColor: getCarreraColor(est.carrera) }}>{getCarreraCode(est.carrera)}</Badge>
                          {est.subarea && <span className="text-[9px] text-gray-400 truncate max-w-[100px]">{est.subarea}</span>}
                          {docResp && <span className="text-[9px] text-gray-400 truncate max-w-[100px] hidden xl:inline">→ {docResp.nombre.split(' ')[0]}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[140px]">
                            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(p, 100)}%`, backgroundColor: p < 30 ? '#EF5350' : p < 60 ? '#FFC107' : '#2E7D32' }} />
                          </div>
                          <span className="text-[10px] text-gray-500">{est.horasCompletadas}/{est.horasRequeridas}h</span>
                        </div>
                      </div>
                      {/* Progress & Status */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-bold" style={{ color: p < 30 ? '#EF5350' : p < 60 ? '#FFC107' : '#2E7D32' }}>{Math.round(p)}%</span>
                      </div>
                      <StatusBadge status={est.estado} />
                    </div>
                  );
                })}
              </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── MAIN VIEW ──
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: Building2, label: 'Áreas Activas', value: areasData.length, color: '#2E7D32', bg: 'from-green-50 to-white', border: 'border-green-100' },
          { icon: Users, label: 'Becados Asignados', value: totalBecados, color: '#1565C0', bg: 'from-blue-50 to-white', border: 'border-blue-100' },
          { icon: GraduationCap, label: 'Docentes', value: totalDocentesAreas, color: '#6A1B9A', bg: 'from-purple-50 to-white', border: 'border-purple-100' },
          { icon: Clock, label: 'Horas Acumuladas', value: `${totalHorasAreas}h`, color: '#EF6C00', bg: 'from-amber-50 to-white', border: 'border-amber-100' },
          { icon: Award, label: 'Mayor Carga', value: areaConMasEstudiantes ? `${areaConMasEstudiantes.estudiantes.length}` : '—', color: '#C62828', bg: 'from-red-50 to-white', border: 'border-red-100', sub: areaConMasEstudiantes?.nombre },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-xl p-3.5 border ${s.border} flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 uppercase">{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              {'sub' in s && s.sub && <p className="text-[9px] text-gray-400 truncate">{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setAreaView('grid')} className={`px-3.5 py-2 rounded-lg text-xs transition-all ${areaView === 'grid' ? 'bg-[#2E7D32] text-white shadow-sm' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
          <Building2 className="w-3.5 h-3.5 inline mr-1.5" />Tarjetas
        </button>
        <button onClick={() => setAreaView('ranking')} className={`px-3.5 py-2 rounded-lg text-xs transition-all ${areaView === 'ranking' ? 'bg-[#2E7D32] text-white shadow-sm' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
          <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />Ranking
        </button>
      </div>

      {areaView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areasData.map(area => {
            const progA = area.horasMeta > 0 ? (area.horasTotal / area.horasMeta) * 100 : 0;
            const ac = getAreaColor(area.nombre);
            return (
              <Card key={area.id} className="bg-white border-none shadow-sm hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelectedArea(area.id)}>
                <CardContent className="p-0">
                  <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: ac }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${ac}15` }}>
                          <Building2 className="w-5 h-5" style={{ color: ac }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm group-hover:text-[#2E7D32] transition-colors">{area.nombre}</h3>
                          <p className="text-[10px] text-gray-400">{area.descripcion}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2E7D32] transition-colors mt-1" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-[10px] text-gray-500">Becados</p>
                        <p className="text-lg font-bold" style={{ color: ac }}>{area.estudiantes.length}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-[10px] text-gray-500">Docentes</p>
                        <p className="text-lg font-bold text-gray-700">{area.docentes.length}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-[10px] text-gray-500">Promedio</p>
                        <p className="text-lg font-bold" style={{ color: area.promedio < 30 ? '#EF5350' : area.promedio < 60 ? '#FFC107' : '#2E7D32' }}>{area.promedio}%</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500">Horas: {area.horasTotal}/{area.horasMeta}h</span>
                        <span className="text-xs font-bold" style={{ color: ac }}>{Math.round(progA)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(progA, 100)}%`, backgroundColor: ac }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {area.activos} activos
                      </span>
                      {area.completados > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {area.completados}
                        </span>
                      )}
                      {area.enRiesgo > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {area.enRiesgo} riesgo
                        </span>
                      )}
                      {area.subareas && area.subareas.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px]">
                          <Layers className="w-2.5 h-2.5" /> {area.subareas.length}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" /> Ranking de Áreas por Progreso Promedio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {areasRanked.map((area, idx) => {
              const ac = getAreaColor(area.nombre);
              const progR = area.horasMeta > 0 ? (area.horasTotal / area.horasMeta) * 100 : 0;
              return (
                <div key={area.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100" onClick={() => setSelectedArea(area.id)}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${idx < 3 ? 'bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ac}15` }}>
                    <Building2 className="w-4 h-4" style={{ color: ac }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 text-sm">{area.nombre}</p>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4" style={{ color: ac, borderColor: ac }}>{area.estudiantes.length} becados</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(progR, 100)}%`, backgroundColor: ac }} />
                      </div>
                      <span className="text-[10px] text-gray-500">{area.horasTotal}/{area.horasMeta}h</span>
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0 px-2">
                    <p className="text-lg font-bold" style={{ color: area.promedio < 30 ? '#EF5350' : area.promedio < 60 ? '#FFC107' : '#2E7D32' }}>{area.promedio}%</p>
                    <p className="text-[9px] text-gray-400">promedio</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {area.enRiesgo > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[9px]">{area.enRiesgo} riesgo</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: DOCENTES
// ═══════════════════════════════════════════════
const TabDocentes: React.FC<Pick<DashboardAdminDataProps, 'mockEstudiantes' | 'mockDocentes'>> = ({
  mockEstudiantes,
  mockDocentes,
}) => {
  const [searchDoc, setSearchDoc] = useState('');
  const [filterArea, setFilterArea] = useState('');

  const uniqueAreas = useMemo(() => [...new Set(mockDocentes.map(d => d.area))].sort(), [mockDocentes]);

  const filteredDocentes = useMemo(() => {
    return mockDocentes.filter(d => {
      const matchSearch = !searchDoc || d.nombre.toLowerCase().includes(searchDoc.toLowerCase()) || d.email.toLowerCase().includes(searchDoc.toLowerCase());
      const matchArea = !filterArea || d.area === filterArea;
      return matchSearch && matchArea;
    });
  }, [searchDoc, filterArea]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar docente por nombre o email..."
                value={searchDoc}
                onChange={e => setSearchDoc(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterArea}
              onChange={e => setFilterArea(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
            >
              <option value="">Todas las áreas</option>
              {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <Badge className="bg-[#2E7D32] text-white">{filteredDocentes.length} docentes</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Docentes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocentes.map(doc => {
          const estDoc = mockEstudiantes.filter(e => e.docenteResponsableId === doc.id);
          const horasTotal = estDoc.reduce((s, e) => s + e.horasCompletadas, 0);
          const promedio = estDoc.length > 0 ? Math.round(horasTotal / estDoc.length) : 0;
          return (
            <Card key={doc.id} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: getAreaColor(doc.area) }}>
                    {doc.nombre.split(' ').slice(-2).map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: getAreaColor(doc.area) }}>{doc.subarea || doc.area}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ color: getAreaColor(doc.area), borderColor: getAreaColor(doc.area) }}>
                        {doc.area}
                      </Badge>
                      <span className="text-[10px] text-gray-400">· {doc.nombre}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-center">
                    <p className="text-[10px] text-gray-500">Becados</p>
                    <p className="text-sm font-bold text-[#2E7D32]">{estDoc.length}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg text-center">
                    <p className="text-[10px] text-gray-500">Horas Tot.</p>
                    <p className="text-sm font-bold text-gray-700">{horasTotal}h</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg text-center">
                    <p className="text-[10px] text-gray-500">Promedio</p>
                    <p className="text-sm font-bold text-gray-700">{promedio}h</p>
                  </div>
                </div>

                {/* Students list */}
                {estDoc.length > 0 && (
                  <div className="space-y-1.5">
                    {estDoc.map(est => {
                      const prog = (est.horasCompletadas / est.horasRequeridas) * 100;
                      return (
                        <div key={est.id} className="flex items-center gap-2 text-xs p-1.5 rounded-lg hover:bg-gray-50">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                            {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <span className="text-gray-700 truncate flex-1">{est.nombre}</span>
                          <span className="text-[#2E7D32] font-bold">{Math.round(prog)}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <a href={`mailto:${doc.email}`} className="flex items-center gap-1.5 mt-3 pt-3 border-t text-xs text-blue-600 hover:underline">
                  <Mail className="w-3.5 h-3.5" /> {doc.email}
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: ESTUDIANTES
// ═══════════════════════════════════════════════
const TabEstudiantes: React.FC<Pick<DashboardAdminDataProps, 'mockEstudiantes' | 'mockDocentes' | 'mockRegistrosHoras'>> = ({
  mockEstudiantes,
  mockDocentes,
  mockRegistrosHoras,
}) => {
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [sortField, setSortField] = useState<'nombre' | 'progreso' | 'horas'>('nombre');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const uniqueAreas = useMemo(() => [...new Set(mockEstudiantes.map(e => e.areaActual).filter(Boolean))].sort(), [mockEstudiantes]);
  const uniqueCarreras = useMemo(() => [...new Set(mockEstudiantes.map(e => getCarreraCode(e.carrera)))].sort(), [mockEstudiantes]);

  const filtered = useMemo(() => {
    let data = mockEstudiantes.filter(e => {
      const matchSearch = !search || e.nombre.toLowerCase().includes(search.toLowerCase()) || e.matricula.includes(search) || e.email.toLowerCase().includes(search.toLowerCase());
      const matchArea = !filterArea || e.areaActual === filterArea;
      const matchCarrera = !filterCarrera || getCarreraCode(e.carrera) === filterCarrera;
      const matchEstado = !filterEstado || e.estado === filterEstado;
      return matchSearch && matchArea && matchCarrera && matchEstado;
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

  const filteredActivos = filtered.filter(e => e.estado === 'activo').length;
  const filteredCompletados = filtered.filter(e => e.estado === 'completado').length;
  const filteredInactivos = filtered.filter(e => e.estado === 'inactivo').length;
  const filteredEnRiesgo = filtered.filter(e => e.estado === 'activo' && (e.horasCompletadas / e.horasRequeridas) < 0.3).length;
  const promedioProgreso = filtered.length > 0 ? Math.round(filtered.reduce((s, e) => s + (e.horasCompletadas / e.horasRequeridas) * 100, 0) / filtered.length) : 0;
  const totalHorasFiltradas = filtered.reduce((s, e) => s + e.horasCompletadas, 0);

  // Student detail view
  if (selectedStudent) {
    const est = selectedStudent;
    const prog = (est.horasCompletadas / est.horasRequeridas) * 100;
    const registrosEst = mockRegistrosHoras.filter(r => r.estudianteId === est.id);
    const horasPendientes = registrosEst.filter(r => r.estado === 'pendiente').reduce((s, r) => s + r.totalHoras, 0);
    const horasAprobadas = registrosEst.filter(r => r.estado === 'aprobada').reduce((s, r) => s + r.totalHoras, 0);
    const horasRechazadas = registrosEst.filter(r => r.estado === 'rechazada').reduce((s, r) => s + r.totalHoras, 0);
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2E7D32] transition-colors">
          <ChevronDown className="w-4 h-4 rotate-90" /> Volver a la lista
        </button>
        <Card className="bg-white border-none shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#2E7D32] to-[#66BB6A]" />
          <CardContent className="p-5">
            <div className="flex items-start gap-5 flex-wrap">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-xl font-bold text-gray-800">{est.nombre}</h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <Badge variant="outline" style={{ color: getCarreraColor(est.carrera), borderColor: getCarreraColor(est.carrera) }}>{est.carrera}</Badge>
                  <span className="text-sm text-gray-500">{est.matricula}</span>
                  <StatusBadge status={est.estado} />
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Mail className="w-3.5 h-3.5" />
                  <a href={`mailto:${est.email}`} className="text-blue-600 hover:underline">{est.email}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { label: 'Periodo', value: `${est.periodoActual}/3` },
                  { label: 'Cuatrimestre', value: est.cuatrimestre },
                ].map(s => (
                  <div key={s.label} className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase">{s.label}</p>
                    <p className="text-sm font-bold text-gray-700">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Progreso Total', value: `${Math.round(prog)}%`, color: prog < 30 ? '#EF5350' : prog < 60 ? '#FFC107' : '#2E7D32', icon: Target, showBar: true, barPct: prog },
            { label: 'Horas Completadas', value: `${est.horasCompletadas}/${est.horasRequeridas}`, color: '#2E7D32', icon: Clock },
            { label: 'Aprobadas', value: `${horasAprobadas}h`, color: '#2E7D32', icon: CheckCircle },
            { label: 'Pendientes', value: `${horasPendientes}h`, color: '#FBC02D', icon: Clock },
            { label: 'Registros', value: registrosEst.length, color: '#1565C0', icon: ClipboardList },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl p-3.5 shadow-sm border-l-4 flex items-center gap-3" style={{ borderLeftColor: kpi.color }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}12` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 uppercase">{kpi.label}</p>
                <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                {'showBar' in kpi && kpi.showBar && (
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(kpi.barPct as number, 100)}%`, backgroundColor: kpi.color }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
              <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4" /> Asignación Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${getAreaColor(est.areaActual || '')}15` }}>
                  <Building2 className="w-5 h-5" style={{ color: getAreaColor(est.areaActual || '') }} />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{est.areaActual || 'Sin asignar'}</p>
                  {est.subarea && <p className="text-[10px] text-gray-500">{est.subarea}</p>}
                </div>
              </div>
              {est.docenteResponsable && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2E7D32] text-white font-bold text-xs">
                    {est.docenteResponsable.split(' ').slice(-2).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{est.docenteResponsable}</p>
                    <p className="text-[10px] text-gray-500">Docente Responsable</p>
                  </div>
                </div>
              )}
              {est.cursoAsignado && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{est.cursoAsignado}</p>
                    <p className="text-[10px] text-gray-500">Curso Asignado</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
              <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
                <ClipboardList className="w-4 h-4" /> Últimos Registros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-h-[300px] overflow-y-auto">
              {registrosEst.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm">Sin registros aún</p>
              ) : (
                <div className="space-y-2">
                  {registrosEst.slice(0, 8).map(r => (
                    <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-gray-100">
                      <div className="text-center min-w-[40px]">
                        <p className="text-[10px] text-gray-400">{r.fecha.split('-').slice(1).join('/')}</p>
                        <p className="text-sm font-bold text-[#2E7D32]">{r.totalHoras}h</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 truncate">{r.descripcion}</p>
                        <p className="text-[10px] text-gray-400">{r.horaInicio} - {r.horaFin}</p>
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
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { icon: UserCheck, label: 'Activos', value: filteredActivos, color: '#2E7D32', bg: 'from-green-50 to-white', border: 'border-green-100' },
          { icon: CheckCircle, label: 'Completados', value: filteredCompletados, color: '#1565C0', bg: 'from-blue-50 to-white', border: 'border-blue-100' },
          { icon: UserX, label: 'Inactivos', value: filteredInactivos, color: '#9E9E9E', bg: 'from-gray-50 to-white', border: 'border-gray-200' },
          { icon: AlertCircle, label: 'En Riesgo', value: filteredEnRiesgo, color: '#EF5350', bg: 'from-red-50 to-white', border: 'border-red-100' },
          { icon: Percent, label: 'Promedio', value: `${promedioProgreso}%`, color: '#EF6C00', bg: 'from-amber-50 to-white', border: 'border-amber-100' },
          { icon: Clock, label: 'Horas Totales', value: `${totalHorasFiltradas}h`, color: '#6A1B9A', bg: 'from-purple-50 to-white', border: 'border-purple-100' },
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

      {/* Filters */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, matrícula o email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <select value={filterArea} onChange={e => { setFilterArea(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700">
              <option value="">Todas las áreas</option>
              {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filterCarrera} onChange={e => { setFilterCarrera(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700">
              <option value="">Todas las carreras</option>
              {uniqueCarreras.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700">
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="completado">Completado</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg text-xs transition-all ${viewMode === 'table' ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="Vista tabla">
                <ClipboardList className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('cards')} className={`p-2 rounded-lg text-xs transition-all ${viewMode === 'cards' ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="Vista tarjetas">
                <Layers className="w-4 h-4" />
              </button>
            </div>
            <Badge className="bg-[#2E7D32] text-white">{total} resultados</Badge>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'table' ? (
        /* TABLE VIEW */
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
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs w-20">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(est => {
                    const prog = (est.horasCompletadas / est.horasRequeridas) * 100;
                    const isExpanded = expandedRow === est.id;
                    return (
                      <React.Fragment key={est.id}>
                        <tr className={`border-b border-gray-100 hover:bg-green-50/30 transition-colors ${isExpanded ? 'bg-green-50/20' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                                {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <div>
                                <span className="font-medium text-gray-800">{est.nombre}</span>
                                <p className="text-[10px] text-gray-400">{est.matricula}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-[10px]" style={{ color: getCarreraColor(est.carrera), borderColor: getCarreraColor(est.carrera) }}>
                              {getCarreraCode(est.carrera)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getAreaColor(est.areaActual || '') }} />
                              {est.areaActual || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#2E7D32]">{est.horasCompletadas}<span className="text-gray-400 font-normal">/{est.horasRequeridas}</span></td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.min(prog, 100)}%`, backgroundColor: prog < 30 ? '#EF5350' : prog < 60 ? '#FFC107' : '#2E7D32' }} />
                              </div>
                              <span className="text-xs font-bold" style={{ color: prog < 30 ? '#EF5350' : prog < 60 ? '#FFC107' : '#2E7D32' }}>{Math.round(prog)}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4"><StatusBadge status={est.estado} /></td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
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
                          <tr className="bg-gradient-to-r from-green-50/40 to-white">
                            <td colSpan={7} className="px-4 py-3">
                              <div className="flex items-start gap-6 text-xs">
                                <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-100 flex-1">
                                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Área / Docente</p>
                                    <p className="text-gray-700">{est.areaActual || 'Sin asignar'}</p>
                                    <p className="text-gray-500">{est.docenteResponsable || '—'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-100 flex-1">
                                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Periodo / Cuatrimestre</p>
                                    <p className="text-gray-700">Periodo {est.periodoActual}/3</p>
                                    <p className="text-gray-500">Cuatrimestre {est.cuatrimestre}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-100 flex-1">
                                  <ClipboardList className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div>
                                    <p className="text-[9px] text-gray-400 uppercase">Registros</p>
                                    <p className="text-gray-700">{mockRegistrosHoras.filter(r => r.estudianteId === est.id).length} registros</p>
                                    <p className="text-gray-500">{mockRegistrosHoras.filter(r => r.estudianteId === est.id && r.estado === 'pendiente').length} pendientes</p>
                                  </div>
                                </div>
                                {est.cursoAsignado && (
                                  <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-100 flex-1">
                                    <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <div>
                                      <p className="text-[9px] text-gray-400 uppercase">Curso</p>
                                      <p className="text-gray-700">{est.cursoAsignado}</p>
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
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <p className="text-xs text-gray-500">
                  Mostrando {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} de {total}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-8 px-3 text-xs">Anterior</Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = totalPages <= 7 ? i + 1 : (page <= 4 ? i + 1 : Math.min(page - 3 + i, totalPages));
                    return (
                      <Button key={i} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className={`h-8 w-8 text-xs ${p === page ? 'bg-[#2E7D32] hover:bg-[#1B5E20]' : ''}`}>{p}</Button>
                    );
                  })}
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-8 px-3 text-xs">Siguiente</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* CARDS VIEW */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paged.map(est => {
              const prog = (est.horasCompletadas / est.horasRequeridas) * 100;
              const registrosEst = mockRegistrosHoras.filter(r => r.estudianteId === est.id);
              return (
                <Card key={est.id} className="bg-white border-none shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-0">
                    <div className="h-1 rounded-t-xl" style={{ backgroundColor: getCarreraColor(est.carrera) }} />
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                          {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{est.nombre}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4" style={{ color: getCarreraColor(est.carrera), borderColor: getCarreraColor(est.carrera) }}>{getCarreraCode(est.carrera)}</Badge>
                            <span className="text-[10px] text-gray-400">{est.matricula}</span>
                          </div>
                        </div>
                        <StatusBadge status={est.estado} />
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-500">{est.horasCompletadas}/{est.horasRequeridas}h</span>
                          <span className="text-xs font-bold" style={{ color: prog < 30 ? '#EF5350' : prog < 60 ? '#FFC107' : '#2E7D32' }}>{Math.round(prog)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(prog, 100)}%`, backgroundColor: prog < 30 ? '#EF5350' : prog < 60 ? '#FFC107' : '#2E7D32' }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 mb-3">
                        <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                          <p className="text-[9px] text-gray-500">Área</p>
                          <p className="text-[10px] font-medium text-gray-700 truncate">{est.areaActual || '—'}</p>
                        </div>
                        <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                          <p className="text-[9px] text-gray-500">Periodo</p>
                          <p className="text-[10px] font-medium text-gray-700">{est.periodoActual}/3</p>
                        </div>
                        <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                          <p className="text-[9px] text-gray-500">Registros</p>
                          <p className="text-[10px] font-medium text-gray-700">{registrosEst.length}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 pt-2 border-t">
                        <button onClick={() => setSelectedStudent(est)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] text-[#2E7D32] hover:bg-green-50 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> Ver detalle
                        </button>
                        <a href={`mailto:${est.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] text-blue-600 hover:bg-blue-50 transition-colors">
                          <Mail className="w-3.5 h-3.5" /> Contactar
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-8 px-3 text-xs">Anterior</Button>
              <span className="text-xs text-gray-500">Pág. {page} de {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-8 px-3 text-xs">Siguiente</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: REGISTROS
// ═══════════════════════════════════════════════
const TabRegistros: React.FC<Pick<DashboardAdminDataProps, 'mockRegistrosHoras'>> = ({
  mockRegistrosHoras,
}) => {
  const [filterEstado, setFilterEstado] = useState('');
  const [searchReg, setSearchReg] = useState('');

  const filtered = useMemo(() => {
    return mockRegistrosHoras
      .filter(r => {
        const matchEstado = !filterEstado || r.estado === filterEstado;
        const matchSearch = !searchReg || r.estudianteNombre.toLowerCase().includes(searchReg.toLowerCase()) || r.descripcion.toLowerCase().includes(searchReg.toLowerCase());
        return matchEstado && matchSearch;
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [filterEstado, searchReg]);

  const { page, setPage, totalPages, paged, total } = usePagination(filtered, 15);

  // Stats
  const totalHoras = mockRegistrosHoras.reduce((s, r) => s + r.totalHoras, 0);
  const aprobadas = mockRegistrosHoras.filter(r => r.estado === 'aprobada');
  const pendientes = mockRegistrosHoras.filter(r => r.estado === 'pendiente');
  const rechazados = mockRegistrosHoras.filter(r => r.estado === 'rechazada');

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase">Total Registros</p>
            <p className="text-2xl font-bold text-gray-800">{mockRegistrosHoras.length}</p>
            <p className="text-xs text-gray-500">{totalHoras}h registradas</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-none shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-green-700 uppercase">Aprobados</p>
            <p className="text-2xl font-bold text-green-700">{aprobadas.length}</p>
            <p className="text-xs text-green-600">{aprobadas.reduce((s, r) => s + r.totalHoras, 0)}h</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-none shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-amber-700 uppercase">Pendientes</p>
            <p className="text-2xl font-bold text-amber-700">{pendientes.length}</p>
            <p className="text-xs text-amber-600">{pendientes.reduce((s, r) => s + r.totalHoras, 0)}h</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-none shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-red-700 uppercase">Rechazados</p>
            <p className="text-2xl font-bold text-red-700">{rechazados.length}</p>
            <p className="text-xs text-red-600">{rechazados.reduce((s, r) => s + r.totalHoras, 0)}h</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por estudiante o descripción..."
                value={searchReg}
                onChange={e => { setSearchReg(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <select value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700">
              <option value="">Todos los estados</option>
              <option value="aprobada">Aprobados</option>
              <option value="pendiente">Pendientes</option>
              <option value="rechazada">Rechazados</option>
            </select>
            <Badge className="bg-[#2E7D32] text-white">{total} registros</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Fecha</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Estudiante</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Área</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Docente</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Horario</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Horas</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Descripción</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(reg => (
                  <tr key={reg.id} className="border-b border-gray-100 hover:bg-green-50/30 transition-colors">
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{reg.fecha}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{reg.estudianteNombre}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{reg.area}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{reg.docenteNombre}</td>
                    <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{reg.horaInicio}-{reg.horaFin}</td>
                    <td className="py-3 px-4 font-bold text-[#2E7D32]">{reg.totalHoras}h</td>
                    <td className="py-3 px-4 text-xs text-gray-600 max-w-[200px] truncate">{reg.descripcion}</td>
                    <td className="py-3 px-4"><StatusBadge status={reg.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <p className="text-xs text-gray-500">
                Mostrando {(page - 1) * 15 + 1}-{Math.min(page * 15, total)} de {total}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-8 px-3 text-xs">
                  Anterior
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = totalPages <= 7 ? i + 1 : (page <= 4 ? i + 1 : Math.min(page - 3 + i, totalPages));
                  return (
                    <Button
                      key={i}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 text-xs ${p === page ? 'bg-[#2E7D32] hover:bg-[#1B5E20]' : ''}`}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-8 px-3 text-xs">
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};