const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
const ACCESS_TOKEN_KEY = 'sibec_access_token';

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

async function authRequest<T>(path: string): Promise<T> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('No hay una sesión activa.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    let detail = 'No fue posible consultar el backend.';
    try {
      const payload = await response.json();
      if (payload?.detail) {
        detail = payload.detail;
      }
    } catch {
      // Ignore parsing failures.
    }

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
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('No hay una sesión activa.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    let detail = 'No fue posible actualizar la información.';
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

    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export async function fetchStudentProgress(): Promise<StudentProgressApiResponse> {
  return authRequest<StudentProgressApiResponse>('/api/v1/progress/me/');
}

export async function fetchStudentAssignments(): Promise<AssignmentApiResponse[]> {
  return fetchAllPages<AssignmentApiResponse>('/api/v1/assignments/');
}

export async function fetchStudentHoursLogs(): Promise<HoursLogApiResponse[]> {
  return fetchAllPages<HoursLogApiResponse>('/api/v1/hours-logs/');
}

export async function approveHoursLog(hoursLogId: string, comments: string): Promise<HoursLogApiResponse> {
  return authMutation<HoursLogApiResponse>(`/api/v1/hours-logs/${hoursLogId}/approve/`, 'POST', { comments });
}

export async function rejectHoursLog(hoursLogId: string, comments: string): Promise<HoursLogApiResponse> {
  return authMutation<HoursLogApiResponse>(`/api/v1/hours-logs/${hoursLogId}/reject/`, 'POST', { comments });
}