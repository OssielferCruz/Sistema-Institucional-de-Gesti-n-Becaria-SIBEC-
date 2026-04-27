import React, { useState } from 'react';
import { Users, Clock, CheckCircle, Calendar, X, Eye, TrendingUp } from 'lucide-react';
import { KPICard } from '../../components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { useLegacyDataBridge } from '../../hooks/useLegacyDataBridge';

// Modal para desglose de información
interface ModalDesgloseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tipo: 'estudiantes' | 'horas-hoy' | 'registros-semana' | 'aprobados';
  data: any;
}

const ModalDesglose: React.FC<ModalDesgloseProps> = ({ isOpen, onClose, title, tipo, data }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (tipo) {
      case 'estudiantes':
        return (
          <div className="space-y-4">
            {data.estudiantes.map((estudiante: any) => {
              const progreso = (estudiante.horasCompletadas / estudiante.horasRequeridas) * 100;
              return (
                <div key={estudiante.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#2E7D32] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold">
                        {estudiante.nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{estudiante.nombre}</p>
                        <p className="text-sm text-gray-500">{estudiante.matricula}</p>
                      </div>
                    </div>
                    <StatusBadge status={estudiante.estado} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Carrera</p>
                      <p className="text-sm font-medium text-gray-900">{estudiante.carrera}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Área Actual</p>
                      <p className="text-sm font-medium text-gray-900">{estudiante.areaActual}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progreso del Año</span>
                      <span className="font-semibold text-[#2E7D32]">
                        {estudiante.horasCompletadas}/{estudiante.horasRequeridas}h ({progreso.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-[#2E7D32] h-3 rounded-full transition-all"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Periodo Actual</p>
                      <p className="text-sm font-semibold text-[#2E7D32]">P{estudiante.periodoActual}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-xs font-medium text-gray-700 truncate">{estudiante.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Periodo</p>
                      <p className="text-xs font-medium text-gray-700">{estudiante.Periodo}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'horas-hoy':
        return (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Total de Horas Registradas Hoy</p>
                  <p className="text-3xl font-bold text-green-900">{data.totalHoras}h</p>
                </div>
                <Clock className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {data.registros.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <p>No hay registros de hoy</p>
              </div>
            ) : (
              data.registros.map((registro: any) => (
                <div key={registro.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#2E7D32] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{registro.estudianteNombre}</p>
                      <p className="text-sm text-gray-500">{registro.fecha}</p>
                    </div>
                    <StatusBadge status={registro.estado} />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{registro.descripcion}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {registro.horaInicio} - {registro.horaFin}
                      </span>
                    </div>
                    <Badge className="bg-[#2E7D32] text-white">
                      {registro.totalHoras} horas
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'registros-semana':
        return (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Registros de Esta Semana</p>
                  <p className="text-3xl font-bold text-yellow-900">{data.registros.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-700 font-medium">Total de Horas</p>
                  <p className="text-3xl font-bold text-yellow-900">{data.totalHoras}h</p>
                </div>
              </div>
            </div>

            {data.registros.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <p>No hay registros esta semana</p>
              </div>
            ) : (
              data.registros.map((registro: any) => (
                <div key={registro.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#2E7D32] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{registro.estudianteNombre}</p>
                      <p className="text-sm text-gray-500">{registro.fecha}</p>
                    </div>
                    <StatusBadge status={registro.estado} />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{registro.descripcion}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {registro.horaInicio} - {registro.horaFin}
                      </span>
                    </div>
                    <Badge className="bg-[#2E7D32] text-white">
                      {registro.totalHoras} horas
                    </Badge>
                  </div>

                  {registro.comentario && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Comentario:</p>
                      <p className="text-sm text-gray-700 italic">"{registro.comentario}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case 'aprobados':
        return (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Total de Registros Aprobados</p>
                  <p className="text-3xl font-bold text-green-900">{data.registros.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-700 font-medium">Horas Aprobadas</p>
                  <p className="text-3xl font-bold text-green-900">{data.totalHoras}h</p>
                </div>
              </div>
            </div>

            {data.registros.map((registro: any) => (
              <div key={registro.id} className="border border-green-200 rounded-lg p-4 bg-green-50/50 hover:border-[#2E7D32] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{registro.estudianteNombre}</p>
                    <p className="text-sm text-gray-500">{registro.fecha}</p>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    ✓ Aprobada
                  </Badge>
                </div>

                <div className="bg-white rounded-lg p-3 mb-3 border border-green-100">
                  <p className="text-sm text-gray-700">{registro.descripcion}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {registro.horaInicio} - {registro.horaFin}
                    </span>
                  </div>
                  <Badge className="bg-[#2E7D32] text-white">
                    {registro.totalHoras} horas
                  </Badge>
                </div>

                {registro.comentario && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-gray-500 mb-1">Comentario de Jefatura:</p>
                    <p className="text-sm text-gray-700 italic bg-white p-2 rounded border border-green-100">
                      "{registro.comentario}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl bg-white max-h-[85vh] overflow-y-auto">
        <CardHeader className="border-b bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {title}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {renderContent()}
        </CardContent>

        <div className="border-t p-4 bg-gray-50 sticky bottom-0">
          <Button onClick={onClose} className="w-full bg-[#2E7D32] hover:bg-[#1B5E20]">
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export const DashboardDocente: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mockEstudiantes, mockRegistrosHoras, mockDocentes, isLoading, error } = useLegacyDataBridge();
  const [modalAbierto, setModalAbierto] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  // Obtener el docente actual desde el contexto/auth
  const docenteActualId = user?.docenteId;
  const docenteActual = mockDocentes.find(d => d.id === docenteActualId);

  if (!docenteActual) {
    return <div className="p-6 text-sm text-gray-500">No se encontró información del docente actual.</div>;
  }

  // Filtrar estudiantes asignados al docente
  const estudiantesAsignados = mockEstudiantes.filter(est =>
    docenteActual?.estudiantesAsignados.includes(est.id)
  );
  
  const hoy = new Date().toISOString().slice(0, 10);

  const registrosDocente = mockRegistrosHoras.filter(
    r => r.docenteId === docenteActual.id || docenteActual.estudiantesAsignados.includes(r.estudianteId),
  );

  // Calcular registros de hoy
  const registrosHoy = registrosDocente.filter(r => r.fecha === hoy);
  
  const horasRegistradasHoy = registrosHoy.reduce((sum, r) => sum + r.totalHoras, 0);
  
  // Calcular registros de esta semana
  const inicioSemana = new Date();
  const day = inicioSemana.getDay() || 7;
  inicioSemana.setDate(inicioSemana.getDate() - day + 1);
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(finSemana.getDate() + 6);

  const registrosSemana = registrosDocente.filter((registro) => {
    const fechaRegistro = new Date(`${registro.fecha}T00:00:00`);
    return fechaRegistro >= inicioSemana && fechaRegistro <= finSemana;
  });
  
  const horasSemana = registrosSemana.reduce((sum, r) => sum + r.totalHoras, 0);
  
  // Registros aprobados del docente
  const registrosAprobados = registrosDocente.filter(r => r.estado === 'aprobada');
  
  const horasAprobadas = registrosAprobados.reduce((sum, r) => sum + r.totalHoras, 0);

  // Filtrar registros recientes solo de estudiantes asignados al docente y ordenar por fecha
  const registrosRecientes = registrosDocente
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  const handleKPIClick = (tipo: string) => {
    setModalAbierto(tipo);
  };

  const getModalData = () => {
    switch (modalAbierto) {
      case 'estudiantes':
        return {
          title: 'Desglose de Estudiantes Asignados',
          tipo: 'estudiantes' as const,
          data: { estudiantes: estudiantesAsignados }
        };
      case 'horas-hoy':
        return {
          title: 'Desglose de Horas Registradas Hoy',
          tipo: 'horas-hoy' as const,
          data: { registros: registrosHoy, totalHoras: horasRegistradasHoy }
        };
      case 'registros-semana':
        return {
          title: 'Desglose de Registros de la Semana',
          tipo: 'registros-semana' as const,
          data: { registros: registrosSemana, totalHoras: horasSemana }
        };
      case 'aprobados':
        return {
          title: 'Desglose de Registros Aprobados',
          tipo: 'aprobados' as const,
          data: { registros: registrosAprobados, totalHoras: horasAprobadas }
        };
      default:
        return null;
    }
  };

  const modalData = getModalData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#2E7D32] mb-2">Panel de Registro</h2>
          <p className="text-gray-600">Gestiona las horas sociales de tus estudiantes asignados</p>
        </div>
        <Button 
          onClick={() => navigate('/registro-horas')}
          className="bg-[#2E7D32] hover:bg-[#66BB6A] text-white"
        >
          Registrar Horas
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Estudiantes Asignados"
          value={estudiantesAsignados.length}
          icon={Users}
          color="#2E7D32"
          onClick={() => handleKPIClick('estudiantes')}
        />
        <KPICard
          title="Horas Registradas Hoy"
          value={horasRegistradasHoy}
          icon={Clock}
          color="#66BB6A"
          onClick={() => handleKPIClick('horas-hoy')}
        />
        <KPICard
          title="Registros de la Semana"
          value={registrosSemana.length}
          icon={Calendar}
          color="#FBC02D"
          onClick={() => handleKPIClick('registros-semana')}
        />
        <KPICard
          title="Aprobados"
          value={registrosAprobados.length}
          icon={CheckCircle}
          color="#1B5E20"
          onClick={() => handleKPIClick('aprobados')}
        />
      </div>

      {/* Distribución por Cursos */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A]">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Distribución por Cursos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-4 text-sm">
            Estudiantes asignados a cada curso que impartes en el periodo actual
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {estudiantesAsignados.map((estudiante) => (
              <div
                key={estudiante.id}
                className="border-2 border-[#2E7D32]/20 rounded-lg p-4 hover:border-[#2E7D32] hover:shadow-md transition-all bg-gradient-to-br from-green-50 to-white"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {estudiante.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-[#2E7D32] text-sm mb-1">
                          📚 {estudiante.cursoAsignado || 'Sin curso asignado'}
                        </h4>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {estudiante.nombre}
                        </p>
                        <p className="text-xs text-gray-500">{estudiante.matricula}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Progreso:</span>
                        <span className="font-semibold text-[#2E7D32]">
                          {((estudiante.horasCompletadas / estudiante.horasRequeridas) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-[#2E7D32] h-1.5 rounded-full transition-all"
                          style={{ width: `${(estudiante.horasCompletadas / estudiante.horasRequeridas) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Estudiantes Asignados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {estudiantesAsignados.map((estudiante) => {
                const progreso = (estudiante.horasCompletadas / estudiante.horasRequeridas) * 100;
                return (
                  <div key={estudiante.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-[#424242]">{estudiante.nombre}</p>
                        <p className="text-sm text-gray-500">{estudiante.matricula} • {estudiante.carrera}</p>
                      </div>
                      <StatusBadge status={estudiante.estado} />
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Horas acumuladas</span>
                        <span className="font-medium text-[#2E7D32]">
                          {estudiante.horasCompletadas}/{estudiante.horasRequeridas}h
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#2E7D32] h-2 rounded-full transition-all"
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/registro-horas')}
                        className="bg-[#2E7D32] hover:bg-[#66BB6A] text-white h-8 text-xs"
                      >
                        Registrar Horas
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        Ver Historial
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Registros Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registrosRecientes.map((registro) => (
                <div key={registro.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-12 h-12 rounded-lg bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#2E7D32]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-[#424242] truncate">
                        {registro.estudianteNombre}
                      </p>
                      <StatusBadge status={registro.estado} />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{registro.descripcion}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{registro.fecha}</span>
                      <span>•</span>
                      <span>{registro.horaInicio} - {registro.horaFin}</span>
                      <span>•</span>
                      <span className="font-medium text-[#2E7D32]">{registro.totalHoras}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] text-white border-none shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-2">Acciones Rápidas</h3>
          <p className="text-white/90 mb-4 text-sm">Registra las actividades realizadas por tus estudiantes</p>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/registro-horas')}
              className="bg-white text-[#2E7D32] hover:bg-gray-100"
            >
              Nuevo Registro
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              Ver Todos los Registros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {modalData && (
        <ModalDesglose
          isOpen={true}
          onClose={() => setModalAbierto(null)}
          title={modalData.title}
          tipo={modalData.tipo}
          data={modalData.data}
        />
      )}
    </div>
  );
};
