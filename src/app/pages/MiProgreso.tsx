import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useAuth } from '../context/AuthContext';
import { useLegacyDataBridge } from '../hooks/useLegacyDataBridge';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Clock, Award, BookOpen, TrendingUp, Calendar, ChevronRight, CheckCircle, ChevronDown, ChevronUp, BarChart3, Activity, AlertCircle, Timer, Target } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export const MiProgreso: React.FC = () => {
  const { user } = useAuth();
  const { mockEstudiantes, mockRegistrosHoras, isLoading, error } = useLegacyDataBridge();
  const [mesesExpandidos, setMesesExpandidos] = React.useState<Record<string, boolean>>({});

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando progreso...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  // Obtener datos del estudiante actual
  const estudiante = mockEstudiantes.find(e => e.id === user?.estudianteId) || mockEstudiantes.find(e => e.email === user?.email) || mockEstudiantes[0];
  if (!estudiante) {
    return <div className="p-6 text-sm text-gray-500">No se encontró información del estudiante.</div>;
  }

  const misRegistros = mockRegistrosHoras.filter(r => 
    r.estudianteId === estudiante.id && r.estado === 'aprobada'
  );

  // Calcular horas completadas (aprobadas)
  const horasCompletadas = misRegistros.reduce((sum, r) => sum + r.totalHoras, 0);
  
  // Progreso del periodo actual (50 horas)
  const progresoPeriodo = (horasCompletadas / 50) * 100;
  const horasPendientesPeriodo = Math.max(0, 50 - horasCompletadas);
  
  // Progreso anual (150 horas)
  const progresoAnual = (horasCompletadas / 150) * 100;
  const horasPendientesAnual = Math.max(0, 150 - horasCompletadas);

  // Determinar nombre del periodo
  const getPeriodoNombre = (periodo: 1 | 2 | 3) => {
    if (periodo === 1) return 'ENE-ABR (Periodo 1)';
    if (periodo === 2) return 'MAY-AGO (Periodo 2)';
    return 'SEP-DIC (Periodo 3)';
  };

  // Agrupar registros por mes
  const registrosPorMes = misRegistros.reduce((acc, reg) => {
    const mes = reg.fecha.substring(0, 7); // YYYY-MM
    if (!acc[mes]) {
      acc[mes] = { 
        count: 0, 
        horas: 0, 
        registros: [],
        diasActivos: new Set<string>(),
        promedio: 0,
        areas: new Set<string>()
      };
    }
    acc[mes].count++;
    acc[mes].horas += reg.totalHoras;
    acc[mes].registros.push(reg);
    acc[mes].diasActivos.add(reg.fecha);
    acc[mes].areas.add(reg.area);
    return acc;
  }, {} as Record<string, { 
    count: number; 
    horas: number; 
    registros: typeof misRegistros;
    diasActivos: Set<string>;
    promedio: number;
    areas: Set<string>;
  }>);

  // Calcular promedios
  Object.keys(registrosPorMes).forEach(mes => {
    registrosPorMes[mes].promedio = registrosPorMes[mes].horas / registrosPorMes[mes].count;
  });

  const toggleMes = (mes: string) => {
    setMesesExpandidos(prev => ({ ...prev, [mes]: !prev[mes] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#2E7D32]">Mi Progreso de Horas Sociales</h2>
        <p className="text-gray-600 mt-1">
          Revisa tu avance en el cumplimiento de horas sociales
        </p>
      </div>

      {/* Información del Estudiante */}
      <Card className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] border-none shadow-lg">
        <CardContent className="p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{estudiante.nombre}</h3>
              <p className="text-white/90 mt-1">Matrícula: {estudiante.matricula}</p>
              <p className="text-white/90">{estudiante.carrera}</p>
              <p className="text-white/90">Periodo: {getPeriodoNombre(estudiante.periodoActual)}</p>
            </div>
            <div className="text-right">
              <p className="text-white/90">Área Actual</p>
              <p className="text-2xl font-bold mt-1">{estudiante.areaActual}</p>
              <p className="text-white/90 mt-2">Responsable</p>
              <p className="text-lg">{estudiante.docenteResponsable}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#2E7D32]/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#2E7D32]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Horas Completadas (Periodo)</p>
                <p className="text-2xl font-bold text-[#2E7D32]">{horasCompletadas}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#FBC02D]/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#FBC02D]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Horas Pendientes (Periodo)</p>
                <p className="text-2xl font-bold text-[#FBC02D]">{horasPendientesPeriodo}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#1B5E20]/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-[#1B5E20]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Horas Completadas (Año)</p>
                <p className="text-2xl font-bold text-[#1B5E20]">{horasCompletadas}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#E65100]/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#E65100]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Horas Pendientes (Año)</p>
                <p className="text-2xl font-bold text-[#E65100]">{horasPendientesAnual}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso del Periodo y Anual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso del Periodo Actual */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Progreso del Periodo Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {horasCompletadas} de 50 horas completadas
                </span>
                <span className="text-lg font-bold text-[#2E7D32]">{Math.round(progresoPeriodo)}%</span>
              </div>
              <Progress value={progresoPeriodo} className="h-4" />
              <p className="text-xs text-gray-500">
                {getPeriodoNombre(estudiante.periodoActual)} • Meta: 50 horas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progreso Anual */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Progreso Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {horasCompletadas} de 150 horas completadas
                </span>
                <span className="text-lg font-bold text-[#1B5E20]">{Math.round(progresoAnual)}%</span>
              </div>
              <Progress value={progresoAnual} className="h-4" />
              <p className="text-xs text-gray-500">
                Meta anual: 150 horas • 3 periodos de 50 horas cada uno
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico por Periodo - Versión Mejorada */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2">
              <Target className="w-5 h-5" />
              Horas por Periodo
            </CardTitle>
            <Badge variant="outline" className="bg-white text-[#2E7D32] border-[#2E7D32]">
              150h Meta Anual
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* P1 2026 - Periodo Actual (EN PROGRESO) */}
            <div className="relative border-2 border-[#1976D2] rounded-xl p-5 bg-gradient-to-br from-blue-50 to-white shadow-md">
              <div className="absolute -top-3 left-4 bg-[#1976D2] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                <Timer className="w-3 h-3" />
                PERIODO ACTUAL
              </div>
              
              <div className="flex items-start justify-between mb-4 mt-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1976D2] to-[#42A5F5] flex items-center justify-center shadow-md">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">Periodo 1 • 2026</h4>
                      <p className="text-sm text-gray-600 font-medium">ENE - ABR 2026</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-4xl font-bold text-[#1976D2]">{horasCompletadas}</span>
                    <span className="text-lg text-gray-500">/50h</span>
                  </div>
                  <Badge className="bg-[#1976D2] text-white mt-2">{Math.round(progresoPeriodo)}% en Progreso</Badge>
                </div>
              </div>

              <Progress value={progresoPeriodo} className="h-4 mb-3" />

              <div className="grid grid-cols-4 gap-3 mt-4">
                <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Completadas</p>
                  <p className="text-lg font-bold text-[#2E7D32]">{horasCompletadas}h</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Pendientes</p>
                  <p className="text-lg font-bold text-[#FBC02D]">{horasPendientesPeriodo}h</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Días Restantes</p>
                  <p className="text-lg font-bold text-[#E65100]">
                    {Math.max(0, Math.floor((new Date('2026-04-30').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Promedio Req.</p>
                  <p className="text-lg font-bold text-[#1976D2]">
                    {(horasPendientesPeriodo / Math.max(1, Math.floor((new Date('2026-04-30').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7)))).toFixed(1)}h/sem
                  </p>
                </div>
              </div>

              {/* Alerta de progreso */}
              {progresoPeriodo < 50 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800">Atención</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Necesitas completar aproximadamente {(horasPendientesPeriodo / Math.max(1, Math.floor((new Date('2026-04-30').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7)))).toFixed(1)} horas por semana para cumplir la meta del periodo.
                    </p>
                  </div>
                </div>
              )}

              {progresoPeriodo >= 80 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800">¡Excelente progreso!</p>
                    <p className="text-xs text-green-700 mt-1">
                      Estás muy cerca de completar tu meta del periodo. Solo te faltan {horasPendientesPeriodo}h.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* P2 2026 - Próximo Periodo */}
            <div className="relative border-2 border-gray-300 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white opacity-60">
              <div className="absolute -top-3 left-4 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                PRÓXIMO PERIODO
              </div>
              
              <div className="flex items-start justify-between mb-4 mt-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-12 h-12 rounded-xl bg-gray-400 flex items-center justify-center shadow-md">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-700">Periodo 2 • 2026</h4>
                      <p className="text-sm text-gray-600 font-medium">MAY - AGO 2026</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-4xl font-bold text-gray-400">0</span>
                    <span className="text-lg text-gray-400">/50h</span>
                  </div>
                  <Badge variant="outline" className="mt-2 border-gray-400 text-gray-600">Pendiente</Badge>
                </div>
              </div>

              <Progress value={0} className="h-4 mb-3" />

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Fecha Inicio</p>
                  <p className="text-sm font-bold text-gray-600">01/05/2026</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Fecha Fin</p>
                  <p className="text-sm font-bold text-gray-600">31/08/2026</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm font-bold text-gray-500">No iniciado</p>
                </div>
              </div>
            </div>

            {/* P3 2026 - Periodo Futuro */}
            <div className="relative border-2 border-gray-300 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white opacity-40">
              <div className="absolute -top-3 left-4 bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                PRÓXIMO PERIODO
              </div>
              
              <div className="flex items-start justify-between mb-4 mt-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-12 h-12 rounded-xl bg-gray-300 flex items-center justify-center shadow-md">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-700">Periodo 3 • 2026</h4>
                      <p className="text-sm text-gray-600 font-medium">SEP - DIC 2026</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-4xl font-bold text-gray-400">0</span>
                    <span className="text-lg text-gray-400">/50h</span>
                  </div>
                  <Badge variant="outline" className="mt-2 border-gray-400 text-gray-600">Pendiente</Badge>
                </div>
              </div>

              <Progress value={0} className="h-4 mb-3" />

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Fecha Inicio</p>
                  <p className="text-sm font-bold text-gray-600">01/09/2026</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Fecha Fin</p>
                  <p className="text-sm font-bold text-gray-600">31/12/2026</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm font-bold text-gray-500">No iniciado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nota informativa mejorada */}
          <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                  📋 Información Importante
                </h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Las horas <strong>no completadas</strong> en un periodo se <strong>acumulan</strong> para el siguiente periodo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Debes completar un <strong>mínimo de 150 horas</strong> durante el año académico (3 periodos).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Cada periodo tiene una meta de <strong>50 horas</strong> distribuidas en diferentes áreas.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Registros Aprobados - Vista de Tarjetas Agrupadas */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Historial de Horas Completadas
              <Badge variant="outline" className="ml-2 bg-white text-[#2E7D32] border-[#2E7D32]">
                {misRegistros.length} registros
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {misRegistros.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No tienes horas completadas aún</p>
              <p className="text-sm text-gray-400 mt-2">
                Las horas aprobadas aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tarjetas Agrupadas por Mes */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#2E7D32]" />
                  Agrupado por Mes
                </h4>
                <div className="space-y-3">
                  {Object.entries(registrosPorMes)
                    .sort(([a], [b]) => b.localeCompare(a)) // Ordenar del más reciente al más antiguo
                    .map(([mes, data]) => {
                      const fecha = new Date(mes + '-01');
                      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                      const expandido = mesesExpandidos[mes];
                      
                      return (
                        <div key={mes} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {/* Header de la tarjeta */}
                          <div 
                            className="bg-gradient-to-r from-[#E8F5E9] to-white p-4 cursor-pointer"
                            onClick={() => toggleMes(mes)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-5 h-5 text-[#2E7D32]" />
                                  <h5 className="font-bold text-gray-800 capitalize">{nombreMes}</h5>
                                </div>
                                <div className="h-6 w-px bg-gray-300"></div>
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-[#2E7D32]" />
                                    <span className="text-2xl font-bold text-[#2E7D32]">{data.horas}h</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-600">{data.count} registro{data.count !== 1 ? 's' : ''}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Activity className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-600">{data.diasActivos.size} día{data.diasActivos.size !== 1 ? 's' : ''} activo{data.diasActivos.size !== 1 ? 's' : ''}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <TrendingUp className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-600">~{data.promedio.toFixed(1)}h promedio</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[#2E7D32] hover:bg-[#2E7D32]/10"
                              >
                                {expandido ? (
                                  <><ChevronUp className="w-5 h-5" /> Ocultar</>
                                ) : (
                                  <><ChevronDown className="w-5 h-5" /> Ver Detalles</>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Contenido expandible */}
                          {expandido && (
                            <div className="p-4 bg-white border-t border-gray-200">
                              {/* Métricas del mes */}
                              <div className="grid grid-cols-4 gap-4 mb-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-xs text-gray-500 font-medium mb-1">Total Horas</p>
                                  <p className="text-xl font-bold text-[#2E7D32]">{data.horas}h</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-xs text-gray-500 font-medium mb-1">Registros</p>
                                  <p className="text-xl font-bold text-gray-900">{data.count}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-xs text-gray-500 font-medium mb-1">Días Activos</p>
                                  <p className="text-xl font-bold text-[#1976D2]">{data.diasActivos.size}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-xs text-gray-500 font-medium mb-1">Áreas Trabajadas</p>
                                  <p className="text-xl font-bold text-[#FBC02D]">{data.areas.size}</p>
                                </div>
                              </div>

                              {/* Lista de registros */}
                              <div className="space-y-2">
                                <h6 className="text-xs font-semibold text-gray-500 uppercase mb-2">Registros Individuales</h6>
                                {data.registros.map((reg, idx) => (
                                  <div 
                                    key={reg.id}
                                    className={`
                                      p-3 rounded-lg border border-gray-200
                                      ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                                      hover:border-[#2E7D32] hover:shadow-sm transition-all
                                    `}
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <Badge className="bg-[#2E7D32] text-white font-bold">
                                            {reg.totalHoras}h
                                          </Badge>
                                          <span className="text-sm font-medium text-gray-700">
                                            {new Date(reg.fecha).toLocaleDateString('es-ES', { 
                                              weekday: 'short', 
                                              day: '2-digit', 
                                              month: 'short' 
                                            })}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {reg.horaInicio} - {reg.horaFin}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                          {reg.descripcion}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs">
                                          <div className="flex items-center gap-1 text-gray-500">
                                            <BookOpen className="w-3 h-3" />
                                            <span>{reg.area}</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-gray-500">
                                            <Award className="w-3 h-3" />
                                            <span>{reg.docenteNombre}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <StatusBadge status={reg.estado} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Resumen General */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
                  Resumen General
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-[#E8F5E9] to-white rounded-lg border border-[#2E7D32]/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#2E7D32]/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#2E7D32]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Total de Horas</p>
                        <p className="text-2xl font-bold text-[#2E7D32]">{horasCompletadas}h</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Total Registros</p>
                        <p className="text-2xl font-bold text-gray-900">{misRegistros.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-white rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Días Activos</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {new Set(misRegistros.map(r => r.fecha)).size}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Promedio/Registro</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {(horasCompletadas / misRegistros.length).toFixed(1)}h
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};