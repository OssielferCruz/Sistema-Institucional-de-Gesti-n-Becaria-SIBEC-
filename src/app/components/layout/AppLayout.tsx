import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Clock,
  CheckSquare,
  FileText,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  User,
  TrendingUp,
  CalendarCheck,
  UserCircle,
  UsersRound,
  Mail,
  DatabaseZap,
  UserCog
} from 'lucide-react';
import { Button } from '../ui/button';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['admin', 'jefatura', 'docente', 'estudiante']
  },
  { 
    name: 'Mi Progreso', 
    path: '/mi-progreso', 
    icon: <TrendingUp className="w-5 h-5" />,
    roles: ['estudiante'] // Solo estudiantes ven su progreso
  },
  { 
    name: 'Mi Asistencia', 
    path: '/mi-asistencia', 
    icon: <CalendarCheck className="w-5 h-5" />,
    roles: ['estudiante'] // Solo estudiantes ven su calendario de asistencia
  },
  { 
    name: 'Estudiantes', 
    path: '/estudiantes', 
    icon: <Users className="w-5 h-5" />,
    roles: ['admin'] // Solo Bienestar puede manipular estudiantes
  },
  {
    name: 'Control de Becados',
    path: '/control-becados',
    icon: <DatabaseZap className="w-5 h-5" />,
    roles: ['admin'] // Solo Admin gestiona altas, bajas, importaciones
  },
  {
    name: 'Gestión de Usuarios',
    path: '/gestion-usuarios',
    icon: <UserCog className="w-5 h-5" />,
    roles: ['admin'] // Solo Admin crea/gestiona todos los usuarios
  },
  { 
    name: 'Áreas de Horas Sociales', 
    path: '/asignaciones', 
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['admin'] // Solo Bienestar puede gestionar áreas y asignaciones
  },
  { 
    name: 'Mis Estudiantes', 
    path: '/mis-estudiantes', 
    icon: <UserCircle className="w-5 h-5" />,
    roles: ['docente'] // Solo Docentes ven sus estudiantes asignados
  },
  { 
    name: 'Registro de Horas', 
    path: '/registro-horas', 
    icon: <Clock className="w-5 h-5" />,
    roles: ['docente'] // Solo Docentes registran horas
  },
  {
    name: 'Control de Asistencia',
    path: '/control-asistencia',
    icon: <CalendarCheck className="w-5 h-5" />,
    roles: ['docente', 'jefatura'] // Docentes y Jefes controlan asistencia
  },
  {
    name: 'Comunicación',
    path: '/mensajes',
    icon: <Mail className="w-5 h-5" />,
    roles: ['docente'] // Solo Docentes tienen comunicación con estudiantes
  },
  {
    name: 'Comunicación',
    path: '/comunicacion',
    icon: <Mail className="w-5 h-5" />,
    roles: ['estudiante'] // Estudiantes contactan a sus responsables
  },
  {
    name: 'Comunicación',
    path: '/comunicacion-jefatura',
    icon: <Mail className="w-5 h-5" />,
    roles: ['jefatura'] // Jefatura contacta a docentes, estudiantes y Bienestar
  },
  {
    name: 'Comunicación',
    path: '/comunicacion-admin',
    icon: <Mail className="w-5 h-5" />,
    roles: ['admin'] // Admin contacta a todos los docentes y estudiantes
  },
  { 
    name: 'Estudiantes y Docentes', 
    path: '/docentes-subordinados', 
    icon: <UsersRound className="w-5 h-5" />,
    roles: ['jefatura'] // Solo Jefatura ve sus docentes subordinados
  },
  { 
    name: 'Validación de Horas', 
    path: '/aprobaciones', 
    icon: <CheckSquare className="w-5 h-5" />,
    roles: ['jefatura'] // Solo Jefes de carrera validan
  },
  { 
    name: 'Reportes', 
    path: '/reportes', 
    icon: <FileText className="w-5 h-5" />,
    roles: ['admin', 'jefatura'] // Bienestar recibe, Jefatura envía
  },
  { 
    name: 'Configuración', 
    path: '/configuracion', 
    icon: <Settings className="w-5 h-5" />,
    roles: ['admin']
  }
];

const roleNames = {
  admin: 'Personal de Bienestar',
  jefatura: 'Jefatura de Carrera',
  docente: 'Docente Responsable',
  estudiante: 'Estudiante Becado'
};

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Show loading or nothing while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
            <h1 className="text-4xl font-bold text-[#2E7D32]">SIBEC</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-[#2E7D32] text-white transition-all duration-300 z-40 overflow-hidden ${
          sidebarOpen ? 'w-64' : 'w-0'
        }`}
      >
        <div className={`flex flex-col h-full w-64 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Logo/Header */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold">SIBEC</h1>
            <p className="text-sm text-white/80 mt-1">Universidad Tecnológica La Salle</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                    isActive 
                      ? 'bg-[#1B5E20] border-l-4 border-[#66BB6A]' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Topbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-[#424242]">
                  {location.pathname === '/mi-progreso' 
                    ? 'Mi Progreso' 
                    : navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
                <Bell className="w-5 h-5 text-[#424242]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#D32F2F] rounded-full"></span>
              </Button>

              {/* User Info */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#424242]">{user.name}</p>
                  <p className="text-xs text-gray-500">{roleNames[user.role]}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-[#D32F2F]"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};