import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Mail, ExternalLink, Send, Search, Users, User,
  GraduationCap, ShieldCheck, Clock, Building2, Layers,
  AlertCircle, Crown
} from 'lucide-react';
import { mockEstudiantes, mockDocentes, areas, carreras } from '../data/mockData';

const AREA_COLORS: Record<string, string> = {
  'Asistencia Docente': '#2E7D32', 'Biblioteca': '#1565C0', 'Bienestar Estudiantil': '#6A1B9A',
  'CIDTEA': '#00838F', 'Extensión Universitaria': '#EF6C00', 'Brigada Ambiental': '#2E7D32',
  'Comunicación Institucional': '#C62828', 'Decanatura': '#283593', 'Educación a Distancia': '#F57F17',
  'Registro Académico': '#4E342E',
};

const getAreaColor = (a: string) => AREA_COLORS[a] || '#9E9E9E';
const getCarreraCode = (c: string) => c.split(' - ')[0];

// ─── Mock jefaturas ───
const mockJefaturas = [
  { id: 'jef-1', nombre: 'Ing. Marco A. Rivera', email: 'jefatura.ice@ulsa.mx', jefatura: 'ICE/IEM', carreras: ['ICE - Ingeniería en Cibernética Electrónica', 'IEM - Ingeniería Electromédica'], color: '#6A1B9A' },
  { id: 'jef-2', nombre: 'Ing. Patricia Flores Gómez', email: 'jefatura.ime@ulsa.mx', jefatura: 'IME', carreras: ['IME - Ingeniería Mecánica y Energías Renovables'], color: '#F57F17' },
  { id: 'jef-3', nombre: 'Mtro. Fernando Silva Reyes', email: 'jefatura@ulsa.mx', jefatura: 'IMS/IEL', carreras: ['IMS - Ingeniería Mecatrónica y Sistemas de Control', 'IEL - Ingeniería Eléctrica'], color: '#2E7D32' },
  { id: 'jef-4', nombre: 'Ing. Laura Ramírez Torres', email: 'jefatura.igi@ulsa.mx', jefatura: 'IGI', carreras: ['IGI - Ingeniería en Gestión Industrial'], color: '#C62828' },
  { id: 'jef-5', nombre: 'Lic. Carlos Vega Mendoza', email: 'jefatura.lcm@ulsa.mx', jefatura: 'LCM/LAF', carreras: ['LCM - Licenciatura Comercial con Énfasis en Mercadeo', 'LAF - Licenciatura Administrativa con énfasis en Finanzas'], color: '#EF6C00' },
];

type Tab = 'docentes' | 'jefaturas' | 'estudiantes' | 'masivo';

