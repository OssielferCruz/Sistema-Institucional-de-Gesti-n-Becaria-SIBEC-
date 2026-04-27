const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
const ACCESS_TOKEN_KEY = 'sibec_access_token';
const REFRESH_TOKEN_KEY = 'sibec_refresh_token';
const USER_KEY = 'sibec_user';

export interface ApiRole {
  id: string;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiUserSummary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: ApiRole | null;
  is_active: boolean;
}

export interface CareerApiResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  degree_level: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudyPlanApiResponse {
  id: string;
  code: string;
  name: string;
  period_type: string;
  periods_per_year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AreaApiResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubareaApiResponse {
  id: string;
  area: AreaApiResponse;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProfileApiResponse {
  id: string;
  user: ApiUserSummary;
  student_code: string;
  career: CareerApiResponse;
  study_plan: StudyPlanApiResponse;
  admission_year: number;
  scholarship_status: string;
  required_annual_hours: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfileApiResponse {
  id: string;
  user: ApiUserSummary;
  employee_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


export interface StudentProfileApiResponse {
  id: string;
  student_code: string;
  user: ApiUserSummary;
  career: CareerApiResponse;
  study_plan: StudyPlanApiResponse;
  admission_year: number;
  scholarship_status: string;
  required_annual_hours: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentHeadProfileApiResponse {
  id: string;
  user: ApiUserSummary;
  career: CareerApiResponse;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProgressApiResponse {
  student_id: string;
  student_code: string;
  student_name: string;
  study_plan: string;
  career: string;
  approved_hours: string;
  target_hours: string;
  remaining_hours: string;
  policy_name: string | null;
  period_sequence: number | null;
  annual_target_hours: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AssignmentApiResponse {
  id: string;
  student: {
    id: string;
    student_code: string;
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    };
    career: {
      id: string;
      code: string;
      name: string;
    };
    study_plan: {
      id: string;
      code: string;
      name: string;
      period_type: string;
      periods_per_year: number;
    };
  };
  subarea: {
    id: string;
    code: string;
    name: string;
    area: {
      id: string;
      code: string;
      name: string;
    };
  };
  teacher_profile: {
    id: string;
    employee_code: string | null;
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    };
  };
  term: {
    id: string;
    academic_year: number;
    sequence_number: number;
    name: string;
    start_date: string;
    end_date: string;
    is_closed: boolean;
  };
  assigned_at: string;
  end_at: string | null;
  status: string;
  notes: string;
}

export interface HoursLogApiResponse {
  id: string;
  student: string;
  assignment: string;
  teacher_profile: string;
  term: string;
  work_date: string;
  start_time: string;
  end_time: string;
  reported_hours: string;
  description: string;
  status: string;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHoursLogPayload {
  student: string;
  assignment: string;
  teacher_profile: string;
  term: string;
  work_date: string;
  start_time: string;
  end_time: string;
  reported_hours: string;
  description: string;
}

function getAccessToken(): string | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setAccessToken(token: string): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  } catch {
    // Ignore storage write errors.
  }
}

function clearSession(): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }
  } catch {
    // Ignore storage cleanup errors.
  }
}

async function parseErrorDetail(response: Response, fallback: string): Promise<string> {
  let detail = fallback;

  try {
    const payload = await response.json();
    if (payload?.detail) {
      detail = payload.detail;
    }
    if (payload?.non_field_errors?.[0]) {
      detail = payload.non_field_errors[0];
    }
  } catch {
    // Ignore parsing failures.
  }

  return detail;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  try {
    const payload = await response.json() as { access?: string };
    if (!payload.access) {
      return null;
    }
    setAccessToken(payload.access);
    return payload.access;
  } catch {
    return null;
  }
}

function withAuth(init: RequestInit, token: string): RequestInit {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return {
    ...init,
    headers,
  };
}

async function fetchWithAuth(path: string, init: RequestInit): Promise<Response> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('No hay una sesión activa.');
  }

  let response = await fetch(`${API_BASE_URL}${path}`, withAuth(init, accessToken));
  if (response.status !== 401) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    clearSession();
    throw new Error('Sesión expirada. Inicia sesión nuevamente.');
  }

  response = await fetch(`${API_BASE_URL}${path}`, withAuth(init, refreshedToken));
  if (response.status === 401) {
    clearSession();
    throw new Error('Sesión expirada. Inicia sesión nuevamente.');
  }

  return response;
}

