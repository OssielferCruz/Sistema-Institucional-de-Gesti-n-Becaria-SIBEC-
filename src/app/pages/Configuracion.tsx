import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import {
  Settings, Users, MapPin, Calendar, Plus, Edit, Trash2, Search, Shield,
  Building2, Clock, GraduationCap, ChevronDown, ChevronRight, Eye, EyeOff,
  ToggleLeft, ToggleRight, Bell, Database, FileText, CheckCircle, AlertCircle,
  Layers, Target, Mail, RefreshCw, Download, Upload, Lock, Unlock, Save,
  BookOpen, UserCheck, UserX, Activity, Zap, Globe, Server
} from 'lucide-react';
import { useLegacyDataBridge } from '../hooks/useLegacyDataBridge';
import { toast } from 'sonner';

let areas: any[] = [];
let cuatrimestres: string[] = [];
let mockDocentes: any[] = [];
let mockEstudiantes: any[] = [];
let carreras: string[] = [];

// ─── Types ───
type ConfigTab = 'general' | 'roles' | 'areas' | 'periodos' | 'usuarios' | 'sistema';

const CONFIG_TABS: { key: ConfigTab; label: string; icon: React.ElementType }[] = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'roles', label: 'Roles y Permisos', icon: Shield },
  { key: 'areas', label: 'Áreas y Subáreas', icon: Building2 },
  { key: 'periodos', label: 'Periodos', icon: Calendar },
  { key: 'usuarios', label: 'Usuarios', icon: Users },
  { key: 'sistema', label: 'Sistema', icon: Server },
];

const roles = [
  { id: '1', nombre: 'Personal de Bienestar', clave: 'admin', nivel: 'Total', color: '#1B5E20', descripcion: 'Acceso completo: gestión de estudiantes, asignaciones, reportes y configuración del sistema.', permisos: ['Dashboard Admin', 'Gestión de Estudiantes', 'Asignaciones', 'Reportes', 'Configuración', 'Comunicación Global'], usuarios: 1 },
  { id: '2', nombre: 'Jefatura de Carrera', clave: 'jefatura', nivel: 'Supervisión', color: '#F57F17', descripcion: 'Validación de horas de Asistencia Docente para estudiantes de su carrera. Control de asistencia y reportes.', permisos: ['Dashboard Jefatura', 'Validación de Horas', 'Control de Asistencia', 'Reportes', 'Comunicación'], usuarios: 5 },
  { id: '3', nombre: 'Docente Responsable', clave: 'docente', nivel: 'Operativo', color: '#2E7D32', descripcion: 'Registro de horas de estudiantes asignados, control de asistencia y comunicación con becados.', permisos: ['Dashboard Docente', 'Registro de Horas', 'Mis Estudiantes', 'Control de Asistencia', 'Comunicación'], usuarios: 23 },
  { id: '4', nombre: 'Estudiante Becado', clave: 'estudiante', nivel: 'Consulta', color: '#1565C0', descripcion: 'Visualización de progreso personal, calendario de asistencia y contacto con docente responsable.', permisos: ['Dashboard Estudiante', 'Mi Progreso', 'Mi Asistencia', 'Comunicación'], usuarios: 42 },
];

const mockUsuarios = [
  { id: '1', nombre: 'María González Salazar', email: 'admin@ulsa.mx', rol: 'admin', activo: true, ultimoAcceso: '2026-04-08' },
  { id: '2', nombre: 'Dr. Roberto Méndez', email: 'docente@ulsa.mx', rol: 'docente', activo: true, ultimoAcceso: '2026-04-07' },
  { id: '3', nombre: 'Mtro. Fernando Silva', email: 'jefatura@ulsa.mx', rol: 'jefatura', activo: true, ultimoAcceso: '2026-04-08' },
  { id: '4', nombre: 'Juan Carlos Pérez', email: 'estudiante@ulsa.mx', rol: 'estudiante', activo: true, ultimoAcceso: '2026-04-06' },
  { id: '5', nombre: 'Ing. Patricia Flores', email: 'patricia.flores@ulsa.mx', rol: 'docente', activo: true, ultimoAcceso: '2026-04-05' },
  { id: '6', nombre: 'Lic. Carlos Vega', email: 'carlos.vega@ulsa.mx', rol: 'docente', activo: false, ultimoAcceso: '2026-03-20' },
];

