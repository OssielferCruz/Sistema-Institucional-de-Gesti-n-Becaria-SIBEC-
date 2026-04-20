import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Calendar, 
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Table as TableIcon,
  CalendarDays,
  Search,
  Filter,
  Download,
  X,
  ArrowUpDown,
  Eye,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLegacyDataBridge } from '../hooks/useLegacyDataBridge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';

// Tipo para evento del calendario
interface EventoCalendario {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  totalHoras: number;
  descripcion: string;
  area: string;
  subarea?: string;
  docenteNombre: string;
  estado: 'aprobada' | 'pendiente' | 'rechazada';
}

export const MiAsistencia: React.FC = () => {
  const { user } = useAuth();
  const { mockEstudiantes, mockRegistrosHoras, isLoading, error } = useLegacyDataBridge();
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date(2026, 2, 1)); // Marzo 2026
  const [vistaActiva, setVistaActiva] = useState<'calendario' | 'tabla'>('calendario');
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroArea, setFiltroArea] = useState<string>('todas');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Ordenamiento tabla
  const [ordenColumna, setOrdenColumna] = useState<string>('fecha');
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('desc');
  
  // Modal detalles
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCalendario | null>(null);
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);

  // Obtener información del estudiante
  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando asistencia...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  const estudiante = mockEstudiantes.find(e => e.email === user?.email) || mockEstudiantes[0];
  if (!estudiante) {
    return <div className="p-6 text-sm text-gray-500">No se encontró información del estudiante.</div>;
  }

  // Obtener registros de horas del estudiante
  const registrosEstudiante = mockRegistrosHoras.filter(r => r.estudianteId === estudiante.id);

  // Convertir registros a eventos de calendario
  const todosLosEventos: EventoCalendario[] = registrosEstudiante.map(r => ({
    id: r.id,
    fecha: r.fecha,
    horaInicio: r.horaInicio,
    horaFin: r.horaFin,
    totalHoras: r.totalHoras,
    descripcion: r.descripcion,
    area: r.area,
    subarea: r.subarea,
    docenteNombre: r.docenteNombre,
    estado: r.estado
  }));

  // Obtener áreas únicas
  const areasUnicas = useMemo(() => {
    const areas = new Set(todosLosEventos.map(e => e.area));
    return Array.from(areas).sort();
  }, [todosLosEventos]);

  // Aplicar filtros
  const eventosFiltrados = useMemo(() => {
    return todosLosEventos.filter(evento => {
      // Filtro de búsqueda
      if (busqueda) {
        const searchLower = busqueda.toLowerCase();
        const matchBusqueda = 
          evento.descripcion.toLowerCase().includes(searchLower) ||
          evento.area.toLowerCase().includes(searchLower) ||
          evento.subarea?.toLowerCase().includes(searchLower) ||
          evento.docenteNombre.toLowerCase().includes(searchLower);
        if (!matchBusqueda) return false;
      }

      // Filtro de estado
      if (filtroEstado !== 'todos' && evento.estado !== filtroEstado) {
        return false;
      }

      // Filtro de área
      if (filtroArea !== 'todas' && evento.area !== filtroArea) {
        return false;
      }

      // Filtro de rango de fechas
      if (fechaInicio && evento.fecha < fechaInicio) {
        return false;
      }
      if (fechaFin && evento.fecha > fechaFin) {
        return false;
      }

      return true;
    });
  }, [todosLosEventos, busqueda, filtroEstado, filtroArea, fechaInicio, fechaFin]);

  // Ordenar eventos para la tabla
  const eventosOrdenados = useMemo(() => {
    const eventos = [...eventosFiltrados];
    eventos.sort((a, b) => {
      let valorA: any = a[ordenColumna as keyof EventoCalendario];
      let valorB: any = b[ordenColumna as keyof EventoCalendario];

      if (ordenColumna === 'totalHoras') {
        valorA = Number(valorA);
        valorB = Number(valorB);
      }

      if (valorA < valorB) return ordenDireccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordenDireccion === 'asc' ? 1 : -1;
      return 0;
    });
    return eventos;
  }, [eventosFiltrados, ordenColumna, ordenDireccion]);

  // Calcular estadísticas basadas en eventos filtrados
  const estadisticas = useMemo(() => {
    const aprobadas = eventosFiltrados.filter(e => e.estado === 'aprobada');
    const pendientes = eventosFiltrados.filter(e => e.estado === 'pendiente');
    const rechazadas = eventosFiltrados.filter(e => e.estado === 'rechazada');

    const horasAprobadas = aprobadas.reduce((sum, e) => sum + e.totalHoras, 0);
    const horasPendientes = pendientes.reduce((sum, e) => sum + e.totalHoras, 0);
    const horasRechazadas = rechazadas.reduce((sum, e) => sum + e.totalHoras, 0);
    const horasTotales = eventosFiltrados.reduce((sum, e) => sum + e.totalHoras, 0);

    const horasRequeridasCuatrimestre = 50;
    const horasPorCumplir = Math.max(0, horasRequeridasCuatrimestre - horasAprobadas);
    const progreso = (horasAprobadas / horasRequeridasCuatrimestre) * 100;

    return {
      totalRegistros: eventosFiltrados.length,
      aprobadas: aprobadas.length,
      pendientes: pendientes.length,
      rechazadas: rechazadas.length,
      horasAprobadas,
      horasPendientes,
      horasRechazadas,
      horasTotales,
      horasPorCumplir,
      progreso
    };
  }, [eventosFiltrados]);

  // Funciones para navegación del calendario
  const mesAnterior = () => {
    setMesSeleccionado(new Date(mesSeleccionado.getFullYear(), mesSeleccionado.getMonth() - 1, 1));
  };

  const mesSiguiente = () => {
    setMesSeleccionado(new Date(mesSeleccionado.getFullYear(), mesSeleccionado.getMonth() + 1, 1));
  };

  const irAHoy = () => {
    setMesSeleccionado(new Date());
  };

  // Generar días del calendario
  const generarDiasCalendario = () => {
    const primerDia = new Date(mesSeleccionado.getFullYear(), mesSeleccionado.getMonth(), 1);
    const ultimoDia = new Date(mesSeleccionado.getFullYear(), mesSeleccionado.getMonth() + 1, 0);
    const diasMesAnterior = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;

    const dias: Array<{ fecha: Date; esMesActual: boolean }> = [];

    for (let i = diasMesAnterior; i > 0; i--) {
      const fecha = new Date(primerDia);
      fecha.setDate(fecha.getDate() - i);
      dias.push({ fecha, esMesActual: false });
    }

    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push({ fecha: new Date(mesSeleccionado.getFullYear(), mesSeleccionado.getMonth(), i), esMesActual: true });
    }

    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      const fecha = new Date(ultimoDia);
      fecha.setDate(fecha.getDate() + i);
      dias.push({ fecha, esMesActual: false });
    }

    return dias;
  };

  // Obtener eventos filtrados para una fecha específica
  const obtenerEventosPorFecha = (fecha: Date): EventoCalendario[] => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return eventosFiltrados.filter(e => e.fecha === fechaStr);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('todos');
    setFiltroArea('todas');
    setFechaInicio('');
    setFechaFin('');
  };

  // Exportar datos
  const exportarDatos = () => {
    const csvContent = [
      ['Fecha', 'Horario', 'Horas', 'Descripción', 'Área', 'Subárea', 'Docente', 'Estado'],
      ...eventosFiltrados.map(e => [
        e.fecha,
        `${e.horaInicio} - ${e.horaFin}`,
        e.totalHoras,
        e.descripcion,
        e.area,
        e.subarea || '',
        e.docenteNombre,
        e.estado
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mis-horas-sociales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Manejar ordenamiento
  const handleOrdenar = (columna: string) => {
    if (ordenColumna === columna) {
      setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenColumna(columna);
      setOrdenDireccion('asc');
    }
  };

  // Ver detalles de evento
  const verDetalles = (evento: EventoCalendario) => {
    setEventoSeleccionado(evento);
    setModalDetallesAbierto(true);
  };

  const dias = generarDiasCalendario();
  const nombreMes = mesSeleccionado.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const hayFiltrosActivos = busqueda || filtroEstado !== 'todos' || filtroArea !== 'todas' || fechaInicio || fechaFin;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#2E7D32]">Mi Asistencia y Registro de Horas</h2>
          <p className="text-gray-600 mt-1">
            Visualiza y filtra tu calendario de horas sociales registradas
          </p>
        </div>
        <Button
          onClick={exportarDatos}
          variant="outline"
          className="border-[#2E7D32] text-[#2E7D32] hover:bg-[#E8F5E9]"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Datos
        </Button>
      </div>

      {/* Info del Estudiante */}
      <Card className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] border-none shadow-sm">
        <CardContent className="p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Estudiante</p>
              <p className="text-xl font-bold">{estudiante.nombre}</p>
              <p className="text-sm text-white/90 mt-1">{estudiante.carrera}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Área Asignada</p>
              <p className="text-lg font-bold">{estudiante.areaActual}</p>
              {estudiante.subarea && <p className="text-sm text-white/90">{estudiante.subarea}</p>}
              <p className="text-xs text-white/80 mt-1">Docente: {estudiante.docenteResponsable}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#2E7D32]/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-[#2E7D32]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Horas Aprobadas</p>
                <p className="text-2xl font-bold text-[#2E7D32]">{estadisticas.horasAprobadas}h</p>
                <p className="text-xs text-gray-400">{estadisticas.aprobadas} registros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#FBC02D]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#FBC02D]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Horas Pendientes</p>
                <p className="text-2xl font-bold text-[#FBC02D]">{estadisticas.horasPendientes}h</p>
                <p className="text-xs text-gray-400">{estadisticas.pendientes} registros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#E53935]/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#E53935]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Por Cumplir</p>
                <p className="text-2xl font-bold text-[#E53935]">{estadisticas.horasPorCumplir}h</p>
                <p className="text-xs text-gray-400">Meta: 50h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#1976D2]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#1976D2]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Progreso</p>
                <p className="text-2xl font-bold text-[#1976D2]">{estadisticas.progreso.toFixed(0)}%</p>
                <p className="text-xs text-gray-400">{estadisticas.totalRegistros} registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros y Toggle de Vista */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Primera fila: Búsqueda y botones */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Búsqueda */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descripción, área, docente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>

              {/* Botón Filtros */}
              <Button
                variant="outline"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={mostrarFiltros ? 'bg-[#E8F5E9] border-[#2E7D32]' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {hayFiltrosActivos && (
                  <Badge className="ml-2 bg-[#2E7D32] text-white">
                    {[busqueda, filtroEstado !== 'todos', filtroArea !== 'todas', fechaInicio, fechaFin].filter(Boolean).length}
                  </Badge>
                )}
              </Button>

              {/* Toggle de Vista */}
              <div className="flex gap-2">
                <Button
                  variant={vistaActiva === 'calendario' ? 'default' : 'outline'}
                  className={vistaActiva === 'calendario' ? 'bg-[#2E7D32] hover:bg-[#66BB6A] text-white' : ''}
                  onClick={() => setVistaActiva('calendario')}
                >
                  <CalendarDays className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Calendario</span>
                </Button>
                <Button
                  variant={vistaActiva === 'tabla' ? 'default' : 'outline'}
                  className={vistaActiva === 'tabla' ? 'bg-[#2E7D32] hover:bg-[#66BB6A] text-white' : ''}
                  onClick={() => setVistaActiva('tabla')}
                >
                  <TableIcon className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Tabla</span>
                </Button>
              </div>
            </div>

            {/* Panel de Filtros Expandible */}
            {mostrarFiltros && (
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Filtro Estado */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Estado</Label>
                    <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        <SelectItem value="aprobada">Aprobada</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="rechazada">Rechazada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro Área */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Área</Label>
                    <Select value={filtroArea} onValueChange={setFiltroArea}>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas las áreas</SelectItem>
                        {areasUnicas.map(area => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fecha Inicio */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Fecha desde</Label>
                    <Input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Fecha Fin */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Fecha hasta</Label>
                    <Input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Segunda fila: Ordenamiento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Ordenar por */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Ordenar por</Label>
                    <Select value={ordenColumna} onValueChange={setOrdenColumna}>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fecha">Fecha</SelectItem>
                        <SelectItem value="horaInicio">Horario</SelectItem>
                        <SelectItem value="totalHoras">Horas</SelectItem>
                        <SelectItem value="area">Área</SelectItem>
                        <SelectItem value="estado">Estado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dirección */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Dirección</Label>
                    <Select value={ordenDireccion} onValueChange={(value: 'asc' | 'desc') => setOrdenDireccion(value)}>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascendente (A-Z, 0-9)</SelectItem>
                        <SelectItem value="desc">Descendente (Z-A, 9-0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botón Limpiar Filtros */}
                {hayFiltrosActivos && (
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={limpiarFiltros}
                      className="text-gray-600 hover:text-[#2E7D32]"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Resultados de filtros */}
            {hayFiltrosActivos && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>
                  Mostrando <strong className="text-blue-600">{eventosFiltrados.length}</strong> de {todosLosEventos.length} registros
                  {estadisticas.horasTotales > 0 && (
                    <> • <strong className="text-blue-600">{estadisticas.horasTotales}h</strong> totales</>
                  )}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vista Calendario */}
      {vistaActiva === 'calendario' && (
        <>
          {/* Calendario */}
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-[#2E7D32] capitalize">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {nombreMes}
                  </div>
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={mesAnterior}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={mesSiguiente}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={irAHoy}
                    className="bg-[#2E7D32] text-white hover:bg-[#66BB6A]"
                  >
                    <CalendarDays className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Encabezado de días de la semana */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
                  <div key={dia} className="text-center font-medium text-sm text-gray-600 py-2">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Grilla del calendario */}
              <div className="grid grid-cols-7 gap-2">
                {dias.map((dia, index) => {
                  const eventosDelDia = obtenerEventosPorFecha(dia.fecha);
                  const tieneEventos = eventosDelDia.length > 0;
                  const esHoy = 
                    dia.fecha.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-2 border rounded-lg ${
                        dia.esMesActual ? 'bg-white' : 'bg-gray-50'
                      } ${esHoy ? 'border-[#2E7D32] border-2' : 'border-gray-200'}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        dia.esMesActual ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {dia.fecha.getDate()}
                      </div>
                      {tieneEventos && (
                        <div className="space-y-1">
                          {eventosDelDia.map((evento, idx) => (
                            <div
                              key={idx}
                              className={`text-xs p-1 rounded ${
                                evento.estado === 'aprobada'
                                  ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/20'
                                  : evento.estado === 'pendiente'
                                  ? 'bg-[#FFF9C4] text-[#F57F17] border border-[#FBC02D]/20'
                                  : 'bg-[#FFEBEE] text-[#C62828] border border-[#E53935]/20'
                              }`}
                              title={evento.descripcion}
                              onClick={() => verDetalles(evento)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span className="font-medium">{evento.totalHoras}h</span>
                              </div>
                              <div className="truncate text-[10px] mt-0.5">
                                {evento.horaInicio} - {evento.horaFin}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#E8F5E9] border border-[#2E7D32]/20"></div>
                  <span className="text-sm text-gray-600">Aprobada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#FFF9C4] border border-[#FBC02D]/20"></div>
                  <span className="text-sm text-gray-600">Pendiente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#FFEBEE] border border-[#E53935]/20"></div>
                  <span className="text-sm text-gray-600">Rechazada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-[#2E7D32]"></div>
                  <span className="text-sm text-gray-600">Hoy</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Registros Recientes */}
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg text-[#2E7D32]">Registros Recientes</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {registrosEstudiante.slice(0, 5).map(registro => (
                  <div key={registro.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={
                            registro.estado === 'aprobada'
                              ? 'text-[#2E7D32] border-[#2E7D32]'
                              : registro.estado === 'pendiente'
                              ? 'text-[#FBC02D] border-[#FBC02D]'
                              : 'text-[#E53935] border-[#E53935]'
                          }
                        >
                          {registro.estado === 'aprobada' ? 'Aprobada' : registro.estado === 'pendiente' ? 'Pendiente' : 'Rechazada'}
                        </Badge>
                        <span className="text-sm font-medium text-gray-700">{registro.fecha}</span>
                      </div>
                      <p className="text-sm text-gray-600">{registro.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {registro.area} {registro.subarea && `- ${registro.subarea}`}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1 text-[#2E7D32]">
                        <Clock className="w-4 h-4" />
                        <span className="font-bold">{registro.totalHoras}h</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {registro.horaInicio} - {registro.horaFin}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Vista Tabla */}
      {vistaActiva === 'tabla' && (
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-[#2E7D32] flex items-center gap-2">
                <TableIcon className="w-5 h-5" />
                Todos los Registros
                <Badge variant="outline" className="ml-2 bg-white text-[#2E7D32] border-[#2E7D32]">
                  {eventosFiltrados.length}
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={exportarDatos}
                className="border-[#2E7D32] text-[#2E7D32] hover:bg-[#E8F5E9]"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {eventosFiltrados.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No tienes registros de horas</p>
                <p className="text-sm text-gray-400 mt-2">
                  {hayFiltrosActivos 
                    ? 'Intenta ajustar los filtros para ver más resultados'
                    : 'Tus registros aparecerán aquí cuando tu docente los registre'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-700 w-[110px]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            Fecha
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[140px]">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            Horario
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[90px]">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            Horas
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 min-w-[300px]">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            Descripción
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[160px]">Área</TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[140px]">Subárea</TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[180px]">Docente</TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[120px] text-center">Estado</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventosOrdenados.map((registro, idx) => (
                        <TableRow 
                          key={registro.id}
                          className={`
                            ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                            hover:bg-[#E8F5E9]/30 transition-colors cursor-pointer border-b border-gray-100 last:border-0
                          `}
                          onClick={() => verDetalles(registro)}
                        >
                          <TableCell className="font-medium text-gray-900">
                            <div className="flex flex-col">
                              <span className="text-sm">{registro.fecha}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(registro.fecha).toLocaleDateString('es-ES', { weekday: 'short' })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="flex flex-col">
                                <span className="font-medium">{registro.horaInicio}</span>
                                <span className="text-xs text-gray-500">a {registro.horaFin}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <div className="px-2.5 py-1 bg-[#E8F5E9] rounded-md border border-[#2E7D32]/20">
                                <span className="font-bold text-[#2E7D32] text-sm">{registro.totalHoras}h</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                              {registro.descripcion}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{registro.area}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {registro.subarea || <span className="text-gray-400">-</span>}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-semibold text-[#2E7D32]">
                                  {registro.docenteNombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                              <span className="text-sm text-gray-700 truncate">{registro.docenteNombre}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={registro.estado} />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#2E7D32] hover:bg-[#E8F5E9]"
                              onClick={(e) => {
                                e.stopPropagation();
                                verDetalles(registro);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Resumen mejorado en vista tabla */}
                <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="p-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
                      Resumen de Registros Filtrados
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Total Registros</p>
                          <p className="text-2xl font-bold text-gray-900">{eventosFiltrados.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-[#2E7D32]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Total Horas</p>
                          <p className="text-2xl font-bold text-[#2E7D32]">{estadisticas.horasTotales}h</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-[#1976D2]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Progreso</p>
                          <p className="text-2xl font-bold text-[#1976D2]">{estadisticas.progreso.toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Desglose por estado */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="p-3 bg-[#E8F5E9] rounded-lg border border-[#2E7D32]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#1B5E20]">Aprobadas</span>
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                        </div>
                        <p className="text-xl font-bold text-[#2E7D32] mt-1">{estadisticas.aprobadas}</p>
                        <p className="text-xs text-[#2E7D32] mt-0.5">{estadisticas.horasAprobadas}h</p>
                      </div>
                      <div className="p-3 bg-[#FFF9C4] rounded-lg border border-[#FBC02D]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#F57F17]">Pendientes</span>
                          <Clock className="w-4 h-4 text-[#FBC02D]" />
                        </div>
                        <p className="text-xl font-bold text-[#FBC02D] mt-1">{estadisticas.pendientes}</p>
                        <p className="text-xs text-[#F57F17] mt-0.5">{estadisticas.horasPendientes}h</p>
                      </div>
                      <div className="p-3 bg-[#FFEBEE] rounded-lg border border-[#E53935]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#C62828]">Rechazadas</span>
                          <AlertCircle className="w-4 h-4 text-[#E53935]" />
                        </div>
                        <p className="text-xl font-bold text-[#E53935] mt-1">{estadisticas.rechazadas}</p>
                        <p className="text-xs text-[#C62828] mt-0.5">{estadisticas.horasRechazadas}h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer Info */}
      <Card className="bg-[#E8F5E9] border-[#2E7D32]/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#2E7D32] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#1B5E20]">
              <p className="font-medium mb-1">Información sobre tu Asistencia:</p>
              <ul className="list-disc list-inside space-y-1 text-[#2E7D32]">
                <li>Esta es una vista de solo lectura. Tu docente responsable registra las horas</li>
                <li>Las horas deben ser aprobadas por la jefatura de carrera para contar hacia tu meta</li>
                <li>Debes completar 50 horas por cuatrimestre (150 horas anuales en total)</li>
                <li>Contacta a tu docente responsable si tienes dudas sobre tus registros</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Detalles */}
      <Dialog open={modalDetallesAbierto} onOpenChange={setModalDetallesAbierto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2E7D32]">Detalles del Registro</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Información detallada sobre el registro seleccionado
            </DialogDescription>
          </DialogHeader>
          {eventoSeleccionado && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">{eventoSeleccionado.fecha}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">
                  {eventoSeleccionado.horaInicio} - {eventoSeleccionado.horaFin}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">
                  {eventoSeleccionado.totalHoras}h
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">
                  {eventoSeleccionado.descripcion}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">
                  {eventoSeleccionado.area} {eventoSeleccionado.subarea && `- ${eventoSeleccionado.subarea}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">
                  Docente: {eventoSeleccionado.docenteNombre}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={eventoSeleccionado.estado} />
                <p className="text-sm font-medium text-gray-700">
                  Estado: {eventoSeleccionado.estado}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};