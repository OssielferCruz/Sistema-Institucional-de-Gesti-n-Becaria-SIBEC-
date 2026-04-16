import React from 'react';
import { Clock, CheckCircle, MapPin, User, Calendar, AlertCircle } from 'lucide-react';
import { KPICard } from '../../components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { mockRegistrosHoras, mockEstudiantes } from '../../data/mockData';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';

export const DashboardEstudiante: React.FC = () => {
  const { user } = useAuth();
  
  // Obtener datos del estudiante actual desde mockData
  const estudiante = mockEstudiantes.find(e => e.email === user?.email) || mockEstudiantes[0];
  
  // Filtrar registros del estudiante
  const misRegistros = mockRegistrosHoras.filter(r => r.estudianteId === estudiante.id).slice(0, 6);
  
  // Calcular horas completadas (aprobadas) del periodo actual
  const horasCompletadasPeriodo = mockRegistrosHoras
    .filter(r => r.estudianteId === estudiante.id && r.estado === 'aprobada')
    .reduce((sum, r) => sum + r.totalHoras, 0);
    
  const horasPendientesPeriodo = 50 - horasCompletadasPeriodo;
  
  // Calcular horas del año (asumiendo que están en periodo 1, por ahora)
  const horasCompletadasAnual = horasCompletadasPeriodo;
  const horasPendientesAnual = 150 - horasCompletadasAnual;
  
  // Progreso del periodo actual
  const progresoPeriodo = (horasCompletadasPeriodo / 50) * 100;
  
  // Progreso anual
  const progresoAnual = (horasCompletadasAnual / 150) * 100;
  
  // Determinar nombre del periodo
  const getPeriodoNombre = (periodo: 1 | 2 | 3) => {
    if (periodo === 1) return 'ENE-ABR (Periodo 1)';
    if (periodo === 2) return 'MAY-AGO (Periodo 2)';
    return 'SEP-DIC (Periodo 3)';
  };
  
  // Datos para el gráfico - horas por mes del cuatrimestre actual
  const chartData = [
    { id: 'mes-ene', mes: 'Ene', horas: 17 },
    { id: 'mes-feb', mes: 'Feb', horas: 21 },
    { id: 'mes-mar', mes: 'Mar', horas: 13 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] text-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-2">¡Hola, {estudiante.nombre}!</h2>
        <p className="text-white/90">Aquí está el resumen de tu progreso en horas sociales</p>
        <p className="text-white/80 text-sm mt-1">{getPeriodoNombre(estudiante.periodoActual)}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Horas Completadas (Periodo)"
          value={horasCompletadasPeriodo}
          icon={CheckCircle}
          color="#2E7D32"
        />
        <KPICard
          title="Horas Pendientes (Periodo)"
          value={horasPendientesPeriodo > 0 ? horasPendientesPeriodo : 0}
          icon={Clock}
          color="#FBC02D"
        />
        <KPICard
          title="Horas Completadas (Año)"
          value={horasCompletadasAnual}
          icon={CheckCircle}
          color="#1B5E20"
        />
        <KPICard
          title="Horas Pendientes (Año)"
          value={horasPendientesAnual > 0 ? horasPendientesAnual : 0}
          icon={AlertCircle}
          color="#E65100"
        />
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso del Periodo */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Progreso del Periodo Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-[#424242]">
                    {horasCompletadasPeriodo} / 50 horas
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {horasPendientesPeriodo > 0 
                      ? `Te faltan ${horasPendientesPeriodo} horas para completar este periodo`
                      : '¡Has completado este periodo! Excelente trabajo.'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {getPeriodoNombre(estudiante.periodoActual)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#2E7D32]">{Math.round(progresoPeriodo)}%</p>
                  <p className="text-sm text-gray-500">Completado</p>
                </div>
              </div>
              <Progress value={progresoPeriodo} className="h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Progreso Anual */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Progreso Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-[#424242]">
                    {horasCompletadasAnual} / 150 horas
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {horasPendientesAnual > 0 
                      ? `Te faltan ${horasPendientesAnual} horas para completar el año`
                      : '¡Has completado todas las horas del año!'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Meta anual: 150 horas • 3 periodos de 50 horas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#1B5E20]">{Math.round(progresoAnual)}%</p>
                  <p className="text-sm text-gray-500">Completado</p>
                </div>
              </div>
              <Progress value={progresoAnual} className="h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Horas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="mes" stroke="#9E9E9E" />
                <YAxis stroke="#9E9E9E" />
                <Tooltip 
                  cursor={{ fill: 'rgba(46, 125, 50, 0.1)' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="horas" name="Horas" fill="#2E7D32" radius={[8, 8, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Mi Asignación Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#2E7D32]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Área</p>
                  <p className="font-medium text-[#424242]">{estudiante.areaActual}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#2E7D32]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Responsable</p>
                  <p className="font-medium text-[#424242]">{estudiante.docenteResponsable}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#2E7D32]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Periodo</p>
                  <p className="font-medium text-[#424242]">{getPeriodoNombre(estudiante.periodoActual)}</p>
                </div>
              </div>

              <div className="p-4 bg-[#E8F5E9] rounded-lg border border-[#2E7D32]/20">
                <p className="text-sm text-[#1B5E20] font-medium">Matrícula: {estudiante.matricula}</p>
                <p className="text-xs text-gray-600 mt-1">{estudiante.carrera}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity History */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#2E7D32]">Mi Historial de Actividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {misRegistros.map((registro) => (
              <div key={registro.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-[#2E7D32]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-[#424242]">{registro.descripcion}</p>
                      <p className="text-sm text-gray-500 mt-1">{registro.area}</p>
                    </div>
                    <StatusBadge status={registro.estado} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {registro.fecha}
                    </span>
                    <span>•</span>
                    <span>{registro.horaInicio} - {registro.horaFin}</span>
                    <span>•</span>
                    <span className="font-medium text-[#2E7D32]">{registro.totalHoras} horas</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};