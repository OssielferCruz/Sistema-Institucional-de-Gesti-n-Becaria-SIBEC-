import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Outlet } from 'react-router';
import { mockUsers } from '../data/mockData';

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

export const AuthProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from sessionStorage if available
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = sessionStorage.getItem('sibec_user');
        return stored ? JSON.parse(stored) : null;
      }
    } catch (error) {
      console.error('Error loading user from sessionStorage:', error);
    }
    return null;
  });

  const login = async (email: string, password: string) => {
    // Simulación de login (delay reducido para mejor UX)
    await new Promise(resolve => setTimeout(resolve, 100));

    const foundUserData = mockUsers[email];
    if (foundUserData && foundUserData.password === password) {
      // Crear objeto de usuario sin el password
      const { password: _, ...userWithoutPassword } = foundUserData;

      setUser(userWithoutPassword as User);

      // Guardar en sessionStorage si está disponible
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('sibec_user', JSON.stringify(userWithoutPassword));
        }
      } catch (error) {
        console.error('Error saving user to sessionStorage:', error);
      }
    } else {
      throw new Error('Credenciales inválidas');
    }
  };

  const logout = () => {
    setUser(null);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem('sibec_user');
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