import React from 'react';
import { AlertCircle, Calendar, CheckCircle, Clock, MapPin, User } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { KPICard } from '../../components/shared/KPICard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { useStudentPortalData } from '../../hooks/useStudentPortalData';

export const DashboardEstudiante: React.FC = () => {
  const { progress, assignment, recentLogs, chartData, isLoading, error } = useStudentPortalData();

  const approvedHours = Number(progress?.approved_hours ?? 0);
  const currentTarget = Number(progress?.target_hours ?? 50);
  const annualTarget = Number(progress?.annual_target_hours ?? 150);
  const remainingCurrent = Number(progress?.remaining_hours ?? 0);
  const remainingAnnual = Math.max(0, annualTarget - approvedHours);
  const progressCurrent = currentTarget > 0 ? (approvedHours / currentTarget) * 100 : 0;
  const progressAnnual = annualTarget > 0 ? (approvedHours / annualTarget) * 100 : 0;

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Cargando datos del estudiante...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-[#D32F2F]">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const chartDataPreview = chartData.length > 0 ? chartData : [{ mes: 'Sin datos', horas: 0 }];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] text-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-2">¡Hola, {progress?.student_name}!</h2>
        <p className="text-white/90">Este es el resumen de tu avance en horas sociales</p>
        <p className="text-white/80 text-sm mt-1">
          {progress?.study_plan} · {progress?.career}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Horas Completadas (Periodo)" value={approvedHours} icon={CheckCircle} color="#2E7D32" />
        <KPICard
          title="Horas Pendientes (Periodo)"
          value={remainingCurrent > 0 ? remainingCurrent : 0}
          icon={Clock}
          color="#FBC02D"
        />
        <KPICard title="Horas Completadas (Año)" value={approvedHours} icon={CheckCircle} color="#1B5E20" />
        <KPICard
          title="Horas Pendientes (Año)"
          value={remainingAnnual > 0 ? remainingAnnual : 0}
          icon={AlertCircle}
          color="#E65100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Progreso del Periodo Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-[#424242]">
                    {approvedHours} / {currentTarget} horas
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {remainingCurrent > 0
                      ? `Te faltan ${remainingCurrent} horas para completar este periodo`
                      : 'Has completado este periodo.'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#2E7D32]">{Math.round(progressCurrent)}%</p>
                  <p className="text-sm text-gray-500">Completado</p>
                </div>
              </div>
              <Progress value={progressCurrent} className="h-4" />
              <p className="text-xs text-gray-400">{progress?.policy_name ?? 'Política activa'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Progreso Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-[#424242]">
                    {approvedHours} / {annualTarget} horas
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {remainingAnnual > 0
                      ? `Te faltan ${remainingAnnual} horas para completar el año`
                      : 'Has completado todas las horas del año.'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#1B5E20]">{Math.round(progressAnnual)}%</p>
                  <p className="text-sm text-gray-500">Completado</p>
                </div>
              </div>
              <Progress value={progressAnnual} className="h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2E7D32]">Horas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartDataPreview} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
                  <p className="font-medium text-[#424242]">{assignment?.area ?? 'Sin asignación activa'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#2E7D32]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Responsable</p>
                  <p className="font-medium text-[#424242]">{assignment?.responsable ?? 'Sin responsable asignado'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#2E7D32]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Periodo</p>
                  <p className="font-medium text-[#424242]">{assignment?.periodo ?? 'Sin periodo activo'}</p>
                </div>
              </div>

              <div className="p-4 bg-[#E8F5E9] rounded-lg border border-[#2E7D32]/20">
                <p className="text-sm text-[#1B5E20] font-medium">Matrícula: {progress?.student_code}</p>
                <p className="text-xs text-gray-600 mt-1">{progress?.career}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#2E7D32]">Mi Historial Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-500">Todavía no hay registros de horas para mostrar.</p>
            ) : (
              recentLogs.map((registro) => (
                <div key={registro.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#2E7D32]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-[#424242]">{registro.description}</p>
                        <p className="text-sm text-gray-500 mt-1">Registro #{registro.id.slice(0, 8)}</p>
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
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {registro.work_date}
                      </span>
                      <span>•</span>
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