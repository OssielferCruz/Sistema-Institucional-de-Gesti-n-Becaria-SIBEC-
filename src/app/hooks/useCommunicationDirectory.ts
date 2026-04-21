import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import {
  AssignmentApiResponse,
  AreaApiResponse,
  DepartmentHeadProfileApiResponse,
  fetchAssignments,
  fetchAreas,
  fetchDepartmentHeads,
  fetchStudents,
  fetchTeachers,
  StudentProfileApiResponse,
  TeacherProfileApiResponse,
} from '../api/portalApi';

export interface CommunicationDirectoryData {
  students: StudentProfileApiResponse[];
  teachers: TeacherProfileApiResponse[];
  departmentHeads: DepartmentHeadProfileApiResponse[];
  assignments: AssignmentApiResponse[];
  areas: AreaApiResponse[];
  currentStudent: StudentProfileApiResponse | null;
  currentTeacher: TeacherProfileApiResponse | null;
  currentDepartmentHead: DepartmentHeadProfileApiResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useCommunicationDirectory(): CommunicationDirectoryData {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentProfileApiResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfileApiResponse[]>([]);
  const [departmentHeads, setDepartmentHeads] = useState<DepartmentHeadProfileApiResponse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentApiResponse[]>([]);
  const [areas, setAreas] = useState<AreaApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDirectory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [studentsResponse, teachersResponse, departmentHeadsResponse, assignmentsResponse, areasResponse] = await Promise.all([
          fetchStudents(),
          fetchTeachers(),
          fetchDepartmentHeads(),
          fetchAssignments(),
          fetchAreas(),
        ]);

        if (!mounted) {
          return;
        }

        setStudents(studentsResponse);
        setTeachers(teachersResponse);
        setDepartmentHeads(departmentHeadsResponse);
        setAssignments(assignmentsResponse);
        setAreas(areasResponse);
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la comunicación.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDirectory();

    return () => {
      mounted = false;
    };
  }, []);

  const currentStudent = useMemo(() => {
    if (!user?.email) {
      return null;
    }

    return students.find((student) => student.user.email.toLowerCase() === user.email.toLowerCase()) ?? null;
  }, [students, user?.email]);

  const currentTeacher = useMemo(() => {
    if (!user?.email) {
      return null;
    }

    return teachers.find((teacher) => teacher.user.email.toLowerCase() === user.email.toLowerCase()) ?? null;
  }, [teachers, user?.email]);

  const currentDepartmentHead = useMemo(() => {
    if (!user?.email) {
      return null;
    }

    return departmentHeads.find((departmentHead) => departmentHead.user.email.toLowerCase() === user.email.toLowerCase()) ?? null;
  }, [departmentHeads, user?.email]);

  return {
    students,
    teachers,
    departmentHeads,
    assignments,
    areas,
    currentStudent,
    currentTeacher,
    currentDepartmentHead,
    isLoading,
    error,
  };
}
