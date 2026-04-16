import React, { useState, useMemo } from 'react';
import {
  Building2, Users, Clock, GraduationCap, TrendingUp,
  Layers, ChevronDown, ChevronRight, AlertCircle, CheckCircle,
  Search, Award, Plus, BarChart3, Mail, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { StatusBadge } from '../components/shared/StatusBadge';
import { mockEstudiantes, mockDocentes, mockRegistrosHoras, areas, cuatrimestres } from '../data/mockData';
import { toast } from 'sonner';

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

const progColor = (p: number) => p < 30 ? '#EF5350' : p < 60 ? '#FFC107' : '#2E7D32';

// ─── Tipos ───
type ViewMode = 'grid' | 'ranking' | 'asignaciones';

export const Asignaciones: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSubareaId, setSelectedSubareaId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dialog state
  const [selEstudiante, setSelEstudiante] = useState('');
  const [selArea, setSelArea] = useState('');
  const [selSubarea, setSelSubarea] = useState('');
  const [selDocente, setSelDocente] = useState('');
  const [selCuatrimestre, setSelCuatrimestre] = useState('');

  // ─── Computed area data ───
  const areasData = useMemo(() => {
    return areas.map(area => {
      const docentesArea = mockDocentes.filter(d => d.area === area.nombre);
      const estudiantesArea = mockEstudiantes.filter(e => e.areaActual === area.nombre);
      const horasTotal = estudiantesArea.reduce((s, e) => s + e.horasCompletadas, 0);
      const horasMeta = estudiantesArea.length * 150;
      const activos = estudiantesArea.filter(e => e.estado === 'activo').length;
      const completados = estudiantesArea.filter(e => e.estado === 'completado').length;
      const enRiesgo = estudiantesArea.filter(e => e.estado === 'activo' && (e.horasCompletadas / e.horasRequeridas) < 0.3).length;
      const promedio = estudiantesArea.length > 0
        ? Math.round(estudiantesArea.reduce((s, e) => s + (e.horasCompletadas / e.horasRequeridas) * 100, 0) / estudiantesArea.length)
        : 0;
      const registrosArea = mockRegistrosHoras.filter(r => estudiantesArea.some(e => e.id === r.estudianteId));
      const pendientesArea = registrosArea.filter(r => r.estado === 'pendiente').length;
      return { ...area, docentes: docentesArea, estudiantes: estudiantesArea, horasTotal, horasMeta, activos, completados, enRiesgo, promedio, pendientes: pendientesArea };
    });
  }, []);

  const areasConDatos = areasData.filter(a => a.estudiantes.length > 0 || a.docentes.length > 0);
  const areasRanked = [...areasConDatos].sort((a, b) => b.promedio - a.promedio);

  const totalBecados = areasConDatos.reduce((s, a) => s + a.estudiantes.length, 0);
  const totalDocentes = areasConDatos.reduce((s, a) => s + a.docentes.length, 0);
  const totalHoras = areasConDatos.reduce((s, a) => s + a.horasTotal, 0);
  const totalPendientes = areasConDatos.reduce((s, a) => s + a.pendientes, 0);
  const areaMayor = areasConDatos.length > 0 ? areasConDatos.reduce((mx, a) => a.estudiantes.length > mx.estudiantes.length ? a : mx, areasConDatos[0]) : null;

  // Filtered for search
  const filteredAreas = useMemo(() => {
    if (!search) return areasConDatos;
    const q = search.toLowerCase();
    return areasConDatos.filter(a =>
      a.nombre.toLowerCase().includes(q) ||
      a.descripcion.toLowerCase().includes(q) ||
      a.docentes.some(d => d.nombre.toLowerCase().includes(q)) ||
      a.estudiantes.some(e => e.nombre.toLowerCase().includes(q))
    );
  }, [areasConDatos, search]);

  const selectedAreaData = areasConDatos.find(a => a.id === selectedAreaId);

  // Dialog helpers
  const areaSelObj = areas.find(a => a.id === selArea);
  const docentesFiltrados = mockDocentes.filter(d => {
    if (!selArea) return false;
    const area = areas.find(a => a.id === selArea);
    if (d.area !== area?.nombre) return false;
    if (selSubarea && d.subarea !== selSubarea) return false;
    return true;
  });

  const handleSave = () => {
    if (!selEstudiante || !selArea || !selDocente || !selCuatrimestre) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    toast.success('Asignación creada exitosamente');
    setIsDialogOpen(false);
    setSelEstudiante(''); setSelArea(''); setSelSubarea(''); setSelDocente(''); setSelCuatrimestre('');
  };

  // ── AREA DETAIL VIEW ──
  if (selectedAreaData) {
    const prog = selectedAreaData.horasMeta > 0 ? (selectedAreaData.horasTotal / selectedAreaData.horasMeta) * 100 : 0;
    const ac = getAreaColor(selectedAreaData.nombre);
    const hasSubareas = selectedAreaData.subareas && selectedAreaData.subareas.length > 0;
    const activeSub = hasSubareas ? selectedAreaData.subareas!.find(s => s.id === selectedSubareaId) : null;

    const filtDocentes = activeSub
      ? selectedAreaData.docentes.filter(d => d.subarea === activeSub.nombre)
      : selectedAreaData.docentes;
    const filtEstudiantes = activeSub
      ? selectedAreaData.estudiantes.filter(e => e.subarea === activeSub.nombre)
      : selectedAreaData.estudiantes;
    const filtHoras = filtEstudiantes.reduce((s, e) => s + e.horasCompletadas, 0);
    const filtMeta = filtEstudiantes.length * 150;
    const filtProg = filtMeta > 0 ? (filtHoras / filtMeta) * 100 : 0;
    const filtRiesgo = filtEstudiantes.filter(e => e.estado === 'activo' && (e.horasCompletadas / e.horasRequeridas) < 0.3).length;
    const filtActivos = filtEstudiantes.filter(e => e.estado === 'activo').length;
    const filtPendientes = activeSub
      ? mockRegistrosHoras.filter(r => r.estado === 'pendiente' && filtEstudiantes.some(e => e.id === r.estudianteId)).length
      : selectedAreaData.pendientes;

    return (
      <div className="space-y-4">
        <button onClick={() => { setSelectedAreaId(null); setSelectedSubareaId(null); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2E7D32] transition-colors">
          <ChevronDown className="w-4 h-4 rotate-90" /> Volver a todas las áreas
        </button>

        {/* Area header */}
        <Card className="bg-white border-none shadow-sm overflow-hidden">
          <div className="h-2 rounded-t-xl" style={{ backgroundColor: ac }} />
          <CardContent className="p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${ac}15` }}>
                <Building2 className="w-7 h-7" style={{ color: ac }} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-xl font-bold text-gray-800">{selectedAreaData.nombre}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{selectedAreaData.descripcion}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-4xl font-bold" style={{ color: ac }}>{Math.round(activeSub ? filtProg : prog)}%</p>
                <p className="text-xs text-gray-400 mt-0.5">{activeSub ? activeSub.nombre : 'Progreso general'}</p>
              </div>
            </div>

            {/* Interactive Subareas */}
            {hasSubareas && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" style={{ color: ac }} />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Subáreas ({selectedAreaData.subareas!.length})</span>
                  {activeSub && (
                    <button onClick={() => setSelectedSubareaId(null)} className="ml-auto text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                      <X className="w-3 h-3" /> Ver todas
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedAreaData.subareas!.map(sub => {
                    const isActive = selectedSubareaId === sub.id;
                    const subDoc = selectedAreaData.docentes.filter(d => d.subarea === sub.nombre);
                    const subEst = selectedAreaData.estudiantes.filter(e => e.subarea === sub.nombre);
                    const subH = subEst.reduce((s, e) => s + e.horasCompletadas, 0);
                    const subM = subEst.length * 150;
                    const subP = subM > 0 ? (subH / subM) * 100 : 0;
                    const subActivos = subEst.filter(e => e.estado === 'activo').length;
                    const subRiesgo = subEst.filter(e => e.estado === 'activo' && (e.horasCompletadas / e.horasRequeridas) < 0.3).length;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubareaId(isActive ? null : sub.id)}
                        className={`relative rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                          isActive ? 'shadow-lg scale-[1.02]' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                        }`}
                        style={isActive ? { borderColor: ac, backgroundColor: `${ac}05` } : {}}
                      >
                        {/* Top accent bar */}
                        <div className="h-1.5" style={{ backgroundColor: isActive ? ac : `${ac}25` }} />

                        <div className="p-4">
                          {/* Header */}
                          <div className="flex items-start gap-2.5 mb-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isActive ? ac : `${ac}15` }}>
                              <Layers className="w-4 h-4" style={{ color: isActive ? 'white' : ac }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[15px] leading-tight" style={{ color: isActive ? ac : '#1f2937' }}>{sub.nombre}</p>
                              {sub.descripcion && (
                                <p className={`text-xs leading-relaxed mt-1 ${isActive ? 'text-gray-600 line-clamp-3' : 'text-gray-400 line-clamp-2'}`}>{sub.descripcion}</p>
                              )}
                            </div>
                            {isActive && (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ac }}>
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>

                          {/* KPI row */}
                          <div className="grid grid-cols-4 gap-1.5 mb-3">
                            {[
                              { label: 'Becados', value: subEst.length, icon: Users },
                              { label: 'Docentes', value: subDoc.length, icon: GraduationCap },
                              { label: 'Horas', value: `${subH}h`, icon: Clock },
                              { label: 'Activos', value: subActivos, icon: CheckCircle },
                            ].map(kpi => (
                              <div key={kpi.label} className={`text-center p-1.5 rounded-lg ${isActive ? 'bg-white/80' : 'bg-gray-50'}`}>
                                <kpi.icon className="w-3 h-3 mx-auto mb-0.5" style={{ color: isActive ? ac : '#9ca3af' }} />
                                <p className="text-xs font-bold" style={{ color: isActive ? ac : '#374151' }}>{kpi.value}</p>
                                <p className="text-[8px] text-gray-400">{kpi.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* Progress bar */}
                          <div className="flex items-center gap-2.5">
                            <div className={`flex-1 rounded-full overflow-hidden ${isActive ? 'h-2.5' : 'h-2'} bg-gray-200`}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(subP, 100)}%`, backgroundColor: progColor(subP) }} />
                            </div>
                            <span className={`font-bold ${isActive ? 'text-sm' : 'text-xs'}`} style={{ color: progColor(subP) }}>{Math.round(subP)}%</span>
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

            <div className="mt-4 w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(activeSub ? filtProg : prog, 100)}%`, backgroundColor: ac }} />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-400">{activeSub ? filtHoras : selectedAreaData.horasTotal}h acumuladas</span>
              <span className="text-[10px] text-gray-400">Meta: {activeSub ? filtMeta : selectedAreaData.horasMeta}h</span>
            </div>
          </CardContent>
        </Card>

        {/* Filter indicator */}
        {activeSub && (
          <div className="flex items-center gap-2 px-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ac }} />
            <span className="text-xs font-semibold" style={{ color: ac }}>Filtrando: {activeSub.nombre}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* KPIs del área */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Becados', value: filtEstudiantes.length, icon: Users, color: ac },
            { label: 'Docentes', value: filtDocentes.length, icon: GraduationCap, color: '#616161' },
            { label: 'Activos', value: filtActivos, icon: CheckCircle, color: '#2E7D32' },
            { label: 'En Riesgo', value: filtRiesgo, icon: AlertCircle, color: filtRiesgo > 0 ? '#EF5350' : '#9E9E9E' },
            { label: 'Pendientes', value: filtPendientes, icon: Clock, color: filtPendientes > 0 ? '#F57F17' : '#9E9E9E' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl p-3.5 shadow-sm border-l-4 flex items-center gap-3" style={{ borderLeftColor: kpi.color }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">{kpi.label}</p>
                <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Docentes - compact sidebar */}
          <Card className="bg-white border-none shadow-sm lg:col-span-2">
            <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
              <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
                <GraduationCap className="w-4 h-4" /> Docentes {activeSub ? `— ${activeSub.nombre}` : ''}
                <Badge className="ml-auto" style={{ backgroundColor: `${ac}20`, color: ac }}>{filtDocentes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 max-h-[560px] overflow-y-auto">
              {filtDocentes.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Sin docentes asignados</p>
              )}
              {(() => {
                const hasSubareasLocal = selectedAreaData.subareas && selectedAreaData.subareas.length > 0;
                const relevantSubs = activeSub ? [activeSub] : (hasSubareasLocal ? selectedAreaData.subareas! : []);

                if (relevantSubs.length > 0) {
                  const groups = relevantSubs.map(sub => ({
                    subarea: sub,
                    docentes: filtDocentes.filter(d => d.subarea === sub.nombre),
                    estudiantes: filtEstudiantes.filter(e => e.subarea === sub.nombre),
                  })).filter(g => g.docentes.length > 0);

                  return groups.map(group => (
                    <div key={group.subarea.id} className="rounded-xl border border-gray-100 overflow-hidden">
                      <div className="px-3 py-2 bg-gradient-to-r from-[#E8F5E9] to-white flex items-center gap-2 border-b border-gray-100">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: ac }}>
                          <Layers className="w-3 h-3 text-white" />
                        </div>
                        <p className="font-semibold text-xs" style={{ color: ac }}>{group.subarea.nombre}</p>
                        <div className="ml-auto flex items-center gap-2 text-[9px] text-gray-400">
                          <span>{group.docentes.length} doc.</span>
                          <span>·</span>
                          <span>{group.estudiantes.length} bec.</span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {group.docentes.map(doc => {
                          const estDoc = group.estudiantes.filter(e => e.docenteResponsableId === doc.id);
                          const horasDoc = estDoc.reduce((s, e) => s + e.horasCompletadas, 0);
                          return (
                            <div key={doc.id} className="px-3 py-2.5 flex items-center gap-2.5 hover:bg-gray-50/50 transition-colors">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0" style={{ backgroundColor: ac }}>
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
                  return filtDocentes.map(doc => {
                    const estDoc = filtEstudiantes.filter(e => e.docenteResponsableId === doc.id);
                    const horasDoc = estDoc.reduce((s, e) => s + e.horasCompletadas, 0);
                    return (
                      <div key={doc.id} className="rounded-xl border border-gray-100 p-3 flex items-center gap-2.5 hover:border-gray-200 transition-all">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: ac }}>
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
                <Award className="w-4 h-4" /> {activeSub ? `Becados — ${activeSub.nombre}` : 'Becados — Ranking de Progreso'}
                <Badge className="bg-[#2E7D32]/10 text-[#2E7D32] ml-auto">{filtEstudiantes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 max-h-[560px] overflow-y-auto">
              {filtEstudiantes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Sin becados asignados a esta subárea</p>
              ) : (
              <div className="space-y-1">
                {[...filtEstudiantes]
                  .sort((a, b) => (b.horasCompletadas / b.horasRequeridas) - (a.horasCompletadas / a.horasRequeridas))
                  .map((est, idx) => {
                    const p = (est.horasCompletadas / est.horasRequeridas) * 100;
                    const isRisk = p < 30;
                    const docResp = mockDocentes.find(d => d.id === est.docenteResponsableId);
                    return (
                      <div key={est.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors border ${
                        isRisk ? 'border-red-100 bg-red-50/30 hover:bg-red-50/60' : 'border-transparent hover:border-gray-100 hover:bg-gray-50'
                      }`}>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                          idx < 3 ? 'bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] text-white shadow-sm' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                          {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{est.nombre}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4" style={{ color: getCarreraColor(est.carrera), borderColor: getCarreraColor(est.carrera) }}>{getCarreraCode(est.carrera)}</Badge>
                            {est.subarea && <span className="text-[9px] text-gray-400 truncate max-w-[100px]">{est.subarea}</span>}
                            {docResp && <span className="text-[9px] text-gray-400 truncate max-w-[100px] hidden xl:inline">→ {docResp.nombre.split(' ').slice(-2).join(' ')}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[140px]">
                              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(p, 100)}%`, backgroundColor: progColor(p) }} />
                            </div>
                            <span className="text-[10px] text-gray-500">{est.horasCompletadas}/{est.horasRequeridas}h</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-base font-bold" style={{ color: progColor(p) }}>{Math.round(p)}%</span>
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

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-5 rounded-xl shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm mb-0.5">Bienestar Estudiantil · Gestión</p>
            <h2 className="text-2xl font-bold mb-0.5">Áreas de Horas Sociales</h2>
            <p className="text-white/90 text-sm">Asignaciones y supervisión por área institucional</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'Áreas', value: areasConDatos.length },
              { label: 'Becados', value: totalBecados },
              { label: 'Docentes', value: totalDocentes },
            ].map(item => (
              <div key={item.label} className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <p className="text-white/80 text-[10px] uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Global KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: Building2, label: 'Áreas Activas', value: areasConDatos.length, color: '#2E7D32', bg: 'from-green-50 to-white', border: 'border-green-100' },
          { icon: Users, label: 'Becados Totales', value: totalBecados, color: '#1565C0', bg: 'from-blue-50 to-white', border: 'border-blue-100' },
          { icon: GraduationCap, label: 'Docentes', value: totalDocentes, color: '#6A1B9A', bg: 'from-purple-50 to-white', border: 'border-purple-100' },
          { icon: Clock, label: 'Horas Acumuladas', value: `${totalHoras}h`, color: '#EF6C00', bg: 'from-amber-50 to-white', border: 'border-amber-100' },
          { icon: AlertCircle, label: 'Pendientes', value: totalPendientes, color: totalPendientes > 0 ? '#D32F2F' : '#9E9E9E', bg: 'from-red-50 to-white', border: 'border-red-100' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-xl p-3.5 border ${s.border} flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">{s.label}</p>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar área, docente o becado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-white border-gray-200"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          {([
            { key: 'grid', label: 'Tarjetas', icon: Building2 },
            { key: 'ranking', label: 'Ranking', icon: BarChart3 },
            { key: 'asignaciones', label: 'Asignaciones', icon: Layers },
          ] as const).map(v => {
            const Icon = v.icon;
            return (
              <button key={v.key} onClick={() => setViewMode(v.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${viewMode === v.key ? 'bg-white text-[#2E7D32] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-3.5 h-3.5" />{v.label}
              </button>
            );
          })}
        </div>

        {/* Nueva Asignación */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2E7D32] hover:bg-[#43A047] text-white shadow-sm ml-auto">
              <Plus className="w-4 h-4 mr-2" /> Nueva Asignación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#2E7D32]">Asignar Estudiante a Área</DialogTitle>
              <DialogDescription>Selecciona el estudiante, área y docente responsable</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Estudiante</Label>
                <Select value={selEstudiante} onValueChange={setSelEstudiante}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un estudiante" /></SelectTrigger>
                  <SelectContent>
                    {mockEstudiantes.map(est => (
                      <SelectItem key={est.id} value={est.id}>{est.nombre} — {est.matricula} ({getCarreraCode(est.carrera)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Área Principal</Label>
                  <Select value={selArea} onValueChange={v => { setSelArea(v); setSelSubarea(''); setSelDocente(''); }}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un área" /></SelectTrigger>
                    <SelectContent>
                      {areas.map(area => <SelectItem key={area.id} value={area.id}>{area.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {areaSelObj?.subareas && areaSelObj.subareas.length > 0 && (
                  <div className="space-y-1.5">
                    <Label>Subárea</Label>
                    <Select value={selSubarea} onValueChange={v => { setSelSubarea(v); setSelDocente(''); }}>
                      <SelectTrigger><SelectValue placeholder="Selecciona subárea" /></SelectTrigger>
                      <SelectContent>
                        {areaSelObj.subareas.map(sub => <SelectItem key={sub.id} value={sub.nombre}>{sub.nombre}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Docente Responsable</Label>
                  <Select value={selDocente} onValueChange={setSelDocente} disabled={!selArea || (!!areaSelObj?.subareas?.length && !selSubarea)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona docente" /></SelectTrigger>
                    <SelectContent>
                      {docentesFiltrados.map(doc => <SelectItem key={doc.id} value={doc.id}>{doc.nombre}{doc.subarea ? ` — ${doc.subarea}` : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Cuatrimestre</Label>
                  <Select value={selCuatrimestre} onValueChange={setSelCuatrimestre}>
                    <SelectTrigger><SelectValue placeholder="Cuatrimestre" /></SelectTrigger>
                    <SelectContent>
                      {cuatrimestres.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-[#2E7D32] hover:bg-[#43A047] text-white" onClick={handleSave}>Guardar Asignación</Button>
            </div>
          </DialogContent>
        </Dialog>

        {search && (
          <Badge className="bg-[#2E7D32] text-white">{filteredAreas.length} resultado{filteredAreas.length !== 1 ? 's' : ''}</Badge>
        )}
      </div>

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAreas.map(area => {
            const progA = area.horasMeta > 0 ? (area.horasTotal / area.horasMeta) * 100 : 0;
            const ac = getAreaColor(area.nombre);
            return (
              <Card key={area.id} className="bg-white border-none shadow-sm hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelectedAreaId(area.id)}>
                <CardContent className="p-0">
                  <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: ac }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ac}15` }}>
                          <Building2 className="w-5 h-5" style={{ color: ac }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm group-hover:text-[#2E7D32] transition-colors">{area.nombre}</h3>
                          <p className="text-[10px] text-gray-400 mt-0.5">{area.descripcion}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2E7D32] transition-colors mt-1 flex-shrink-0" />
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-[9px] text-gray-500 uppercase">Becados</p>
                        <p className="text-lg font-bold" style={{ color: ac }}>{area.estudiantes.length}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-[9px] text-gray-500 uppercase">Docentes</p>
                        <p className="text-lg font-bold text-gray-700">{area.docentes.length}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-[9px] text-gray-500 uppercase">Promedio</p>
                        <p className="text-lg font-bold" style={{ color: progColor(area.promedio) }}>{area.promedio}%</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500">{area.horasTotal}/{area.horasMeta}h</span>
                        <span className="text-xs font-bold" style={{ color: ac }}>{Math.round(progA)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(progA, 100)}%`, backgroundColor: ac }} />
                      </div>
                    </div>

                    {/* Status tags */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {area.activos} activos
                      </span>
                      {area.completados > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {area.completados} complet.
                        </span>
                      )}
                      {area.enRiesgo > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px]">
                          <AlertCircle className="w-2.5 h-2.5" /> {area.enRiesgo} riesgo
                        </span>
                      )}
                      {area.subareas && area.subareas.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px]">
                          <Layers className="w-2.5 h-2.5" /> {area.subareas.length} subáreas
                        </span>
                      )}
                    </div>

                    {/* Mini docentes list */}
                    {area.docentes.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-1.5 flex-wrap">
                        <GraduationCap className="w-3 h-3 text-gray-400" />
                        {area.docentes.slice(0, 3).map(doc => (
                          <span key={doc.id} className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full truncate max-w-[100px]" title={doc.nombre}>
                            {doc.nombre.split(' ').slice(-2).join(' ')}
                          </span>
                        ))}
                        {area.docentes.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{area.docentes.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredAreas.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No se encontraron áreas</p>
            </div>
          )}
        </div>
      )}

      {/* ── RANKING VIEW ── */}
      {viewMode === 'ranking' && (
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
                <div key={area.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100" onClick={() => setSelectedAreaId(area.id)}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${idx < 3 ? 'bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ac}15` }}>
                    <Building2 className="w-4 h-4" style={{ color: ac }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-800 text-sm">{area.nombre}</p>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4" style={{ color: ac, borderColor: ac }}>{area.estudiantes.length} becados</Badge>
                      {area.enRiesgo > 0 && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-red-600 border-red-300 bg-red-50">{area.enRiesgo} riesgo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[220px]">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(progR, 100)}%`, backgroundColor: ac }} />
                      </div>
                      <span className="text-[10px] text-gray-500">{area.horasTotal}/{area.horasMeta}h</span>
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0 min-w-[56px]">
                    <p className="text-xl font-bold" style={{ color: progColor(area.promedio) }}>{area.promedio}%</p>
                    <p className="text-[9px] text-gray-400">promedio</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500">
                    <div className="text-center">
                      <p className="font-medium text-gray-700">{area.docentes.length}</p>
                      <p className="text-[9px] text-gray-400">docentes</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ── ASIGNACIONES VIEW ── */}
      {viewMode === 'asignaciones' && (
        <div className="space-y-4">
          {areasConDatos.map(area => {
            const ac = getAreaColor(area.nombre);
            if (area.estudiantes.length === 0) return null;
            return (
              <Card key={area.id} className="bg-white border-none shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ backgroundImage: `linear-gradient(to right, ${ac}12, transparent)` }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ac }} />
                  <h3 className="font-semibold text-gray-800 text-sm">{area.nombre}</h3>
                  {area.subareas && area.subareas.length > 0 && (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Layers className="w-3 h-3" />{area.subareas.map(s => s.nombre).join(', ')}
                    </span>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <Badge className="text-[10px]" style={{ backgroundColor: `${ac}15`, color: ac }}>{area.estudiantes.length} becados</Badge>
                    <Badge className="text-[10px] bg-gray-100 text-gray-600">{area.docentes.length} docentes</Badge>
                    <button onClick={() => setSelectedAreaId(area.id)} className="text-[10px] text-gray-400 hover:text-[#2E7D32] flex items-center gap-1 transition-colors">
                      Ver detalle <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Becado</th>
                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Carrera</th>
                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Subárea</th>
                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Docente</th>
                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Horas</th>
                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Progreso</th>
                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {area.estudiantes.map(est => {
                        const p = (est.horasCompletadas / est.horasRequeridas) * 100;
                        return (
                          <tr key={est.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                                  {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </div>
                                <div>
                                  <p className="text-gray-800 font-medium truncate max-w-[140px]">{est.nombre}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">{est.matricula}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4">
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4" style={{ color: getCarreraColor(est.carrera), borderColor: getCarreraColor(est.carrera) }}>
                                {getCarreraCode(est.carrera)}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-4 font-medium text-gray-700">{est.subarea || '—'}</td>
                            <td className="py-2.5 px-4 text-gray-400 max-w-[120px] truncate text-xs">{est.docenteResponsable || '—'}</td>
                            <td className="py-2.5 px-4">
                              <span className="font-medium text-[#2E7D32]">{est.horasCompletadas}</span>
                              <span className="text-gray-400">/{est.horasRequeridas}h</span>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2 min-w-[80px]">
                                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${Math.min(p, 100)}%`, backgroundColor: progColor(p) }} />
                                </div>
                                <span className="font-bold" style={{ color: progColor(p) }}>{Math.round(p)}%</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4"><StatusBadge status={est.estado} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};