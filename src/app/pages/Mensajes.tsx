import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Mail,
  Search,
  ExternalLink,
  User,
  BookOpen,
  Clock,
  Send,
  Users
} from 'lucide-react';
import { mockEstudiantes, mockDocentes } from '../data/mockData';

export const Mensajes: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');

  const docenteActualId = 'doc-1';
  const docenteActual = mockDocentes.find(d => d.id === docenteActualId);

  const estudiantesAsignados = mockEstudiantes.filter(est =>
    docenteActual?.estudiantesAsignados.includes(est.id)
  );

  const estudiantesFiltrados = estudiantesAsignados.filter(est => {
    if (!busqueda) return true;
    return (
      est.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (est.cursoAsignado || '').toLowerCase().includes(busqueda.toLowerCase())
    );
  });

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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-300';
      case 'completado': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const asuntosRapidos = [
    { label: 'Registro de Horas', asunto: 'SIBEC - Registro de Horas Sociales', icono: '⏰' },
    { label: 'Seguimiento', asunto: 'SIBEC - Seguimiento de Actividades', icono: '📋' },
    { label: 'Recordatorio', asunto: 'SIBEC - Recordatorio Importante', icono: '🔔' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#2E7D32]">Comunicación</h2>
        <p className="text-gray-600 mt-1">Contacta a tus estudiantes asignados vía correo electrónico</p>
      </div>

      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar estudiante, correo o curso..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{estudiantesAsignados.length} estudiante{estudiantesAsignados.length !== 1 ? 's' : ''} asignado{estudiantesAsignados.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Acceso rápido grupal */}
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
            <a
              href={generarGmailLink(
                estudiantesAsignados.map(e => e.email).join(','),
                'SIBEC - Comunicado General',
                `Estimados estudiantes,\n\n\n\nSaludos cordiales,\n${docenteActual?.nombre || 'Docente Responsable'}`
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

      {/* Tarjetas de estudiantes */}
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
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      📚 {estudiante.cursoAsignado || 'Sin curso'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              {/* Info rápida */}
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

              {/* Progreso */}
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-[#2E7D32] h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (estudiante.horasCompletadas / estudiante.horasRequeridas) * 100)}%` }}
                />
              </div>

              {/* Separador */}
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2 font-medium">Enviar correo rápido:</p>
                <div className="flex flex-wrap gap-1.5">
                  {asuntosRapidos.map((asunto) => (
                    <a
                      key={asunto.label}
                      href={generarGmailLink(
                        estudiante.email,
                        asunto.asunto,
                        `Estimado/a ${estudiante.nombre.split(' ')[0]},\n\n\n\nSaludos cordiales,\n${docenteActual?.nombre || 'Docente Responsable'}`
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

              {/* Botón principal */}
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

      {/* Estado vacío */}
      {estudiantesFiltrados.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <User className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium">No se encontraron estudiantes</p>
            <p className="text-sm">Intenta con otro término de búsqueda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
