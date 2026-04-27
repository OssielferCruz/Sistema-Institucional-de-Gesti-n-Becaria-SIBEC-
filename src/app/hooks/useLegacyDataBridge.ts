import { useCallback, useEffect, useState } from 'react';

import {
  fetchAreas,
  fetchStudentAssignments,
  fetchStudentHoursLogs,
  fetchStudents,
  fetchSubareas,
  fetchTeachers,
  type AssignmentApiResponse,
  type AreaApiResponse,
  type HoursLogApiResponse,
  type StudentProfileApiResponse,
  type SubareaApiResponse,
  type TeacherProfileApiResponse,
} from '../api/portalApi';
import type { Area, Docente, Estudiante, RegistroHora } from '../types/domain';

export type RegistroHoraExtended = RegistroHora & {
  validadoPorJefatura?: boolean;
  rechazadoPorJefatura?: boolean;
};

export interface LegacyDataBridgeResult {
  areas: Area[];
  carreras: string[];
  Periodos: string[];
  mockDocentes: Docente[];
  mockEstudiantes: Estudiante[];
  mockRegistrosHoras: RegistroHoraExtended[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface LegacyPayload {
  areas: AreaApiResponse[];
  subareas: SubareaApiResponse[];
  assignments: AssignmentApiResponse[];
  logs: HoursLogApiResponse[];
  teachers: TeacherProfileApiResponse[];
  students: StudentProfileApiResponse[];
}

function fullName(firstName?: string, lastName?: string): string {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}

function toCareerLabel(code: string, name: string): string {
  const normalizedCode = (code || '').toUpperCase();
  return normalizedCode ? `${normalizedCode} - ${name}` : name;
}

function mapLegacy(payload: LegacyPayload): Omit<LegacyDataBridgeResult, 'isLoading' | 'error' | 'refresh'> {
  const { areas, subareas, assignments, logs, teachers, students } = payload;

  const assignmentsByTeacher = new Map<string, AssignmentApiResponse[]>();
  const assignmentsByStudent = new Map<string, AssignmentApiResponse[]>();
  const assignmentById = new Map<string, AssignmentApiResponse>();

  assignments.forEach((assignment) => {
    const teacherAssignments = assignmentsByTeacher.get(assignment.teacher_profile.id) ?? [];
    teacherAssignments.push(assignment);
    assignmentsByTeacher.set(assignment.teacher_profile.id, teacherAssignments);

    const studentAssignments = assignmentsByStudent.get(assignment.student.id) ?? [];
    studentAssignments.push(assignment);
    assignmentsByStudent.set(assignment.student.id, studentAssignments);

    assignmentById.set(assignment.id, assignment);
  });

  const legacyAreas: Area[] = areas
    .map((area) => ({
      id: area.code || area.id,
      nombre: area.name,
      descripcion: area.description || '',
      subareas: subareas
        .filter((subarea) => subarea.area.id === area.id)
        .map((subarea) => ({
          id: subarea.code || subarea.id,
          nombre: subarea.name,
          descripcion: subarea.description || '',
          tieneEncargado: true,
        })),
    }))
    .sort((left, right) => left.nombre.localeCompare(right.nombre));

  const mockDocentes: Docente[] = teachers
    .map((teacher) => {
      const teacherAssignments = assignmentsByTeacher.get(teacher.id) ?? [];
      const firstAssignment = teacherAssignments[0];

      return {
        id: teacher.id,
        nombre: fullName(teacher.user.first_name, teacher.user.last_name),
        email: teacher.user.email,
        area: firstAssignment?.subarea.area.name ?? 'Sin área',
        subarea: firstAssignment?.subarea.name,
        carrerasAsignadas: [
          ...new Set(
            teacherAssignments.map((assignment) =>
              toCareerLabel(assignment.student.career.code, assignment.student.career.name),
            ),
          ),
        ],
        estudiantesAsignados: [...new Set(teacherAssignments.map((assignment) => assignment.student.id))],
      };
    })
    .sort((left, right) => left.nombre.localeCompare(right.nombre));

  const mockEstudiantes: Estudiante[] = students
    .map((student) => {
      const studentAssignments = assignmentsByStudent.get(student.id) ?? [];
      const assignment = studentAssignments[0];
      const approvedHours = logs
        .filter((log) => log.student === student.id && log.status === 'approved')
        .reduce((sum, log) => sum + Number.parseFloat(log.reported_hours), 0);

      const requiredHours = 150;
      const state: Estudiante['estado'] = approvedHours >= requiredHours ? 'completado' : 'activo';

      return {
        id: student.id,
        nombre: fullName(student.user.first_name, student.user.last_name),
        matricula: student.student_code,
        carrera: toCareerLabel(student.career.code, student.career.name),
        email: student.user.email,
        horasRequeridas: requiredHours,
        horasCompletadas: Math.round(approvedHours),
        horasAcumuladas: Math.round(approvedHours),
        horasCompletadasPeriodo: Math.round(approvedHours),
        periodoActual: assignment ? (((assignment.term.sequence_number - 1) % 3) + 1 as Estudiante['periodoActual']) : 1,
        estado: state,
        planEstudio: (student.study_plan.name === 'Trimestral' ? 'Trimestral' : 'Cuatrimestral') as Estudiante['planEstudio'],
        areaActual: assignment?.subarea.area.name ?? 'Sin Asignar',
        subarea: assignment?.subarea.name ?? 'Sin Asignar',
        docenteResponsableId: assignment?.teacher_profile.id ?? '',
        docenteResponsable: assignment ? fullName(
          assignment.teacher_profile.user.first_name,
          assignment.teacher_profile.user.last_name,
        ) : 'Sin Docente',
        periodo: assignment?.term.name ?? 'No especificado',
        cursoAsignado: assignment?.subarea.name ?? 'Sin Asignar',
      };
    })
    .sort((left, right) => left.nombre.localeCompare(right.nombre));

  const mockRegistrosHoras: RegistroHoraExtended[] = logs
    .map((log) => {
      const assignment = assignmentById.get(log.assignment);
      if (!assignment) {
        return null;
      }

      const studentName = fullName(assignment.student.user.first_name, assignment.student.user.last_name);
      const teacherName = fullName(
        assignment.teacher_profile.user.first_name,
        assignment.teacher_profile.user.last_name,
      );

      const base: RegistroHoraExtended = {
        id: log.id,
        estudianteId: assignment.student.id,
        estudianteNombre: studentName,
        docenteId: assignment.teacher_profile.id,
        docenteNombre: teacherName,
        fecha: log.work_date,
        horaInicio: log.start_time,
        horaFin: log.end_time,
        totalHoras: Number.parseFloat(log.reported_hours),
        descripcion: log.description,
        area: assignment.subarea.area.name,
        subarea: assignment.subarea.name,
        carrera: toCareerLabel(assignment.student.career.code, assignment.student.career.name),
        estado: 'pendiente',
      };

      if (log.status === 'approved') {
        return {
          ...base,
          estado: 'aprobada',
          aprobadoPor: 'Jefatura de Carrera',
          fechaAprobacion: log.updated_at,
          validadoPorJefatura: true,
        };
      }

      if (log.status === 'rejected') {
        return {
          ...base,
          estado: 'rechazada',
          aprobadoPor: 'Jefatura de Carrera',
          fechaAprobacion: log.updated_at,
          rechazadoPorJefatura: true,
        };
      }

      return {
        ...base,
        estado: 'pendiente',
      };
    })
    .filter((value): value is RegistroHoraExtended => value !== null)
    .sort((left, right) => new Date(right.fecha).getTime() - new Date(left.fecha).getTime());

  const carreras = [
    ...new Set(
      assignments.map((assignment) =>
        toCareerLabel(assignment.student.career.code, assignment.student.career.name),
      ),
    ),
  ].sort((left, right) => left.localeCompare(right));

  const Periodos = [
    ...new Set(assignments.map((assignment) => assignment.term.name)),
  ].sort((left, right) => left.localeCompare(right));

  return {
    areas: legacyAreas,
    carreras,
    Periodos,
    mockDocentes,
    mockEstudiantes,
    mockRegistrosHoras,
  };
}

export function useLegacyDataBridge(): LegacyDataBridgeResult {
  const [data, setData] = useState<Omit<LegacyDataBridgeResult, 'isLoading' | 'error' | 'refresh'>>({
    areas: [],
    carreras: [],
    Periodos: [],
    mockDocentes: [],
    mockEstudiantes: [],
    mockRegistrosHoras: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [areas, subareas, assignments, logs, teachers, students] = await Promise.all([
        fetchAreas(),
        fetchSubareas(),
        fetchStudentAssignments(),
        fetchStudentHoursLogs(),
        fetchTeachers(),
        fetchStudents(),
      ]);

      setData(mapLegacy({ areas, subareas, assignments, logs, teachers, students }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la información.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...data,
    isLoading,
    error,
    refresh: load,
  };
}
