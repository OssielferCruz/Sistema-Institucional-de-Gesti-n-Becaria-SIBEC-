import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  X,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { useLegacyDataBridge } from '../hooks/useLegacyDataBridge';

// Modal para ver detalles del día
interface ModalDetallesDiaProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: any;
  dia: any;
  registros: any[];
}

const ModalDetallesDia: React.FC<ModalDetallesDiaProps> = ({ isOpen, onClose, estudiante, dia, registros }) => {
  if (!isOpen) return null;

  const totalHoras = registros.reduce((sum, r) => sum + r.totalHoras, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Detalles del Día - {dia.nombreDia} {dia.dia} de {dia.mes}
              </CardTitle>
              <p className="text-white/90 text-sm mt-1">{estudiante.nombre}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Resumen del día */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Total de Horas Trabajadas</p>
                <p className="text-3xl font-bold text-green-900">{totalHoras}h</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700 font-medium">Registros</p>
                <p className="text-3xl font-bold text-green-900">{registros.length}</p>
              </div>
            </div>
          </div>

          {/* Lista de registros */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Actividades Realizadas
            </h3>

            {registros.map((registro, index) => (
              <div key={registro.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#2E7D32] transition-colors">
                {/* Header del registro */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#2E7D32]">{index + 1}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {registro.horaInicio} - {registro.horaFin}
                        </span>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          {registro.totalHoras}h
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Registrado el {new Date(registro.fechaRegistro).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  <Badge 
                    className={
                      registro.estado === 'aprobada' ? 'bg-green-100 text-green-700 border-green-200' :
                      registro.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-red-100 text-red-700 border-red-200'
                    }
                  >
                    {registro.estado === 'aprobada' ? '✓ Aprobada' :
                     registro.estado === 'pendiente' ? '⏳ Pendiente' : '✗ Rechazada'}
                  </Badge>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Descripción de Actividades:</p>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-700">{registro.descripcion}</p>
                    </div>
                  </div>

                  {/* Comentarios del docente */}
                  {registro.comentario && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Comentarios del Docente:</p>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-sm text-blue-900 italic">"{registro.comentario}"</p>
                      </div>
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>Área: <strong>{estudiante.areaActual}</strong></span>
                    {registro.responsable && (
                      <span>Responsable: <strong>{registro.responsable}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botón de cerrar */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} className="bg-[#2E7D32] hover:bg-[#1B5E20]">
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ControlAsistencia: React.FC = () => {
  const { user } = useAuth();
  const { mockEstudiantes, mockDocentes, mockRegistrosHoras, isLoading, error } = useLegacyDataBridge();
  const [semanaActual, setSemanaActual] = useState(12);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<any>(null);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<any>(null);

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando asistencia...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  // Obtener docente actual o datos de jefatura
  const docente = mockDocentes.find(d => d.id === user?.docenteId) ?? mockDocentes.find(d => d.email === user?.email);

  // Filtrar estudiantes según el rol (MOSTRAR TODOS LOS ESTADOS)
  let estudiantesAsignados: any[] = [];

  if (user?.role === 'jefatura') {
    // Para jefatura: solo estudiantes de Asistencia Docente de sus carreras
    const carrerasJefe = user?.carrerasAsignadas || (user?.carrera ? [user.carrera] : []);

    // Obtener estudiantes que son de las carreras del jefe Y están en Asistencia Docente
    estudiantesAsignados = mockEstudiantes.filter(e =>
      carrerasJefe.includes(e.carrera) && e.areaActual === 'Asistencia Docente'
    );
  } else if (user?.role === 'docente') {
    // Para docente: filtrar por estudiantes asignados (todos los estados)

    estudiantesAsignados = mockEstudiantes.filter(e =>
      docente?.estudiantesAsignados?.includes(e.id)
    );

  } else {
    // Rol no reconocido
  }

  // Filtrar estudiantes por búsqueda
  const estudiantesFiltrados = estudiantesAsignados.filter(e => {
    if (!busquedaEstudiante) return true;
    const busqueda = busquedaEstudiante.toLowerCase();
    return (
      e.nombre.toLowerCase().includes(busqueda) ||
      e.matricula.toLowerCase().includes(busqueda) ||
      e.areaActual.toLowerCase().includes(busqueda)
    );
  });

  // Función para generar fechas de una semana específica (lunes a viernes)
  const obtenerDiasSemana = (numeroSemana: number) => {
    // Calcular semana basándose en el periodo actual (ENE-ABR 2026)
    const fechaInicioPeriodo = new Date(2026, 0, 19); // 19 de enero 2026 (lunes)
    const diasDesdeInicio = (numeroSemana - 1) * 7;
    
    const dias = [];
    for (let i = 0; i < 5; i++) { // Lunes a Viernes
      const fecha = new Date(fechaInicioPeriodo);
      fecha.setDate(fechaInicioPeriodo.getDate() + diasDesdeInicio + i);
      
      dias.push({
        fecha: fecha.toISOString().split('T')[0],
        dia: fecha.getDate(),
        mes: fecha.toLocaleDateString('es-ES', { month: 'short' }),
        diaSemana: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][fecha.getDay()],
        nombreDia: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()]
      });
    }
    return dias;
  };

  const diasSemana = obtenerDiasSemana(semanaActual);

  // Obtener registros de un estudiante en una fecha específica
  const obtenerRegistrosPorFecha = (estudianteId: string, fecha: string) => {
    return mockRegistrosHoras.filter(r => 
      r.estudianteId === estudianteId && 
      r.fecha === fecha
    );
  };

  // Calcular estadísticas de la semana
  const calcularEstadisticasSemana = (estudianteId: string) => {
    const diasConAsistencia = diasSemana.filter(dia => {
      const registros = obtenerRegistrosPorFecha(estudianteId, dia.fecha);
      return registros.length > 0;
    }).length;
    
    const totalHorasSemana = diasSemana.reduce((total, dia) => {
      const registros = obtenerRegistrosPorFecha(estudianteId, dia.fecha);
      return total + registros.reduce((sum, r) => sum + r.totalHoras, 0);
    }, 0);

    return {
      diasAsistidos: diasConAsistencia,
      totalDias: 5, // Lunes a Viernes
      porcentajeAsistencia: Math.round((diasConAsistencia / 5) * 100),
      horasTotales: totalHorasSemana
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2E7D32]">Control de Asistencia por Semanas</h2>
          <p className="text-gray-600 mt-1">
            {user?.role === 'jefatura' 
              ? 'Estudiantes de Asistencia Docente de tus carreras asignadas'
              : 'Visualiza las asistencias registradas desde "Registro de Horas"'
            }
          </p>
        </div>
      </div>


      {/* Controles de navegación */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            {/* Selector de semana */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSemanaActual(Math.max(1, semanaActual - 1))}
                disabled={semanaActual === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center min-w-[200px]">
                <p className="text-2xl font-bold text-[#2E7D32]">Semana {semanaActual}</p>
                <p className="text-sm text-gray-500">
                  {diasSemana[0].dia} {diasSemana[0].mes} - {diasSemana[4].dia} {diasSemana[4].mes} 2026
                </p>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSemanaActual(Math.min(12, semanaActual + 1))}
                disabled={semanaActual === 12}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Filtro de estudiante */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={busquedaEstudiante}
                  onChange={(e) => setBusquedaEstudiante(e.target.value)}
                  placeholder="Buscar estudiante por nombre o matrícula..."
                  className="w-[320px] pl-10"
                />
              </div>
              {busquedaEstudiante && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setBusquedaEstudiante('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Indicador de semanas */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
              <button
                key={num}
                onClick={() => setSemanaActual(num)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  semanaActual === num
                    ? 'bg-[#2E7D32] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                S{num}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vista por estudiante */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#2E7D32] flex items-center justify-between">
            <span>Asistencia de Estudiantes</span>
            <Badge className="bg-[#2E7D32] text-white">{estudiantesFiltrados.length} estudiante{estudiantesFiltrados.length !== 1 ? 's' : ''}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {estudiantesFiltrados.map((estudiante) => {
              const estadisticas = calcularEstadisticasSemana(estudiante.id);

              return (
                <AccordionItem key={estudiante.id} value={estudiante.id} className="border-b border-gray-200">
                  <AccordionTrigger className="hover:no-underline hover:bg-gray-50 px-3 rounded-md">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white font-bold">
                          {estudiante.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#424242] text-sm">{estudiante.nombre}</p>
                            <Badge 
                              className={
                                estudiante.estado === 'activo' ? 'bg-green-100 text-green-700 border-green-300 text-xs' :
                                estudiante.estado === 'completado' ? 'bg-blue-100 text-blue-700 border-blue-300 text-xs' :
                                'bg-gray-100 text-gray-700 border-gray-300 text-xs'
                              }
                              variant="outline"
                            >
                              {estudiante.estado === 'activo' ? '● Activo' :
                               estudiante.estado === 'completado' ? '✓ Completado' : '⏸ Inactivo'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{estudiante.matricula} • {estudiante.areaActual}</p>
                        </div>
                      </div>
                      
                      {/* Estadísticas condensadas */}
                      <div className="flex items-center gap-4 mr-2">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Días</p>
                          <p className="text-lg font-bold text-[#2E7D32]">{estadisticas.diasAsistidos}/5</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">%</p>
                          <p className={`text-lg font-bold ${
                            estadisticas.porcentajeAsistencia >= 80 ? 'text-green-600' :
                            estadisticas.porcentajeAsistencia >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {estadisticas.porcentajeAsistencia}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Horas</p>
                          <p className="text-lg font-bold text-blue-600">{estadisticas.horasTotales}h</p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent>
                    <div className="px-3 pb-4 pt-2">
                      {/* Calendario semanal */}
                      <div className="grid grid-cols-5 gap-3 mb-4">
                        {diasSemana.map((dia, index) => {
                          const registros = obtenerRegistrosPorFecha(estudiante.id, dia.fecha);
                          const tieneAsistencia = registros.length > 0;
                          const horasDia = registros.reduce((sum, r) => sum + r.totalHoras, 0);

                          return (
                            <div
                              key={index}
                              onClick={() => {
                                if (tieneAsistencia) {
                                  setEstudianteSeleccionado(estudiante);
                                  setDiaSeleccionado(dia);
                                  setModalAbierto(true);
                                }
                              }}
                              className={`border rounded-lg p-3 transition-all ${
                                tieneAsistencia 
                                  ? 'border-green-300 bg-green-50 cursor-pointer hover:shadow-md hover:scale-105' 
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              {/* Encabezado del día */}
                              <div className="text-center mb-2">
                                <p className="text-xs font-medium text-gray-500">{dia.diaSemana}</p>
                                <p className="text-lg font-bold text-gray-900">{dia.dia}</p>
                                <p className="text-xs text-gray-500">{dia.mes}</p>
                              </div>

                              {/* Indicador de asistencia */}
                              <div className="flex items-center justify-center mb-2">
                                {tieneAsistencia ? (
                                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Registros del día */}
                              {tieneAsistencia ? (
                                <div className="space-y-1">
                                  <div className="text-center">
                                    <Badge className="bg-green-600 text-white text-xs">
                                      {horasDia}h
                                    </Badge>
                                  </div>

                                  <div className="text-center">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full h-7 text-xs bg-white border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEstudianteSeleccionado(estudiante);
                                        setDiaSeleccionado(dia);
                                        setModalAbierto(true);
                                      }}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      Ver
                                    </Button>
                                  </div>

                                  <div className="text-xs text-gray-600 text-center pt-1 border-t border-green-200">
                                    {registros.length} reg.
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="text-xs text-gray-400">Sin registro</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Resumen de registros de la semana */}
                      {estadisticas.diasAsistidos > 0 && (
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900 font-semibold mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Resumen de la Semana {semanaActual}
                          </p>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/70 rounded-lg p-3 text-center">
                              <p className="text-xs text-blue-600 mb-1">Días trabajados</p>
                              <p className="text-xl font-bold text-blue-900">{estadisticas.diasAsistidos}/5</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-3 text-center">
                              <p className="text-xs text-blue-600 mb-1">Total de horas</p>
                              <p className="text-xl font-bold text-blue-900">{estadisticas.horasTotales}h</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-3 text-center">
                              <p className="text-xs text-blue-600 mb-1">Promedio diario</p>
                              <p className="text-xl font-bold text-blue-900">
                                {estadisticas.diasAsistidos > 0 
                                  ? (estadisticas.horasTotales / estadisticas.diasAsistidos).toFixed(1) 
                                  : 0}h
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Mensaje cuando no hay estudiantes */}
          {estudiantesFiltrados.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-lg mb-2">No hay estudiantes para mostrar</p>
              {busquedaEstudiante ? (
                <p className="text-sm mt-2">Intenta con otro criterio de búsqueda</p>
              ) : (
                <div className="max-w-md mx-auto mt-4 text-left bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ Posible solución:</p>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    <li>Cierra sesión en la esquina superior derecha</li>
                    <li>Vuelve a iniciar sesión con tus credenciales</li>
                    <li>Los datos deberían aparecer correctamente</li>
                  </ol>
                  <p className="text-xs text-yellow-600 mt-3 italic">
                    Usuario actual: {user?.email} ({user?.role})
                  </p>
                  {user?.role === 'jefatura' && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Carreras asignadas: {user?.carrerasAsignadas?.length || 0}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Asistió y registró horas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <span>No hay registro de asistencia</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Descripción de actividades realizadas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles del día */}
      <ModalDetallesDia
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        estudiante={estudianteSeleccionado}
        dia={diaSeleccionado}
        registros={obtenerRegistrosPorFecha(estudianteSeleccionado?.id, diaSeleccionado?.fecha)}
      />
    </div>
  );
};