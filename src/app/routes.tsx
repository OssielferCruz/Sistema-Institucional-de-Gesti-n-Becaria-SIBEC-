import { createBrowserRouter, redirect } from 'react-router';
import Login from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Estudiantes } from './pages/Estudiantes';
import { Asignaciones } from './pages/Asignaciones';
import { RegistroHoras } from './pages/RegistroHoras';
import { Aprobaciones } from './pages/Aprobaciones';
import { Reportes } from './pages/Reportes';
import { Configuracion } from './pages/Configuracion';
import { MiProgreso } from './pages/MiProgreso';
import { ControlAsistencia } from './pages/ControlAsistencia';
import { MiAsistencia } from './pages/MiAsistencia';
import { MisEstudiantes } from './pages/MisEstudiantes';
import { DocentesSubordinados } from './pages/DocentesSubordinados';
import { Mensajes } from './pages/Mensajes';
import { ComunicacionEstudiante } from './pages/ComunicacionEstudiante';
import { ComunicacionJefatura } from './pages/ComunicacionJefatura';
import { ComunicacionAdmin } from './pages/ComunicacionAdmin';
import { ControlBecados } from './pages/ControlBecados';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthProvider />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: '',
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            loader: () => redirect('/dashboard'),
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'estudiantes',
            element: <Estudiantes />,
          },
          {
            path: 'asignaciones',
            element: <Asignaciones />,
          },
          {
            path: 'mis-estudiantes',
            element: <MisEstudiantes />,
          },
          {
            path: 'docentes-subordinados',
            element: <DocentesSubordinados />,
          },
          {
            path: 'registro-horas',
            element: <RegistroHoras />,
          },
          {
            path: 'aprobaciones',
            element: <Aprobaciones />,
          },
          {
            path: 'reportes',
            element: <Reportes />,
          },
          {
            path: 'configuracion',
            element: <Configuracion />,
          },
          {
            path: 'mi-progreso',
            element: <MiProgreso />,
          },
          {
            path: 'control-asistencia',
            element: <ControlAsistencia />,
          },
          {
            path: 'mi-asistencia',
            element: <MiAsistencia />,
          },
          {
            path: 'mensajes',
            element: <Mensajes />,
          },
          {
            path: 'comunicacion',
            element: <ComunicacionEstudiante />,
          },
          {
            path: 'comunicacion-jefatura',
            element: <ComunicacionJefatura />,
          },
          {
            path: 'comunicacion-admin',
            element: <ComunicacionAdmin />,
          },
          {
            path: 'control-becados',
            element: <ControlBecados />,
          },
        ],
      },
      {
        path: '*',
        loader: () => redirect('/login'),
      },
    ],
  },
]);