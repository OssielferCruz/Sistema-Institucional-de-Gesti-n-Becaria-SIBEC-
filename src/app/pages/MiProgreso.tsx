import React from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { HoursLogApiResponse } from '../api/portalApi';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useStudentPortalData } from '../hooks/useStudentPortalData';

type MonthGroup = {
  count: number;
  horas: number;
  registros: HoursLogApiResponse[];
};

export const MiProgreso: React.FC = () => {
  const { progress, assignment, recentLogs, chartData, isLoading, error } = useStudentPortalData();
  const [mesesExpandidos, setMesesExpandidos] = React.useState<Record<string, boolean>>({});

  const approvedHours = Number(progress?.approved_hours ?? 0);
  const targetHours = Number(progress?.target_hours ?? 50);
  const annualTarget = Number(progress?.annual_target_hours ?? 150);
  const remainingPeriod = Math.max(0, targetHours - approvedHours);
  const remainingAnnual = Math.max(0, annualTarget - approvedHours);
  const progressPeriod = targetHours > 0 ? (approvedHours / targetHours) * 100 : 0;
  const progressAnnual = annualTarget > 0 ? (approvedHours / annualTarget) * 100 : 0;

  const registrosPorMes = recentLogs.reduce<Record<string, MonthGroup>>((accumulator, registro) => {
    const monthKey = registro.work_date.slice(0, 7);

    if (!accumulator[monthKey]) {
      accumulator[monthKey] = { count: 0, horas: 0, registros: [] };
    }

    accumulator[monthKey].count += 1;
    accumulator[monthKey].horas += Number(registro.reported_hours);
    accumulator[monthKey].registros.push(registro);
    return accumulator;
  }, {});

  if (isLoading) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">Cargando progreso...</p></div>;
  }

  if (error) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-[#D32F2F]">{error}</p></div>;
  }

  const chartPreview = chartData.length > 0 ? chartData : [{ mes: 'Sin datos', horas: 0 }];

  const toggleMes = (mes: string) => {
    setMesesExpandidos((prevState) => ({ ...prevState, [mes]: !prevState[mes] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#2E7D32]">Mi Progreso de Horas Sociales</h2>
        <p className="text-gray-600 mt-1">Consulta tu avance real, por periodo y por mes.</p>
      </div>

      <Card className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] border-none shadow-lg">
        <CardContent className="p-6 text-white">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">{progress?.student_name}</h3>
              <p className="text-white/90 mt-1">Matrícula: {progress?.student_code}</p>
              <p className="text-white/90">{progress?.career}</p>
              <p className="text-white/90">{progress?.study_plan}</p>
            </div>
            <div className="text-right">
              <p className="text-white/90">Área Actual</p>
              <p className="text-2xl font-bold mt-1">{assignment?.area ?? 'Sin asignación activa'}</p>
              <p className="text-white/90 mt-2">Responsable</p>
              <p className="text-lg">{assignment?.responsable ?? 'Sin responsable asignado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#2E7D32]/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#2E7D32]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Horas Completadas</p>
                <p className="text-2xl font-bold text-[#2E7D32]">{approvedHours}h</p>
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
                <p className="text-sm text-gray-500">Horas Pendientes</p>
                <p className="text-2xl font-bold text-[#FBC02D]">{remainingPeriod}h</p>
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
                <p className="text-sm text-gray-500">Progreso Anual</p>
                <p className="text-2xl font-bold text-[#1B5E20]">{Math.round(progressAnnual)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#E65100]/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#E65100]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Restante del Año</p>
                <p className="text-2xl font-bold text-[#E65100]">{remainingAnnual}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Progreso del Periodo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {approvedHours} de {targetHours} horas completadas
                </span>
                <span className="text-lg font-bold text-[#2E7D32]">{Math.round(progressPeriod)}%</span>
              </div>
              <Progress value={progressPeriod} className="h-4" />
              <p className="text-xs text-gray-500">{progress?.policy_name ?? 'Política activa'} · Meta anual parametrizable</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Horas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartPreview} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="mes" stroke="#9E9E9E" />
                <YAxis stroke="#9E9E9E" />
                <Tooltip
                  cursor={{ fill: 'rgba(46, 125, 50, 0.1)' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="horas" name="Horas" fill="#2E7D32" radius={[8, 8, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2">
              <Target className="w-5 h-5" />
              Registro por Mes
            </CardTitle>
            <Badge variant="outline" className="bg-white text-[#2E7D32] border-[#2E7D32]">
              {recentLogs.length} registros recientes
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Object.keys(registrosPorMes).length === 0 ? (
              <p className="text-sm text-gray-500">Todavía no hay registros recientes para desglosar por mes.</p>
            ) : (
              Object.entries(registrosPorMes).map(([mes, resumen]) => {
                const estaExpandido = mesesExpandidos[mes] ?? false;

                return (
                  <div key={mes} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleMes(mes)}
                      className="w-full flex items-center justify-between gap-4 text-left"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-[#2E7D32]" />
                          <h4 className="text-lg font-semibold text-gray-800">{mes}</h4>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {resumen.count} registros · {resumen.horas.toFixed(2)} horas
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[#2E7D32]">
                        <span className="text-sm font-medium">{estaExpandido ? 'Ocultar' : 'Ver detalle'}</span>
                        {estaExpandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {estaExpandido && (
                      <div className="mt-4 space-y-3">
                        {resumen.registros.map((registro) => (
                          <div key={registro.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium text-[#424242]">{registro.description}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {registro.work_date} · {registro.start_time} - {registro.end_time}
                                </p>
                              </div>
                              <StatusBadge
                                status={
                                  registro.status === 'approved'
                                    ? 'aprobada'
                                    : registro.status === 'rejected'
                                      ? 'rechazada'
                                      : 'pendiente'
                                }
                              />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                              <span className="font-medium text-[#2E7D32]">{Number(registro.reported_hours)} horas</span>
                              <span>•</span>
                              <span>{registro.assignment.slice(0, 8)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#2E7D32]">Estados recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-500">Todavía no hay registros recientes para mostrar.</p>
            ) : (
              recentLogs.map((registro) => (
                <div key={registro.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#2E7D32]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <div>
                        <p className="font-medium text-[#424242]">{registro.description}</p>
                        <p className="text-sm text-gray-500 mt-1">{registro.work_date}</p>
                      </div>
                      <StatusBadge
                        status={
                          registro.status === 'approved'
                            ? 'aprobada'
                            : registro.status === 'rejected'
                              ? 'rechazada'
                              : 'pendiente'
                        }
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>{registro.start_time} - {registro.end_time}</span>
                      <span>•</span>
                      <span className="font-medium text-[#2E7D32]">{Number(registro.reported_hours)} horas</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};