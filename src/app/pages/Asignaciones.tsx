import React from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  ChevronRight,
  Clock3,
  GraduationCap,
  Layers3,
  Plus,
  Search,
  Users,
} from 'lucide-react';

import {
  fetchStudentAssignments,
  fetchStudentHoursLogs,
  type AssignmentApiResponse,
  type HoursLogApiResponse,
} from '../api/portalApi';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { StatusBadge } from '../components/shared/StatusBadge';

type AssignmentStatusFilter = 'all' | 'active' | 'inactive';
type ViewMode = 'cards' | 'ranking' | 'table';

type AreaCardData = {
  areaId: string;
  areaName: string;
  assignments: AssignmentApiResponse[];
  studentCount: number;
  teacherCount: number;
  subareaCount: number;
  activeStudents: number;
  approvedHours: number;
  totalHours: number;
  targetHours: number;
  progress: number;
  pendingLogs: number;
  teacherNames: string[];
};

function fullName(firstName?: string, lastName?: string): string {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}

function parseHours(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const AREA_PRESENTATION: Record<string, { subtitle: string; accent: string }> = {
  'Asistencia Docente': { subtitle: 'Apoyo a jefaturas de carrera', accent: '#2E7D32' },
  Biblioteca: { subtitle: 'Apoyo en biblioteca institucional', accent: '#1565C0' },
  'Bienestar Estudiantil': { subtitle: 'Actividades deportivas y recreativas', accent: '#6A1B9A' },
  'Extensión Universitaria': { subtitle: 'Actividades de extensión y servicio', accent: '#EF6C00' },
  CIDTEA: { subtitle: 'Centro de Investigación y Desarrollo tecnológico', accent: '#0E8A9A' },
  'Brigada Ambiental': { subtitle: 'Proyectos de sustentabilidad', accent: '#558B2F' },
  'Comunicación Institucional': { subtitle: 'Difusión y contenido institucional', accent: '#00838F' },
  Decanatura: { subtitle: 'Soporte académico y administrativo', accent: '#8E24AA' },
  'Educación a Distancia': { subtitle: 'Acompañamiento virtual y soporte', accent: '#3949AB' },
  'Registro Académico': { subtitle: 'Operación de control escolar', accent: '#5D4037' },
};

export const Asignaciones: React.FC = () => {
  const [assignments, setAssignments] = React.useState<AssignmentApiResponse[]>([]);
  const [hoursLogs, setHoursLogs] = React.useState<HoursLogApiResponse[]>([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<AssignmentStatusFilter>('all');
  const [viewMode, setViewMode] = React.useState<ViewMode>('cards');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [assignmentResponse, logResponse] = await Promise.all([
          fetchStudentAssignments(),
          fetchStudentHoursLogs(),
        ]);

        if (!mounted) {
          return;
        }

        setAssignments(assignmentResponse);
        setHoursLogs(logResponse);
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar las asignaciones.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleAssignments = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? assignment.status === 'active'
            : assignment.status !== 'active';

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        fullName(assignment.student.user.first_name, assignment.student.user.last_name),
        assignment.student.student_code,
        assignment.student.career.name,
        assignment.subarea.area.name,
        assignment.subarea.name,
        fullName(assignment.teacher_profile.user.first_name, assignment.teacher_profile.user.last_name),
        assignment.term.name,
        assignment.status,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [assignments, search, statusFilter]);

  const areaCards = React.useMemo<AreaCardData[]>(() => {
    const grouped = new Map<string, AssignmentApiResponse[]>();

    visibleAssignments.forEach((assignment) => {
      const key = assignment.subarea.area.id;
      const current = grouped.get(key) ?? [];
      current.push(assignment);
      grouped.set(key, current);
    });

    return Array.from(grouped.entries())
      .map(([areaId, areaAssignments]) => {
        const areaName = areaAssignments[0].subarea.area.name;
        const assignmentIds = new Set(areaAssignments.map((assignment) => assignment.id));
        const logs = hoursLogs.filter((log) => assignmentIds.has(log.assignment));

        const approvedHours = logs
          .filter((log) => log.status === 'approved')
          .reduce((sum, log) => sum + parseHours(log.reported_hours), 0);

        const totalHours = logs.reduce((sum, log) => sum + parseHours(log.reported_hours), 0);
        const pendingLogs = logs.filter((log) => log.status === 'registered').length;

        const studentCount = new Set(areaAssignments.map((assignment) => assignment.student.id)).size;
        const teacherCount = new Set(areaAssignments.map((assignment) => assignment.teacher_profile.id)).size;
        const subareaCount = new Set(areaAssignments.map((assignment) => assignment.subarea.id)).size;
        const activeStudents = new Set(
          areaAssignments
            .filter((assignment) => assignment.status === 'active')
            .map((assignment) => assignment.student.id),
        ).size;

        const targetHours = studentCount * 150;
        const progress = targetHours > 0 ? Math.round((approvedHours / targetHours) * 100) : 0;

        const teacherNames = [
          ...new Set(
            areaAssignments.map((assignment) =>
              fullName(assignment.teacher_profile.user.first_name, assignment.teacher_profile.user.last_name),
            ),
          ),
        ];

        return {
          areaId,
          areaName,
          assignments: areaAssignments,
          studentCount,
          teacherCount,
          subareaCount,
          activeStudents,
          approvedHours,
          totalHours,
          targetHours,
          progress: Math.max(0, Math.min(100, progress)),
          pendingLogs,
          teacherNames,
        };
      })
      .sort((left, right) => right.progress - left.progress || right.studentCount - left.studentCount);
  }, [hoursLogs, visibleAssignments]);

  const totalAreas = new Set(assignments.map((assignment) => assignment.subarea.area.id)).size;
  const totalStudents = new Set(assignments.map((assignment) => assignment.student.id)).size;
  const totalTeachers = new Set(assignments.map((assignment) => assignment.teacher_profile.id)).size;
  const accumulatedHours = hoursLogs.reduce((sum, log) => sum + parseHours(log.reported_hours), 0);
  const pendingHours = hoursLogs.filter((log) => log.status === 'registered').length;

  const cardAccentPalette = ['#2E7D32', '#1565C0', '#6A1B9A', '#EF6C00', '#0E8A9A', '#558B2F'];

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Cargando asignaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm text-[#D32F2F]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card className="bg-white border border-[#2E7D32]/15 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Áreas activas</p>
                <p className="text-2xl font-bold text-[#2E7D32]">{totalAreas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#1565C0]/15 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1565C0]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#1565C0]" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Becados totales</p>
                <p className="text-2xl font-bold text-[#1565C0]">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#6A1B9A]/15 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6A1B9A]/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#6A1B9A]" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Docentes</p>
                <p className="text-2xl font-bold text-[#6A1B9A]">{totalTeachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#EF6C00]/15 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF6C00]/10 flex items-center justify-center">
                <Clock3 className="w-5 h-5 text-[#EF6C00]" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Horas acumuladas</p>
                <p className="text-2xl font-bold text-[#EF6C00]">{Math.round(accumulatedHours)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#D32F2F]/15 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D32F2F]/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#D32F2F]" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-[#D32F2F]">{pendingHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar área, docente o becado"
                className="pl-10"
              />
            </div>

            <Button type="button" className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
              <Plus className="w-4 h-4" />
              Nueva Asignación
            </Button>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {([
                ['cards', 'Tarjetas', Building2],
                ['ranking', 'Ranking', Clock3],
                ['table', 'Asignaciones', Layers3],
              ] as const).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setViewMode(value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    viewMode === value ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {([
                ['all', 'Todas'],
                ['active', 'Activas'],
                ['inactive', 'Inactivas'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === value ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {areaCards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Building2 className="w-14 h-14 mb-4 text-gray-300" />
            <p className="font-medium text-gray-500 text-lg">No hay asignaciones para mostrar</p>
            <p className="text-sm mt-1">Prueba otro filtro o un término distinto de búsqueda</p>
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {areaCards.map((area, index) => {
            const presentation = AREA_PRESENTATION[area.areaName];
            const accent = presentation?.accent ?? cardAccentPalette[index % cardAccentPalette.length];
            const subtitle = presentation?.subtitle ?? `${area.subareaCount} subáreas activas`;
            const riskCount = area.pendingLogs > 0 ? Math.max(1, Math.round(area.pendingLogs / 4)) : 0;
            return (
              <Card key={area.areaId} className="bg-white border-none shadow-sm overflow-hidden">
                <div className="h-2" style={{ backgroundColor: accent }} />
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${accent}22` }}>
                        <Building2 className="w-6 h-6" style={{ color: accent }} />
                      </div>
                      <div>
                        <h3 className="text-[34px] font-semibold text-gray-900 leading-tight">{area.areaName}</h3>
                        <p className="text-sm text-gray-500">{subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <p className="text-[11px] uppercase text-gray-400">Becados</p>
                      <p className="text-2xl font-bold text-gray-800">{area.studentCount}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <p className="text-[11px] uppercase text-gray-400">Docentes</p>
                      <p className="text-2xl font-bold text-gray-800">{area.teacherCount}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <p className="text-[11px] uppercase text-gray-400">Promedio</p>
                      <p className="text-2xl font-bold" style={{ color: accent }}>{area.progress}%</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-500">{Math.round(area.approvedHours)}/{area.targetHours}h</span>
                      <span className="font-semibold" style={{ color: accent }}>{area.progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${area.progress}%`, backgroundColor: accent }} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                      {area.activeStudents} activos
                    </Badge>
                    {riskCount > 0 && (
                      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                        {riskCount} riesgo
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">
                      {area.subareaCount} subáreas
                    </Badge>
                  </div>

                  <div className="border-t pt-3 text-sm text-gray-600">
                    {area.teacherNames.slice(0, 4).map((teacher) => (
                      <span key={teacher} className="inline-flex mr-2 mb-1 rounded-full bg-gray-100 px-3 py-1">
                        {teacher}
                      </span>
                    ))}
                    {area.teacherNames.length > 4 && (
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1">+{area.teacherNames.length - 4}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : viewMode === 'ranking' ? (
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Ranking de áreas por avance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {areaCards.map((area, index) => (
              <div key={area.areaId} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{area.areaName}</p>
                      <p className="text-xs text-gray-500">{area.studentCount} becados · {area.teacherCount} docentes</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-[#2E7D32]">{area.progress}%</p>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#2E7D32]" style={{ width: `${area.progress}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {areaCards.map((area) => (
            <Card key={area.areaId} className="bg-white border-none shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#2E7D32]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#2E7D32] text-base">{area.areaName}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      {area.studentCount} becados · {area.teacherCount} docentes · {area.assignments.length} asignaciones
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Becado</th>
                      <th className="px-4 py-3 text-left font-medium">Carrera</th>
                      <th className="px-4 py-3 text-left font-medium">Subárea</th>
                      <th className="px-4 py-3 text-left font-medium">Docente</th>
                      <th className="px-4 py-3 text-left font-medium">Periodo</th>
                      <th className="px-4 py-3 text-left font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {area.assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {fullName(assignment.student.user.first_name, assignment.student.user.last_name)}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{assignment.student.student_code}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{assignment.student.career.name}</td>
                        <td className="px-4 py-3 text-gray-600">{assignment.subarea.name}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {fullName(assignment.teacher_profile.user.first_name, assignment.teacher_profile.user.last_name)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{assignment.term.name}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={assignment.status === 'active' ? 'activa' : 'finalizada'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
