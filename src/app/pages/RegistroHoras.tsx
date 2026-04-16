import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Clock, Calendar, Save, Search, User, TrendingUp, AlertCircle, CheckCircle2, Award, X, Eye, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { mockEstudiantes, mockRegistrosHoras, mockDocentes } from '../data/mockData';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

// Modal para desglose de estadísticas
interface ModalEstadisticasProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'hoy' | 'semana' | 'totales';
}

const ModalEstadisticas: React.FC<ModalEstadisticasProps> = ({ isOpen, onClose, tipo }) => {
  if (!isOpen) return null;

  // Crear datos de ejemplo para "hoy"
  const hoy = new Date().toISOString().split('T')[0];
  const registrosHoy = [
    {
      id: 'rh-hoy-1',
      estudianteNombre: 'Juan Carlos Pérez García',
      matricula: '2021001',
      fecha: hoy,
      horaInicio: '08:00',
      horaFin: '12:00',
      totalHoras: 4,
      descripcion: 'Apoyo en organización de archivos académicos y atención a estudiantes en ventanilla',
      area: 'Asistencia Docente',
      estado: 'pendiente' as const
    },
    {
      id: 'rh-hoy-2',
      estudianteNombre: 'María Fernanda López Hernández',
      matricula: '2021002',
      fecha: hoy,
      horaInicio: '14:00',
      horaFin: '18:00',
      totalHoras: 4,
      descripcion: 'Actualización de base de datos de estudiantes y digitalización de documentos',
      area: 'Asistencia Docente',
      estado: 'pendiente' as const
    },
    {
      id: 'rh-hoy-3',
      estudianteNombre: 'Luis Alberto López Ramírez',
      matricula: '2021070',
      fecha: hoy,
      horaInicio: '09:00',
      horaFin: '13:00',
      totalHoras: 4,
      descripcion: 'Preparación de material didáctico para laboratorios de ingeniería',
      area: 'Asistencia Docente',
      estado: 'pendiente' as const
    }
  ];

  // Crear datos de ejemplo para "semana"
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
  
  const registrosSemana = [
    ...registrosHoy,
    {
      id: 'rh-sem-1',
      estudianteNombre: 'Juan Carlos Pérez García',
      matricula: '2021001',
      fecha: new Date(inicioSemana.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      horaInicio: '08:00',
      horaFin: '12:00',
      totalHoras: 4,
      descripcion: 'Organización de documentos administrativos de la jefatura',
      area: 'Asistencia Docente',
      estado: 'aprobada' as const
    },
    {
      id: 'rh-sem-2',
      estudianteNombre: 'María Fernanda López Hernández',
      matricula: '2021002',
      fecha: new Date(inicioSemana.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      horaInicio: '14:00',
      horaFin: '17:00',
      totalHoras: 3,
      descripcion: 'Atención a estudiantes en trámites académicos',
      area: 'Asistencia Docente',
      estado: 'aprobada' as const
    },
    {
      id: 'rh-sem-3',
      estudianteNombre: 'Luis Alberto López Ramírez',
      matricula: '2021070',
      fecha: new Date(inicioSemana.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      horaInicio: '09:00',
      horaFin: '13:00',
      totalHoras: 4,
      descripcion: 'Inventario y mantenimiento de equipos de laboratorio',
      area: 'Asistencia Docente',
      estado: 'aprobada' as const
    },
    {
      id: 'rh-sem-4',
      estudianteNombre: 'Ana Patricia Ramírez Torres',
      matricula: '2021010',
      fecha: new Date(inicioSemana.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      horaInicio: '10:00',
      horaFin: '14:00',
      totalHoras: 4,
      descripcion: 'Apoyo en preparación de material para clases',
      area: 'Asistencia Docente',
      estado: 'pendiente' as const
    }
  ];

  const registrosTotales = mockRegistrosHoras;

  let registros = [];
  let titulo = '';
  let colorHeader = '';
  let totalHoras = 0;

  switch (tipo) {
    case 'hoy':
      registros = registrosHoy;
      titulo = 'Registros de Hoy';
      colorHeader = 'from-blue-600 to-blue-400';
      totalHoras = registrosHoy.reduce((sum, r) => sum + r.totalHoras, 0);
      break;
    case 'semana':
      registros = registrosSemana;
      titulo = 'Registros de Esta Semana';
      colorHeader = 'from-green-600 to-green-400';
      totalHoras = registrosSemana.reduce((sum, r) => sum + r.totalHoras, 0);
      break;
    case 'totales':
      registros = registrosTotales;
      titulo = 'Todos los Registros';
      colorHeader = 'from-purple-600 to-purple-400';
      totalHoras = registrosTotales.reduce((sum, r) => sum + r.totalHoras, 0);
      break;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-white max-h-[85vh] overflow-y-auto">
        <CardHeader className={`border-b bg-gradient-to-r ${colorHeader} sticky top-0 z-10`}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {titulo}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Resumen Superior */}
          <div className={`rounded-lg p-4 mb-6 ${
            tipo === 'hoy' ? 'bg-blue-50 border border-blue-200' :
            tipo === 'semana' ? 'bg-green-50 border border-green-200' :
            'bg-purple-50 border border-purple-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  tipo === 'hoy' ? 'text-blue-700' :
                  tipo === 'semana' ? 'text-green-700' :
                  'text-purple-700'
                }`}>
                  Total de Registros
                </p>
                <p className={`text-3xl font-bold ${
                  tipo === 'hoy' ? 'text-blue-900' :
                  tipo === 'semana' ? 'text-green-900' :
                  'text-purple-900'
                }`}>
                  {registros.length}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  tipo === 'hoy' ? 'text-blue-700' :
                  tipo === 'semana' ? 'text-green-700' :
                  'text-purple-700'
                }`}>
                  Horas Totales
                </p>
                <p className={`text-3xl font-bold ${
                  tipo === 'hoy' ? 'text-blue-900' :
                  tipo === 'semana' ? 'text-green-900' :
                  'text-purple-900'
                }`}>
                  {totalHoras}h
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  tipo === 'hoy' ? 'text-blue-700' :
                  tipo === 'semana' ? 'text-green-700' :
                  'text-purple-700'
                }`}>
                  Aprobados
                </p>
                <p className={`text-3xl font-bold ${
                  tipo === 'hoy' ? 'text-blue-900' :
                  tipo === 'semana' ? 'text-green-900' :
                  'text-purple-900'
                }`}>
                  {registros.filter(r => r.estado === 'aprobada').length}
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Registros */}
          <div className="space-y-3">
            {registros.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <p>No hay registros para mostrar</p>
              </div>
            ) : (
              registros.map((registro) => (
                <div key={registro.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#2E7D32] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{registro.estudianteNombre}</p>
                        <StatusBadge status={registro.estado} />
                      </div>
                      <p className="text-sm text-gray-500">
                        {(registro as any).matricula || 'Matrícula no disponible'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-[#2E7D32] text-white">
                        {registro.totalHoras} horas
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{registro.descripcion}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Fecha</p>
                      <p className="font-medium text-gray-900">
                        {new Date(registro.fecha).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Horario</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {registro.horaInicio} - {registro.horaFin}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Área</p>
                      <p className="font-medium text-gray-900">{registro.area}</p>
                    </div>
                  </div>

                  {(registro as any).comentario && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Comentario:</p>
                      <p className="text-sm text-gray-700 italic">"{(registro as any).comentario}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>

        <div className="border-t p-4 bg-gray-50 sticky bottom-0">
          <Button onClick={onClose} className={`w-full ${
            tipo === 'hoy' ? 'bg-blue-600 hover:bg-blue-700' :
            tipo === 'semana' ? 'bg-green-600 hover:bg-green-700' :
            'bg-purple-600 hover:bg-purple-700'
          }`}>
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export const RegistroHoras: React.FC = () => {
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [selectedEstudiante, setSelectedEstudiante] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [modalAbierto, setModalAbierto] = useState<'hoy' | 'semana' | 'totales' | null>(null);
  const [estudiantesExpandidos, setEstudiantesExpandidos] = useState<Set<string>>(new Set());

  // Obtener el docente actual (en un caso real vendría del contexto de auth)
  const docenteActualId = 'doc-1'; // Dr. Roberto Méndez
  const docenteActual = mockDocentes.find(d => d.id === docenteActualId);

  // Obtener estudiantes asignados al docente
  const estudiantesAsignados = useMemo(() => {
    return mockEstudiantes.filter(est =>
      docenteActual?.estudiantesAsignados.includes(est.id)
    );
  }, [docenteActual]);

  // Filtrar estudiantes en tiempo real (solo de los asignados al docente)
  const estudiantesFiltrados = useMemo(() => {
    if (!busquedaEstudiante.trim()) return [];

    const busqueda = busquedaEstudiante.toLowerCase();
    return estudiantesAsignados
      .filter(e => e.estado === 'activo')
      .filter(e =>
        e.nombre.toLowerCase().includes(busqueda) ||
        e.matricula.toLowerCase().includes(busqueda) ||
        e.carrera.toLowerCase().includes(busqueda)
      )
      .slice(0, 5); // Limitar a 5 resultados
  }, [busquedaEstudiante, estudiantesAsignados]);

  // Obtener datos del estudiante seleccionado
  const estudianteSeleccionado = mockEstudiantes.find(e => e.id === selectedEstudiante);
  
  // Calcular estadísticas del estudiante
  const registrosEstudiante = selectedEstudiante 
    ? mockRegistrosHoras.filter(r => r.estudianteId === selectedEstudiante)
    : [];
  
  // Datos de ejemplo para hoy (mismo que en el modal)
  const hoy = new Date().toISOString().split('T')[0];
  const registrosHoy = [
    { totalHoras: 4 },
    { totalHoras: 4 },
    { totalHoras: 4 }
  ];
  
  const horasRegistradasHoy = registrosHoy.reduce((sum, r) => sum + r.totalHoras, 0);

  // Datos de ejemplo para la semana (mismo que en el modal)
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
  
  const registrosSemana = [
    { totalHoras: 4 }, // Hoy - Juan Carlos
    { totalHoras: 4 }, // Hoy - María Fernanda
    { totalHoras: 4 }, // Hoy - Luis Alberto
    { totalHoras: 4 }, // Día anterior - Juan Carlos
    { totalHoras: 3 }, // Día anterior - María Fernanda
    { totalHoras: 4 }, // Día anterior - Luis Alberto
    { totalHoras: 4 }  // Día anterior - Ana Patricia
  ];
  
  const horasRegistradasSemana = registrosSemana.reduce((sum, r) => sum + r.totalHoras, 0);

  const calcularHoras = () => {
    if (!horaInicio || !horaFin) return 0;
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;
    const total = (fin - inicio) / 60;
    return total > 0 ? total.toFixed(1) : 0;
  };

  const totalHoras = calcularHoras();

  const handleSeleccionarEstudiante = (estudiante: any) => {
    setSelectedEstudiante(estudiante.id);
    setBusquedaEstudiante(estudiante.nombre);
    setMostrarSugerencias(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEstudiante || !fecha || !horaInicio || !horaFin || !descripcion) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (parseFloat(totalHoras) <= 0) {
      toast.error('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    toast.success(`✓ Registro guardado: ${totalHoras} horas para ${estudianteSeleccionado?.nombre}`);
    
    // Reset form
    setSelectedEstudiante('');
    setBusquedaEstudiante('');
    setFecha('');
    setHoraInicio('');
    setHoraFin('');
    setDescripcion('');
  };

  const limpiarFormulario = () => {
    setSelectedEstudiante('');
    setBusquedaEstudiante('');
    setFecha('');
    setHoraInicio('');
    setHoraFin('');
    setDescripcion('');
  };

  return (
    <div className="space-y-6">
      {/* Header con Estadísticas Rápidas */}
      <div>
        <h2 className="text-2xl font-bold text-[#2E7D32]">Registro de Horas Sociales</h2>
        <p className="text-gray-600 mt-1">Registra las actividades realizadas por los estudiantes</p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
          onClick={() => setModalAbierto('hoy')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Horas Hoy</p>
                <p className="text-2xl font-bold text-blue-900">{horasRegistradasHoy}h</p>
              </div>
              <Clock className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
            <p className="text-xs text-blue-600 mt-2 font-medium flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Clic para ver detalles
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
          onClick={() => setModalAbierto('semana')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Horas Esta Semana</p>
                <p className="text-2xl font-bold text-green-900">{horasRegistradasSemana}h</p>
              </div>
              <Calendar className="w-10 h-10 text-green-600 opacity-20" />
            </div>
            <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Clic para ver detalles
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
          onClick={() => setModalAbierto('totales')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Registros Totales</p>
                <p className="text-2xl font-bold text-purple-900">{mockRegistrosHoras.length}</p>
              </div>
              <Award className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
            <p className="text-xs text-purple-600 mt-2 font-medium flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Clic para ver detalles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Panel de Información del Estudiante */}
      {estudianteSeleccionado && (
        <Card className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] border-none shadow-md">
          <CardContent className="p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{estudianteSeleccionado.nombre}</h3>
                  <p className="text-white/90 text-sm">{estudianteSeleccionado.matricula} • {estudianteSeleccionado.carrera}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className="bg-white/20 text-white border-white/30">
                      {estudianteSeleccionado.areaActual}
                    </Badge>
                    <p className="text-sm text-white/80">Periodo {estudianteSeleccionado.periodoActual}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80 mb-1">Progreso Anual</p>
                <p className="text-3xl font-bold">{estudianteSeleccionado.horasCompletadas}/{estudianteSeleccionado.horasRequeridas}h</p>
                <p className="text-sm text-white/90 mt-1">
                  {((estudianteSeleccionado.horasCompletadas / estudianteSeleccionado.horasRequeridas) * 100).toFixed(0)}% completado
                </p>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="mt-4">
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all shadow-lg"
                  style={{ width: `${(estudianteSeleccionado.horasCompletadas / estudianteSeleccionado.horasRequeridas) * 100}%` }}
                />
              </div>
            </div>

            {/* Registros Previos del Estudiante */}
            {registrosEstudiante.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="text-sm font-medium">Registros Previos: {registrosEstudiante.length}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-white/80">Aprobados: </span>
                      <span className="font-bold">{registrosEstudiante.filter(r => r.estado === 'aprobada').length}</span>
                    </div>
                    <div>
                      <span className="text-white/80">Pendientes: </span>
                      <span className="font-bold">{registrosEstudiante.filter(r => r.estado === 'pendiente').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Card */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A]">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Nuevo Registro de Horas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estudiante */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="estudiante">
                  Estudiante * 
                  <span className="text-xs text-gray-500 ml-2">(Escribe para buscar por nombre, matrícula o carrera)</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="estudiante"
                    type="text"
                    value={busquedaEstudiante}
                    onChange={(e) => {
                      setBusquedaEstudiante(e.target.value);
                      if (!e.target.value) {
                        setSelectedEstudiante('');
                      }
                    }}
                    className="pl-10"
                    placeholder="Busca por nombre, matrícula o carrera..."
                    onFocus={() => setMostrarSugerencias(true)}
                    onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                  />
                  {selectedEstudiante && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                  )}
                </div>
                
                {/* Sugerencias de búsqueda */}
                {mostrarSugerencias && estudiantesFiltrados.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full md:w-[calc(100%-3rem)] bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {estudiantesFiltrados.map(estudiante => {
                      const progreso = (estudiante.horasCompletadas / estudiante.horasRequeridas) * 100;
                      return (
                        <div
                          key={estudiante.id}
                          className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                          onClick={() => handleSeleccionarEstudiante(estudiante)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{estudiante.nombre}</p>
                              <p className="text-sm text-gray-600">{estudiante.matricula} • {estudiante.carrera}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-[#2E7D32] text-white text-xs">
                                  {estudiante.areaActual}
                                </Badge>
                                <span className="text-xs text-gray-500">P{estudiante.periodoActual}</span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm font-semibold text-[#2E7D32]">
                                {estudiante.horasCompletadas}/{estudiante.horasRequeridas}h
                              </p>
                              <p className="text-xs text-gray-500">{progreso.toFixed(0)}%</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {mostrarSugerencias && busquedaEstudiante && estudiantesFiltrados.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full md:w-[calc(100%-3rem)] bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm">No se encontraron estudiantes activos con ese criterio</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="pl-10"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <p className="text-xs text-gray-500">No puedes registrar fechas futuras</p>
              </div>

              {/* Hora Inicio */}
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora de Inicio *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="horaInicio"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Hora Fin */}
              <div className="space-y-2">
                <Label htmlFor="horaFin">Hora de Fin *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="horaFin"
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Total Horas (calculado) */}
              <div className="space-y-2">
                <Label>Total de Horas Calculado</Label>
                <div className={`h-10 px-4 rounded-md flex items-center transition-colors ${
                  totalHoras > 0 
                    ? 'bg-[#E8F5E9] border border-[#2E7D32]/20' 
                    : 'bg-gray-100 border border-gray-300'
                }`}>
                  {totalHoras > 0 ? (
                    <span className="text-[#1B5E20] font-bold text-lg">{totalHoras} horas</span>
                  ) : (
                    <span className="text-gray-500">0 horas</span>
                  )}
                </div>
                {parseFloat(totalHoras) > 8 && (
                  <div className="flex items-center gap-1 text-amber-600 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>Verifica que las horas sean correctas (más de 8 horas)</span>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descripcion">Descripción de Actividades *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe las actividades realizadas durante este periodo..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Sé específico sobre las tareas y responsabilidades cumplidas
                  </p>
                  <p className={`text-xs ${descripcion.length < 20 ? 'text-gray-400' : descripcion.length < 50 ? 'text-amber-600' : 'text-green-600'}`}>
                    {descripcion.length} caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Vista Previa del Registro */}
            {selectedEstudiante && fecha && horaInicio && horaFin && descripcion && parseFloat(totalHoras) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-2">Vista Previa del Registro</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Estudiante:</span>
                        <span className="text-blue-900 ml-2">{estudianteSeleccionado?.nombre}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Fecha:</span>
                        <span className="text-blue-900 ml-2">{new Date(fecha).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Horario:</span>
                        <span className="text-blue-900 ml-2">{horaInicio} - {horaFin}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Total:</span>
                        <span className="text-blue-900 ml-2 font-bold">{totalHoras} horas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline"
                onClick={limpiarFormulario}
              >
                Limpiar
              </Button>
              <Button 
                type="submit" 
                className="bg-[#2E7D32] hover:bg-[#66BB6A] text-white"
                disabled={!selectedEstudiante || !fecha || !horaInicio || !horaFin || !descripcion || parseFloat(totalHoras) <= 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Registro
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Historial por Estudiante con Acordeón */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A]">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Historial Completo de Horas por Estudiante
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 mb-6 text-sm">
            Consulta el historial detallado de registros de horas para cada estudiante asignado
          </p>
          
          <div className="space-y-3">
            {estudiantesAsignados.map((estudiante) => {
              const registrosDeEstudiante = mockRegistrosHoras.filter(r => r.estudianteId === estudiante.id);
              const registrosAprobados = registrosDeEstudiante.filter(r => r.estado === 'aprobada');
              const isExpanded = estudiantesExpandidos.has(estudiante.id);
              const progreso = (estudiante.horasCompletadas / estudiante.horasRequeridas) * 100;

              const toggleExpand = () => {
                const newSet = new Set(estudiantesExpandidos);
                if (isExpanded) {
                  newSet.delete(estudiante.id);
                } else {
                  newSet.add(estudiante.id);
                }
                setEstudiantesExpandidos(newSet);
              };

              return (
                <div key={estudiante.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#2E7D32] transition-colors">
                  {/* Header del Acordeón */}
                  <div 
                    className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 cursor-pointer hover:from-[#E8F5E9] hover:to-[#F1F8E9] transition-colors"
                    onClick={toggleExpand}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {estudiante.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>

                        {/* Info del Estudiante */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 truncate">{estudiante.nombre}</p>
                            <StatusBadge status={estudiante.estado} />
                          </div>
                          <p className="text-sm text-gray-600">{estudiante.matricula} • {estudiante.carrera}</p>
                        </div>

                        {/* Estadísticas Rápidas */}
                        <div className="hidden md:flex items-center gap-6 shrink-0">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Registros</p>
                            <p className="text-lg font-bold text-[#2E7D32]">{registrosDeEstudiante.length}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Aprobados</p>
                            <p className="text-lg font-bold text-green-600">{registrosAprobados.length}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Progreso</p>
                            <p className="text-lg font-bold text-blue-600">{progreso.toFixed(0)}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Horas</p>
                            <p className="text-lg font-bold text-[#1B5E20]">{estudiante.horasCompletadas}h</p>
                          </div>
                        </div>

                        {/* Icono de Expandir/Colapsar */}
                        <div className="shrink-0 ml-4">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas Mobile (visible solo en móvil) */}
                    <div className="md:hidden grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Registros</p>
                        <p className="text-sm font-bold text-[#2E7D32]">{registrosDeEstudiante.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Aprobados</p>
                        <p className="text-sm font-bold text-green-600">{registrosAprobados.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Progreso</p>
                        <p className="text-sm font-bold text-blue-600">{progreso.toFixed(0)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Horas</p>
                        <p className="text-sm font-bold text-[#1B5E20]">{estudiante.horasCompletadas}h</p>
                      </div>
                    </div>
                  </div>

                  {/* Contenido Expandible (Tabla de Registros) */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      {registrosDeEstudiante.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No hay registros para este estudiante</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">Fecha</TableHead>
                                <TableHead className="text-xs">Horario</TableHead>
                                <TableHead className="text-xs">Horas</TableHead>
                                <TableHead className="text-xs">Descripción</TableHead>
                                <TableHead className="text-xs">Área</TableHead>
                                <TableHead className="text-xs">Responsable</TableHead>
                                <TableHead className="text-xs">Estado</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {registrosDeEstudiante.map((registro) => (
                                <TableRow key={registro.id} className="hover:bg-gray-50">
                                  <TableCell className="text-sm">{registro.fecha}</TableCell>
                                  <TableCell className="text-xs text-gray-600">
                                    {registro.horaInicio} - {registro.horaFin}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className="bg-[#2E7D32] text-white text-xs">
                                      {registro.totalHoras}h
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="max-w-xs">
                                    <p className="text-sm text-gray-700 truncate" title={registro.descripcion}>
                                      {registro.descripcion}
                                    </p>
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600">{registro.area}</TableCell>
                                  <TableCell className="text-sm text-gray-600">{registro.docenteNombre}</TableCell>
                                  <TableCell>
                                    <StatusBadge status={registro.estado} />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>

                          {/* Resumen del Estudiante */}
                          <div className="mt-4 p-4 bg-[#E8F5E9] rounded-lg border border-[#2E7D32]/20">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Total de Registros</p>
                                <p className="text-xl font-bold text-[#2E7D32]">{registrosDeEstudiante.length}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Registros Aprobados</p>
                                <p className="text-xl font-bold text-green-700">{registrosAprobados.length}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Horas Acumuladas</p>
                                <p className="text-xl font-bold text-blue-700">{estudiante.horasCompletadas}/{estudiante.horasRequeridas}h</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Progreso Anual</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xl font-bold text-[#1B5E20]">{progreso.toFixed(0)}%</p>
                                  <TrendingUp className="w-4 h-4 text-[#1B5E20]" />
                                </div>
                              </div>
                            </div>

                            {/* Barra de Progreso */}
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-[#2E7D32] h-2 rounded-full transition-all"
                                  style={{ width: `${progreso}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {estudiantesAsignados.length > 5 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Mostrando 5 de {estudiantesAsignados.length} estudiantes asignados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales de Estadísticas */}
      <ModalEstadisticas isOpen={modalAbierto === 'hoy'} onClose={() => setModalAbierto(null)} tipo="hoy" />
      <ModalEstadisticas isOpen={modalAbierto === 'semana'} onClose={() => setModalAbierto(null)} tipo="semana" />
      <ModalEstadisticas isOpen={modalAbierto === 'totales'} onClose={() => setModalAbierto(null)} tipo="totales" />
    </div>
  );
};