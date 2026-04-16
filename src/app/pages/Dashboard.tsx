import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardAdmin } from './dashboards/DashboardAdmin';
import { DashboardJefatura } from './dashboards/DashboardJefatura';
import { DashboardDocente } from './dashboards/DashboardDocente';
import { DashboardEstudiante } from './dashboards/DashboardEstudiante';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <DashboardAdmin />;
    case 'jefatura':
      return <DashboardJefatura />;
    case 'docente':
      return <DashboardDocente />;
    case 'estudiante':
      return <DashboardEstudiante />;
    default:
      return null;
  }
};
