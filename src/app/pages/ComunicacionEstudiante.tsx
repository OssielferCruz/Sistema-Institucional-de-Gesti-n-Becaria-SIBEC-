import React from 'react';
import { Building2, BookOpen, ExternalLink, GraduationCap, Mail, Send, ShieldCheck } from 'lucide-react';

import { useCommunicationDirectory } from '../hooks/useCommunicationDirectory';
import { useStudentPortalData } from '../hooks/useStudentPortalData';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { buildMailtoLink, formatFullName, getCareerCode, getInitials } from '../utils/communication';

type ContactCard = {
  id: string;
  name: string;
  email: string;
  role: string;
  area: string;
  subarea?: string;
  accent: string;
  subjectList: Array<{ label: string; subject: string; icon: string }>;
};

export const ComunicacionEstudiante: React.FC = () => {
  const { progress, assignmentRecord, isLoading: studentLoading, error: studentError } = useStudentPortalData();
  const { currentStudent, teachers, departmentHeads, isLoading: directoryLoading, error: directoryError } = useCommunicationDirectory();

  const currentTeacher = React.useMemo(() => {
    if (!assignmentRecord) {
      return null;
    }

    return teachers.find((teacher) => teacher.id === assignmentRecord.teacher_profile.id) ?? null;
  }, [assignmentRecord, teachers]);

  const currentDepartmentHead = React.useMemo(() => {
    if (!currentStudent) {
      return null;
    }

    return departmentHeads.find((departmentHead) => departmentHead.career.id === currentStudent.career.id) ?? null;
  }, [currentStudent, departmentHeads]);

  const contacts = React.useMemo<ContactCard[]>(() => {
    const result: ContactCard[] = [];

    if (currentTeacher) {
      result.push({
        id: currentTeacher.id,
        name: formatFullName(currentTeacher.user.first_name, currentTeacher.user.last_name),
        email: currentTeacher.user.email,
        role: 'Docente responsable',
        area: assignmentRecord?.subarea.area.name ?? 'Asistencia Docente',
        subarea: assignmentRecord?.subarea.name,
        accent: '#2E7D32',
        subjectList: [
          { label: 'Registro de Horas', subject: 'SIBEC - Consulta sobre Registro de Horas', icon: '⏰' },
          { label: 'Justificación', subject: 'SIBEC - Justificación de Inasistencia', icon: '📝' },
          { label: 'Consulta General', subject: 'SIBEC - Consulta General', icon: '💬' },
        ],
      });
    }

    if (currentDepartmentHead) {
      result.push({
        id: currentDepartmentHead.id,
        name: formatFullName(currentDepartmentHead.user.first_name, currentDepartmentHead.user.last_name),
        email: currentDepartmentHead.user.email,
        role: 'Jefatura de carrera',
        area: currentDepartmentHead.career.name,
        subarea: 'Coordinación académica',
        accent: '#F57F17',
        subjectList: [
          { label: 'Situación', subject: 'SIBEC - Consulta Situación Académica', icon: '📊' },
          { label: 'Apoyo', subject: 'SIBEC - Solicitud de Apoyo Académico', icon: '📚' },
          { label: 'Consulta', subject: 'SIBEC - Consulta para Jefatura', icon: '💬' },
        ],
      });
    }

    result.push({
      id: 'bienestar',
      name: 'Oficina de Bienestar Estudiantil',
      email: 'bienestar@ulsa.mx',
      role: 'Personal de bienestar',
      area: 'Bienestar Estudiantil',
      subarea: 'Horas sociales',
      accent: '#1565C0',
      subjectList: [
        { label: 'Estado de Beca', subject: 'SIBEC - Consulta Estado de Beca', icon: '🎓' },
        { label: 'Cambio de Área', subject: 'SIBEC - Solicitud de Cambio de Área', icon: '🔄' },
        { label: 'Constancia', subject: 'SIBEC - Solicitud de Constancia', icon: '📄' },
      ],
    });

    return result;
  }, [assignmentRecord, currentDepartmentHead, currentTeacher]);

  const studentName = progress?.student_name ?? (currentStudent ? formatFullName(currentStudent.user.first_name, currentStudent.user.last_name) : 'Estudiante');
  const annualProgress = progress ? Math.round((Number(progress.approved_hours) / Number(progress.annual_target_hours || 150)) * 100) : 0;

  if (studentLoading || directoryLoading) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">Cargando comunicación del estudiante...</p></div>;
  }

  if (studentError) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-[#D32F2F]">{studentError}</p></div>;
  }

  if (directoryError) {
    return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-[#D32F2F]">{directoryError}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#2E7D32]">Comunicación</h2>
        <p className="text-gray-600 mt-1">Contacta a tus responsables y oficinas de apoyo vía correo electrónico</p>
      </div>

      {progress && (
        <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold flex-shrink-0">{getInitials(progress.student_name)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#2E7D32]">{progress.student_name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">📚 {currentStudent?.study_plan.name ?? 'Sin plan'}</Badge>
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300"><BookOpen className="w-3 h-3 mr-1" />{getCareerCode(progress.career)}</Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300"><Building2 className="w-3 h-3 mr-1" />{assignmentRecord?.subarea.area.name ?? 'Sin área'}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Progreso anual</p>
                <p className="text-lg font-bold text-[#2E7D32]">{annualProgress}%</p>
                <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="bg-[#2E7D32] h-1.5 rounded-full" style={{ width: `${Math.min(100, annualProgress)}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {contacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow border-gray-200">
            <CardContent className="p-0">
              <div className="p-5 border-b" style={{ borderTop: `4px solid ${contact.accent}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: contact.accent }}>
                    {getInitials(contact.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base text-gray-900 truncate">{contact.name}</CardTitle>
                    <p className="text-sm text-gray-500 truncate">{contact.email}</p>
                    <Badge variant="outline" className="mt-1 bg-gray-50 text-gray-700 border-gray-300">{contact.role}</Badge>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-3 space-y-3">
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /><span>{contact.area}</span></div>
                  {contact.subarea && <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /><span>{contact.subarea}</span></div>}
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Enviar correo rápido:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {contact.subjectList.map((quickAction) => (
                      <a key={quickAction.label} href={buildMailtoLink(contact.email, quickAction.subject, `Estimado/a ${contact.name.split(' ')[0]},\n\nMe dirijo a usted en relación a mis horas sociales.\n\n\n\nAgradezco su atención.\n\nAtentamente,\n${studentName}\nMatrícula: ${progress?.student_code ?? 'N/A'}`)} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-[#E8F5E9] hover:border-[#2E7D32]"><span>{quickAction.icon}</span>{quickAction.label}</Button>
                      </a>
                    ))}
                  </div>
                </div>

                <a href={buildMailtoLink(contact.email)} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full gap-2 text-white" style={{ backgroundColor: contact.accent }}>
                    <Send className="w-4 h-4" />
                    Redactar Correo
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-4 flex items-start gap-3">
          <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-600 mb-1">Sobre la comunicación</p>
            <p>Los correos se abren en Gmail con el destinatario y el asunto prellenados. Usa tu nombre y matrícula en el cuerpo del mensaje cuando corresponda.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