export const ComunicacionAdmin: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState<Tab>('docentes');
  const [filterArea, setFilterArea] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const firma = `Saludos cordiales,\nOficina de Bienestar Estudiantil\nUniversidad Tecnológica La Salle`;

  const generarGmailLink = (email: string, asunto: string = '', cuerpo: string = '') => {
    const params = new URLSearchParams();
    params.set('to', email);
    if (asunto) params.set('su', asunto);
    if (cuerpo) params.set('body', cuerpo);
    return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
  };

  const generarIniciales = (nombre: string) =>
    nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const uniqueAreas = useMemo(() => [...new Set(mockDocentes.map(d => d.area))].sort(), []);
  const uniqueCarreras = useMemo(() => [...new Set(mockEstudiantes.map(e => getCarreraCode(e.carrera)))].sort(), []);

  const docentesFiltrados = useMemo(() => {
    return mockDocentes.filter(d => {
      const matchSearch = !busqueda ||
        d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.email.toLowerCase().includes(busqueda.toLowerCase());
      const matchArea = !filterArea || d.area === filterArea;
      return matchSearch && matchArea;
    });
  }, [busqueda, filterArea]);

  const jefaturasFiltradas = useMemo(() => {
    return mockJefaturas.filter(j => {
      if (!busqueda) return true;
      return j.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.jefatura.toLowerCase().includes(busqueda.toLowerCase());
    });
  }, [busqueda]);

  const estudiantesFiltrados = useMemo(() => {
    return mockEstudiantes.filter(e => {
      const matchSearch = !busqueda ||
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        import React from 'react';
        import { AlertCircle, Building2, Crown, ExternalLink, GraduationCap, Mail, Search, Send, Users } from 'lucide-react';

        import { useCommunicationDirectory } from '../hooks/useCommunicationDirectory';
        import { Badge } from '../components/ui/badge';
        import { Button } from '../components/ui/button';
        import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
        import { Input } from '../components/ui/input';
        import { buildMailtoLink, formatFullName, getCareerCode, getInitials } from '../utils/communication';

        type Tab = 'docentes' | 'jefaturas' | 'estudiantes' | 'masivo';

        function uniqueCount<T>(items: T[], selector: (item: T) => string): number {
          return new Set(items.map(selector).filter(Boolean)).size;
        }

        function matches(query: string, haystack: string[]): boolean {
          if (!query) {
            return true;
          }

          const normalized = query.toLowerCase();
          return haystack.some((value) => value.toLowerCase().includes(normalized));
        }

        export const ComunicacionAdmin: React.FC = () => {
          const { students, teachers, departmentHeads, assignments, isLoading, error } = useCommunicationDirectory();
          const [tab, setTab] = React.useState<Tab>('docentes');
          const [search, setSearch] = React.useState('');

          const assignmentByTeacher = React.useMemo(() => {
            const map = new Map<string, typeof assignments>();

            assignments.forEach((assignment) => {
              const current = map.get(assignment.teacher_profile.id) ?? [];
              current.push(assignment);
              map.set(assignment.teacher_profile.id, current);
            });

            return map;
          }, [assignments]);

          const assignmentByCareer = React.useMemo(() => {
            const map = new Map<string, typeof assignments>();

            assignments.forEach((assignment) => {
              const current = map.get(assignment.student.career.id) ?? [];
              current.push(assignment);
              map.set(assignment.student.career.id, current);
            });

            return map;
          }, [assignments]);

          const assignmentByStudent = React.useMemo(() => {
            const map = new Map<string, (typeof assignments)[number]>();

            assignments.forEach((assignment) => {
              if (!map.has(assignment.student.id)) {
                map.set(assignment.student.id, assignment);
              }
            });

            return map;
          }, [assignments]);

          const teacherCards = React.useMemo(() => teachers.map((teacher) => {
            const teacherAssignments = assignmentByTeacher.get(teacher.id) ?? [];
            const areas = [...new Set(teacherAssignments.map((assignment) => assignment.subarea.area.name))];

            return {
              teacher,
              teacherAssignments,
              areas,
            };
          }).filter(({ teacher, teacherAssignments, areas }) => matches(search, [
            formatFullName(teacher.user.first_name, teacher.user.last_name),
            teacher.user.email,
            teacher.employee_code ?? '',
            ...areas,
            ...teacherAssignments.map((assignment) => assignment.subarea.name),
            ...teacherAssignments.map((assignment) => assignment.student.career.name),
          ])), [assignmentByTeacher, search, teachers]);

          const jefaturaCards = React.useMemo(() => departmentHeads.map((departmentHead) => {
            const careerAssignments = assignmentByCareer.get(departmentHead.career.id) ?? [];
            const teacherCount = uniqueCount(careerAssignments, (assignment) => assignment.teacher_profile.id);
            const studentCount = uniqueCount(careerAssignments, (assignment) => assignment.student.id);

            return {
              departmentHead,
              careerAssignments,
              teacherCount,
              studentCount,
            };
          }).filter(({ departmentHead, careerAssignments }) => matches(search, [
            formatFullName(departmentHead.user.first_name, departmentHead.user.last_name),
            departmentHead.user.email,
            departmentHead.career.name,
            departmentHead.career.code,
            ...careerAssignments.map((assignment) => assignment.subarea.area.name),
          ])), [assignmentByCareer, departmentHeads, search]);

          const studentCards = React.useMemo(() => students.map((student) => {
            const assignment = assignmentByStudent.get(student.id);

            return {
              student,
              assignment,
            };
          }).filter(({ student, assignment }) => matches(search, [
            formatFullName(student.user.first_name, student.user.last_name),
            student.user.email,
            student.student_code,
            student.career.name,
            student.study_plan.name,
            assignment?.subarea.area.name ?? '',
            assignment?.subarea.name ?? '',
            assignment?.teacher_profile.user.first_name ?? '',
            assignment?.teacher_profile.user.last_name ?? '',
          ])), [assignmentByStudent, search, students]);

          const activeStudents = students.filter((student) => student.is_active);
          const activeTeachers = teachers.filter((teacher) => teacher.is_active);
          const activeDepartmentHeads = departmentHeads.filter((departmentHead) => departmentHead.is_active);

          const mailSignature = 'Oficina de Bienestar Estudiantil\nUniversidad Tecnológica La Salle';

          if (isLoading) {
            return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">Cargando comunicación...</p></div>;
          }

          if (error) {
            return <div className="rounded-lg bg-white p-6 shadow-sm"><p className="text-sm text-[#D32F2F]">{error}</p></div>;
          }

          return (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-5 rounded-xl shadow-md">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-white/70 text-sm mb-0.5">Bienestar Estudiantil · Comunicación</p>
                    <h2 className="text-2xl font-bold mb-0.5">Centro de Comunicación</h2>
                    <p className="text-white/90 text-sm">Contacta docentes, jefaturas, estudiantes y envía comunicados masivos</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {[
                      { label: 'Docentes', value: teachers.length },
                      { label: 'Jefaturas', value: departmentHeads.length },
                      { label: 'Estudiantes', value: students.length },
                    ].map((item) => (
                      <div key={item.label} className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3">
                        <p className="text-white/80 text-[10px] uppercase tracking-wider">{item.label}</p>
                        <p className="text-3xl font-bold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                {([
                  { key: 'docentes' as Tab, label: `Docentes (${teachers.length})`, icon: GraduationCap },
                  { key: 'jefaturas' as Tab, label: `Jefaturas (${departmentHeads.length})`, icon: Crown },
                  { key: 'estudiantes' as Tab, label: `Estudiantes (${students.length})`, icon: Users },
                  { key: 'masivo' as Tab, label: 'Correo Masivo', icon: Send },
                ]).map((item) => {
                  const Icon = item.icon;
                  const isActive = tab === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTab(item.key)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive ? 'bg-white text-[#2E7D32] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <Card className="bg-white border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative flex-1 min-w-[220px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, correo, carrera o área" className="pl-10" />
                    </div>
                    <Badge className="bg-[#2E7D32] text-white">{tab === 'docentes' ? teacherCards.length : tab === 'jefaturas' ? jefaturaCards.length : tab === 'estudiantes' ? studentCards.length : assignments.length} resultados</Badge>
                  </div>
                </CardContent>
              </Card>

              {tab === 'docentes' && (
                <div className="space-y-4">
                  {teacherCards.length > 0 && (
                    <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
                            <div>
                              <p className="font-semibold text-[#2E7D32]">Correo a docentes filtrados</p>
                              <p className="text-sm text-gray-600">Enviar comunicado a {teacherCards.length} docentes</p>
                            </div>
                          </div>
                          <a href={buildMailtoLink(teacherCards.map(({ teacher }) => teacher.user.email).join(','), 'SIBEC - Comunicado de Bienestar Estudiantil', `Estimados docentes,\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2"><Mail className="w-4 h-4" /> Enviar a Todos <ExternalLink className="w-3 h-3" /></Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {teacherCards.map(({ teacher, teacherAssignments, areas }) => (
                      <Card key={teacher.id} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="h-1 bg-[#2E7D32]" />
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {getInitials(formatFullName(teacher.user.first_name, teacher.user.last_name))}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base text-gray-900 truncate">{formatFullName(teacher.user.first_name, teacher.user.last_name)}</CardTitle>
                              <p className="text-[11px] text-gray-500 truncate">{teacher.user.email}</p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-800 border-green-200">Docente</Badge>
                                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">{teacherAssignments.length} asignaciones</Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /><span>{areas.length > 0 ? areas.join(' · ') : 'Sin área asignada'}</span></div>
                            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /><span>{uniqueCount(teacherAssignments, (assignment) => assignment.student.id)} estudiantes vinculados</span></div>
                          </div>

                          <div className="border-t pt-3">
                            <p className="text-[10px] text-gray-500 mb-2 font-medium">Correo rápido:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: 'Seguimiento', subject: 'SIBEC - Seguimiento de Horas Sociales', icon: '📋' },
                                { label: 'Reporte', subject: 'SIBEC - Solicitud de Reporte', icon: '📊' },
                                { label: 'Coordinación', subject: 'SIBEC - Coordinación Institucional', icon: '🤝' },
                              ].map((quickAction) => (
                                <a key={quickAction.label} href={buildMailtoLink(teacher.user.email, quickAction.subject, `Estimado/a ${teacher.user.first_name},\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-[#E8F5E9] hover:border-[#2E7D32]"><span>{quickAction.icon}</span>{quickAction.label}</Button>
                                </a>
                              ))}
                            </div>
                          </div>

                          <a href={buildMailtoLink(teacher.user.email)} target="_blank" rel="noopener noreferrer" className="block">
                            <Button className="w-full gap-2 bg-[#2E7D32] hover:bg-[#1B5E20]"><Send className="w-4 h-4" /> Redactar Correo <ExternalLink className="w-3 h-3 ml-auto" /></Button>
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'jefaturas' && (
                <div className="space-y-4">
                  {jefaturaCards.length > 0 && (
                    <Card className="border-[#F57F17]/20 bg-gradient-to-r from-amber-50 to-white shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F57F17] flex items-center justify-center"><Crown className="w-5 h-5 text-white" /></div>
                            <div>
                              <p className="font-semibold text-[#F57F17]">Correo a jefaturas filtradas</p>
                              <p className="text-sm text-gray-600">Enviar comunicado a {jefaturaCards.length} jefaturas de carrera</p>
                            </div>
                          </div>
                          <a href={buildMailtoLink(jefaturaCards.map(({ departmentHead }) => departmentHead.user.email).join(','), 'SIBEC - Comunicado a Jefaturas de Carrera', `Estimadas jefaturas de carrera,\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-[#F57F17] hover:bg-[#E65100] gap-2"><Mail className="w-4 h-4" /> Enviar a Todas <ExternalLink className="w-3 h-3" /></Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {jefaturaCards.map(({ departmentHead, careerAssignments, teacherCount, studentCount }) => (
                      <Card key={departmentHead.id} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="h-1 bg-[#F57F17]" />
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-full bg-[#F57F17] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {getInitials(formatFullName(departmentHead.user.first_name, departmentHead.user.last_name))}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base text-gray-900 truncate">{formatFullName(departmentHead.user.first_name, departmentHead.user.last_name)}</CardTitle>
                              <p className="text-[11px] text-gray-500 truncate">{departmentHead.user.email}</p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">{departmentHead.career.code}</Badge>
                                <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-700 border-gray-200">Jefatura</Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /><span>{departmentHead.career.name}</span></div>
                            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /><span>{studentCount} becados · {teacherCount} docentes</span></div>
                            <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /><span>{careerAssignments.length} asignaciones de la carrera</span></div>
                          </div>

                          <div className="border-t pt-3">
                            <p className="text-[10px] text-gray-500 mb-2 font-medium">Correo rápido:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: 'Reporte', subject: 'SIBEC - Reporte de Estudiantes Becados', icon: '📊' },
                                { label: 'Validación', subject: 'SIBEC - Solicitud de Validación de Horas', icon: '✅' },
                                { label: 'Coordinación', subject: 'SIBEC - Coordinación Académica', icon: '🤝' },
                              ].map((quickAction) => (
                                <a key={quickAction.label} href={buildMailtoLink(departmentHead.user.email, quickAction.subject, `Estimado/a ${departmentHead.user.first_name},\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-amber-50 hover:border-[#F57F17]"><span>{quickAction.icon}</span>{quickAction.label}</Button>
                                </a>
                              ))}
                            </div>
                          </div>

                          <a href={buildMailtoLink(departmentHead.user.email)} target="_blank" rel="noopener noreferrer" className="block">
                            <Button className="w-full gap-2 bg-[#F57F17] hover:bg-[#E65100]"><Send className="w-4 h-4" /> Redactar Correo <ExternalLink className="w-3 h-3 ml-auto" /></Button>
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'estudiantes' && (
                <div className="space-y-4">
                  {studentCards.length > 0 && (
                    <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
                            <div>
                              <p className="font-semibold text-[#2E7D32]">Correo a estudiantes filtrados</p>
                              <p className="text-sm text-gray-600">Enviar comunicado a {studentCards.length} estudiantes</p>
                            </div>
                          </div>
                          <a href={buildMailtoLink(studentCards.map(({ student }) => student.user.email).join(','), 'SIBEC - Comunicado de Bienestar Estudiantil', `Estimados estudiantes,\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2"><Mail className="w-4 h-4" /> Enviar a Todos <ExternalLink className="w-3 h-3" /></Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {studentCards.map(({ student, assignment }) => (
                      <Card key={student.id} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="h-1 bg-[#2E7D32]" />
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {getInitials(formatFullName(student.user.first_name, student.user.last_name))}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base text-gray-900 truncate">{formatFullName(student.user.first_name, student.user.last_name)}</CardTitle>
                              <p className="text-[11px] text-gray-500 truncate">{student.user.email}</p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge variant="outline" className={`text-[10px] ${student.is_active ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>{student.is_active ? 'Activo' : 'Inactivo'}</Badge>
                                <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-700 border-gray-200">{student.student_code}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /><span>{getCareerCode(student.career.name)}</span></div>
                            <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /><span>{assignment?.subarea.area.name ?? 'Sin área asignada'}</span></div>
                            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /><span>{student.study_plan.name}</span></div>
                          </div>

                          <div className="border-t pt-3">
                            <p className="text-[10px] text-gray-500 mb-2 font-medium">Correo rápido:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: 'Seguimiento', subject: 'SIBEC - Seguimiento de Horas Sociales', icon: '📋' },
                                { label: 'Situación', subject: 'SIBEC - Revisión de Situación', icon: '📊' },
                                { label: 'Recordatorio', subject: 'SIBEC - Recordatorio Importante', icon: '🔔' },
                              ].map((quickAction) => (
                                <a key={quickAction.label} href={buildMailtoLink(student.user.email, quickAction.subject, `Estimado/a ${student.user.first_name},\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-[#E8F5E9] hover:border-[#2E7D32]"><span>{quickAction.icon}</span>{quickAction.label}</Button>
                                </a>
                              ))}
                            </div>
                          </div>

                          <a href={buildMailtoLink(student.user.email)} target="_blank" rel="noopener noreferrer" className="block">
                            <Button className="w-full gap-2 bg-[#2E7D32] hover:bg-[#1B5E20]"><Send className="w-4 h-4" /> Redactar Correo <ExternalLink className="w-3 h-3 ml-auto" /></Button>
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'masivo' && (
                <div className="space-y-4">
                  <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
                          <div><p className="font-semibold text-[#2E7D32]">Todos los estudiantes activos</p><p className="text-sm text-gray-600">{activeStudents.length} estudiantes activos</p></div>
                        </div>
                        <a href={buildMailtoLink(activeStudents.map((student) => student.user.email).join(','), 'SIBEC - Comunicado Institucional', `Estimados estudiantes becados,\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2"><Send className="w-4 h-4" /> Enviar a Todos <ExternalLink className="w-3 h-3" /></Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[#1565C0]/20 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1565C0] flex items-center justify-center"><GraduationCap className="w-5 h-5 text-white" /></div>
                          <div><p className="font-semibold text-[#1565C0]">Todos los docentes activos</p><p className="text-sm text-gray-600">{activeTeachers.length} docentes responsables</p></div>
                        </div>
                        <a href={buildMailtoLink(activeTeachers.map((teacher) => teacher.user.email).join(','), 'SIBEC - Comunicado a Docentes', `Estimados docentes responsables,\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-[#1565C0] hover:bg-[#0D47A1] gap-2"><Send className="w-4 h-4" /> Enviar a Todos <ExternalLink className="w-3 h-3" /></Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[#F57F17]/20 bg-gradient-to-r from-amber-50 to-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F57F17] flex items-center justify-center"><Crown className="w-5 h-5 text-white" /></div>
                          <div><p className="font-semibold text-[#F57F17]">Todas las jefaturas activas</p><p className="text-sm text-gray-600">{activeDepartmentHeads.length} jefaturas registradas</p></div>
                        </div>
                        <a href={buildMailtoLink(activeDepartmentHeads.map((departmentHead) => departmentHead.user.email).join(','), 'SIBEC - Comunicado a Jefaturas', `Estimadas jefaturas de carrera,\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-[#F57F17] hover:bg-[#E65100] gap-2"><Send className="w-4 h-4" /> Enviar a Todas <ExternalLink className="w-3 h-3" /></Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-gradient-to-r from-red-50 to-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#EF5350] flex items-center justify-center"><AlertCircle className="w-5 h-5 text-white" /></div>
                          <div><p className="font-semibold text-[#EF5350]">Comunicación general</p><p className="text-sm text-gray-600">Agrupa a toda la comunidad visible en el módulo</p></div>
                        </div>
                        <a href={buildMailtoLink([...new Set([...activeStudents, ...activeTeachers, ...activeDepartmentHeads].map((item) => item.user.email))].join(','), 'SIBEC - Comunicado General', `Estimados miembros de la comunidad SIBEC,\n\n\n\n${mailSignature}`)} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-[#EF5350] hover:bg-[#D32F2F] gap-2"><Send className="w-4 h-4" /> Enviar General <ExternalLink className="w-3 h-3" /></Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {((tab === 'docentes' && teacherCards.length === 0) || (tab === 'jefaturas' && jefaturaCards.length === 0) || (tab === 'estudiantes' && studentCards.length === 0)) && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mb-3 text-gray-300" />
                    <p className="font-medium">No se encontraron resultados</p>
                    <p className="text-sm">Intenta con otro término de búsqueda</p>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        };
          <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