// ─── Config state toggles ───
interface SistemConfig {
  notificacionesEmail: boolean;
  recordatoriosPeriodo: boolean;
  alertasRiesgo: boolean;
  backupAutomatico: boolean;
  modoMantenimiento: boolean;
  registroAuditoria: boolean;
  horasMaxDia: number;
  horasMinRegistro: number;
  diasGraciaRegistro: number;
  periodoActual: string;
}

const defaultConfig: SistemConfig = {
  notificacionesEmail: true,
  recordatoriosPeriodo: true,
  alertasRiesgo: true,
  backupAutomatico: true,
  modoMantenimiento: false,
  registroAuditoria: true,
  horasMaxDia: 8,
  horasMinRegistro: 1,
  diasGraciaRegistro: 7,
  periodoActual: 'ENE-ABR 2026',
};

export const Configuracion: React.FC = () => {
  const {
    areas: bridgeAreas,
    cuatrimestres: bridgeCuatrimestres,
    mockDocentes: bridgeDocentes,
    mockEstudiantes: bridgeEstudiantes,
    carreras: bridgeCarreras,
    isLoading,
    error,
  } = useLegacyDataBridge();

  areas = bridgeAreas;
  cuatrimestres = bridgeCuatrimestres;
  mockDocentes = bridgeDocentes;
  mockEstudiantes = bridgeEstudiantes;
  carreras = bridgeCarreras;

  const [activeTab, setActiveTab] = useState<ConfigTab>('general');
  const [config, setConfig] = useState<SistemConfig>(defaultConfig);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [searchUsuarios, setSearchUsuarios] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando configuración...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  const totalUsuarios = mockUsuarios.length;
  const usuariosActivos = mockUsuarios.filter(u => u.activo).length;
  const totalAreasActivas = areas.length;
  const totalSubareas = areas.reduce((s, a) => s + (a.subareas?.length || 0), 0);

  const toggleConfig = (key: keyof SistemConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    setUnsavedChanges(true);
  };

  const updateNumericConfig = (key: keyof SistemConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    toast.success('Configuración guardada exitosamente');
    setUnsavedChanges(false);
  };

  const filteredUsuarios = useMemo(() => {
    return mockUsuarios.filter(u => {
      const matchSearch = !searchUsuarios ||
        u.nombre.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUsuarios.toLowerCase());
      const matchRol = !filterRol || u.rol === filterRol;
      return matchSearch && matchRol;
    });
  }, [searchUsuarios, filterRol]);

  const getRolColor = (clave: string) => roles.find(r => r.clave === clave)?.color || '#9E9E9E';
  const getRolName = (clave: string) => roles.find(r => r.clave === clave)?.nombre || clave;

  // Period data
  const periodos = [
    { id: 'p1', nombre: 'Periodo 1', rango: 'ENE-ABR 2026', horas: 50, estado: 'activo' as const, inicio: '2026-01-13', fin: '2026-04-25' },
    { id: 'p2', nombre: 'Periodo 2', rango: 'MAY-AGO 2026', horas: 50, estado: 'pendiente' as const, inicio: '2026-05-11', fin: '2026-08-28' },
    { id: 'p3', nombre: 'Periodo 3', rango: 'SEP-DIC 2026', horas: 50, estado: 'pendiente' as const, inicio: '2026-09-07', fin: '2026-12-18' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-5 rounded-xl shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm mb-0.5">Bienestar Estudiantil · Administración</p>
            <h2 className="text-2xl font-bold mb-0.5">Configuración del Sistema</h2>
            <p className="text-white/90 text-sm">Gestión de roles, áreas, periodos y parámetros institucionales</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'Usuarios', value: totalUsuarios },
              { label: 'Áreas', value: totalAreasActivas },
              { label: 'Subáreas', value: totalSubareas },
            ].map(item => (
              <div key={item.label} className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3">
                <p className="text-white/80 text-[10px] uppercase tracking-wider">{item.label}</p>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Usuarios Activos', value: `${usuariosActivos}/${totalUsuarios}`, icon: UserCheck, color: '#2E7D32' },
          { label: 'Roles del Sistema', value: 4, icon: Shield, color: '#1565C0' },
          { label: 'Periodo Actual', value: 'ENE-ABR', icon: Calendar, color: '#F57F17' },
          { label: 'Horas/Periodo', value: '50h', icon: Clock, color: '#6A1B9A' },
          { label: 'Carreras', value: carreras.length, icon: GraduationCap, color: '#EF6C00' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl p-3.5 shadow-sm border-l-4 flex items-center gap-3" style={{ borderLeftColor: kpi.color }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}12` }}>
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">{kpi.label}</p>
              <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Unsaved changes banner */}
      {unsavedChanges && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-amber-700 flex-1">Tienes cambios sin guardar</span>
          <Button size="sm" className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-1.5 h-8" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" /> Guardar Cambios
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => { setConfig(defaultConfig); setUnsavedChanges(false); }}>
            Descartar
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {CONFIG_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-[#2E7D32] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && <TabGeneral config={config} toggleConfig={toggleConfig} updateNumericConfig={updateNumericConfig} />}
      {activeTab === 'roles' && <TabRoles expandedRole={expandedRole} setExpandedRole={setExpandedRole} />}
      {activeTab === 'areas' && <TabAreas expandedArea={expandedArea} setExpandedArea={setExpandedArea} isDialogOpen={isAreaDialogOpen} setIsDialogOpen={setIsAreaDialogOpen} />}
      {activeTab === 'periodos' && <TabPeriodos periodos={periodos} config={config} />}
      {activeTab === 'usuarios' && (
        <TabUsuarios
          filteredUsuarios={filteredUsuarios}
          searchUsuarios={searchUsuarios}
          setSearchUsuarios={setSearchUsuarios}
          filterRol={filterRol}
          setFilterRol={setFilterRol}
          getRolColor={getRolColor}
          getRolName={getRolName}
          isDialogOpen={isUserDialogOpen}
          setIsDialogOpen={setIsUserDialogOpen}
        />
      )}
      {activeTab === 'sistema' && <TabSistema config={config} toggleConfig={toggleConfig} />}

      {/* System Info */}
      <Card className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] text-white border-none shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">SIBEC — Sistema Institucional de Gestión Becaria</h3>
              <p className="text-white/90 text-sm">Universidad Tecnológica La Salle</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/70">
                <span>Versión 1.2.0</span>
                <span>•</span>
                <span>Última actualización: 08 Abr 2026</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Sistema Operativo</span>
              </div>
            </div>
            <Settings className="w-14 h-14 text-white/20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: GENERAL
// ═══════════════════════════════════════════════
const TabGeneral: React.FC<{
  config: SistemConfig;
  toggleConfig: (key: keyof SistemConfig) => void;
  updateNumericConfig: (key: keyof SistemConfig, value: number) => void;
}> = ({ config, toggleConfig, updateNumericConfig }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Parámetros de Horas */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" /> Parámetros de Horas Sociales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-gray-700">Horas Requeridas Anual</p>
                    <p className="text-[10px] text-gray-400">Total de horas sociales por año académico</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#2E7D32]">150</p>
                    <p className="text-[9px] text-gray-400">horas/año</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3].map(p => (
                    <div key={p} className="flex-1 p-2 bg-white rounded-lg border border-gray-100 text-center">
                      <p className="text-[9px] text-gray-400">Periodo {p}</p>
                      <p className="text-sm font-bold text-[#2E7D32]">50h</p>
                    </div>
                  ))}
                </div>
              </div>

              {[
                { key: 'horasMaxDia' as keyof SistemConfig, label: 'Máximo de horas por día', desc: 'Límite de horas registrables en un solo día', value: config.horasMaxDia, min: 1, max: 12, unit: 'h' },
                { key: 'horasMinRegistro' as keyof SistemConfig, label: 'Mínimo por registro', desc: 'Horas mínimas para un registro válido', value: config.horasMinRegistro, min: 1, max: 4, unit: 'h' },
                { key: 'diasGraciaRegistro' as keyof SistemConfig, label: 'Días de gracia para registro', desc: 'Plazo máximo para registrar horas pasadas', value: config.diasGraciaRegistro, min: 1, max: 30, unit: 'd' },
              ].map(param => (
                <div key={param.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                  <div>
                    <p className="font-medium text-sm text-gray-700">{param.label}</p>
                    <p className="text-[10px] text-gray-400">{param.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                      onClick={() => updateNumericConfig(param.key, Math.max(param.min, (param.value as number) - 1))}
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-bold text-[#2E7D32]">{param.value}{param.unit}</span>
                    <button
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                      onClick={() => updateNumericConfig(param.key, Math.min(param.max, (param.value as number) + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Bell className="w-4 h-4" /> Notificaciones y Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {[
              { key: 'notificacionesEmail' as keyof SistemConfig, label: 'Notificaciones por correo', desc: 'Enviar correos automáticos de actualizaciones del sistema', icon: Mail, value: config.notificacionesEmail },
              { key: 'recordatoriosPeriodo' as keyof SistemConfig, label: 'Recordatorios de periodo', desc: 'Avisar a estudiantes sobre el avance y cierre de periodo', icon: Calendar, value: config.recordatoriosPeriodo },
              { key: 'alertasRiesgo' as keyof SistemConfig, label: 'Alertas de riesgo', desc: 'Notificar cuando un estudiante tiene menos del 30% de avance', icon: AlertCircle, value: config.alertasRiesgo },
            ].map(toggle => (
              <div key={toggle.key} className="flex items-center gap-4 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: toggle.value ? '#E8F5E912' : '#f3f4f6' }}>
                  <toggle.icon className="w-4 h-4" style={{ color: toggle.value ? '#2E7D32' : '#9ca3af' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-700">{toggle.label}</p>
                  <p className="text-[10px] text-gray-400">{toggle.desc}</p>
                </div>
                <button onClick={() => toggleConfig(toggle.key)} className="flex-shrink-0">
                  {toggle.value ? (
                    <ToggleRight className="w-10 h-10 text-[#2E7D32]" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300" />
                  )}
                </button>
              </div>
            ))}

            {/* Carreras */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#2E7D32]" /> Carreras Registradas ({carreras.length})
              </p>
              <div className="space-y-1.5">
                {carreras.map(c => {
                  const code = c.split(' - ')[0];
                  const estCount = mockEstudiantes.filter(e => e.carrera === c).length;
                  return (
                    <div key={c} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <Badge variant="outline" className="text-[10px] px-1.5 font-bold">{code}</Badge>
                      <span className="text-xs text-gray-600 flex-1 truncate">{c.split(' - ')[1]}</span>
                      <span className="text-[10px] text-gray-400">{estCount} becados</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: ROLES Y PERMISOS
// ═══════════════════════════════════════════════
const TabRoles: React.FC<{ expandedRole: string | null; setExpandedRole: (id: string | null) => void }> = ({ expandedRole, setExpandedRole }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {roles.map(rol => (
          <div key={rol.id} className="bg-white rounded-xl p-3.5 shadow-sm border-l-4 flex items-center gap-3" style={{ borderLeftColor: rol.color }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${rol.color}12` }}>
              <Shield className="w-4 h-4" style={{ color: rol.color }} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">{rol.nivel}</p>
              <p className="text-lg font-bold" style={{ color: rol.color }}>{rol.usuarios}</p>
              <p className="text-[9px] text-gray-400">usuarios</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {roles.map(rol => {
          const isExpanded = expandedRole === rol.id;
          return (
            <Card key={rol.id} className="bg-white border-none shadow-sm overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedRole(isExpanded ? null : rol.id)}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${rol.color}15` }}>
                  <Shield className="w-5 h-5" style={{ color: rol.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm" style={{ color: rol.color }}>{rol.nombre}</h3>
                    <Badge variant="outline" className="text-[10px]" style={{ color: rol.color, borderColor: rol.color }}>{rol.nivel}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{rol.descripcion}</p>
                </div>
                <div className="text-center flex-shrink-0 px-3">
                  <p className="text-lg font-bold" style={{ color: rol.color }}>{rol.usuarios}</p>
                  <p className="text-[9px] text-gray-400">usuarios</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isExpanded && (
                <div className="border-t bg-gray-50/50 p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Permisos del Módulo</p>
                  <div className="flex flex-wrap gap-2">
                    {rol.permisos.map(p => (
                      <div key={p} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-700">
                        <CheckCircle className="w-3.5 h-3.5" style={{ color: rol.color }} />
                        {p}
                      </div>
                    ))}
                  </div>
                  {rol.clave === 'jefatura' && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                      <p className="font-medium mb-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Regla Especial de Permisos</p>
                      <p>Jefatura de Carrera solo puede validar horas de estudiantes en <strong>Asistencia Docente</strong> que pertenezcan a su misma carrera.</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: ÁREAS Y SUBÁREAS
// ═══════════════════════════════════════════════
const AREA_COLORS: Record<string, string> = {
  'Asistencia Docente': '#2E7D32', 'Biblioteca': '#1565C0', 'Bienestar Estudiantil': '#6A1B9A',
  'CIDTEA': '#00838F', 'Extensión Universitaria': '#EF6C00', 'Brigada Ambiental': '#2E7D32',
  'Comunicación Institucional': '#C62828', 'Decanatura': '#283593', 'Educación a Distancia': '#F57F17',
  'Registro Académico': '#4E342E',
};

const TabAreas: React.FC<{
  expandedArea: string | null; setExpandedArea: (id: string | null) => void;
  isDialogOpen: boolean; setIsDialogOpen: (v: boolean) => void;
}> = ({ expandedArea, setExpandedArea, isDialogOpen, setIsDialogOpen }) => {

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20">{areas.length} áreas</Badge>
          <Badge className="bg-[#1565C0]/10 text-[#1565C0] border border-[#1565C0]/20">{areas.reduce((s, a) => s + (a.subareas?.length || 0), 0)} subáreas</Badge>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-1.5 h-8">
              <Plus className="w-3.5 h-3.5" /> Nueva Área
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#2E7D32]">Agregar Nueva Área</DialogTitle>
              <DialogDescription>Define una nueva área institucional para horas sociales</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre del Área</Label>
                <Input placeholder="Ej: Laboratorio de Innovación" />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input placeholder="Descripción de las actividades" />
              </div>
              <div className="space-y-2">
                <Label>¿Tiene subáreas?</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">No</Button>
                  <Button variant="outline" size="sm">Sí</Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-[#2E7D32] hover:bg-[#1B5E20]" onClick={() => { toast.success('Área creada exitosamente'); setIsDialogOpen(false); }}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2.5">
        {areas.map(area => {
          const isExpanded = expandedArea === area.id;
          const ac = AREA_COLORS[area.nombre] || '#9E9E9E';
          const docentesArea = mockDocentes.filter(d => d.area === area.nombre);
          const estudiantesArea = mockEstudiantes.filter(e => e.areaActual === area.nombre);

          return (
            <Card key={area.id} className="bg-white border-none shadow-sm overflow-hidden">
              <div className="h-1" style={{ backgroundColor: ac }} />
              <div
                className="flex items-center gap-3.5 p-3.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedArea(isExpanded ? null : area.id)}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${ac}15` }}>
                  <Building2 className="w-5 h-5" style={{ color: ac }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-800">{area.nombre}</h3>
                    {area.subareas && area.subareas.length > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ color: ac, borderColor: ac }}>
                        <Layers className="w-2.5 h-2.5 mr-0.5" />{area.subareas.length} subáreas
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{area.descripcion}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: ac }}>{estudiantesArea.length}</p>
                    <p className="text-[9px] text-gray-400">becados</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-gray-600">{docentesArea.length}</p>
                    <p className="text-[9px] text-gray-400">docentes</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#2E7D32] transition-colors" onClick={e => { e.stopPropagation(); toast.success('Editando área...'); }}>
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {isExpanded && (
                <div className="border-t bg-gray-50/50 p-4">
                  {area.subareas && area.subareas.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Subáreas</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {area.subareas.map(sub => {
                          const subDoc = docentesArea.filter(d => d.subarea === sub.nombre);
                          const subEst = estudiantesArea.filter(e => e.subarea === sub.nombre);
                          return (
                            <div key={sub.id} className="p-3 bg-white rounded-xl border border-gray-100">
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ac}15` }}>
                                  <Layers className="w-3 h-3" style={{ color: ac }} />
                                </div>
                                <p className="font-medium text-xs text-gray-700">{sub.nombre}</p>
                              </div>
                              {sub.descripcion && <p className="text-[9px] text-gray-400 mb-2 line-clamp-2">{sub.descripcion}</p>}
                              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{subEst.length}</span>
                                <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{subDoc.length}</span>
                                <span className="flex items-center gap-1">
                                  {sub.tieneEncargado ? <CheckCircle className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                                  {sub.tieneEncargado ? 'Con encargado' : 'Sin encargado'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Área sin subáreas</p>
                        <p className="text-[10px] text-gray-400">{docentesArea.length} docente(s) responsable(s) · {estudiantesArea.length} becado(s)</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: PERIODOS
// ═══════════════════════════════════════════════
const TabPeriodos: React.FC<{ periodos: { id: string; nombre: string; rango: string; horas: number; estado: 'activo' | 'pendiente'; inicio: string; fin: string }[]; config: SistemConfig }> = ({ periodos, config }) => {
  const cuatActual = cuatrimestres.indexOf(config.periodoActual);

  return (
    <div className="space-y-4">
      {/* Año académico */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
          <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" /> Año Académico 2026 — Estructura de 3 Periodos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#1B5E20] to-[#43A047] rounded-full" style={{ width: '33%' }} />
            </div>
            <span className="text-xs font-bold text-[#2E7D32]">Periodo 1 de 3</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {periodos.map((p, i) => (
              <div
                key={p.id}
                className={`relative rounded-xl border-2 p-4 transition-all ${
                  p.estado === 'activo'
                    ? 'border-[#2E7D32] bg-[#E8F5E9]/30 shadow-md'
                    : 'border-gray-100 bg-white'
                }`}
              >
                {p.estado === 'activo' && <div className="absolute top-0 left-0 right-0 h-1 bg-[#2E7D32] rounded-t-lg" />}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      p.estado === 'activo' ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${p.estado === 'activo' ? 'text-[#2E7D32]' : 'text-gray-600'}`}>{p.nombre}</p>
                      <p className="text-[10px] text-gray-400">{p.rango}</p>
                    </div>
                  </div>
                  <Badge className={p.estado === 'activo' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-200'}>
                    {p.estado === 'activo' ? 'Activo' : 'Pendiente'}
                  </Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Meta de horas:</span>
                    <span className="font-bold text-[#2E7D32]">{p.horas}h</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Inicio:</span>
                    <span className="font-medium text-gray-700">{p.inicio}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Fin:</span>
                    <span className="font-medium text-gray-700">{p.fin}</span>
                  </div>
                </div>
                {p.estado === 'activo' && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex items-center gap-2 text-xs text-[#2E7D32]">
                      <Activity className="w-3.5 h-3.5" />
                      <span className="font-medium">En curso — Semana 13 de 16</span>
                    </div>
                    <div className="mt-1.5">
                      <Progress value={81} className="h-1.5" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cuatrimestres históricos */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
          <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
            <Clock className="w-4 h-4" /> Cuatrimestres Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {cuatrimestres.map((c, i) => {
              const isCurrent = c === config.periodoActual;
              const isPast = i < cuatActual;
              return (
                <div
                  key={c}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    isCurrent
                      ? 'border-[#2E7D32] bg-[#E8F5E9]/30'
                      : isPast
                      ? 'border-gray-100 bg-gray-50 opacity-60'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <p className={`font-medium text-sm ${isCurrent ? 'text-[#2E7D32]' : 'text-gray-600'}`}>{c}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {isCurrent ? '● Actual' : isPast ? 'Finalizado' : 'Futuro'}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: USUARIOS
// ═══════════════════════════════════════════════
const TabUsuarios: React.FC<{
  filteredUsuarios: typeof mockUsuarios;
  searchUsuarios: string; setSearchUsuarios: (v: string) => void;
  filterRol: string; setFilterRol: (v: string) => void;
  getRolColor: (c: string) => string; getRolName: (c: string) => string;
  isDialogOpen: boolean; setIsDialogOpen: (v: boolean) => void;
}> = ({ filteredUsuarios, searchUsuarios, setSearchUsuarios, filterRol, setFilterRol, getRolColor, getRolName, isDialogOpen, setIsDialogOpen }) => {

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={searchUsuarios}
                onChange={e => setSearchUsuarios(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterRol}
              onChange={e => setFilterRol(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
            >
              <option value="">Todos los roles</option>
              {roles.map(r => <option key={r.clave} value={r.clave}>{r.nombre}</option>)}
            </select>
            <Badge className="bg-[#2E7D32] text-white">{filteredUsuarios.length} usuarios</Badge>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-1.5 h-8 ml-auto">
                  <Plus className="w-3.5 h-3.5" /> Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-[#2E7D32]">Agregar Nuevo Usuario</DialogTitle>
                  <DialogDescription>Crea una cuenta de acceso al sistema SIBEC</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nombre Completo</Label>
                    <Input placeholder="Nombre del usuario" />
                  </div>
                  <div className="space-y-2">
                    <Label>Correo Electrónico</Label>
                    <Input type="email" placeholder="usuario@ulsa.mx" />
                  </div>
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700">
                      {roles.map(r => <option key={r.clave} value={r.clave}>{r.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button className="bg-[#2E7D32] hover:bg-[#1B5E20]" onClick={() => { toast.success('Usuario creado exitosamente'); setIsDialogOpen(false); }}>Guardar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Users grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredUsuarios.map(user => {
          const rc = getRolColor(user.rol);
          return (
            <Card key={user.id} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-1" style={{ backgroundColor: rc }} />
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: rc }}>
                    {user.nombre.split(' ').slice(0, 2).map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{user.nombre}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5" style={{ color: rc, borderColor: rc }}>{getRolName(user.rol)}</Badge>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] ${
                        user.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.activo ? 'bg-green-500' : 'bg-red-500'}`} />
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#2E7D32] transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Último acceso: {user.ultimoAcceso}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: SISTEMA
// ═══════════════════════════════════════════════
const TabSistema: React.FC<{ config: SistemConfig; toggleConfig: (key: keyof SistemConfig) => void }> = ({ config, toggleConfig }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mantenimiento */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Server className="w-4 h-4" /> Mantenimiento y Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {[
              { key: 'backupAutomatico' as keyof SistemConfig, label: 'Respaldo automático', desc: 'Respaldar datos diariamente a las 2:00 AM', icon: Database, value: config.backupAutomatico },
              { key: 'registroAuditoria' as keyof SistemConfig, label: 'Registro de auditoría', desc: 'Guardar historial de acciones de todos los usuarios', icon: FileText, value: config.registroAuditoria },
              { key: 'modoMantenimiento' as keyof SistemConfig, label: 'Modo mantenimiento', desc: 'Desactivar acceso temporal para actualizaciones', icon: Lock, value: config.modoMantenimiento, danger: true },
            ].map(toggle => (
              <div key={toggle.key} className={`flex items-center gap-4 p-3.5 rounded-xl border transition-colors ${
                'danger' in toggle && toggle.danger && toggle.value ? 'border-red-200 bg-red-50/50' : 'border-gray-100 hover:border-gray-200'
              }`}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: toggle.value ? ('danger' in toggle ? '#FEE2E2' : '#E8F5E912') : '#f3f4f6' }}>
                  <toggle.icon className="w-4 h-4" style={{ color: 'danger' in toggle && toggle.danger && toggle.value ? '#EF4444' : toggle.value ? '#2E7D32' : '#9ca3af' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-700">{toggle.label}</p>
                  <p className="text-[10px] text-gray-400">{toggle.desc}</p>
                </div>
                <button onClick={() => toggleConfig(toggle.key)} className="flex-shrink-0">
                  {toggle.value ? (
                    <ToggleRight className={`w-10 h-10 ${'danger' in toggle && toggle.danger ? 'text-red-500' : 'text-[#2E7D32]'}`} />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300" />
                  )}
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Zap className="w-4 h-4" /> Acciones del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {[
              { label: 'Exportar datos completos', desc: 'Descargar todos los registros en formato CSV', icon: Download, color: '#2E7D32', action: () => toast.success('Exportación iniciada...') },
              { label: 'Importar datos', desc: 'Cargar datos desde archivo CSV/Excel', icon: Upload, color: '#1565C0', action: () => toast.info('Función disponible próximamente') },
              { label: 'Sincronizar sistema', desc: 'Recalcular horas y estadísticas globales', icon: RefreshCw, color: '#F57F17', action: () => toast.success('Sistema sincronizado correctamente') },
              { label: 'Generar reporte global', desc: 'Crear informe completo del periodo actual', icon: FileText, color: '#6A1B9A', action: () => toast.success('Reporte generado exitosamente') },
              { label: 'Limpiar caché', desc: 'Eliminar datos temporales del sistema', icon: Trash2, color: '#EF5350', action: () => toast.success('Caché limpiado correctamente') },
            ].map(action => (
              <button
                key={action.label}
                onClick={action.action}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}12` }}>
                  <action.icon className="w-4 h-4" style={{ color: action.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-700 group-hover:text-gray-900">{action.label}</p>
                  <p className="text-[10px] text-gray-400">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
          <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
            <Activity className="w-4 h-4" /> Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Estudiantes', value: mockEstudiantes.length, color: '#2E7D32' },
              { label: 'Docentes', value: mockDocentes.length, color: '#1565C0' },
              { label: 'Áreas', value: areas.length, color: '#6A1B9A' },
              { label: 'Carreras', value: carreras.length, color: '#EF6C00' },
              { label: 'Subáreas', value: areas.reduce((s, a) => s + (a.subareas?.length || 0), 0), color: '#00838F' },
              { label: 'Cuatrimestres', value: cuatrimestres.length, color: '#F57F17' },
            ].map(stat => (
              <div key={stat.label} className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] text-gray-500 uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
