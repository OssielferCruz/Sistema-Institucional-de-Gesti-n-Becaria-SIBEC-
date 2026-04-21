import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Outlet } from 'react-router';
import { requestCurrentUser, requestToken } from '../api/authApi';
import { fetchDepartmentHeads, fetchStudents, fetchTeachers } from '../api/portalApi';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_KEY = 'sibec_user';
const ACCESS_TOKEN_KEY = 'sibec_access_token';
const REFRESH_TOKEN_KEY = 'sibec_refresh_token';

function mapRole(roleCode?: string): UserRole {
  const normalized = (roleCode ?? '').toLowerCase();
  if (normalized === 'admin') {
    return 'admin';
  }
  if (normalized === 'jefatura' || normalized === 'department_head' || normalized === 'department-head') {
    return 'jefatura';
  }
  if (normalized === 'docente' || normalized === 'teacher') {
    return 'docente';
  }
  return 'estudiante';
}

function toCareerLabel(code: string, name: string): string {
  return code ? `${code.toUpperCase()} - ${name}` : name;
}

function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export const AuthProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from sessionStorage if available
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = sessionStorage.getItem(USER_KEY);
        return stored ? JSON.parse(stored) : null;
      }
    } catch (error) {
      console.error('Error loading user from sessionStorage:', error);
    }
    return null;
  });

  const login = async (email: string, password: string) => {
    const tokens = await requestToken(email, password);

    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    }

    const me = await requestCurrentUser(tokens.access);
    const role = mapRole(me.role?.code);

    const nextUser: User = {
      id: me.id,
      name: fullName(me.first_name, me.last_name),
      email: me.email,
      role,
    };

    if (role === 'jefatura') {
      const heads = await fetchDepartmentHeads();
      const myHead = heads.find((head) => head.user.email.toLowerCase() === me.email.toLowerCase());
      if (myHead) {
        const carrera = toCareerLabel(myHead.career.code, myHead.career.name);
        nextUser.carrera = carrera;
        nextUser.carrerasAsignadas = [carrera];
        nextUser.jefatura = myHead.career.code;
      }
    }

    if (role === 'docente') {
      const teachers = await fetchTeachers();
      const myTeacher = teachers.find((teacher) => teacher.user.email.toLowerCase() === me.email.toLowerCase());
      if (myTeacher) {
        nextUser.docenteId = myTeacher.id;
      }
    }

    if (role === 'estudiante') {
      const students = await fetchStudents();
      const myStudent = students.find((student) => student.user.email.toLowerCase() === me.email.toLowerCase());
      if (myStudent) {
        nextUser.estudianteId = myStudent.id;
        nextUser.matricula = myStudent.student_code;
        nextUser.carrera = toCareerLabel(myStudent.career.code, myStudent.career.name);
      }
    }

    setUser(nextUser);

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      }
    } catch (error) {
      console.error('Error saving user to sessionStorage:', error);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error removing user from sessionStorage:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user 
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