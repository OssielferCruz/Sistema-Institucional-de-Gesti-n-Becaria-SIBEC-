export interface Estudiante {
  id: string;
  nombre: string;
  matricula: string;
  carrera: string;
  email: string;
  horasRequeridas: number;
  horasCompletadas: number;
  horasAcumuladas: number;
  horasCompletadasPeriodo: number;
  periodoActual: 1 | 2 | 3;
  estado: 'activo' | 'inactivo' | 'completado';
  areaActual?: string;
  subarea?: string;
  docenteResponsableId?: string;
  docenteResponsable?: string;
  cuatrimestre: string;
  cursoAsignado?: string;
}

export interface Docente {
  id: string;
  nombre: string;
  email: string;
  area: string;
  subarea?: string;
  jefaturaAsignada?: string;
  carrerasAsignadas?: string[];
  estudiantesAsignados: string[];
}

export interface RegistroHora {
  id: string;
  estudianteId: string;
  estudianteNombre: string;
  docenteId: string;
  docenteNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  totalHoras: number;
  descripcion: string;
  area: string;
  subarea?: string;
  carrera: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  aprobadoPor?: string;
  fechaAprobacion?: string;
  comentario?: string;
}

export interface Subarea {
  id: string;
  nombre: string;
  descripcion?: string;
  tieneEncargado: boolean;
}

export interface Area {
  id: string;
  nombre: string;
  descripcion: string;
  subareas?: Subarea[];
}