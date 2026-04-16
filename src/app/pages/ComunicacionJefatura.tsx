import React from 'react';
import { Building2, ExternalLink, GraduationCap, Mail, Search, Send, Users } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useCommunicationDirectory } from '../hooks/useCommunicationDirectory';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { buildMailtoLink, formatFullName, getCareerCode, getInitials } from '../utils/communication';

type ViewTab = 'docentes' | 'estudiantes';

function matches(query: string, values: string[]): boolean {
  if (!query) {
    return true;
  }

  const normalized = query.toLowerCase();
  return values.some((value) => value.toLowerCase().includes(normalized));
}

function uniqueCount<T>(items: T[], selector: (item: T) => string): number {
  return new Set(items.map(selector).filter(Boolean)).size;
}

export const ComunicacionJefatura: React.FC = () => {
  const { user } = useAuth();
  const { currentDepartmentHead, assignments, isLoading, error } = useCommunicationDirectory();
  const [search, setSearch] = React.useState('');
  const [tab, setTab] = React.useState<ViewTab>('docentes');

  const careerName = currentDepartmentHead?.career.name ?? user?.carrera ?? 'Carrera no disponible';
  const careerId = currentDepartmentHead?.career.id;

  const careerAssignments = React.useMemo(
    () =>
      assignments.filter((assignment) => {
        if (!careerId) {
          return false;
        }

        return assignment.student.career.id === careerId && assignment.subarea.area.name === 'Asistencia Docente';
      }),
    [assignments, careerId],
  );

  const teacherCards = React.useMemo(() => {
    const map = new Map<string, typeof careerAssignments>();

    careerAssignments.forEach((assignment) => {
      const current = map.get(assignment.teacher_profile.id) ?? [];
      current.push(assignment);
      map.set(assignment.teacher_profile.id, current);
    });

    return Array.from(map.values())
      .map((teacherAssignments) => {
        const teacher = teacherAssignments[0].teacher_profile;
        const areaNames = [...new Set(teacherAssignments.map((assignment) => assignment.subarea.area.name))];

        return {
          teacher,
          teacherAssignments,
          areaNames,
        };
      })
      .filter(({ teacher, teacherAssignments, areaNames }) =>
        matches(search, [
          formatFullName(teacher.user.first_name, teacher.user.last_name),
          teacher.user.email,
          teacher.employee_code ?? '',
          ...areaNames,
          ...teacherAssignments.map((assignment) => assignment.student.student_code),
          ...teacherAssignments.map((assignment) => assignment.student.career.name),
        ]),
      );
  }, [careerAssignments, search]);

  const studentCards = React.useMemo(() => {
    const map = new Map<string, typeof careerAssignments>();

    careerAssignments.forEach((assignment) => {
      const current = map.get(assignment.student.id) ?? [];
      current.push(assignment);
      map.set(assignment.student.id, current);
    });

    return Array.from(map.values())
      .map((studentAssignments) => ({
        student: studentAssignments[0].student,
        assignment: studentAssignments[0],
      }))
      .filter(({ student, assignment }) =>
        matches(search, [
          formatFullName(student.user.first_name, student.user.last_name),
          student.user.email,
          student.student_code,
          student.career.name,
          assignment.subarea.area.name,
          assignment.subarea.name,
          assignment.teacher_profile.user.first_name,
          assignment.teacher_profile.user.last_name,
        ]),
      );
  }, [careerAssignments, search]);

  const mailSignature = `${user?.name || 'Jefatura de Carrera'}\nJefatura de Carrera - ${careerName}`;

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Cargando comunicación de jefatura...</p>
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

  if (!currentDepartmentHead) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">No se encontro el perfil de jefatura asociado a tu usuario.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-white/70 text-sm mb-1">Jefatura de carrera</p>
            <h2 className="text-2xl font-bold">Comunicacion de carrera</h2>
            <p className="text-white/80 text-sm mt-1">Contacta docentes y estudiantes de {careerName} en Asistencia Docente.</p>
          </div>
          <Badge className="bg-white/15 text-white border border-white/20 w-fit">{careerAssignments.length} contactos</Badge>
        </div>
      </div>

      <Card className="border-[#F57F17]/20 bg-gradient-to-r from-amber-50 to-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F57F17] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#F57F17]">Reporte a Bienestar</p>
                <p className="text-sm text-gray-600">Enviar resumen de {careerAssignments.length} asignaciones vigentes</p>
              </div>
            </div>
            <a
              href={buildMailtoLink(
                'bienestar@ulsa.mx',
                'SIBEC - Reporte de Jefatura de Carrera',
                `Estimada Oficina de Bienestar Estudiantil,\n\nAdjunto el reporte correspondiente a ${careerName}.\n\n\n\n${mailSignature}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-[#1565C0] hover:bg-[#0D47A1] gap-2">
                <Mail className="w-4 h-4" /> Enviar Reporte <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={tab === 'docentes' ? 'default' : 'outline'}
            onClick={() => setTab('docentes')}
            className={tab === 'docentes' ? 'bg-[#2E7D32] hover:bg-[#1B5E20]' : ''}
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Docentes ({teacherCards.length})
          </Button>
          <Button
            variant={tab === 'estudiantes' ? 'default' : 'outline'}
            onClick={() => setTab('estudiantes')}
            className={tab === 'estudiantes' ? 'bg-[#2E7D32] hover:bg-[#1B5E20]' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            Estudiantes ({studentCards.length})
          </Button>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tab === 'docentes' ? 'Buscar docente, correo o area...' : 'Buscar estudiante, correo o matricula...'}
            className="pl-10"
          />
        </div>
      </div>

      {tab === 'docentes' && teacherCards.length > 0 && (
        <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#2E7D32]">Correo a docentes filtrados</p>
                  <p className="text-sm text-gray-600">Enviar comunicado a {teacherCards.length} docentes</p>
                </div>
              </div>
              <a
                href={buildMailtoLink(
                  teacherCards.map(({ teacher }) => teacher.user.email).join(','),
                  'SIBEC - Comunicado de Jefatura de Carrera',
                  `Estimados docentes,\n\n\n\n${mailSignature}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
                  <Mail className="w-4 h-4" /> Enviar a Todos <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'estudiantes' && studentCards.length > 0 && (
        <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#2E7D32]">Correo a estudiantes filtrados</p>
                  <p className="text-sm text-gray-600">Enviar comunicado a {studentCards.length} estudiantes becados</p>
                </div>
              </div>
              <a
                href={buildMailtoLink(
                  studentCards.map(({ student }) => student.user.email).join(','),
                  'SIBEC - Comunicado de Jefatura de Carrera',
                  `Estimados estudiantes,\n\n\n\n${mailSignature}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
                  <Mail className="w-4 h-4" /> Enviar a Todos <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'docentes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {teacherCards.map(({ teacher, teacherAssignments, areaNames }) => (
            <Card key={teacher.id} className="bg-white border-none shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-1 bg-[#2E7D32]" />
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {getInitials(formatFullName(teacher.user.first_name, teacher.user.last_name))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base text-gray-900 truncate">{formatFullName(teacher.user.first_name, teacher.user.last_name)}</CardTitle>
                    <p className="text-sm text-gray-500 truncate">{teacher.user.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        Docente Responsable
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {teacherAssignments.length} asignaciones
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{areaNames.join(' · ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{uniqueCount(teacherAssignments, (assignment) => assignment.student.id)} estudiantes vinculados</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Enviar correo rapido:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Seguimiento', subject: 'SIBEC - Seguimiento de Estudiantes Asignados', icon: '📋' },
                      { label: 'Reporte', subject: 'SIBEC - Solicitud de Reporte de Horas', icon: '📊' },
                      { label: 'Coordinacion', subject: 'SIBEC - Coordinacion de Actividades', icon: '🤝' },
                    ].map((quickAction) => (
                      <a
                        key={quickAction.label}
                        href={buildMailtoLink(
                          teacher.user.email,
                          quickAction.subject,
                          `Estimado/a ${teacher.user.first_name},\n\n\n\n${mailSignature}`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-[#E8F5E9] hover:border-[#2E7D32]">
                          <span>{quickAction.icon}</span>
                          {quickAction.label}
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>
                <a href={buildMailtoLink(teacher.user.email)} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
                    <Send className="w-4 h-4" /> Redactar Correo <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === 'estudiantes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {studentCards.map(({ student, assignment }) => (
            <Card key={student.id} className="bg-white border-none shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-1 bg-[#2E7D32]" />
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {getInitials(formatFullName(student.user.first_name, student.user.last_name))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base text-gray-900 truncate">{formatFullName(student.user.first_name, student.user.last_name)}</CardTitle>
                    <p className="text-sm text-gray-500 truncate">{student.user.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          student.is_active
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {student.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300 text-[10px]">
                        {student.student_code}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span className="truncate">{getCareerCode(student.career.name)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate">{assignment?.subarea.area.name ?? 'Sin area'}</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Enviar correo rapido:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Seguimiento', subject: 'SIBEC - Seguimiento de Horas Sociales', icon: '📋' },
                      { label: 'Situacion Academica', subject: 'SIBEC - Revision de Situacion Academica', icon: '📊' },
                      { label: 'Recordatorio', subject: 'SIBEC - Recordatorio Importante', icon: '🔔' },
                    ].map((quickAction) => (
                      <a
                        key={quickAction.label}
                        href={buildMailtoLink(
                          student.user.email,
                          quickAction.subject,
                          `Estimado/a ${student.user.first_name},\n\n\n\n${mailSignature}`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-[#E8F5E9] hover:border-[#2E7D32]">
                          <span>{quickAction.icon}</span>
                          {quickAction.label}
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>
                <a href={buildMailtoLink(student.user.email)} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full gap-2 bg-[#2E7D32] hover:bg-[#1B5E20]">
                    <Send className="w-4 h-4" /> Redactar Correo <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {((tab === 'docentes' && teacherCards.length === 0) || (tab === 'estudiantes' && studentCards.length === 0)) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium">No se encontraron resultados</p>
            <p className="text-sm">Intenta con otro termino de busqueda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
