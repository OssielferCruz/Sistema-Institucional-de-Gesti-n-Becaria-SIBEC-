import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  Users, Plus, Search, Edit, Trash2, Upload, Download, UserPlus, Building2,
  GraduationCap, Clock, ChevronDown, ChevronRight, AlertCircle, CheckCircle,
  FileSpreadsheet, ArrowUpDown, Eye, RotateCcw, UserCheck, UserX, RefreshCw,
  ArrowRightLeft, X, Save, Filter, Layers, Target, Mail, Check, Copy,
  FileText, Calendar, BookOpen, Shield
} from 'lucide-react';
import {
  mockEstudiantes as initialEstudiantes, mockDocentes, areas, carreras,
  Estudiante
} from '../data/mockData';
import { toast } from 'sonner';

// ─── Constants ───
const AREA_COLORS: Record<string, string> = {
  'Asistencia Docente': '#2E7D32', 'Biblioteca': '#1565C0', 'Bienestar Estudiantil': '#6A1B9A',
  'CIDTEA': '#00838F', 'Extensión Universitaria': '#EF6C00', 'Brigada Ambiental': '#2E7D32',
  'Comunicación Institucional': '#C62828', 'Decanatura': '#283593', 'Educación a Distancia': '#F57F17',
  'Registro Académico': '#4E342E',
};
const getAreaColor = (a: string) => AREA_COLORS[a] || '#9E9E9E';
const getCarreraCode = (c: string) => c.split(' - ')[0];
const CARRERA_COLORS: Record<string, string> = {
  ICE: '#6A1B9A', IMS: '#2E7D32', IGI: '#C62828', IME: '#F57F17',
  IEM: '#00838F', IEL: '#1565C0', LAF: '#283593', LCM: '#EF6C00',
};
const getCarreraColor = (c: string) => CARRERA_COLORS[getCarreraCode(c)] || '#9E9E9E';

type ControlTab = 'gestion' | 'agregar' | 'importar' | 'asignaciones' | 'historial';

const TABS: { key: ControlTab; label: string; icon: React.ElementType }[] = [
  { key: 'gestion', label: 'Gestión de Becados', icon: Users },
  { key: 'agregar', label: 'Nuevo Becado', icon: UserPlus },
  { key: 'importar', label: 'Importar Excel', icon: FileSpreadsheet },
  { key: 'asignaciones', label: 'Cambio de Área', icon: ArrowRightLeft },
  { key: 'historial', label: 'Acciones Recientes', icon: Clock },
];

// ─── Mock action history ───
const mockHistorial = [
  { id: 'h1', tipo: 'alta', descripcion: 'Alta de nuevo becado: Daniel E. Villanueva', usuario: 'Admin Bienestar', fecha: '2026-04-08 10:30', color: '#2E7D32' },
  { id: 'h2', tipo: 'cambio_area', descripcion: 'Cambio de área: Paola Mendoza → Brigada Ambiental', usuario: 'Admin Bienestar', fecha: '2026-04-07 14:15', color: '#1565C0' },
  { id: 'h3', tipo: 'edicion', descripcion: 'Edición de datos: Carlos Sánchez - correo actualizado', usuario: 'Admin Bienestar', fecha: '2026-04-07 09:45', color: '#F57F17' },
  { id: 'h4', tipo: 'baja', descripcion: 'Baja temporal: Luis Martínez - motivo académico', usuario: 'Admin Bienestar', fecha: '2026-04-06 16:00', color: '#EF5350' },
  { id: 'h5', tipo: 'importacion', descripcion: 'Importación masiva: 15 estudiantes desde Excel', usuario: 'Admin Bienestar', fecha: '2026-04-05 08:30', color: '#6A1B9A' },
  { id: 'h6', tipo: 'reset', descripcion: 'Reset de horas del Periodo 2 para 42 estudiantes', usuario: 'Admin Bienestar', fecha: '2026-04-01 07:00', color: '#00838F' },
  { id: 'h7', tipo: 'alta', descripcion: 'Alta de nuevo becado: Ximena Campos Torres', usuario: 'Admin Bienestar', fecha: '2026-03-28 11:20', color: '#2E7D32' },
  { id: 'h8', tipo: 'cambio_area', descripcion: 'Cambio de área: Sebastián Herrera → Educación a Distancia', usuario: 'Admin Bienestar', fecha: '2026-03-25 13:50', color: '#1565C0' },
];

