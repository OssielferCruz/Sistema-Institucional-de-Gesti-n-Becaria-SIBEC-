import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Users, LayoutGrid, List, Search, Mail, GraduationCap, Calendar, Clock, User, BookOpen, Download, Filter } from 'lucide-react';
import { mockEstudiantes, mockDocentes } from '../data/mockData';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

type VistaType = 'cards' | 'tabla';

export const MisEstudiantes: React.FC = () => {
  const [vista, setVista] = useState<VistaType>('tabla');
  const [busqueda, setBusqueda] = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCurso, setFiltroCurso] = useState('todos');

  // Obtener el docente actual (en un caso real vendría del contexto de auth)
  const docenteActualId = 'doc-1'; // Dr. Roberto Méndez
  const docenteActual = mockDocentes.find(d => d.id === docenteActualId);

  // Filtrar estudiantes asignados al docente
  const estudiantesAsignados = useMemo(() => {
    return mockEstudiantes.filter(est => 
      docenteActual?.estudiantesAsignados.includes(est.id)
    );
  }, [docenteActual]);

  // Aplicar filtros de búsqueda
  const estudiantesFiltrados = useMemo(() => {
    return estudiantesAsignados.filter(est => {
      const matchBusqueda = !busqueda ||
        est.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        est.matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
        est.email.toLowerCase().includes(busqueda.toLowerCase());

      const matchCarrera = filtroCarrera === 'todas' || est.carrera === filtroCarrera;
      const matchEstado = filtroEstado === 'todos' || est.estado === filtroEstado;
      const matchCurso = filtroCurso === 'todos' || est.cursoAsignado === filtroCurso;

      return matchBusqueda && matchCarrera && matchEstado && matchCurso;
    });
  }, [estudiantesAsignados, busqueda, filtroCarrera, filtroEstado, filtroCurso]);

  // Obtener carreras únicas
  const carrerasUnicas = useMemo(() => {
    return Array.from(new Set(estudiantesAsignados.map(e => e.carrera)));
  }, [estudiantesAsignados]);

  // Obtener cursos únicos
  const cursosUnicos = useMemo(() => {
    return Array.from(new Set(estudiantesAsignados.map(e => e.cursoAsignado).filter(Boolean)));
  }, [estudiantesAsignados]);

  // Función para obtener año del estudiante basado en el cuatrimestre
  const obtenerAnio = (cuatrimestre: string): string => {
    // Esto es un ejemplo, podrías tener un campo específico de año
    const anios = ['Primer Año', 'Segundo Año', 'Tercer Año', 'Cuarto Año'];
    return anios[Math.floor(Math.random() * anios.length)]; // Simulado
  };

  // Función para obtener modalidad (simulada)
  const obtenerModalidad = (): string => {
    const modalidades = ['Presencial', 'Semi-presencial', 'Virtual'];
    return modalidades[Math.floor(Math.random() * modalidades.length)];
  };

  // Función para obtener tiempo semanal disponible (simulado - solo número)
  const obtenerTiempoDisponible = (): number => {
    const tiempos = [10, 12, 15, 18, 20];
    return tiempos[Math.floor(Math.random() * tiempos.length)];
  };

  // Función para generar correo institucional a partir del nombre
  const generarCorreoInstitucional = (nombreCompleto: string): string => {
    const partes = nombreCompleto.trim().split(' ');
    if (partes.length < 2) return 'estudiante@est.ulsa.edu.ni';
    
    const primerNombre = partes[0].toLowerCase();
    // Buscar el primer apellido (generalmente después de los nombres)
    // Para nombres como "Juan Carlos Pérez García", queremos "juan.perez"
    // Asumimos que los primeros 1-2 elementos son nombres, el resto apellidos
    const primerApellido = partes.length > 2 ? partes[2].toLowerCase() : partes[1].toLowerCase();
    
    // Reemplazar caracteres especiales
    const correo = `${primerNombre}.${primerApellido}@est.ulsa.edu.ni`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Eliminar acentos
    
    return correo;
  };

  // Función para exportar a CSV
  const exportarCSV = () => {
    const headers = ['No. Carnet', 'Nombres', 'Carrera', 'Año', 'Modalidad', 'Correo', 'Curso que Apoya', 'Asignatura/Área', 'Docente', 'Tiempo Semanal'];
    const rows = estudiantesFiltrados.map((est, index) => [
      est.matricula,
      est.nombre,
      est.carrera,
      obtenerAnio(est.cuatrimestre),
      obtenerModalidad(),
      generarCorreoInstitucional(est.nombre),
      est.cursoAsignado || 'Sin curso',
      est.areaActual || 'No asignada',
      est.docenteResponsable || docenteActual?.nombre || 'N/A',
      obtenerTiempoDisponible()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mis_estudiantes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#2E7D32]">Mis Estudiantes Asignados</h2>
        <p className="text-gray-600 mt-1">
          Información completa de los {estudiantesAsignados.length} estudiantes bajo tu responsabilidad
        </p>
      </div>

      {/* Barra de herramientas */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, matrícula o correo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por Carrera */}
            <Select value={filtroCarrera} onValueChange={setFiltroCarrera}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por carrera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las carreras</SelectItem>
                {carrerasUnicas.map(carrera => (
                  <SelectItem key={carrera} value={carrera}>{carrera}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por Curso */}
            <Select value={filtroCurso} onValueChange={setFiltroCurso}>
              <SelectTrigger className="w-full lg:w-[220px]">
                <BookOpen className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los cursos</SelectItem>
                {cursosUnicos.map(curso => (
                  <SelectItem key={curso} value={curso!}>{curso}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por Estado */}
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
                <SelectItem value="completado">Completados</SelectItem>
              </SelectContent>
            </Select>

            {/* Toggle de Vista */}
            <div className="flex gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
              <Button
                variant={vista === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVista('cards')}
                className={vista === 'cards' ? 'bg-[#2E7D32] hover:bg-[#66BB6A]' : ''}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Cards
              </Button>
              <Button
                variant={vista === 'tabla' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVista('tabla')}
                className={vista === 'tabla' ? 'bg-[#2E7D32] hover:bg-[#66BB6A]' : ''}
              >
                <List className="w-4 h-4 mr-2" />
                Tabla
              </Button>
            </div>

            {/* Botón Exportar */}
            <Button
              variant="outline"
              onClick={exportarCSV}
              className="border-[#2E7D32] text-[#2E7D32] hover:bg-[#E8F5E9]"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Información de filtros activos */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              Mostrando <span className="font-bold text-[#2E7D32]">{estudiantesFiltrados.length}</span> de {estudiantesAsignados.length} estudiantes
            </span>
            {(busqueda || filtroCarrera !== 'todas' || filtroEstado !== 'todos' || filtroCurso !== 'todos') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBusqueda('');
                  setFiltroCarrera('todas');
                  setFiltroEstado('todos');
                  setFiltroCurso('todos');
                }}
                className="text-[#2E7D32] hover:bg-[#E8F5E9]"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vista Cards */}
      {vista === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estudiantesFiltrados.map((estudiante) => {
            const progreso = (estudiante.horasCompletadas / estudiante.horasRequeridas) * 100;
            return (
              <Card key={estudiante.id} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {estudiante.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-gray-900 truncate">
                        {estudiante.nombre}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{estudiante.matricula}</p>
                      <StatusBadge status={estudiante.estado} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Carrera */}
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Carrera</p>
                      <p className="text-sm text-gray-900 font-medium truncate" title={estudiante.carrera}>
                        {estudiante.carrera}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Correo</p>
                      <p className="text-sm text-gray-900 truncate" title={generarCorreoInstitucional(estudiante.nombre)}>
                        {generarCorreoInstitucional(estudiante.nombre)}
                      </p>
                    </div>
                  </div>

                  {/* Curso que Apoya */}
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Curso que Apoya</p>
                      <p className="text-sm text-blue-900 font-semibold">
                        📚 {estudiante.cursoAsignado || 'Sin curso asignado'}
                      </p>
                    </div>
                  </div>

                  {/* Área */}
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Área Asignada</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {estudiante.areaActual || 'No asignada'}
                      </p>
                    </div>
                  </div>

                  {/* Progreso */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-500">Progreso Anual</p>
                      <p className="text-xs font-bold text-[#2E7D32]">
                        {estudiante.horasCompletadas}/{estudiante.horasRequeridas}h
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#2E7D32] h-2 rounded-full transition-all"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">{progreso.toFixed(0)}%</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Vista Tabla */}
      {vista === 'tabla' && (
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A]">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Información Detallada de Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">#</TableHead>
                    <TableHead className="font-semibold text-gray-700">No. Carnet</TableHead>
                    <TableHead className="font-semibold text-gray-700">Nombres</TableHead>
                    <TableHead className="font-semibold text-gray-700">Carrera</TableHead>
                    <TableHead className="font-semibold text-gray-700">Año</TableHead>
                    <TableHead className="font-semibold text-gray-700">Modalidad</TableHead>
                    <TableHead className="font-semibold text-gray-700">Correo</TableHead>
                    <TableHead className="font-semibold text-gray-700">Curso que Apoya</TableHead>
                    <TableHead className="font-semibold text-gray-700">Asignatura/Área</TableHead>
                    <TableHead className="font-semibold text-gray-700">Docente</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tiempo Semanal</TableHead>
                    <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estudiantesFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No se encontraron estudiantes con los filtros aplicados</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    estudiantesFiltrados.map((estudiante, index) => (
                      <TableRow key={estudiante.id} className="hover:bg-gray-50">
                        {/* Número */}
                        <TableCell className="font-medium text-gray-600">
                          {index + 1}
                        </TableCell>

                        {/* No. Carnet (Matrícula) */}
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-mono">
                            {estudiante.matricula}
                          </Badge>
                        </TableCell>

                        {/* Nombres */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {estudiante.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900">{estudiante.nombre}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Carrera */}
                        <TableCell className="max-w-xs">
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
                            <p className="text-sm text-gray-700 truncate" title={estudiante.carrera}>
                              {estudiante.carrera}
                            </p>
                          </div>
                        </TableCell>

                        {/* Año */}
                        <TableCell>
                          <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                            {obtenerAnio(estudiante.cuatrimestre)}
                          </Badge>
                        </TableCell>

                        {/* Modalidad */}
                        <TableCell>
                          <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                            {obtenerModalidad()}
                          </Badge>
                        </TableCell>

                        {/* Correo */}
                        <TableCell className="max-w-[200px]">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                            <a
                              href={`mailto:${generarCorreoInstitucional(estudiante.nombre)}`}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                              title={generarCorreoInstitucional(estudiante.nombre)}
                            >
                              {generarCorreoInstitucional(estudiante.nombre)}
                            </a>
                          </div>
                        </TableCell>

                        {/* Curso que Apoya */}
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300" variant="outline">
                            📚 {estudiante.cursoAsignado || 'Sin curso'}
                          </Badge>
                        </TableCell>

                        {/* Asignatura/Área */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
                            <Badge className="bg-[#2E7D32] text-white">
                              {estudiante.areaActual || 'No asignada'}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Docente */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-gray-400 shrink-0" />
                            <p className="text-sm text-gray-700">
                              {estudiante.docenteResponsable || docenteActual?.nombre || 'N/A'}
                            </p>
                          </div>
                        </TableCell>

                        {/* Tiempo Semanal Disponible */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                            <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                              {obtenerTiempoDisponible()}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Estado */}
                        <TableCell>
                          <StatusBadge status={estudiante.estado} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Footer con estadísticas */}
            {estudiantesFiltrados.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Estudiantes</p>
                    <p className="text-xl font-bold text-[#2E7D32]">{estudiantesFiltrados.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Activos</p>
                    <p className="text-xl font-bold text-green-600">
                      {estudiantesFiltrados.filter(e => e.estado === 'activo').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Carreras</p>
                    <p className="text-xl font-bold text-blue-600">
                      {new Set(estudiantesFiltrados.map(e => e.carrera)).size}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Promedio Horas</p>
                    <p className="text-xl font-bold text-purple-600">
                      {(estudiantesFiltrados.reduce((sum, e) => sum + e.horasCompletadas, 0) / estudiantesFiltrados.length).toFixed(1)}h
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay estudiantes */}
      {estudiantesAsignados.length === 0 && (
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes estudiantes asignados</h3>
            <p className="text-gray-600">
              Cuando se te asignen estudiantes, aparecerán aquí con toda su información.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};