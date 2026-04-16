import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Mail,
  ExternalLink,
  Send,
  Search,
  MapPin,
  BookOpen,
  Users,
  User,
  GraduationCap,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { mockEstudiantes, mockDocentes } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export const ComunicacionJefatura: React.FC = () => {
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState<'docentes' | 'estudiantes'>('docentes');

  const carrerasJefe = user?.carrerasAsignadas || (user?.carrera ? [user.carrera] : []);

  // Solo docentes de Asistencia Docente de las carreras del jefe
  const docentesCarrera = mockDocentes.filter(doc => {
    if (doc.area !== 'Asistencia Docente') return false;
    if (doc.carrerasAsignadas && doc.carrerasAsignadas.length > 0) {
      return doc.carrerasAsignadas.some(carrera => carrerasJefe.includes(carrera));
    }
    return false;
  });

  // Solo estudiantes de Asistencia Docente de las carreras del jefe
  const estudiantesCarrera = mockEstudiantes.filter(e =>
    carrerasJefe.includes(e.carrera) && e.areaActual === 'Asistencia Docente'
  );

  const generarGmailLink = (email: string, asunto: string = '', cuerpo: string = '') => {
    const params = new URLSearchParams();
    params.set('to', email);
    if (asunto) params.set('su', asunto);
    if (cuerpo) params.set('body', cuerpo);
    return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
  };

  const generarIniciales = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const firma = `Saludos cordiales,\n${user?.name || 'Jefatura de Carrera'}\nJefatura de Carrera - ${carrerasJefe.join(' / ')}`;

  // Filtrar según tab activo
  const docentesFiltrados = docentesCarrera.filter(doc => {
    if (!busqueda) return true;
    return (
      doc.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.area.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const estudiantesFiltrados = estudiantesCarrera.filter(est => {
    if (!busqueda) return true;
    return (
      est.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.matricula.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const asuntosDocente = [
    { label: 'Seguimiento', asunto: 'SIBEC - Seguimiento de Estudiantes Asignados', icono: '📋' },
    { label: 'Reporte', asunto: 'SIBEC - Solicitud de Reporte de Horas', icono: '📊' },
    { label: 'Coordinación', asunto: 'SIBEC - Coordinación de Actividades', icono: '🤝' },
  ];

  const asuntosEstudiante = [
    { label: 'Seguimiento', asunto: 'SIBEC - Seguimiento de Horas Sociales', icono: '📋' },
    { label: 'Situación Académica', asunto: 'SIBEC - Revisión de Situación Académica', icono: '📊' },
    { label: 'Recordatorio', asunto: 'SIBEC - Recordatorio Importante', icono: '🔔' },
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-300';
      case 'completado': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#2E7D32]">Comunicación</h2>
        <p className="text-gray-600 mt-1">Contacta a docentes, estudiantes y Bienestar Estudiantil vía correo electrónico</p>
      </div>

      {/* Contacto rápido Bienestar */}
      <Card className="border-[#1565C0]/20 bg-gradient-to-r from-blue-50 to-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1565C0] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#1565C0]">Oficina de Bienestar Estudiantil</p>
                <p className="text-sm text-gray-600">bienestar@ulsa.mx</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a
                href={generarGmailLink(
                  'bienestar@ulsa.mx',
                  'SIBEC - Reporte de Jefatura de Carrera',
                  `Estimada Oficina de Bienestar Estudiantil,\n\nAdjunto el reporte correspondiente a las carreras: ${carrerasJefe.join(', ')}.\n\n\n\n${firma}`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#1565C0] hover:bg-[#0D47A1] gap-2">
                  <Send className="w-4 h-4" />
                  Enviar Reporte
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
              <a
                href={generarGmailLink('bienestar@ulsa.mx')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2 border-[#1565C0] text-[#1565C0] hover:bg-blue-50">
                  <Mail className="w-4 h-4" />
                  Redactar Correo
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs + Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={tab === 'docentes' ? 'default' : 'outline'}
            onClick={() => { setTab('docentes'); setBusqueda(''); }}
            className={tab === 'docentes' ? 'bg-[#2E7D32] hover:bg-[#1B5E20]' : ''}
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Docentes ({docentesCarrera.length})
          </Button>
          <Button
            variant={tab === 'estudiantes' ? 'default' : 'outline'}
            onClick={() => { setTab('estudiantes'); setBusqueda(''); }}
            className={tab === 'estudiantes' ? 'bg-[#2E7D32] hover:bg-[#1B5E20]' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            Estudiantes ({estudiantesCarrera.length})
          </Button>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={tab === 'docentes' ? 'Buscar docente, correo o área...' : 'Buscar estudiante, correo o matrícula...'}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Correo grupal */}
      {tab === 'docentes' && docentesCarrera.length > 0 && (
        <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#2E7D32]">Correo a Todos los Docentes</p>
                  <p className="text-sm text-gray-600">Enviar comunicado a los {docentesCarrera.length} docentes de tus carreras</p>
                </div>
              </div>
              <a
                href={generarGmailLink(
                  docentesCarrera.map(d => d.email).join(','),
                  'SIBEC - Comunicado de Jefatura de Carrera',
                  `Estimados docentes,\n\n\n\n${firma}`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
                  <Mail className="w-4 h-4" />
                  Enviar a Todos
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'estudiantes' && estudiantesCarrera.length > 0 && (
        <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#2E7D32]">Correo a Todos los Estudiantes</p>
                  <p className="text-sm text-gray-600">Enviar comunicado a los {estudiantesCarrera.length} estudiantes becados</p>
                </div>
              </div>
              <a
                href={generarGmailLink(
                  estudiantesCarrera.map(e => e.email).join(','),
                  'SIBEC - Comunicado de Jefatura de Carrera',
                  `Estimados estudiantes,\n\n\n\n${firma}`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
                  <Mail className="w-4 h-4" />
                  Enviar a Todos
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tarjetas de contactos - Docentes */}
      {tab === 'docentes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {docentesFiltrados.map((docente) => {
            const numEstudiantes = docente.estudiantesAsignados.length;
            return (
              <Card key={docente.id} className="hover:shadow-lg transition-shadow border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold flex-shrink-0">
                      {generarIniciales(docente.nombre)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base text-gray-900 truncate">
                        {docente.nombre}
                      </CardTitle>
                      <p className="text-sm text-gray-500 truncate">{docente.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          Docente Responsable
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {numEstudiantes} estudiante{numEstudiantes !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{docente.area}</span>
                    </div>
                    {docente.subarea && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="truncate">{docente.subarea}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Enviar correo rápido:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {asuntosDocente.map((asunto) => (
                        <a
                          key={asunto.label}
                          href={generarGmailLink(
                            docente.email,
                            asunto.asunto,
                            `Estimado/a ${docente.nombre.split(' ')[0]},\n\n\n\n${firma}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-[#E8F5E9] hover:border-[#2E7D32]">
                            <span>{asunto.icono}</span>
                            {asunto.label}
                          </Button>
                        </a>
                      ))}
                    </div>
                  </div>

                  <a
                    href={generarGmailLink(docente.email)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
                      <Send className="w-4 h-4" />
                      Redactar Correo
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tarjetas de contactos - Estudiantes */}
      {tab === 'estudiantes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {estudiantesFiltrados.map((estudiante) => (
            <Card key={estudiante.id} className="hover:shadow-lg transition-shadow border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {generarIniciales(estudiante.nombre)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base text-gray-900 truncate">
                      {estudiante.nombre}
                    </CardTitle>
                    <p className="text-sm text-gray-500 truncate">{estudiante.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className={getEstadoColor(estudiante.estado)}>
                        {estudiante.estado === 'activo' ? 'Activo' : estudiante.estado === 'completado' ? 'Completado' : 'Inactivo'}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                        {estudiante.matricula}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="truncate">{estudiante.carrera.split(' - ')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{estudiante.horasCompletadas}/{estudiante.horasRequeridas}h</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-[#2E7D32] h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (estudiante.horasCompletadas / estudiante.horasRequeridas) * 100)}%` }}
                  />
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Enviar correo rápido:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {asuntosEstudiante.map((asunto) => (
                      <a
                        key={asunto.label}
                        href={generarGmailLink(
                          estudiante.email,
                          asunto.asunto,
                          `Estimado/a ${estudiante.nombre.split(' ')[0]},\n\n\n\n${firma}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-[#E8F5E9] hover:border-[#2E7D32]">
                          <span>{asunto.icono}</span>
                          {asunto.label}
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>

                <a
                  href={generarGmailLink(estudiante.email)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] gap-2">
                    <Send className="w-4 h-4" />
                    Redactar Correo
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {((tab === 'docentes' && docentesFiltrados.length === 0) ||
        (tab === 'estudiantes' && estudiantesFiltrados.length === 0)) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <User className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium">No se encontraron resultados</p>
            <p className="text-sm">Intenta con otro término de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Nota informativa */}
      <Card className="border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-4 flex items-start gap-3">
          <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-600 mb-1">Sobre la comunicación</p>
            <p>
              Los correos se envían a través de Gmail. Al hacer clic en "Redactar Correo" o en un acceso rápido,
              se abrirá una nueva ventana de Gmail con el destinatario y asunto prellenados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
