import React from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileCheck,
  Filter,
  MessageSquare,
  Search,
  XCircle,
} from 'lucide-react';

import {
  approveHoursLog,
  fetchStudentAssignments,
  fetchStudentHoursLogs,
  rejectHoursLog,
  type AssignmentApiResponse,
  type HoursLogApiResponse,
} from '../api/portalApi';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

type ReviewTab = 'pendientes' | 'aprobadas' | 'rechazadas' | 'todas';

type ReviewAction = 'validar' | 'rechazar';

function formatStudentName(assignment?: AssignmentApiResponse): string {
  if (!assignment) {
    return 'Estudiante no encontrado';
  }

  return `${assignment.student.user.first_name} ${assignment.student.user.last_name}`.trim();
}

function formatTeacherName(assignment?: AssignmentApiResponse): string {
  if (!assignment) {
    return 'Docente no encontrado';
  }

  return `${assignment.teacher_profile.user.first_name} ${assignment.teacher_profile.user.last_name}`.trim();
}

function getStatusTab(status: HoursLogApiResponse['status']): ReviewTab {
  if (status === 'approved') {
    return 'aprobadas';
  }

  if (status === 'rejected') {
    return 'rechazadas';
  }

  return 'pendientes';
}

function getStatusBadge(status: HoursLogApiResponse['status']): 'pendiente' | 'aprobada' | 'rechazada' {
  if (status === 'approved') {
    return 'aprobada';
  }

  if (status === 'rejected') {
    return 'rechazada';
  }

  return 'pendiente';
}

