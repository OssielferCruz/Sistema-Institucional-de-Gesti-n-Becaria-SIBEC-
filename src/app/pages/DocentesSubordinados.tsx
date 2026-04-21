import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import {
  Users, ChevronDown, ChevronRight, User, GraduationCap, Mail, MapPin,
  Search, BookOpen, Clock, Calendar, FileText, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/shared/StatusBadge';
import { useLegacyDataBridge } from '../hooks/useLegacyDataBridge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible';

type Vista = 'estudiantes' | 'docentes';

export const DocentesSubordinados: React.FC = () => {
  const { user } = useAuth();
  const { mockDocentes, mockEstudiantes, mockRegistrosHoras, isLoading, error } = useLegacyDataBridge();
  const [expandedDocentes, setExpandedDocentes] = useState<{ [key: string]: boolean }>({});
  const [expandedEstudiantes, setExpandedEstudiantes] = useState<{ [key: string]: boolean }>({});
  const [vista, setVista] = useState<Vista>('estudiantes');
  const [busqueda, setBusqueda] = useState('');

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando datos de docentes y estudiantes...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  const carrerasJefe = user?.carrerasAsignadas || (user?.carrera ? [user.carrera] : []);

  // Solo docentes de Asistencia Docente de las carreras del jefe
  const docentesCarrera = useMemo(() =>
    mockDocentes.filter(doc => {
      if (doc.area !== 'Asistencia Docente') return false;
      if (doc.carrerasAsignadas && doc.carrerasAsignadas.length > 0) {
        return doc.carrerasAsignadas.some(carrera => carrerasJefe.includes(carrera));
      }
      return false;
    }),
    [mockDocentes, carrerasJefe]
  );

  // Solo estudiantes de Asistencia Docente de las carreras del jefe
  const estudiantesAsistencia = useMemo(() =>
    mockEstudiantes.filter(e =>
      carrerasJefe.includes(e.carrera) && e.areaActual === 'Asistencia Docente'
    ),
    [mockEstudiantes, carrerasJefe]
  );

  // Search filtering
  const estudiantesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return estudiantesAsistencia;
    const q = busqueda.toLowerCase();
    return estudiantesAsistencia.filter(e =>
      e.nombre.toLowerCase().includes(q) ||
      e.matricula.toLowerCase().includes(q) ||
      (e.cursoAsignado && e.cursoAsignado.toLowerCase().includes(q)) ||
      (e.docenteResponsable && e.docenteResponsable.toLowerCase().includes(q))
    );
  }, [estudiantesAsistencia, busqueda]);

  const docentesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return docentesCarrera;
    const q = busqueda.toLowerCase();
    return docentesCarrera.filter(d =>
      d.nombre.toLowerCase().includes(q) ||
      (d.subarea && d.subarea.toLowerCase().includes(q))
    );
  }, [docentesCarrera, busqueda]);

  const toggleDocente = (id: string) => {
    setExpandedDocentes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEstudiante = (id: string) => {
    setExpandedEstudiantes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getIniciales = (nombre: string) =>
    nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Registros por estudiante
  const getRegistrosEstudiante = (estId: string) =>
    mockRegistrosHoras.filter(r => r.estudianteId === estId);

  // Promedio progreso
  const promedioProgreso = estudiantesAsistencia.length > 0
    ? Math.round(estudiantesAsistencia.reduce((s, e) => s + (e.horasCompletadas / e.horasRequeridas) * 100, 0) / estudiantesAsistencia.length)
    : 0;

  const estudiantesActivos = estudiantesAsistencia.filter(e => e.estado === 'activo').length;
  const estudiantesCompletados = estudiantesAsistencia.filter(e => e.estado === 'completado').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm mb-1">Jefatura de Carrera · Asistencia Docente</p>
            <h2 className="text-2xl font-bold">Estudiantes y Docentes</h2>
            <p className="text-white/80 text-sm mt-1">
              {carrerasJefe.map(c => c.split(' - ')[0]).join(' / ')}
            </p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-white/70 text-sm">Estudiantes</p>
              <p className="text-3xl font-bold">{estudiantesAsistencia.length}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Docentes</p>
              <p className="text-3xl font-bold">{docentesCarrera.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
          <button
            onClick={() => { setVista('estudiantes'); setBusqueda(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
              vista === 'estudiantes'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span className="font-medium">Estudiantes</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              vista === 'estudiantes' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {estudiantesAsistencia.length}
            </span>
          </button>
          <button
            onClick={() => { setVista('docentes'); setBusqueda(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
              vista === 'docentes'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="font-medium">Docentes</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              vista === 'docentes' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {docentesCarrera.length}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={vista === 'estudiantes' ? 'Buscar por nombre, matrícula, curso...' : 'Buscar docente...'}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {/* ===================== VISTA ESTUDIANTES ===================== */}
      {vista === 'estudiantes' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#2E7D32]/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-[#2E7D32]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Becados</p>
                    <p className="text-2xl font-bold text-[#2E7D32]">{estudiantesAsistencia.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Activos</p>
                    <p className="text-2xl font-bold text-green-600">{estudiantesActivos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completados</p>
                    <p className="text-2xl font-bold text-blue-600">{estudiantesCompletados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Promedio Progreso</p>
                    <p className="text-2xl font-bold text-amber-600">{promedioProgreso}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student list with collapsibles */}
          <Card className="bg-white border-none shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gradient-to-r from-[#E8F5E9] to-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#2E7D32]" />
                <h3 className="font-semibold text-[#2E7D32]">Estudiantes en Asistencia Docente</h3>
              </div>
              <Badge className="bg-[#2E7D32] text-white">{estudiantesFiltrados.length}</Badge>
            </div>

            <div className="divide-y divide-gray-100">
              {estudiantesFiltrados.map(estudiante => {
                const progreso = estudiante.horasRequeridas > 0
                  ? (estudiante.horasCompletadas / estudiante.horasRequeridas) * 100
                  : 0;
                const registros = getRegistrosEstudiante(estudiante.id);
                const registrosAprobados = registros.filter(r => r.estado === 'aprobada');
                const registrosPendientes = registros.filter(r => r.estado === 'pendiente');
                const registrosRecientes = registros
                  .sort((a, b) => b.fecha.localeCompare(a.fecha))
                  .slice(0, 3);
                const isOpen = expandedEstudiantes[estudiante.id];

                return (
                  <Collapsible
                    key={estudiante.id}
                    open={isOpen}
                    onOpenChange={() => toggleEstudiante(estudiante.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className={`px-5 py-3.5 hover:bg-gray-50/80 transition-colors cursor-pointer ${isOpen ? 'bg-green-50/40' : ''}`}>
                        <div className="flex items-center gap-4">
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}

                          <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {getIniciales(estudiante.nombre)}
                          </div>

                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-semibold text-gray-800 text-sm">{estudiante.nombre}</p>
                              <StatusBadge status={estudiante.estado} />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{estudiante.matricula}</span>
                              <span>·</span>
                              <span>{estudiante.carrera.split(' - ')[0]}</span>
                              {estudiante.cursoAsignado && (
                                <>
                                  <span>·</span>
                                  <span className="flex items-center gap-1 text-[#2E7D32]">
                                    <BookOpen className="w-3 h-3" />
                                    {estudiante.cursoAsignado}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Docente */}
                          <div className="hidden md:block text-right">
                            <p className="text-xs text-gray-500">Docente</p>
                            <p className="text-sm text-[#2E7D32] font-medium">{estudiante.docenteResponsable}</p>
                          </div>

                          {/* Progress compact */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-700">{estudiante.horasCompletadas}/{estudiante.horasRequeridas}h</p>
                            </div>
                            <div className="w-20">
                              <div className="flex justify-end mb-0.5">
                                <span className={`text-xs font-bold ${progreso >= 100 ? 'text-blue-600' : 'text-[#2E7D32]'}`}>{Math.round(progreso)}%</span>
                              </div>
                              <Progress value={Math.min(progreso, 100)} className="h-1.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-5 pb-5 pt-2 bg-gradient-to-b from-green-50/30 to-white">
                        <div className="ml-10 space-y-4">
                          {/* Info grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white rounded-xl border border-gray-100 p-3">
                              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> Correo
                              </p>
                              <p className="text-sm font-medium text-gray-800 truncate">{estudiante.email}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-100 p-3">
                              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <User className="w-3 h-3" /> Docente Responsable
                              </p>
                              <p className="text-sm font-medium text-gray-800">{estudiante.docenteResponsable}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-100 p-3">
                              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> Curso Asignado
                              </p>
                              <p className="text-sm font-medium text-gray-800">{estudiante.cursoAsignado || 'No especificado'}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-100 p-3">
                              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Cuatrimestre
                              </p>
                              <p className="text-sm font-medium text-gray-800">{estudiante.cuatrimestre}</p>
                            </div>
                          </div>

                          {/* Progreso periodo actual */}
                          <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
                                Periodo Actual
                              </p>
                              <Badge variant="outline" className="text-[#2E7D32] border-[#2E7D32] text-xs">
                                {estudiante.cuatrimestre} · Periodo {(() => {
                                  if (estudiante.horasCompletadas <= 50) return 1;
                                  if (estudiante.horasCompletadas <= 100) return 2;
                                  return 3;
                                })()}
                              </Badge>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                              <div className="flex items-end justify-between mb-2">
                                <div>
                                  <p className="text-xs text-gray-500">Horas completadas en este periodo</p>
                                  <p className="text-2xl font-bold text-[#2E7D32]">
                                    {(() => {
                                      if (estudiante.horasCompletadas <= 50) return estudiante.horasCompletadas;
                                      if (estudiante.horasCompletadas <= 100) return estudiante.horasCompletadas - 50;
                                      return estudiante.horasCompletadas - 100;
                                    })()}/50h
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Total acumulado</p>
                                  <p className="text-lg font-bold text-gray-700">{estudiante.horasCompletadas}/{estudiante.horasRequeridas}h</p>
                                </div>
                              </div>
                              <Progress value={(() => {
                                let horasPeriodo;
                                if (estudiante.horasCompletadas <= 50) horasPeriodo = estudiante.horasCompletadas;
                                else if (estudiante.horasCompletadas <= 100) horasPeriodo = estudiante.horasCompletadas - 50;
                                else horasPeriodo = estudiante.horasCompletadas - 100;
                                return (horasPeriodo / 50) * 100;
                              })()} className="h-2" />
                            </div>
                          </div>

                          {/* Resumen de registros */}
                          <div className="flex items-center gap-3">
                            <Badge className="bg-green-100 text-green-700 border border-green-200">
                              {registrosAprobados.length} aprobados
                            </Badge>
                            <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200">
                              {registrosPendientes.length} pendientes
                            </Badge>
                            <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
                              {registros.length} registros totales
                            </Badge>
                          </div>

                          {/* Últimos registros */}
                          {registrosRecientes.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 p-4">
                              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#2E7D32]" />
                                Últimos Registros
                              </p>
                              <div className="space-y-2">
                                {registrosRecientes.map(r => (
                                  <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 text-sm">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <span className="text-gray-500 text-xs w-20 flex-shrink-0">
                                        {new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                      </span>
                                      <span className="text-gray-700 truncate">{r.descripcion}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                      <Badge className="bg-blue-100 text-blue-700 text-xs">{r.totalHoras}h</Badge>
                                      <Badge className={`text-xs ${
                                        r.estado === 'aprobada' ? 'bg-green-100 text-green-700' :
                                        r.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {r.estado === 'aprobada' ? '✓' : r.estado === 'pendiente' ? '⏳' : '✗'}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>

            {estudiantesFiltrados.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <GraduationCap className="w-14 h-14 mb-4 text-gray-300" />
                <p className="font-medium text-gray-500">No se encontraron estudiantes</p>
                <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ===================== VISTA DOCENTES ===================== */}
      {vista === 'docentes' && (
        <div className="space-y-4">
          {docentesFiltrados.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
                <User className="w-14 h-14 mb-4 text-gray-300" />
                <p className="font-medium text-gray-500">No se encontraron docentes</p>
              </CardContent>
            </Card>
          ) : (
            docentesFiltrados.map((docente) => {
              const estudiantesDocente = mockEstudiantes.filter(e =>
                docente.estudiantesAsignados.includes(e.id)
              );
              const totalHorasDocente = estudiantesDocente.reduce((acc, e) => acc + e.horasAcumuladas, 0);
              const horasRequeridasDocente = estudiantesDocente.length * 150;
              const progresoDocente = horasRequeridasDocente > 0
                ? (totalHorasDocente / horasRequeridasDocente) * 100
                : 0;

              return (
                <Collapsible
                  key={docente.id}
                  open={expandedDocentes[docente.id]}
                  onOpenChange={() => toggleDocente(docente.id)}
                >
                  <Card className="bg-white border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <CollapsibleTrigger className="w-full">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {expandedDocentes[docente.id] ? (
                              <ChevronDown className="w-5 h-5 text-[#2E7D32] flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}

                            <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold flex-shrink-0">
                              {getIniciales(docente.nombre)}
                            </div>

                            <div className="flex-1 text-left">
                              <h3 className="font-bold text-gray-800">{docente.nombre}</h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5" />
                                  {docente.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {docente.subarea || docente.area}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-[#2E7D32] text-white text-xs">
                                  {docente.estudiantesAsignados.length} estudiantes
                                </Badge>
                                <Badge variant="outline" className="text-[#2E7D32] border-[#2E7D32] text-xs">
                                  {Math.round(progresoDocente)}% progreso
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="text-right ml-4">
                            <p className="text-sm text-gray-500">Horas Acumuladas</p>
                            <p className="text-2xl font-bold text-[#2E7D32]">{totalHorasDocente}h</p>
                            <p className="text-xs text-gray-500">de {horasRequeridasDocente}h</p>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t border-gray-100 bg-gray-50/50">
                        <div className="p-5">
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-[#2E7D32]" />
                            Estudiantes Asignados ({estudiantesDocente.length})
                          </h4>

                          <div className="space-y-2">
                            {estudiantesDocente.map((estudiante) => {
                              const progreso = estudiante.horasRequeridas > 0
                                ? (estudiante.horasAcumuladas / estudiante.horasRequeridas) * 100
                                : 0;

                              return (
                                <div
                                  key={estudiante.id}
                                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-[#2E7D32]/30 transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white font-bold text-xs">
                                      {getIniciales(estudiante.nombre)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-800 text-sm">{estudiante.nombre}</p>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{estudiante.matricula}</span>
                                        <span>·</span>
                                        <span>{estudiante.carrera.split(' - ')[0]}</span>
                                        {estudiante.cursoAsignado && (
                                          <>
                                            <span>·</span>
                                            <span className="text-[#2E7D32]">{estudiante.cursoAsignado}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-[#2E7D32]">
                                        {estudiante.horasAcumuladas}/{estudiante.horasRequeridas}h
                                      </p>
                                    </div>
                                    <div className="w-20">
                                      <div className="flex justify-end mb-0.5">
                                        <span className="text-xs font-bold text-[#2E7D32]">{Math.round(progreso)}%</span>
                                      </div>
                                      <Progress value={Math.min(progreso, 100)} className="h-1.5" />
                                    </div>
                                    <StatusBadge status={estudiante.estado} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
