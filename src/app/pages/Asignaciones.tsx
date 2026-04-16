import React from 'react';
import { Building2, Calendar, ChevronRight, GraduationCap, Search, Users } from 'lucide-react';

import { fetchStudentAssignments, type AssignmentApiResponse } from '../api/portalApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { StatusBadge } from '../components/shared/StatusBadge';

type AssignmentStatusFilter = 'all' | 'active' | 'inactive';

type AreaGroup = {
  areaName: string;
  assignments: AssignmentApiResponse[];
};

function formatTeacherName(assignment: AssignmentApiResponse): string {
  return `${assignment.teacher_profile.user.first_name} ${assignment.teacher_profile.user.last_name}`.trim();
}

function formatStudentName(assignment: AssignmentApiResponse): string {
  return `${assignment.student.user.first_name} ${assignment.student.user.last_name}`.trim();
}

export const Asignaciones: React.FC = () => {
  const [assignments, setAssignments] = React.useState<AssignmentApiResponse[]>([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<AssignmentStatusFilter>('all');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadAssignments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchStudentAssignments();
        if (!mounted) {
          return;
        }

        setAssignments(response);
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

    void loadAssignments();

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
        formatStudentName(assignment),
        assignment.student.student_code,
        assignment.student.career.name,
        assignment.subarea.area.name,
        assignment.subarea.name,
        formatTeacherName(assignment),
        assignment.term.name,
        assignment.status,
      ].join(' ').toLowerCase();

      return haystack.includes(query);
    });
  }, [assignments, search, statusFilter]);

  const groupedByArea = React.useMemo<AreaGroup[]>(() => {
    const map = new Map<string, AssignmentApiResponse[]>();

    visibleAssignments.forEach((assignment) => {
      const areaName = assignment.subarea.area.name;
      const currentGroup = map.get(areaName) ?? [];
      currentGroup.push(assignment);
      map.set(areaName, currentGroup);
    });

    return Array.from(map.entries())
      .map(([areaName, areaAssignments]) => ({ areaName, assignments: areaAssignments }))
      .sort((left, right) => right.assignments.length - left.assignments.length || left.areaName.localeCompare(right.areaName));
  }, [visibleAssignments]);

  const totalStudents = new Set(assignments.map((assignment) => assignment.student.id)).size;
  const totalTeachers = new Set(assignments.map((assignment) => assignment.teacher_profile.id)).size;
  const totalAreas = new Set(assignments.map((assignment) => assignment.subarea.area.id)).size;
  const activeAssignments = assignments.filter((assignment) => assignment.status === 'active').length;

  if (isLoading) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">Cargando asignaciones...</p></div>;
  }

  if (error) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-[#D32F2F]">{error}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-white/70 text-sm mb-1">Gestión de asignaciones</p>
            <h2 className="text-2xl font-bold">Asignaciones por área y carrera</h2>
            <p className="text-white/80 text-sm mt-1">
              Consulta la asignación vigente de cada estudiante, docente y subárea desde el backend.
            </p>
          </div>
          <Badge className="bg-white/15 text-white border border-white/20 w-fit">{activeAssignments} activas</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Áreas</p>
                <p className="text-2xl font-bold text-gray-800">{totalAreas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1565C0]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#1565C0]" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Becados</p>
                <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6A1B9A]/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#6A1B9A]" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Docentes</p>
                <p className="text-2xl font-bold text-gray-800">{totalTeachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF6C00]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#EF6C00]" />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Asignaciones</p>
                <p className="text-2xl font-bold text-gray-800">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estudiante, carrera, docente o subárea" className="pl-10" />
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

      {groupedByArea.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Building2 className="w-14 h-14 mb-4 text-gray-300" />
            <p className="font-medium text-gray-500 text-lg">No hay asignaciones para mostrar</p>
            <p className="text-sm mt-1">Prueba otro filtro o un término distinto de búsqueda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedByArea.map((group) => {
            const areaStudents = new Set(group.assignments.map((assignment) => assignment.student.id)).size;
            const areaTeachers = new Set(group.assignments.map((assignment) => assignment.teacher_profile.id)).size;

            return (
              <Card key={group.areaName} className="bg-white border-none shadow-sm overflow-hidden">
                <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#2E7D32]" />
                    </div>
                    <div>
                      <CardTitle className="text-[#2E7D32] text-base">{group.areaName}</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">{areaStudents} becados · {areaTeachers} docentes · {group.assignments.length} asignaciones</p>
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
                      {group.assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{formatStudentName(assignment)}</div>
                            <div className="text-xs text-gray-400 font-mono">{assignment.student.student_code}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{assignment.student.career.name}</td>
                          <td className="px-4 py-3 text-gray-600">{assignment.subarea.name}</td>
                          <td className="px-4 py-3 text-gray-600">{formatTeacherName(assignment)}</td>
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
            );
          })}
        </div>
      )}
    </div>
  );
};