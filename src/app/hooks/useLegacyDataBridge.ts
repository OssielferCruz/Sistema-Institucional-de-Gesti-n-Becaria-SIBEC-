import { useCallback, useEffect, useState } from 'react';

import {
  fetchAreas,
  fetchStudentAssignments,
  fetchStudentHoursLogs,
  fetchSubareas,
  fetchTeachers,
  type AssignmentApiResponse,
  type AreaApiResponse,
  type HoursLogApiResponse,
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
  cuatrimestres: string[];
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
}

function fullName(firstName?: string, lastName?: string): string {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}

function toCareerLabel(code: string, name: string): string {
  const normalizedCode = (code || '').toUpperCase();
  return normalizedCode ? `${normalizedCode} - ${name}` : name;
}

function mapLegacy(payload: LegacyPayload): Omit<LegacyDataBridgeResult, 'isLoading' | 'error' | 'refresh'> {
  const { areas, subareas, assignments, logs, teachers } = payload;

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

  const mockEstudiantes: Estudiante[] = Array.from(assignmentsByStudent.entries())
    .map(([studentId, studentAssignments]) => {
      const assignment = studentAssignments[0];
      const approvedHours = logs
        .filter((log) => log.student === studentId && log.status === 'approved')
        .reduce((sum, log) => sum + Number.parseFloat(log.reported_hours), 0);

      const requiredHours = 150;
      const state: Estudiante['estado'] = approvedHours >= requiredHours ? 'completado' : 'activo';

      return {
        id: studentId,
        nombre: fullName(assignment.student.user.first_name, assignment.student.user.last_name),
        matricula: assignment.student.student_code,
        carrera: toCareerLabel(assignment.student.career.code, assignment.student.career.name),
        email: assignment.student.user.email,
        horasRequeridas: requiredHours,
        horasCompletadas: Math.round(approvedHours),
        horasAcumuladas: Math.round(approvedHours),
        horasCompletadasPeriodo: Math.round(approvedHours),
        periodoActual: ((assignment.term.sequence_number - 1) % 3) + 1 as Estudiante['periodoActual'],
        estado: state,
        areaActual: assignment.subarea.area.name,
        subarea: assignment.subarea.name,
        docenteResponsableId: assignment.teacher_profile.id,
        docenteResponsable: fullName(
          assignment.teacher_profile.user.first_name,
          assignment.teacher_profile.user.last_name,
        ),
        cuatrimestre: assignment.term.name,
        cursoAsignado: assignment.subarea.name,
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
        estado: 'aprobada',
        aprobadoPor: teacherName,
        validadoPorJefatura: false,
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

  const cuatrimestres = [
    ...new Set(assignments.map((assignment) => assignment.term.name)),
  ].sort((left, right) => left.localeCompare(right));

  return {
    areas: legacyAreas,
    carreras,
    cuatrimestres,
    mockDocentes,
    mockEstudiantes,
    mockRegistrosHoras,
  };
}

export function useLegacyDataBridge(): LegacyDataBridgeResult {
  const [data, setData] = useState<Omit<LegacyDataBridgeResult, 'isLoading' | 'error' | 'refresh'>>({
    areas: [],
    carreras: [],
    cuatrimestres: [],
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

      const [areas, subareas, assignments, logs, teachers] = await Promise.all([
        fetchAreas(),
        fetchSubareas(),
        fetchStudentAssignments(),
        fetchStudentHoursLogs(),
        fetchTeachers(),
      ]);

      setData(mapLegacy({ areas, subareas, assignments, logs, teachers }));
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
