import React from 'react';
import { BookOpen, Building2, ExternalLink, Mail, Search, Send, Users } from 'lucide-react';

import { useCommunicationDirectory } from '../hooks/useCommunicationDirectory';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { buildMailtoLink, formatFullName, getCareerCode, getInitials } from '../utils/communication';

export const Mensajes: React.FC = () => {
  const { currentTeacher, assignments, isLoading, error } = useCommunicationDirectory();
  const [search, setSearch] = React.useState('');

  const teacherAssignments = React.useMemo(() => {
    if (!currentTeacher) {
      return [];
    }

    return assignments.filter((assignment) => assignment.teacher_profile.id === currentTeacher.id);
  }, [assignments, currentTeacher]);

  const studentCards = React.useMemo(() => {
    const map = new Map<string, (typeof teacherAssignments)[number]>();

    teacherAssignments.forEach((assignment) => {
      if (!map.has(assignment.student.id)) {
        map.set(assignment.student.id, assignment);
      }
    });

    return Array.from(map.values()).filter((assignment) => {
      if (!search) {
        return true;
      }

      const haystack = [
        formatFullName(assignment.student.user.first_name, assignment.student.user.last_name),
        assignment.student.user.email,
        assignment.student.student_code,
        assignment.student.career.name,
        assignment.subarea.name,
      ].join(' ').toLowerCase();

      return haystack.includes(search.toLowerCase());
    });
  }, [search, teacherAssignments]);

  const mailSignature = `Saludos cordiales,\n${currentTeacher ? formatFullName(currentTeacher.user.first_name, currentTeacher.user.last_name) : 'Docente Responsable'}`;

  if (isLoading) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">Cargando mensajes...</p></div>;
  }

  if (error) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-[#D32F2F]">{error}</p></div>;
  }

  if (!currentTeacher) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">No se encontró el perfil docente asociado a tu usuario.</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#2E7D32]">Comunicación</h2>
        <p className="text-gray-600 mt-1">Contacta a tus estudiantes asignados vía correo electrónico</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estudiante, correo o curso..." className="pl-10" />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{studentCards.length} estudiante{studentCards.length !== 1 ? 's' : ''} asignado{studentCards.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#2E7D32]">Correo Grupal</p>
                <p className="text-sm text-gray-600">Enviar correo a todos tus estudiantes</p>
              </div>
            </div>
            <a href={buildMailtoLink(teacherAssignments.map((assignment) => assignment.student.user.email).join(','), 'SIBEC - Comunicado General', `Estimados estudiantes,\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2"><Mail className="w-4 h-4" /> Enviar a Todos <ExternalLink className="w-3 h-3" /></Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {studentCards.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-lg transition-shadow border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {getInitials(formatFullName(assignment.student.user.first_name, assignment.student.user.last_name))}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base text-gray-900 truncate">{formatFullName(assignment.student.user.first_name, assignment.student.user.last_name)}</CardTitle>
                  <p className="text-sm text-gray-500 truncate">{assignment.student.user.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Activo</Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{assignment.student.student_code}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-500"><BookOpen className="w-3.5 h-3.5" /><span className="truncate">{getCareerCode(assignment.student.career.name)}</span></div>
                <div className="flex items-center gap-1.5 text-gray-500"><Building2 className="w-3.5 h-3.5" /><span>{assignment.subarea.area.name}</span></div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2 font-medium">Enviar correo rápido:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Registro de Horas', subject: 'SIBEC - Registro de Horas Sociales', icon: '⏰' },
                    { label: 'Seguimiento', subject: 'SIBEC - Seguimiento de Actividades', icon: '📋' },
                    { label: 'Recordatorio', subject: 'SIBEC - Recordatorio Importante', icon: '🔔' },
                  ].map((quickAction) => (
                    <a key={quickAction.label} href={buildMailtoLink(assignment.student.user.email, quickAction.subject, `Estimado/a ${assignment.student.user.first_name},\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-[#E8F5E9] hover:border-[#2E7D32]"><span>{quickAction.icon}</span>{quickAction.label}</Button>
                    </a>
                  ))}
                </div>
              </div>

              <a href={buildMailtoLink(assignment.student.user.email)} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] gap-2"><Send className="w-4 h-4" /> Redactar Correo <ExternalLink className="w-3 h-3 ml-auto" /></Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      {studentCards.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium">No se encontraron estudiantes</p>
            <p className="text-sm">Intenta con otro término de búsqueda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