export const ControlBecados: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ControlTab>('gestion');
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([...initialEstudiantes]);

  // Stats
  const totalBecados = estudiantes.length;
  const activos = estudiantes.filter(e => e.estado === 'activo').length;
  const completados = estudiantes.filter(e => e.estado === 'completado').length;
  const inactivos = estudiantes.filter(e => e.estado === 'inactivo').length;
  const sinAsignar = estudiantes.filter(e => !e.areaActual).length;
  const enRiesgo = estudiantes.filter(e => e.estado === 'activo' && (e.horasCompletadas / e.horasRequeridas) < 0.3).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-5 rounded-xl shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm mb-0.5">Bienestar Estudiantil · Control</p>
            <h2 className="text-2xl font-bold mb-0.5">Control de Becados</h2>
            <p className="text-white/90 text-sm">Alta, baja, edición, importación y asignación de estudiantes becados</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'Total', value: totalBecados },
              { label: 'Activos', value: activos },
              { label: 'Sin Área', value: sinAsignar },
            ].map(item => (
              <div key={item.label} className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3">
                <p className="text-white/80 text-[10px] uppercase tracking-wider">{item.label}</p>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Becados Activos', value: activos, icon: UserCheck, color: '#2E7D32' },
          { label: 'Completados', value: completados, icon: CheckCircle, color: '#1565C0' },
          { label: 'Inactivos', value: inactivos, icon: UserX, color: '#9E9E9E' },
          { label: 'Sin Área', value: sinAsignar, icon: AlertCircle, color: '#FBC02D' },
          { label: 'En Riesgo', value: enRiesgo, icon: AlertCircle, color: '#EF5350' },
          { label: 'Carreras', value: carreras.length, icon: GraduationCap, color: '#6A1B9A' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl p-3 shadow-sm border-l-4 flex items-center gap-2.5" style={{ borderLeftColor: kpi.color }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}12` }}>
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase">{kpi.label}</p>
              <p className="text-lg font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive ? 'bg-white text-[#2E7D32] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'gestion' && <TabGestion estudiantes={estudiantes} setEstudiantes={setEstudiantes} />}
      {activeTab === 'agregar' && <TabAgregar estudiantes={estudiantes} setEstudiantes={setEstudiantes} />}
      {activeTab === 'importar' && <TabImportar />}
      {activeTab === 'asignaciones' && <TabAsignaciones estudiantes={estudiantes} setEstudiantes={setEstudiantes} />}
      {activeTab === 'historial' && <TabHistorial />}
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: GESTIÓN DE BECADOS
// ═══════════════════════════════════════════════
const TabGestion: React.FC<{
  estudiantes: Estudiante[];
  setEstudiantes: React.Dispatch<React.SetStateAction<Estudiante[]>>;
}> = ({ estudiantes, setEstudiantes }) => {
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [sortField, setSortField] = useState<'nombre' | 'progreso' | 'horas'>('nombre');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingStudent, setEditingStudent] = useState<Estudiante | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState('');

  const uniqueAreas = useMemo(() => [...new Set(estudiantes.map(e => e.areaActual).filter(Boolean))].sort() as string[], [estudiantes]);
  const uniqueCarreras = useMemo(() => [...new Set(estudiantes.map(e => getCarreraCode(e.carrera)))].sort(), [estudiantes]);

  const filtered = useMemo(() => {
    let data = estudiantes.filter(e => {
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
  }, [estudiantes, search, filterArea, filterCarrera, filterEstado, sortField, sortAsc]);

  const [page, setPage] = useState(1);
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paged.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paged.map(e => e.id)));
  };

  const handleDelete = (id: string) => {
    setEstudiantes(prev => prev.filter(e => e.id !== id));
    setDeleteDialog(null);
    toast.success('Estudiante eliminado del sistema');
  };

  const handleBulkAction = () => {
    if (selectedIds.size === 0) return;
    if (bulkAction === 'activar') {
      setEstudiantes(prev => prev.map(e => selectedIds.has(e.id) ? { ...e, estado: 'activo' } : e));
      toast.success(`${selectedIds.size} estudiantes activados`);
    } else if (bulkAction === 'desactivar') {
      setEstudiantes(prev => prev.map(e => selectedIds.has(e.id) ? { ...e, estado: 'inactivo' } : e));
      toast.success(`${selectedIds.size} estudiantes desactivados`);
    } else if (bulkAction === 'eliminar') {
      setEstudiantes(prev => prev.filter(e => !selectedIds.has(e.id)));
      toast.success(`${selectedIds.size} estudiantes eliminados`);
    }
    setSelectedIds(new Set());
    setBulkAction('');
  };

  const handleSaveEdit = () => {
    if (!editingStudent) return;
    setEstudiantes(prev => prev.map(e => e.id === editingStudent.id ? editingStudent : e));
    setEditDialog(false);
    setEditingStudent(null);
    toast.success('Estudiante actualizado exitosamente');
  };

  const handleExport = () => {
    const header = 'Matrícula,Nombre,Carrera,Email,Área,Estado,Horas Completadas,Horas Requeridas';
    const rows = filtered.map(e => `${e.matricula},"${e.nombre}","${e.carrera}",${e.email},"${e.areaActual || 'Sin asignar'}",${e.estado},${e.horasCompletadas},${e.horasRequeridas}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `becados_sibec_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Archivo CSV exportado exitosamente');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar por nombre, matrícula o email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
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
            <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </Button>
            <Badge className="bg-[#2E7D32] text-white">{filtered.length} resultados</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
          <Check className="w-4 h-4 text-blue-600" />
          <span className="text-blue-700 font-medium">{selectedIds.size} estudiante(s) seleccionado(s)</span>
          <div className="flex-1" />
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="border border-blue-200 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-700">
            <option value="">Acción masiva...</option>
            <option value="activar">Activar</option>
            <option value="desactivar">Desactivar</option>
            <option value="eliminar">Eliminar</option>
          </select>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 text-xs" onClick={handleBulkAction} disabled={!bulkAction}>Aplicar</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>Cancelar</Button>
        </div>
      )}

      {/* Table */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <th className="py-3 px-3 w-10">
                    <input type="checkbox" checked={paged.length > 0 && selectedIds.size === paged.length} onChange={toggleSelectAll} className="rounded border-gray-300" />
                  </th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium text-xs cursor-pointer select-none" onClick={() => toggleSort('nombre')}>
                    Estudiante <ArrowUpDown className={`w-3 h-3 inline ml-1 ${sortField === 'nombre' ? 'text-[#2E7D32]' : 'text-gray-300'}`} />
                  </th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium text-xs">Carrera</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium text-xs">Área</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium text-xs cursor-pointer select-none" onClick={() => toggleSort('progreso')}>
                    Progreso <ArrowUpDown className={`w-3 h-3 inline ml-1 ${sortField === 'progreso' ? 'text-[#2E7D32]' : 'text-gray-300'}`} />
                  </th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium text-xs">Estado</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium text-xs w-28">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(est => {
                  const prog = (est.horasCompletadas / est.horasRequeridas) * 100;
                  const isSelected = selectedIds.has(est.id);
                  return (
                    <tr key={est.id} className={`border-b border-gray-100 hover:bg-green-50/30 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                      <td className="py-2.5 px-3">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(est.id)} className="rounded border-gray-300" />
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                            {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 text-xs">{est.nombre}</span>
                            <p className="text-[10px] text-gray-400">{est.matricula} · {est.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className="text-[10px]" style={{ color: getCarreraColor(est.carrera), borderColor: getCarreraColor(est.carrera) }}>{getCarreraCode(est.carrera)}</Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getAreaColor(est.areaActual || '') }} />
                          <span className="truncate max-w-[120px]">{est.areaActual || <span className="text-amber-500 italic">Sin asignar</span>}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 min-w-[90px]">
                          <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(prog, 100)}%`, backgroundColor: prog < 30 ? '#EF5350' : prog < 60 ? '#FFC107' : '#2E7D32' }} />
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: prog < 30 ? '#EF5350' : prog < 60 ? '#FFC107' : '#2E7D32' }}>{Math.round(prog)}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          est.estado === 'activo' ? 'bg-green-50 text-green-700' : est.estado === 'completado' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${est.estado === 'activo' ? 'bg-green-500' : est.estado === 'completado' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                          {est.estado === 'activo' ? 'Activo' : est.estado === 'completado' ? 'Completado' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-0.5">
                          <button className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-[#2E7D32] transition-colors" title="Editar" onClick={() => { setEditingStudent({ ...est }); setEditDialog(true); }}>
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar" onClick={() => setDeleteDialog(est.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                            title={est.estado === 'activo' ? 'Desactivar' : 'Activar'}
                            onClick={() => {
                              setEstudiantes(prev => prev.map(e => e.id === est.id ? { ...e, estado: e.estado === 'activo' ? 'inactivo' : 'activo' } : e));
                              toast.success(`Estudiante ${est.estado === 'activo' ? 'desactivado' : 'activado'}`);
                            }}
                          >
                            {est.estado === 'activo' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Mostrando {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, filtered.length)} de {filtered.length}</p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : Math.min(page - 2 + i, totalPages);
                return (
                  <Button key={p} size="sm" variant={p === page ? 'default' : 'outline'} className={`h-7 w-7 text-xs p-0 ${p === page ? 'bg-[#2E7D32] hover:bg-[#1B5E20]' : ''}`} onClick={() => setPage(p)}>{p}</Button>
                );
              })}
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#2E7D32]">Editar Estudiante Becado</DialogTitle>
            <DialogDescription>Modifica los datos del estudiante</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre Completo</Label>
                  <Input value={editingStudent.nombre} onChange={e => setEditingStudent({ ...editingStudent, nombre: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Matrícula</Label>
                  <Input value={editingStudent.matricula} onChange={e => setEditingStudent({ ...editingStudent, matricula: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Correo Electrónico</Label>
                  <Input value={editingStudent.email} onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Carrera</Label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={editingStudent.carrera} onChange={e => setEditingStudent({ ...editingStudent, carrera: e.target.value })}>
                    {carreras.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Área Asignada</Label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={editingStudent.areaActual || ''} onChange={e => setEditingStudent({ ...editingStudent, areaActual: e.target.value || undefined })}>
                    <option value="">Sin asignar</option>
                    {areas.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Estado</Label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={editingStudent.estado} onChange={e => setEditingStudent({ ...editingStudent, estado: e.target.value as any })}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Horas Completadas</Label>
                  <Input type="number" value={editingStudent.horasCompletadas} onChange={e => setEditingStudent({ ...editingStudent, horasCompletadas: Number(e.target.value), horasAcumuladas: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Horas Requeridas</Label>
                  <Input type="number" value={editingStudent.horasRequeridas} onChange={e => setEditingStudent({ ...editingStudent, horasRequeridas: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cuatrimestre</Label>
                  <Input value={editingStudent.cuatrimestre} onChange={e => setEditingStudent({ ...editingStudent, cuatrimestre: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditDialog(false)}>Cancelar</Button>
                <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-1.5" onClick={handleSaveEdit}><Save className="w-3.5 h-3.5" /> Guardar Cambios</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Confirmar Eliminación</DialogTitle>
            <DialogDescription>¿Estás seguro de eliminar a este estudiante? Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => deleteDialog && handleDelete(deleteDialog)}>Eliminar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: AGREGAR NUEVO BECADO
// ═══════════════════════════════════════════════
const TabAgregar: React.FC<{
  estudiantes: Estudiante[];
  setEstudiantes: React.Dispatch<React.SetStateAction<Estudiante[]>>;
}> = ({ estudiantes, setEstudiantes }) => {
  const [form, setForm] = useState({
    nombre: '', matricula: '', carrera: carreras[0], email: '', cuatrimestre: 'ENE-ABR 2026',
    areaActual: '', subarea: '', docenteResponsableId: '', cursoAsignado: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableSubareas = useMemo(() => {
    if (!form.areaActual) return [];
    const area = areas.find(a => a.nombre === form.areaActual);
    return area?.subareas || [];
  }, [form.areaActual]);

  const availableDocentes = useMemo(() => {
    if (!form.areaActual) return [];
    let docs = mockDocentes.filter(d => d.area === form.areaActual);
    if (form.subarea) docs = docs.filter(d => d.subarea === form.subarea);
    return docs;
  }, [form.areaActual, form.subarea]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!form.matricula.trim()) e.matricula = 'Requerido';
    if (estudiantes.some(est => est.matricula === form.matricula)) e.matricula = 'Matrícula ya existe';
    if (!form.email.trim()) e.email = 'Requerido';
    if (!form.email.includes('@')) e.email = 'Email inválido';
    if (estudiantes.some(est => est.email === form.email)) e.email = 'Email ya registrado';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const docente = form.docenteResponsableId ? mockDocentes.find(d => d.id === form.docenteResponsableId) : null;
    const newStudent: Estudiante = {
      id: `est-new-${Date.now()}`,
      nombre: form.nombre,
      matricula: form.matricula,
      carrera: form.carrera,
      email: form.email,
      horasRequeridas: 150,
      horasCompletadas: 0,
      horasAcumuladas: 0,
      horasCompletadasPeriodo: 0,
      periodoActual: 1,
      estado: 'activo',
      areaActual: form.areaActual || undefined,
      subarea: form.subarea || undefined,
      docenteResponsableId: form.docenteResponsableId || undefined,
      docenteResponsable: docente?.nombre || undefined,
      cuatrimestre: form.cuatrimestre,
      cursoAsignado: form.cursoAsignado || undefined,
    };
    setEstudiantes(prev => [...prev, newStudent]);
    toast.success(`Estudiante ${form.nombre} registrado exitosamente`);
    setForm({ nombre: '', matricula: '', carrera: carreras[0], email: '', cuatrimestre: 'ENE-ABR 2026', areaActual: '', subarea: '', docenteResponsableId: '', cursoAsignado: '' });
    setErrors({});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <UserPlus className="w-4 h-4" /> Registrar Nuevo Estudiante Becado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            {/* Datos personales */}
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#2E7D32]" /> Datos Personales
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre Completo *</Label>
                  <Input placeholder="Ej: Juan Carlos Pérez García" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={errors.nombre ? 'border-red-400' : ''} />
                  {errors.nombre && <p className="text-[10px] text-red-500">{errors.nombre}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Matrícula *</Label>
                  <Input placeholder="Ej: 2026001" value={form.matricula} onChange={e => setForm({ ...form, matricula: e.target.value })} className={errors.matricula ? 'border-red-400' : ''} />
                  {errors.matricula && <p className="text-[10px] text-red-500">{errors.matricula}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Correo Electrónico *</Label>
                  <Input type="email" placeholder="nombre@ulsa.mx" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={errors.email ? 'border-red-400' : ''} />
                  {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Carrera *</Label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={form.carrera} onChange={e => setForm({ ...form, carrera: e.target.value })}>
                    {carreras.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Asignación */}
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#2E7D32]" /> Asignación de Área (Opcional)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Área</Label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={form.areaActual} onChange={e => setForm({ ...form, areaActual: e.target.value, subarea: '', docenteResponsableId: '' })}>
                    <option value="">Sin asignar por ahora</option>
                    {areas.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                  </select>
                </div>
                {availableSubareas.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Subárea</Label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={form.subarea} onChange={e => setForm({ ...form, subarea: e.target.value, docenteResponsableId: '' })}>
                      <option value="">Seleccionar subárea</option>
                      {availableSubareas.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                    </select>
                  </div>
                )}
                {availableDocentes.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Docente Responsable</Label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={form.docenteResponsableId} onChange={e => setForm({ ...form, docenteResponsableId: e.target.value })}>
                      <option value="">Seleccionar docente</option>
                      {availableDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                  </div>
                )}
                {form.areaActual === 'Asistencia Docente' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Curso Asignado</Label>
                    <Input placeholder="Ej: Programación Avanzada" value={form.cursoAsignado} onChange={e => setForm({ ...form, cursoAsignado: e.target.value })} />
                  </div>
                )}
              </div>
            </div>

            {/* Period */}
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2E7D32]" /> Periodo Académico
              </p>
              <div className="space-y-1.5 max-w-xs">
                <Label className="text-xs">Cuatrimestre</Label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={form.cuatrimestre} onChange={e => setForm({ ...form, cuatrimestre: e.target.value })}>
                  <option value="ENE-ABR 2026">ENE-ABR 2026</option>
                  <option value="MAY-AGO 2026">MAY-AGO 2026</option>
                  <option value="SEP-DIC 2026">SEP-DIC 2026</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t">
              <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-1.5" onClick={handleSubmit}>
                <UserPlus className="w-4 h-4" /> Registrar Estudiante
              </Button>
              <Button variant="outline" onClick={() => { setForm({ nombre: '', matricula: '', carrera: carreras[0], email: '', cuatrimestre: 'ENE-ABR 2026', areaActual: '', subarea: '', docenteResponsableId: '', cursoAsignado: '' }); setErrors({}); }}>
                Limpiar Formulario
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side info */}
      <div className="space-y-4">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base"><Shield className="w-4 h-4" /> Guía de Registro</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              { icon: Users, text: 'Ingresa nombre completo tal como aparece en el registro académico.' },
              { icon: GraduationCap, text: 'La matrícula debe ser única en el sistema.' },
              { icon: Mail, text: 'Utiliza el correo institucional @ulsa.mx del estudiante.' },
              { icon: Building2, text: 'Puedes asignar un área ahora o dejarlo para después en "Cambio de Área".' },
              { icon: BookOpen, text: 'El curso asignado solo aplica para Asistencia Docente.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
                <item.icon className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0 mt-0.5" />
                <span>{item.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base"><Target className="w-4 h-4" /> Valores por Defecto</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {[
              { label: 'Horas Requeridas', value: '150h / año' },
              { label: 'Horas por Periodo', value: '50h / periodo' },
              { label: 'Periodos', value: '3 periodos / año' },
              { label: 'Estado Inicial', value: 'Activo' },
              { label: 'Periodo Actual', value: '1 de 3' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-bold text-[#2E7D32]">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: IMPORTAR EXCEL
// ═══════════════════════════════════════════════
const TabImportar: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    // Simulated preview
    setPreviewData([
      ['2026050', 'Ana María Rodríguez', 'ICE - Ingeniería en Cibernética Electrónica', 'ana.rodriguez@ulsa.mx', 'ENE-ABR 2026'],
      ['2026051', 'Pedro Jiménez López', 'IMS - Ingeniería Mecatrónica y Sistemas de Control', 'pedro.jimenez@ulsa.mx', 'ENE-ABR 2026'],
      ['2026052', 'Laura Martínez Soto', 'LAF - Licenciatura Administrativa con énfasis en Finanzas', 'laura.martinez2@ulsa.mx', 'ENE-ABR 2026'],
      ['2026053', 'Roberto Herrera Vega', 'IGI - Ingeniería en Gestión Industrial', 'roberto.herrera@ulsa.mx', 'ENE-ABR 2026'],
      ['2026054', 'Camila Flores Ruiz', 'LCM - Licenciatura Comercial con Énfasis en Mercadeo', 'camila.flores@ulsa.mx', 'ENE-ABR 2026'],
    ]);
    toast.success(`Archivo "${file.name}" cargado. Vista previa disponible.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {/* Drop zone */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Upload className="w-4 h-4" /> Importar Estudiantes desde Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                isDragging ? 'border-[#2E7D32] bg-[#E8F5E9]/30' : 'border-gray-300 hover:border-[#2E7D32] hover:bg-gray-50'
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileSelect} />
              <FileSpreadsheet className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-[#2E7D32]' : 'text-gray-300'}`} />
              <p className="font-medium text-gray-700 mb-1">Arrastra tu archivo Excel aquí</p>
              <p className="text-sm text-gray-500 mb-3">o haz clic para seleccionarlo</p>
              <p className="text-xs text-gray-400">Formatos aceptados: .xlsx, .xls, .csv</p>
              {fileName && (
                <div className="mt-4 flex items-center gap-2 justify-center text-sm text-[#2E7D32]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">{fileName}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {previewData && (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
                  <Eye className="w-4 h-4" /> Vista Previa — {previewData.length} registros detectados
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setPreviewData(null); setFileName(''); }}>Cancelar</Button>
                  <Button size="sm" className="bg-[#2E7D32] hover:bg-[#1B5E20] h-7 text-xs gap-1" onClick={() => { toast.success(`${previewData.length} estudiantes importados exitosamente`); setPreviewData(null); setFileName(''); }}>
                    <Upload className="w-3 h-3" /> Confirmar Importación
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="py-2.5 px-3 text-left text-gray-500 font-medium">Matrícula</th>
                      <th className="py-2.5 px-3 text-left text-gray-500 font-medium">Nombre</th>
                      <th className="py-2.5 px-3 text-left text-gray-500 font-medium">Carrera</th>
                      <th className="py-2.5 px-3 text-left text-gray-500 font-medium">Email</th>
                      <th className="py-2.5 px-3 text-left text-gray-500 font-medium">Cuatrimestre</th>
                      <th className="py-2.5 px-3 text-left text-gray-500 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-green-50/30">
                        <td className="py-2 px-3 font-mono">{row[0]}</td>
                        <td className="py-2 px-3 font-medium text-gray-800">{row[1]}</td>
                        <td className="py-2 px-3"><Badge variant="outline" className="text-[9px]">{row[2].split(' - ')[0]}</Badge></td>
                        <td className="py-2 px-3 text-gray-500">{row[3]}</td>
                        <td className="py-2 px-3">{row[4]}</td>
                        <td className="py-2 px-3"><span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[9px]"><CheckCircle className="w-2.5 h-2.5" /> Válido</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Side info */}
      <div className="space-y-4">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base"><FileText className="w-4 h-4" /> Formato Requerido</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-gray-600">El archivo Excel debe contener las siguientes columnas en orden:</p>
            <div className="space-y-1.5">
              {['Matrícula', 'Nombre Completo', 'Carrera', 'Correo Electrónico', 'Cuatrimestre'].map((col, i) => (
                <div key={col} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[9px] font-bold">{i + 1}</span>
                  <span className="text-gray-700">{col}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base"><Download className="w-4 h-4" /> Plantilla</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-3">Descarga la plantilla para asegurar el formato correcto:</p>
            <Button variant="outline" className="w-full gap-2 text-xs" onClick={() => toast.success('Plantilla descargada')}>
              <Download className="w-3.5 h-3.5" /> Descargar Plantilla .xlsx
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed border-amber-300 bg-amber-50 shadow-none">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700">
              <p className="font-medium mb-1">Notas Importantes</p>
              <ul className="space-y-1 list-disc pl-3">
                <li>Los duplicados (misma matrícula) serán ignorados</li>
                <li>Las carreras deben coincidir exactamente con las del sistema</li>
                <li>Se asigna automáticamente: 150h requeridas, estado activo</li>
                <li>La asignación de áreas se hace por separado</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: CAMBIO DE ÁREA
// ═══════════════════════════════════════════════
const TabAsignaciones: React.FC<{
  estudiantes: Estudiante[];
  setEstudiantes: React.Dispatch<React.SetStateAction<Estudiante[]>>;
}> = ({ estudiantes, setEstudiantes }) => {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [newArea, setNewArea] = useState('');
  const [newSubarea, setNewSubarea] = useState('');
  const [newDocente, setNewDocente] = useState('');
  const [newCurso, setNewCurso] = useState('');

  const sinAsignar = estudiantes.filter(e => !e.areaActual && e.estado === 'activo');
  const estudiantesActivos = estudiantes.filter(e => e.estado === 'activo');

  const searchResults = useMemo(() => {
    if (!search) return [];
    return estudiantesActivos.filter(e =>
      e.nombre.toLowerCase().includes(search.toLowerCase()) ||
      e.matricula.includes(search)
    ).slice(0, 8);
  }, [search, estudiantesActivos]);

  const selectedEst = estudiantes.find(e => e.id === selectedStudent);

  const availableSubareas = useMemo(() => {
    if (!newArea) return [];
    return areas.find(a => a.nombre === newArea)?.subareas || [];
  }, [newArea]);

  const availableDocentes = useMemo(() => {
    if (!newArea) return [];
    let docs = mockDocentes.filter(d => d.area === newArea);
    if (newSubarea) docs = docs.filter(d => d.subarea === newSubarea);
    return docs;
  }, [newArea, newSubarea]);

  const handleTransfer = () => {
    if (!selectedStudent || !newArea) return;
    const docente = newDocente ? mockDocentes.find(d => d.id === newDocente) : null;
    setEstudiantes(prev => prev.map(e => e.id === selectedStudent ? {
      ...e,
      areaActual: newArea,
      subarea: newSubarea || undefined,
      docenteResponsableId: newDocente || undefined,
      docenteResponsable: docente?.nombre || undefined,
      cursoAsignado: newCurso || undefined,
    } : e));
    const est = estudiantes.find(e => e.id === selectedStudent);
    toast.success(`${est?.nombre} asignado a ${newArea}${newSubarea ? ` — ${newSubarea}` : ''}`);
    setSelectedStudent('');
    setNewArea('');
    setNewSubarea('');
    setNewDocente('');
    setNewCurso('');
    setSearch('');
  };

  // Area distribution
  const areaDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    estudiantes.filter(e => e.estado === 'activo').forEach(e => {
      const a = e.areaActual || 'Sin asignar';
      map[a] = (map[a] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [estudiantes]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {/* Transfer form */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <ArrowRightLeft className="w-4 h-4" /> Asignar o Cambiar Área de Estudiante
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            {/* Student search */}
            <div>
              <Label className="text-xs mb-1.5 block">Buscar Estudiante</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Escribe el nombre o matrícula..." value={search} onChange={e => { setSearch(e.target.value); setSelectedStudent(''); }} className="pl-10" />
              </div>
              {searchResults.length > 0 && !selectedStudent && (
                <div className="mt-2 border rounded-xl overflow-hidden max-h-[240px] overflow-y-auto">
                  {searchResults.map(est => (
                    <button
                      key={est.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-green-50 transition-colors text-left border-b border-gray-100 last:border-0"
                      onClick={() => { setSelectedStudent(est.id); setSearch(est.nombre); }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                        {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{est.nombre}</p>
                        <p className="text-[10px] text-gray-400">{est.matricula} · {getCarreraCode(est.carrera)} · {est.areaActual || 'Sin área'}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] flex-shrink-0" style={{ color: getAreaColor(est.areaActual || ''), borderColor: getAreaColor(est.areaActual || '') }}>
                        {est.areaActual || 'Sin área'}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected student info */}
            {selectedEst && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: getCarreraColor(selectedEst.carrera) }}>
                    {selectedEst.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{selectedEst.nombre}</p>
                    <p className="text-xs text-gray-500">{selectedEst.matricula} · {getCarreraCode(selectedEst.carrera)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Área actual</p>
                    <p className="text-sm font-medium" style={{ color: getAreaColor(selectedEst.areaActual || '') }}>{selectedEst.areaActual || 'Sin asignar'}</p>
                    {selectedEst.subarea && <p className="text-[10px] text-gray-400">{selectedEst.subarea}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* New area selection */}
            {selectedEst && (
              <>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span className="font-semibold text-gray-600 uppercase tracking-wider">Nueva Asignación</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nueva Área *</Label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={newArea} onChange={e => { setNewArea(e.target.value); setNewSubarea(''); setNewDocente(''); }}>
                      <option value="">Seleccionar área</option>
                      {areas.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                    </select>
                  </div>
                  {availableSubareas.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Subárea</Label>
                      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={newSubarea} onChange={e => { setNewSubarea(e.target.value); setNewDocente(''); }}>
                        <option value="">Seleccionar subárea</option>
                        {availableSubareas.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                      </select>
                    </div>
                  )}
                  {availableDocentes.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Docente Responsable</Label>
                      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={newDocente} onChange={e => setNewDocente(e.target.value)}>
                        <option value="">Seleccionar docente</option>
                        {availableDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre} ({d.estudiantesAsignados.length} becados)</option>)}
                      </select>
                    </div>
                  )}
                  {newArea === 'Asistencia Docente' && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Curso Asignado</Label>
                      <Input placeholder="Ej: Programación Avanzada" value={newCurso} onChange={e => setNewCurso(e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-1.5" onClick={handleTransfer} disabled={!newArea}>
                    <ArrowRightLeft className="w-4 h-4" /> Confirmar Cambio de Área
                  </Button>
                  <Button variant="outline" onClick={() => { setSelectedStudent(''); setSearch(''); setNewArea(''); setNewSubarea(''); setNewDocente(''); setNewCurso(''); }}>Cancelar</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Students without area */}
        {sinAsignar.length > 0 && (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b bg-amber-50 pb-3 pt-4 px-5">
              <CardTitle className="text-amber-700 flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4" /> Estudiantes Sin Área Asignada
                <Badge className="bg-amber-100 text-amber-700 border-amber-300 ml-2">{sinAsignar.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 max-h-[300px] overflow-y-auto">
              <div className="space-y-1.5">
                {sinAsignar.map(est => (
                  <button
                    key={est.id}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-amber-50 transition-colors text-left border border-transparent hover:border-amber-200"
                    onClick={() => { setSelectedStudent(est.id); setSearch(est.nombre); }}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0" style={{ backgroundColor: getCarreraColor(est.carrera) }}>
                      {est.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 truncate">{est.nombre}</p>
                      <p className="text-[10px] text-gray-400">{est.matricula} · {getCarreraCode(est.carrera)}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Distribution sidebar */}
      <div className="space-y-4">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base"><Layers className="w-4 h-4" /> Distribución Actual</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {areaDistribution.map(([area, count]) => {
              const ac = getAreaColor(area);
              const pct = (count / estudiantesActivos.length) * 100;
              return (
                <div key={area} className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 truncate">{area}</span>
                    <span className="text-xs font-bold" style={{ color: ac }}>{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: ac }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: HISTORIAL DE ACCIONES
// ═══════════════════════════════════════════════
const TabHistorial: React.FC = () => {
  const tipoIcons: Record<string, React.ElementType> = {
    alta: UserPlus, baja: UserX, edicion: Edit, cambio_area: ArrowRightLeft, importacion: Upload, reset: RotateCcw,
  };

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
        <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
          <Clock className="w-4 h-4" /> Historial de Acciones Recientes
          <Badge className="bg-[#2E7D32]/10 text-[#2E7D32] ml-2">{mockHistorial.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />
          <div className="space-y-4">
            {mockHistorial.map(h => {
              const Icon = tipoIcons[h.tipo] || Clock;
              return (
                <div key={h.id} className="relative flex items-start gap-4 pl-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10" style={{ backgroundColor: `${h.color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: h.color }} />
                  </div>
                  <div className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-800">{h.descripcion}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                      <span>{h.usuario}</span>
                      <span>·</span>
                      <span>{h.fecha}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
