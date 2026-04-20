import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CheckCircle, XCircle, Clock, Send, Eye, MessageSquare, Search, MapPin, User, Calendar, ChevronDown, ChevronUp, ListFilter, FileCheck } from 'lucide-react';
import { approveHoursLog, rejectHoursLog } from '../api/portalApi';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { type RegistroHoraExtended, useLegacyDataBridge } from '../hooks/useLegacyDataBridge';

type TabFilter = 'pendientes' | 'validadas' | 'rechazadas' | 'todas';

export const Aprobaciones: React.FC = () => {
  const { user } = useAuth();
  const { mockRegistrosHoras, mockEstudiantes, isLoading, error, refresh } = useLegacyDataBridge();
  const [activeTab, setActiveTab] = useState<TabFilter>('pendientes');
  const [busqueda, setBusqueda] = useState('');
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroHoraExtended | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetalleDialog, setShowDetalleDialog] = useState(false);
  const [accion, setAccion] = useState<'validar' | 'rechazar'>('validar');
  const [comentario, setComentario] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const carrerasJefe = user?.carrerasAsignadas || (user?.carrera ? [user.carrera] : []);

  // Solo registros de estudiantes asignados a "Asistencia Docente" Y de las carreras del jefe
  const registrosCarrera = useMemo(() =>
    mockRegistrosHoras.filter(r => {
      const estudiante = mockEstudiantes.find(e => e.id === r.estudianteId);
      return estudiante 
        && carrerasJefe.includes(estudiante.carrera)
        && estudiante.areaActual === 'Asistencia Docente';
    }),
    [mockRegistrosHoras, mockEstudiantes, carrerasJefe]
  );

  // Estudiantes de Asistencia Docente de las carreras del jefe (para contexto)
  const estudiantesAsistencia = useMemo(() =>
    mockEstudiantes.filter(e =>
      carrerasJefe.includes(e.carrera) && e.areaActual === 'Asistencia Docente'
    ),
    [mockEstudiantes, carrerasJefe]
  );

  // Counts
  const pendientes = registrosCarrera.filter(r => r.estado === 'aprobada' && !r.validadoPorJefatura);
  const validadas = registrosCarrera.filter(r => r.estado === 'aprobada' && r.validadoPorJefatura);
  const rechazadas = registrosCarrera.filter(r => r.estado === 'rechazada' && r.rechazadoPorJefatura);

  // Filter by tab
  const registrosPorTab = useMemo(() => {
    switch (activeTab) {
      case 'pendientes': return pendientes;
      case 'validadas': return validadas;
      case 'rechazadas': return rechazadas;
      case 'todas': return registrosCarrera;
    }
  }, [activeTab, pendientes, validadas, rechazadas, registrosCarrera]);

  // Search
  const registrosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return registrosPorTab;
    const q = busqueda.toLowerCase();
    return registrosPorTab.filter(r =>
      r.estudianteNombre.toLowerCase().includes(q) ||
      r.area.toLowerCase().includes(q) ||
      r.docenteNombre.toLowerCase().includes(q) ||
      r.descripcion.toLowerCase().includes(q) ||
      r.fecha.includes(q)
    );
  }, [registrosPorTab, busqueda]);

  // Group by student for better organization
  const registrosAgrupados = useMemo(() => {
    const map = new Map<string, { nombre: string; id: string; registros: typeof registrosFiltrados }>();
    registrosFiltrados.forEach(r => {
      const key = r.estudianteId;
      if (!map.has(key)) {
        map.set(key, { nombre: r.estudianteNombre, id: r.estudianteId, registros: [] });
      }
      map.get(key)!.registros.push(r);
    });
    return Array.from(map.values()).sort((a, b) => b.registros.length - a.registros.length);
  }, [registrosFiltrados]);

  const handleAccion = (registro: RegistroHoraExtended, tipo: 'validar' | 'rechazar') => {
    setSelectedRegistro(registro);
    setAccion(tipo);
    setComentario('');
    setShowDialog(true);
  };

  const handleVerDetalle = (registro: RegistroHoraExtended) => {
    setSelectedRegistro(registro);
    setShowDetalleDialog(true);
  };

  const handleConfirmar = async () => {
    if (!selectedRegistro) {
      return;
    }

    try {
      if (accion === 'validar') {
        await approveHoursLog(selectedRegistro.id);
      } else {
        await rejectHoursLog(selectedRegistro.id, comentario.trim());
      }

      await refresh();
      const mensaje = accion === 'validar' ? 'validado y enviado a Bienestar' : 'rechazado';
      toast.success(`Registro ${mensaje} exitosamente`);
      setShowDialog(false);
      setComentario('');
      setSelectedRegistro(null);
    } catch (confirmError) {
      toast.error(confirmError instanceof Error ? confirmError.message : 'No fue posible procesar el registro.');
    }
  };

  const handleEnviarReporte = () => {
    toast.success('Reporte semanal enviado a Bienestar Estudiantil');
  };

  const handleValidarTodos = async () => {
    try {
      await Promise.all(pendientes.map((registro) => approveHoursLog(registro.id)));
      await refresh();
      toast.success(`${pendientes.length} registros validados y enviados a Bienestar`);
    } catch (confirmError) {
      toast.error(confirmError instanceof Error ? confirmError.message : 'No fue posible validar todos los registros.');
    }
  };

  const tabs: { key: TabFilter; label: string; count: number; color: string; icon: React.ReactNode }[] = [
    { key: 'pendientes', label: 'Pendientes', count: pendientes.length, color: '#F59E0B', icon: <Clock className="w-4 h-4" /> },
    { key: 'validadas', label: 'Validadas', count: validadas.length, color: '#16A34A', icon: <CheckCircle className="w-4 h-4" /> },
    { key: 'rechazadas', label: 'Rechazadas', count: rechazadas.length, color: '#DC2626', icon: <XCircle className="w-4 h-4" /> },
    { key: 'todas', label: 'Todas', count: registrosCarrera.length, color: '#2E7D32', icon: <ListFilter className="w-4 h-4" /> },
  ];

  const getIniciales = (nombre: string) =>
    nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const getEstudiante = (id: string) => mockEstudiantes.find(e => e.id === id);

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando aprobaciones...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-white/70 text-sm mb-1">Jefatura de Carrera</p>
            <h2 className="text-2xl font-bold">Validación de Horas Sociales</h2>
            <p className="text-white/80 text-sm mt-1">
              Estudiantes de Asistencia Docente · {carrerasJefe.map(c => c.split(' - ')[0]).join(' / ')} · {estudiantesAsistencia.length} becados asignados
            </p>
          </div>
          <div className="flex gap-2">
            {pendientes.length > 0 && (
              <Button
                className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/20"
                onClick={handleValidarTodos}
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Validar Todos ({pendientes.length})
              </Button>
            )}
            <Button
              className="bg-white text-[#2E7D32] hover:bg-gray-100"
              onClick={handleEnviarReporte}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Reporte
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="space-y-4">
        {/* Tab Pills */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setBusqueda(''); setExpandedId(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#2E7D32] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar estudiante, área, fecha..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Summary strip for pending */}
        {activeTab === 'pendientes' && pendientes.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>{pendientes.length} registro{pendientes.length !== 1 ? 's' : ''}</strong> aprobado{pendientes.length !== 1 ? 's' : ''} por docentes esperando tu validación.
              Las horas totales pendientes suman <strong>{pendientes.reduce((s, r) => s + r.totalHoras, 0)}h</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      {registrosFiltrados.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
            {activeTab === 'pendientes' ? (
              <>
                <CheckCircle className="w-14 h-14 mb-4 text-green-300" />
                <p className="font-medium text-gray-500 text-lg">Sin registros pendientes</p>
                <p className="text-sm mt-1">Todos los registros han sido procesados</p>
              </>
            ) : (
              <>
                <ListFilter className="w-14 h-14 mb-4 text-gray-300" />
                <p className="font-medium text-gray-500">No se encontraron registros</p>
                <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {registrosAgrupados.map(grupo => {
            const estudiante = getEstudiante(grupo.id);
            const isExpanded = expandedId === grupo.id;
            const showAll = grupo.registros.length <= 2 || isExpanded;
            const visibles = showAll ? grupo.registros : grupo.registros.slice(0, 2);
            const horasGrupo = grupo.registros.reduce((s, r) => s + r.totalHoras, 0);

            return (
              <Card key={grupo.id} className="bg-white border-none shadow-sm overflow-hidden">
                {/* Student header */}
                <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <div className="w-11 h-11 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {getIniciales(grupo.nombre)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{grupo.nombre}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      {estudiante && (
                        <>
                          <span>{estudiante.matricula}</span>
                          <span>·</span>
                          <span>{estudiante.carrera.split(' - ')[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{grupo.registros.length} registro{grupo.registros.length !== 1 ? 's' : ''}</p>
                      <p className="font-bold text-[#2E7D32]">{horasGrupo}h</p>
                    </div>
                    {activeTab === 'pendientes' && grupo.registros.length > 1 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          toast.success(`${grupo.registros.length} registros de ${grupo.nombre.split(' ')[0]} validados`);
                        }}
                        className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs h-8"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Validar todos
                      </Button>
                    )}
                  </div>
                </div>

                {/* Records list */}
                <div className="divide-y divide-gray-50">
                  {visibles.map(registro => {
                    const isPendiente = registro.estado === 'aprobada' && !registro.validadoPorJefatura;
                    return (
                      <div key={registro.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start gap-4">
                          {/* Date column */}
                          <div className="flex-shrink-0 w-16 text-center">
                            <div className="bg-gray-100 rounded-lg px-2 py-1.5">
                              <p className="text-xs text-gray-500">{new Date(registro.fecha).toLocaleDateString('es', { month: 'short' }).toUpperCase()}</p>
                              <p className="text-lg font-bold text-gray-700">{new Date(registro.fecha).getDate()}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{registro.horaInicio}-{registro.horaFin}</p>
                          </div>

                          {/* Main content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800">{registro.descripcion}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200 gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {(() => {
                                      const est = getEstudiante(registro.estudianteId);
                                      return est?.cursoAsignado || registro.subarea || registro.area;
                                    })()}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 gap-1">
                                    <User className="w-3 h-3" />
                                    {registro.docenteNombre}
                                  </Badge>
                                  <Badge className="bg-[#2E7D32] text-white text-xs">
                                    {registro.totalHoras}h
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Approval info */}
                            {registro.aprobadoPor && (
                              <p className="text-xs text-gray-400 mt-2">
                                Aprobado por {registro.aprobadoPor}
                                {registro.fechaAprobacion && ` el ${new Date(registro.fechaAprobacion).toLocaleDateString('es', { day: 'numeric', month: 'short' })}`}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerDetalle(registro)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-[#2E7D32]"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {isPendiente && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleAccion(registro, 'validar')}
                                  className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white h-8 text-xs gap-1"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Validar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleAccion(registro, 'rechazar')}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {!isPendiente && (
                              <StatusBadge status={registro.estado} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Show more / less */}
                {grupo.registros.length > 2 && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : grupo.id)}
                    className="w-full px-5 py-2.5 text-xs text-[#2E7D32] hover:bg-green-50 transition-colors flex items-center justify-center gap-1 border-t border-gray-100"
                  >
                    {isExpanded ? (
                      <>Ver menos <ChevronUp className="w-3.5 h-3.5" /></>
                    ) : (
                      <>Ver {grupo.registros.length - 2} registro{grupo.registros.length - 2 !== 1 ? 's' : ''} más <ChevronDown className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de confirmación */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={accion === 'validar' ? 'text-[#2E7D32]' : 'text-[#D32F2F]'}>
              {accion === 'validar' ? 'Validar Registro' : 'Rechazar Registro'}
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {selectedRegistro && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-sm">
                        {getIniciales(selectedRegistro.estudianteNombre)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{selectedRegistro.estudianteNombre}</p>
                        <p className="text-xs text-gray-500">{selectedRegistro.fecha} · {selectedRegistro.totalHoras} horas · {selectedRegistro.area}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Actividad realizada</p>
                      <p className="text-sm text-gray-700">{selectedRegistro.descripcion}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {accion === 'validar' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-800">
                  Al validar, este registro se enviará a Bienestar Estudiantil para su registro final.
                </p>
              </div>
            )}
            {accion === 'rechazar' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800">
                  El registro regresará al docente para que el estudiante realice correcciones.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Comentario {accion === 'rechazar' ? '(requerido)' : '(opcional)'}</Label>
              <Textarea
                placeholder={accion === 'validar'
                  ? 'Agrega un comentario o felicitación...'
                  : 'Explica el motivo del rechazo...'
                }
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                className={accion === 'rechazar' && !comentario ? 'border-red-300 focus-visible:ring-red-400' : ''}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmar}
              disabled={accion === 'rechazar' && !comentario}
              className={accion === 'validar'
                ? 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white'
                : 'bg-[#D32F2F] hover:bg-red-700 text-white'
              }
            >
              {accion === 'validar' ? (
                <><CheckCircle className="w-4 h-4 mr-2" /> Confirmar Validación</>
              ) : (
                <><XCircle className="w-4 h-4 mr-2" /> Confirmar Rechazo</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de detalle */}
      <Dialog open={showDetalleDialog} onOpenChange={setShowDetalleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#2E7D32] flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detalle del Registro
            </DialogTitle>
          </DialogHeader>
          {selectedRegistro && (
            <div className="space-y-4 py-2">
              {/* Student */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold">
                  {getIniciales(selectedRegistro.estudianteNombre)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedRegistro.estudianteNombre}</p>
                  <p className="text-sm text-gray-500">{selectedRegistro.carrera || user?.carrera}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <p className="text-xs">Fecha</p>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{selectedRegistro.fecha}</p>
                  <p className="text-xs text-gray-500">{selectedRegistro.horaInicio} - {selectedRegistro.horaFin}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-1.5 text-green-500 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <p className="text-xs">Horas</p>
                  </div>
                  <p className="text-2xl font-bold text-[#2E7D32]">{selectedRegistro.totalHoras}h</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <p className="text-xs">Curso</p>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {(() => {
                      const est = getEstudiante(selectedRegistro.estudianteId);
                      return est?.cursoAsignado || selectedRegistro.subarea || selectedRegistro.area;
                    })()}
                  </p>
                  <p className="text-xs text-gray-500">Asistencia Docente</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <User className="w-3.5 h-3.5" />
                    <p className="text-xs">Docente</p>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{selectedRegistro.docenteNombre}</p>
                  {selectedRegistro.aprobadoPor && <p className="text-xs text-green-600">Aprobado</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-gray-500 mb-1.5 font-medium">Descripción de la actividad</p>
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-700">{selectedRegistro.descripcion}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 mr-1">Estado:</span>
                <StatusBadge status={selectedRegistro.estado} />
                {selectedRegistro.validadoPorJefatura ? (
                  <Badge className="bg-green-100 text-green-800 border border-green-300 text-xs">
                    Validado por Jefatura
                  </Badge>
                ) : selectedRegistro.estado === 'aprobada' ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                    Pendiente de validación
                  </Badge>
                ) : null}
              </div>

              {/* Comments */}
              {selectedRegistro.comentario && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <p className="text-xs font-medium">Comentario</p>
                  </div>
                  <p className="text-sm italic text-gray-700">"{selectedRegistro.comentario}"</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDetalleDialog(false)}>
              Cerrar
            </Button>
            {selectedRegistro?.estado === 'aprobada' && !selectedRegistro?.validadoPorJefatura && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDetalleDialog(false);
                    handleAccion(selectedRegistro, 'rechazar');
                  }}
                  className="text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
                <Button
                  onClick={() => {
                    setShowDetalleDialog(false);
                    handleAccion(selectedRegistro, 'validar');
                  }}
                  className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Validar
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};