async function authRequest<T>(path: string): Promise<T> {
  const response = await fetchWithAuth(path, {
    method: 'GET',
  });

  if (!response.ok) {
    const detail = await parseErrorDetail(response, 'No fue posible consultar el backend.');
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let nextPath: string | null = path;

  while (nextPath) {
    const payload = await authRequest<T[] | PaginatedResponse<T>>(nextPath);

    if (Array.isArray(payload)) {
      items.push(...payload);
      break;
    }

    items.push(...payload.results);
    if (payload.next) {
      const nextUrl = new URL(payload.next, API_BASE_URL);
      nextPath = `${nextUrl.pathname}${nextUrl.search}`;
    } else {
      nextPath = null;
    }
  }

  return items;
}

async function authMutation<T>(path: string, method: 'POST' | 'PATCH', body?: unknown): Promise<T> {
  const response = await fetchWithAuth(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await parseErrorDetail(response, 'No fue posible actualizar la información.');
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export async function fetchStudentProgress(): Promise<StudentProgressApiResponse> {
  return authRequest<StudentProgressApiResponse>('/api/v1/progress/me/');
}

export async function fetchStudents(): Promise<StudentProfileApiResponse[]> {
  return fetchAllPages<StudentProfileApiResponse>('/api/v1/students/');
}

export async function fetchTeachers(): Promise<TeacherProfileApiResponse[]> {
  return fetchAllPages<TeacherProfileApiResponse>('/api/v1/teachers/');
}

export async function fetchDepartmentHeads(): Promise<DepartmentHeadProfileApiResponse[]> {
  return fetchAllPages<DepartmentHeadProfileApiResponse>('/api/v1/department-heads/');
}

export async function fetchAreas(): Promise<AreaApiResponse[]> {
  return fetchAllPages<AreaApiResponse>('/api/v1/areas/');
}

export async function fetchSubareas(): Promise<SubareaApiResponse[]> {
  return fetchAllPages<SubareaApiResponse>('/api/v1/subareas/');
}

export async function fetchStudentAssignments(): Promise<AssignmentApiResponse[]> {
  return fetchAllPages<AssignmentApiResponse>('/api/v1/assignments/');
}

export async function fetchAssignments(): Promise<AssignmentApiResponse[]> {
  return fetchStudentAssignments();
}

export async function fetchStudentHoursLogs(): Promise<HoursLogApiResponse[]> {
  return fetchAllPages<HoursLogApiResponse>('/api/v1/hours-logs/');
}

export async function createHoursLog(payload: CreateHoursLogPayload): Promise<HoursLogApiResponse> {
  return authMutation<HoursLogApiResponse>('/api/v1/hours-logs/', 'POST', payload);
}

export async function approveHoursLog(hoursLogId: string, comments = ''): Promise<HoursLogApiResponse> {
  return authMutation<HoursLogApiResponse>(`/api/v1/hours-logs/${hoursLogId}/approve/`, 'POST', { comments });
}

export async function rejectHoursLog(hoursLogId: string, comments: string): Promise<HoursLogApiResponse> {
  return authMutation<HoursLogApiResponse>(`/api/v1/hours-logs/${hoursLogId}/reject/`, 'POST', { comments });
}

// ─── User Management API ───

export interface CreateUserPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role_id: string;
}

export interface RoleApiResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface TermApiResponse {
  id: string;
  academic_year: number;
  sequence_number: number;
  name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
}

export async function fetchUsers(): Promise<ApiUserSummary[]> {
  const resp = await authRequest<ApiUserSummary[] | PaginatedResponse<ApiUserSummary>>('/api/v1/users/');
  return Array.isArray(resp) ? resp : resp.results;
}

export async function fetchRoles(): Promise<RoleApiResponse[]> {
  return fetchAllPages<RoleApiResponse>('/api/v1/roles/');
}

export async function fetchCareers(): Promise<CareerApiResponse[]> {
  return fetchAllPages<CareerApiResponse>('/api/v1/careers/');
}

export async function fetchStudyPlans(): Promise<StudyPlanApiResponse[]> {
  return fetchAllPages<StudyPlanApiResponse>('/api/v1/study-plans/');
}

export async function fetchTerms(): Promise<TermApiResponse[]> {
  return fetchAllPages<TermApiResponse>('/api/v1/terms/');
}

export async function createUser(payload: CreateUserPayload): Promise<ApiUserSummary> {
  return authMutation<ApiUserSummary>('/api/v1/users/', 'POST', payload);
}

export interface CreateStudentPayload {
  user_id: string;
  student_code: string;
  career_id: string;
  study_plan_id: string;
  admission_year: number;
}

export async function createStudent(payload: CreateStudentPayload): Promise<StudentProfileApiResponse> {
  return authMutation<StudentProfileApiResponse>('/api/v1/students/', 'POST', payload);
}

export interface CreateTeacherPayload {
  user_id: string;
  employee_code?: string;
}

export async function createTeacher(payload: CreateTeacherPayload): Promise<TeacherProfileApiResponse> {
  return authMutation<TeacherProfileApiResponse>('/api/v1/teachers/', 'POST', payload);
}

export interface CreateDepartmentHeadPayload {
  user_id: string;
  career_id: string;
}

export async function createDepartmentHead(payload: CreateDepartmentHeadPayload): Promise<DepartmentHeadProfileApiResponse> {
  return authMutation<DepartmentHeadProfileApiResponse>('/api/v1/department-heads/', 'POST', payload);
}

export interface CreateAssignmentPayload {
  student_id: string;
  subarea_id: string;
  teacher_profile_id: string;
  term_id: string;
}

export async function createAssignment(payload: CreateAssignmentPayload): Promise<AssignmentApiResponse> {
  return authMutation<AssignmentApiResponse>('/api/v1/assignments/', 'POST', payload);
}