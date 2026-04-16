import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Outlet } from 'react-router';
import { refreshToken, requestCurrentUser, requestToken } from '../api/authApi';

export type UserRole = 'admin' | 'jefatura' | 'docente' | 'estudiante';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  carrera?: string;
  carrerasAsignadas?: string[]; // Para jefaturas que manejan múltiples carreras
  jefatura?: string; // Identificador de la jefatura (ej: 'IMS/IEL', 'ICE/IEM')
  matricula?: string;
  docenteId?: string; // ID del docente
  estudianteId?: string; // ID del estudiante
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = 'sibec_user';
const STORAGE_ACCESS_TOKEN_KEY = 'sibec_access_token';
const STORAGE_REFRESH_TOKEN_KEY = 'sibec_refresh_token';

function readFromStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem(key);
    }
  } catch (error) {
    console.error(`Error reading storage key ${key}:`, error);
  }
  return null;
}

function writeToStorage(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(key, value);
    }
  } catch (error) {
    console.error(`Error writing storage key ${key}:`, error);
  }
}

function removeFromStorage(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing storage key ${key}:`, error);
  }
}

function mapRole(roleCode?: string | null): UserRole {
  if (roleCode === 'admin' || roleCode === 'jefatura' || roleCode === 'docente' || roleCode === 'estudiante') {
    return roleCode;
  }
  return 'estudiante';
}

function mapApiUserToAuthUser(apiUser: {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: { code: string } | null;
}): User {
  return {
    id: apiUser.id,
    name: `${apiUser.first_name} ${apiUser.last_name}`.trim(),
    email: apiUser.email,
    role: mapRole(apiUser.role?.code),
  };
}

export const AuthProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = sessionStorage.getItem(STORAGE_USER_KEY);
        return stored ? JSON.parse(stored) : null;
      }
    } catch (error) {
      console.error('Error loading user from sessionStorage:', error);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const persistSession = (nextUser: User, access: string, refresh: string) => {
    setUser(nextUser);
    writeToStorage(STORAGE_USER_KEY, JSON.stringify(nextUser));
    writeToStorage(STORAGE_ACCESS_TOKEN_KEY, access);
    writeToStorage(STORAGE_REFRESH_TOKEN_KEY, refresh);
  };

  const clearSession = () => {
    setUser(null);
    removeFromStorage(STORAGE_USER_KEY);
    removeFromStorage(STORAGE_ACCESS_TOKEN_KEY);
    removeFromStorage(STORAGE_REFRESH_TOKEN_KEY);
  };

  useEffect(() => {
    const bootstrapSession = async () => {
      const access = readFromStorage(STORAGE_ACCESS_TOKEN_KEY);
      const refresh = readFromStorage(STORAGE_REFRESH_TOKEN_KEY);

      if (!access || !refresh) {
        setIsLoading(false);
        return;
      }

      try {
        const apiUser = await requestCurrentUser(access);
        const mappedUser = mapApiUserToAuthUser(apiUser);
        setUser(mappedUser);
        writeToStorage(STORAGE_USER_KEY, JSON.stringify(mappedUser));
      } catch {
        try {
          const tokenPayload = await refreshToken(refresh);
          const apiUser = await requestCurrentUser(tokenPayload.access);
          const mappedUser = mapApiUserToAuthUser(apiUser);
          setUser(mappedUser);
          writeToStorage(STORAGE_USER_KEY, JSON.stringify(mappedUser));
          writeToStorage(STORAGE_ACCESS_TOKEN_KEY, tokenPayload.access);
        } catch {
          clearSession();
        }
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  const login = async (email: string, password: string) => {
    const tokenPair = await requestToken(email, password);
    const apiUser = await requestCurrentUser(tokenPair.access);
    const mappedUser = mapApiUserToAuthUser(apiUser);
    persistSession(mappedUser, tokenPair.access, tokenPair.refresh);
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children ?? <Outlet />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};