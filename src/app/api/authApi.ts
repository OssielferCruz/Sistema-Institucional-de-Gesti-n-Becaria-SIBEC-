const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface MeResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: {
    id: string;
    code: 'admin' | 'jefatura' | 'docente' | 'estudiante';
    name: string;
    description?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  } | null;
  is_active: boolean;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const payload = await response.json();
      if (payload?.detail) {
        errorMessage = payload.detail;
      }
    } catch {
      // Keep default message when response payload is not JSON.
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export async function requestToken(email: string, password: string): Promise<TokenPair> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<TokenPair>(response);
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  });

  return parseResponse<{ access: string }>(response);
}

export async function requestCurrentUser(access: string): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/me/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  return parseResponse<MeResponse>(response);
}