export const Aprobaciones: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = React.useState<HoursLogApiResponse[]>([]);
  const [assignments, setAssignments] = React.useState<AssignmentApiResponse[]>([]);
  const [activeTab, setActiveTab] = React.useState<ReviewTab>('pendientes');
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedLog, setSelectedLog] = React.useState<HoursLogApiResponse | null>(null);
  const [reviewAction, setReviewAction] = React.useState<ReviewAction>('validar');
  const [comment, setComment] = React.useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [logsResponse, assignmentsResponse] = await Promise.all([
        fetchStudentHoursLogs(),
        fetchStudentAssignments(),
      ]);

      setLogs(logsResponse);
      setAssignments(assignmentsResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar las aprobaciones.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const assignmentById = React.useMemo(() => {
    return new Map(assignments.map((assignment) => [assignment.id, assignment]));
  }, [assignments]);

  const filteredLogs = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      if (activeTab !== 'todas' && getStatusTab(log.status) !== activeTab) {
        return false;
      }

      if (!query) {
        return true;
      }

      const assignment = assignmentById.get(log.assignment);
      const haystack = [
        formatStudentName(assignment),
        assignment?.student.student_code,
        assignment?.student.career.name,
        assignment?.subarea.area.name,
        assignment?.subarea.name,
        formatTeacherName(assignment),
        log.description,
        log.work_date,
        log.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [assignmentById, activeTab, logs, search]);

  const counts = React.useMemo(() => ({
    pendientes: logs.filter((log) => log.status === 'registered').length,
    aprobadas: logs.filter((log) => log.status === 'approved').length,
    rechazadas: logs.filter((log) => log.status === 'rejected').length,
    todas: logs.length,
  }), [logs]);

  const handleOpenDetail = (log: HoursLogApiResponse) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  const handleOpenReview = (log: HoursLogApiResponse, action: ReviewAction) => {
    setSelectedLog(log);
    setReviewAction(action);
    setComment('');
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedLog) {
      return;
    }

    try {
      const request = reviewAction === 'validar'
        ? approveHoursLog(selectedLog.id, comment)
        : rejectHoursLog(selectedLog.id, comment);

      await toast.promise(request, {
        loading: reviewAction === 'validar' ? 'Validando registro...' : 'Rechazando registro...',
        success: reviewAction === 'validar' ? 'Registro validado correctamente' : 'Registro rechazado correctamente',
        error: (message) => message instanceof Error ? message.message : 'No fue posible completar la revisión.',
      });

      setIsReviewDialogOpen(false);
      setSelectedLog(null);
      setComment('');
      await loadData();
    } catch {
      // The toast already communicates the error.
    }
  };

  if (isLoading) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">Cargando aprobaciones...</p></div>;
  }

  if (error) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-[#D32F2F]">{error}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-white/70 text-sm mb-1">Jefatura de carrera</p>
            <h2 className="text-2xl font-bold">Validación de horas sociales</h2>
            <p className="text-white/80 text-sm mt-1">
              {user?.name} · registros aprobados por docentes y pendientes de revisión.
            </p>
          </div>
          <Badge className="bg-white/15 text-white border border-white/20 w-fit">
            {counts.pendientes} pendientes
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm"><CardContent className="p-5"><p className="text-xs uppercase text-gray-400">Pendientes</p><p className="text-2xl font-bold text-[#F59E0B]">{counts.pendientes}</p></CardContent></Card>
        <Card className="bg-white border-none shadow-sm"><CardContent className="p-5"><p className="text-xs uppercase text-gray-400">Aprobadas</p><p className="text-2xl font-bold text-[#2E7D32]">{counts.aprobadas}</p></CardContent></Card>
        <Card className="bg-white border-none shadow-sm"><CardContent className="p-5"><p className="text-xs uppercase text-gray-400">Rechazadas</p><p className="text-2xl font-bold text-[#D32F2F]">{counts.rechazadas}</p></CardContent></Card>
        <Card className="bg-white border-none shadow-sm"><CardContent className="p-5"><p className="text-xs uppercase text-gray-400">Total</p><p className="text-2xl font-bold text-gray-800">{counts.todas}</p></CardContent></Card>
      </div>

      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estudiante, carrera, docente o actividad" className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                ['pendientes', 'Pendientes', counts.pendientes],
                ['aprobadas', 'Aprobadas', counts.aprobadas],
                ['rechazadas', 'Rechazadas', counts.rechazadas],
                ['todas', 'Todas', counts.todas],
              ] as const).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === value ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label} <span className="ml-1 opacity-80">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'pendientes' && counts.pendientes > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                Hay <strong>{counts.pendientes} registros</strong> listos para validar o rechazar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredLogs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Filter className="w-14 h-14 mb-4 text-gray-300" />
            <p className="font-medium text-gray-500 text-lg">No se encontraron registros</p>
            <p className="text-sm mt-1">Ajusta el filtro o la búsqueda para encontrar horas sociales</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const assignment = assignmentById.get(log.assignment);
            const isPending = log.status === 'registered';

            return (
              <Card key={log.id} className="bg-white border-none shadow-sm overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center">
                          <FileCheck className="w-5 h-5 text-[#2E7D32]" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{formatStudentName(assignment)}</p>
                          <p className="text-sm text-gray-500">
                            {assignment?.student.career.name ?? 'Carrera no disponible'} · {assignment?.subarea.area.name ?? 'Área no disponible'}
                          </p>
                        </div>
                        <StatusBadge status={getStatusBadge(log.status)} />
                      </div>

                      <p className="text-sm text-gray-700">{log.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" />{log.work_date}</span>
                        <span>{log.start_time} - {log.end_time}</span>
                        <span className="font-medium text-[#2E7D32]">{Number(log.reported_hours)} horas</span>
                        <span>Docente: {formatTeacherName(assignment)}</span>
                        <span>Periodo: {assignment?.term.name ?? 'N/D'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button variant="outline" onClick={() => handleOpenDetail(log)}>
                        <Eye className="w-4 h-4 mr-2" /> Ver detalle
                      </Button>
                      {isPending && (
                        <>
                          <Button className="bg-[#2E7D32] text-white hover:bg-[#1B5E20]" onClick={() => handleOpenReview(log, 'validar')}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Validar
                          </Button>
                          <Button variant="ghost" className="text-[#D32F2F] hover:bg-red-50 hover:text-[#B71C1C]" onClick={() => handleOpenReview(log, 'rechazar')}>
                            <XCircle className="w-4 h-4 mr-2" /> Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={reviewAction === 'validar' ? 'text-[#2E7D32]' : 'text-[#D32F2F]'}>
              {reviewAction === 'validar' ? 'Validar registro' : 'Rechazar registro'}
            </DialogTitle>
            <DialogDescription>
              {selectedLog && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="font-medium text-gray-800">{formatStudentName(assignmentById.get(selectedLog.assignment))}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedLog.work_date} · {Number(selectedLog.reported_hours)} horas</p>
                  </div>
                  <p className="text-sm text-gray-600">{selectedLog.description}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className={`rounded-xl border p-3 ${reviewAction === 'validar' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <p className={`text-sm ${reviewAction === 'validar' ? 'text-green-800' : 'text-red-800'}`}>
                {reviewAction === 'validar'
                  ? 'El registro quedará aprobado y bloqueado para edición.'
                  : 'El registro volverá al docente con el comentario indicado.'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Comentario {reviewAction === 'rechazar' ? '(requerido)' : '(opcional)'}</Label>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={reviewAction === 'validar' ? 'Observaciones opcionales...' : 'Explica el motivo del rechazo...'}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>Cancelar</Button>
            <Button
              className={reviewAction === 'validar' ? 'bg-[#2E7D32] text-white hover:bg-[#1B5E20]' : 'bg-[#D32F2F] text-white hover:bg-[#B71C1C]'}
              onClick={() => void handleSubmitReview()}
              disabled={reviewAction === 'rechazar' && !comment.trim()}
            >
              {reviewAction === 'validar' ? 'Confirmar validación' : 'Confirmar rechazo'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#2E7D32] flex items-center gap-2"><MessageSquare className="w-5 h-5" />Detalle del registro</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Estudiante</p>
                  <p className="font-medium text-gray-800">{formatStudentName(assignmentById.get(selectedLog.assignment))}</p>
                  <p className="text-sm text-gray-500">{assignmentById.get(selectedLog.assignment)?.student.student_code}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Docente</p>
                  <p className="font-medium text-gray-800">{formatTeacherName(assignmentById.get(selectedLog.assignment))}</p>
                  <p className="text-sm text-gray-500">{assignmentById.get(selectedLog.assignment)?.subarea.name ?? 'Sin subárea'}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Fecha y horario</p>
                  <p className="font-medium text-gray-800">{selectedLog.work_date}</p>
                  <p className="text-sm text-gray-500">{selectedLog.start_time} - {selectedLog.end_time}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Horas</p>
                  <p className="text-2xl font-bold text-[#2E7D32]">{Number(selectedLog.reported_hours)}h</p>
                  <p className="text-sm text-gray-500">{selectedLog.status}</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500 mb-1">Actividad</p>
                <p className="text-sm text-gray-700">{selectedLog.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Estado:</span>
                <StatusBadge status={getStatusBadge(selectedLog.status)} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Cerrar</Button>
            {selectedLog?.status === 'registered' && (
              <>
                <Button variant="ghost" className="text-[#D32F2F] hover:bg-red-50" onClick={() => { setIsDetailDialogOpen(false); handleOpenReview(selectedLog, 'rechazar'); }}>Rechazar</Button>
                <Button className="bg-[#2E7D32] text-white hover:bg-[#1B5E20]" onClick={() => { setIsDetailDialogOpen(false); handleOpenReview(selectedLog, 'validar'); }}>Validar</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};