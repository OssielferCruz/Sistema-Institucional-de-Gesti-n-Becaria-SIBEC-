import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Mail,
  ExternalLink,
  Send,
  BookOpen,
  MapPin,
  User,
  GraduationCap,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCommunicationDirectory } from '../hooks/useCommunicationDirectory';
import { useLegacyDataBridge } from '../hooks/useLegacyDataBridge';
import { formatFullName } from '../utils/communication';

export const ComunicacionEstudiante: React.FC = () => {
  const { user } = useAuth();
  const {
    mockEstudiantes,
    mockDocentes,
    isLoading: isLoadingBridge,
    error: bridgeError,
  } = useLegacyDataBridge();
  const {
    departmentHeads,
    isLoading: isLoadingDirectory,
    error: directoryError,
  } = useCommunicationDirectory();

  const estudianteActual = mockEstudiantes.find(e => e.id === user?.estudianteId);

  const docenteResponsable = estudianteActual
    ? mockDocentes.find(d => d.id === estudianteActual.docenteResponsableId)
    : null;

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

  const nombreEstudiante = estudianteActual?.nombre.split(' ')[0] || user?.name?.split(' ')[0] || 'Estudiante';

  const careerCode = estudianteActual?.carrera?.split(' - ')[0]?.toUpperCase() ?? '';
  const jefaturaCarrera = departmentHeads.find((head) => head.career.code.toUpperCase() === careerCode);

  if (isLoadingBridge || isLoadingDirectory) {
    return <div className="p-6 text-sm text-gray-500">Cargando comunicación...</div>;
  }

  if (bridgeError || directoryError) {
    return <div className="p-6 text-sm text-red-600">{bridgeError ?? directoryError}</div>;
  }

  // Contactos del estudiante
  const contactos = [
    ...(docenteResponsable ? [{
      id: docenteResponsable.id,
      nombre: docenteResponsable.nombre,
      email: docenteResponsable.email,
      rol: 'Docente Responsable',
      area: docenteResponsable.area,
      subarea: docenteResponsable.subarea || '',
      icono: <GraduationCap className="w-5 h-5 text-white" />,
      color: 'bg-[#2E7D32]',
      colorLight: 'bg-green-50 border-green-200',
      badgeColor: 'bg-green-100 text-green-800 border-green-300',
    }] : []),
    {
      id: 'bienestar',
      nombre: 'Oficina de Bienestar Estudiantil',
      email: 'bienestar.estudiantil@ulsa.edu.ni',
      rol: 'Personal de Bienestar',
      area: 'Bienestar Estudiantil',
      subarea: 'Horas Sociales',
      icono: <ShieldCheck className="w-5 h-5 text-white" />,
      color: 'bg-[#1565C0]',
      colorLight: 'bg-blue-50 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      id: 'jefatura',
      nombre: jefaturaCarrera ? formatFullName(jefaturaCarrera.user.first_name, jefaturaCarrera.user.last_name) : 'Jefatura de Carrera',
      email: jefaturaCarrera?.user.email ?? 'jefatura@sibec.local',
      rol: 'Jefatura de Carrera',
      area: estudianteActual?.carrera?.split(' - ')[0] || 'Ingeniería',
      subarea: 'Coordinación Académica',
      icono: <Building2 className="w-5 h-5 text-white" />,
      color: 'bg-[#F57F17]',
      colorLight: 'bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
  ];

  const asuntosRapidosDocente = [
    { label: 'Registro de Horas', asunto: 'SIBEC - Consulta sobre Registro de Horas', icono: '⏰' },
    { label: 'Justificación', asunto: 'SIBEC - Justificación de Inasistencia', icono: '📝' },
    { label: 'Consulta General', asunto: 'SIBEC - Consulta General', icono: '💬' },
  ];

  const asuntosRapidosBienestar = [
    { label: 'Estado de Beca', asunto: 'SIBEC - Consulta Estado de Beca', icono: '🎓' },
    { label: 'Cambio de Área', asunto: 'SIBEC - Solicitud de Cambio de Área', icono: '🔄' },
    { label: 'Constancia', asunto: 'SIBEC - Solicitud de Constancia', icono: '📄' },
  ];

  const asuntosRapidosJefatura = [
    { label: 'Situación Académica', asunto: 'SIBEC - Consulta Situación Académica', icono: '📊' },
    { label: 'Apoyo Académico', asunto: 'SIBEC - Solicitud de Apoyo Académico', icono: '📚' },
    { label: 'Consulta General', asunto: 'SIBEC - Consulta para Jefatura', icono: '💬' },
  ];

  const getAsuntosRapidos = (contactoId: string) => {
    if (contactoId === 'bienestar') return asuntosRapidosBienestar;
    if (contactoId === 'jefatura') return asuntosRapidosJefatura;
    return asuntosRapidosDocente;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#2E7D32]">Comunicación</h2>
        <p className="text-gray-600 mt-1">Contacta a tus responsables y oficinas de apoyo vía correo electrónico</p>
      </div>

      {/* Info del estudiante */}
      {estudianteActual && (
        <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold flex-shrink-0">
                {generarIniciales(estudianteActual.nombre)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#2E7D32]">{estudianteActual.nombre}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    📚 {estudianteActual.cursoAsignado || 'Sin curso'}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                    <MapPin className="w-3 h-3 mr-1" />
                    {estudianteActual.areaActual || 'Sin área'}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {estudianteActual.carrera.split(' - ')[0]}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Progreso</p>
                <p className="text-lg font-bold text-[#2E7D32]">
                  {estudianteActual.horasCompletadas}/{estudianteActual.horasRequeridas}h
                </p>
                <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-[#2E7D32] h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (estudianteActual.horasCompletadas / estudianteActual.horasRequeridas) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tarjetas de contactos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {contactos.map((contacto) => {
          const asuntos = getAsuntosRapidos(contacto.id);
          return (
            <Card key={contacto.id} className={`hover:shadow-lg transition-shadow border ${contacto.colorLight}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full ${contacto.color} flex items-center justify-center flex-shrink-0`}>
                    {contacto.icono}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base text-gray-900">
                      {contacto.nombre}
                    </CardTitle>
                    <p className="text-sm text-gray-500 truncate">{contacto.email}</p>
                    <Badge variant="outline" className={`mt-1 ${contacto.badgeColor}`}>
                      {contacto.rol}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Info */}
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{contacto.area}</span>
                  </div>
                  {contacto.subarea && (
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{contacto.subarea}</span>
                    </div>
                  )}
                </div>

                {/* Separador + asuntos rápidos */}
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Enviar correo rápido:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {asuntos.map((asunto) => (
                      <a
                        key={asunto.label}
                        href={generarGmailLink(
                          contacto.email,
                          asunto.asunto,
                          `Estimado/a ${contacto.nombre.split(' ')[0]},\n\nMe dirijo a usted en relación a mis horas sociales.\n\n\n\nAgradezco su atención.\n\nAtentamente,\n${estudianteActual?.nombre || user?.name || 'Estudiante'}\nMatrícula: ${estudianteActual?.matricula || 'N/A'}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-white/80">
                          <span>{asunto.icono}</span>
                          {asunto.label}
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Botón principal */}
                <a
                  href={generarGmailLink(contacto.email)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className={`w-full ${contacto.color} hover:opacity-90 gap-2 text-white`}>
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

      {/* Nota informativa */}
      <Card className="border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-4 flex items-start gap-3">
          <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-600 mb-1">Sobre la comunicación</p>
            <p>
              Los correos se envían a través de Gmail. Al hacer clic en "Redactar Correo" o en un acceso rápido,
              se abrirá una nueva ventana de Gmail con el destinatario y asunto prellenados.
              Recuerda siempre incluir tu nombre completo y matrícula en tus comunicaciones.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
