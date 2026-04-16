import { useEffect, useState } from 'react';

import {
  AssignmentApiResponse,
  fetchStudentAssignments,
  fetchStudentHoursLogs,
  fetchStudentProgress,
  HoursLogApiResponse,
  StudentProgressApiResponse,
} from '../api/portalApi';

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export interface StudentPortalChartPoint {
  mes: string;
  horas: number;
}

export interface StudentPortalAssignment {
  area: string;
  subarea: string;
  responsable: string;
  carrera: string;
  periodo: string;
}

export interface StudentPortalData {
  progress: StudentProgressApiResponse | null;
  assignment: StudentPortalAssignment | null;
  assignmentRecord: AssignmentApiResponse | null;
  recentLogs: HoursLogApiResponse[];
  chartData: StudentPortalChartPoint[];
  isLoading: boolean;
  error: string | null;
}

function buildAssignment(currentAssignment?: AssignmentApiResponse | null): StudentPortalAssignment | null {
  if (!currentAssignment) {
    return null;
  }

  return {
    area: currentAssignment.subarea.area.name,
    subarea: currentAssignment.subarea.name,
    responsable: `${currentAssignment.teacher_profile.user.first_name} ${currentAssignment.teacher_profile.user.last_name}`.trim(),
    carrera: currentAssignment.student.career.name,
    periodo: currentAssignment.term.name,
  };
}

function buildChartData(logs: HoursLogApiResponse[]): StudentPortalChartPoint[] {
  const points = logs.reduce<Record<string, number>>((accumulator, log) => {
    const monthKey = log.work_date.slice(0, 7);
    accumulator[monthKey] = (accumulator[monthKey] ?? 0) + Number(log.reported_hours);
    return accumulator;
  }, {});

  return Object.entries(points)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([monthKey, hours]) => {
      const monthIndex = Number(monthKey.slice(5, 7)) - 1;
      return {
        mes: MONTH_LABELS[monthIndex] ?? monthKey,
        horas: Number(hours.toFixed(2)),
      };
    });
}

export function useStudentPortalData(): StudentPortalData {
  const [progress, setProgress] = useState<StudentProgressApiResponse | null>(null);
  const [assignment, setAssignment] = useState<StudentPortalAssignment | null>(null);
  const [assignmentRecord, setAssignmentRecord] = useState<AssignmentApiResponse | null>(null);
  const [recentLogs, setRecentLogs] = useState<HoursLogApiResponse[]>([]);
  const [chartData, setChartData] = useState<StudentPortalChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPortalData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [progressResponse, assignmentsResponse, logsResponse] = await Promise.all([
          fetchStudentProgress(),
          fetchStudentAssignments(),
          fetchStudentHoursLogs(),
        ]);

        const currentAssignment = assignmentsResponse.find(
          (item) => item.student.id === progressResponse.student_id && item.status === 'active',
        ) ?? assignmentsResponse.find((item) => item.student.id === progressResponse.student_id) ?? null;

        const sortedLogs = [...logsResponse].sort((left, right) => right.work_date.localeCompare(left.work_date));

        if (!mounted) {
          return;
        }

        setProgress(progressResponse);
        setAssignment(buildAssignment(currentAssignment));
        setAssignmentRecord(currentAssignment);
        setRecentLogs(sortedLogs.slice(0, 6));
        setChartData(buildChartData(sortedLogs));
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la información del estudiante.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPortalData();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    progress,
    assignment,
    assignmentRecord,
    recentLogs,
    chartData,
    isLoading,
    error,
  };
}