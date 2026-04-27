import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  Users, UserPlus, GraduationCap, Building2, Shield, Search,
  CheckCircle, AlertCircle, Eye, EyeOff, RefreshCw, Clock
} from 'lucide-react';
import {
  fetchUsers, fetchRoles, fetchCareers, fetchStudyPlans, fetchTerms,
  fetchTeachers, fetchSubareas, fetchStudents,
  createUser, createStudent, createTeacher, createDepartmentHead, createAssignment,
  type ApiUserSummary, type RoleApiResponse, type CareerApiResponse,
  type StudyPlanApiResponse, type TermApiResponse, type SubareaApiResponse,
  type TeacherProfileApiResponse, type StudentProfileApiResponse,
} from '../api/portalApi';
import { toast } from 'sonner';

type TabKey = 'usuarios' | 'crear';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'usuarios', label: 'Usuarios Registrados', icon: Users },
  { key: 'crear', label: 'Crear Usuario', icon: UserPlus },
];

type RolCode = 'estudiante' | 'docente' | 'jefatura' | '';

const ROLE_COLORS: Record<string, string> = {
  admin: '#1B5E20', estudiante: '#1565C0', docente: '#6A1B9A', jefatura: '#EF6C00',
};

export const GestionUsuarios: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('crear');
  const [users, setUsers] = useState<ApiUserSummary[]>([]);
  const [roles, setRoles] = useState<RoleApiResponse[]>([]);
  const [careers, setCareers] = useState<CareerApiResponse[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlanApiResponse[]>([]);
  const [terms, setTerms] = useState<TermApiResponse[]>([]);
  const [subareas, setSubareas] = useState<SubareaApiResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfileApiResponse[]>([]);
  const [students, setStudents] = useState<StudentProfileApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, r, c, sp, t, sub, teach, st] = await Promise.all([
        fetchUsers(), fetchRoles(), fetchCareers(), fetchStudyPlans(),
        fetchTerms(), fetchSubareas(), fetchTeachers(), fetchStudents(),
      ]);
      setUsers(u); setRoles(r); setCareers(c); setStudyPlans(sp);
      setTerms(t); setSubareas(sub); setTeachers(teach); setStudents(st);
    } catch (err: any) {
      toast.error(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Cargando gestión de usuarios...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-5 rounded-xl shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm mb-0.5">Administración · Sistema SIBEC</p>
            <h2 className="text-2xl font-bold mb-0.5">Gestión de Usuarios</h2>
            <p className="text-white/90 text-sm">Crear y administrar usuarios del sistema por rol</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'Total', value: users.length },
              { label: 'Estudiantes', value: students.length },
              { label: 'Docentes', value: teachers.length },
            ].map(item => (
              <div key={item.label} className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3">
                <p className="text-white/80 text-[10px] uppercase tracking-wider">{item.label}</p>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive ? 'bg-white text-[#2E7D32] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
        <div className="flex-1" />
        <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={loadData}>
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </Button>
      </div>

      {activeTab === 'usuarios' && (
        <TabUsuarios users={users} search={search} setSearch={setSearch} />
      )}
      {activeTab === 'crear' && (
        <TabCrear
          roles={roles} careers={careers} studyPlans={studyPlans}
          terms={terms} subareas={subareas} teachers={teachers}
          students={students}
          onCreated={() => { loadData(); setActiveTab('usuarios'); }}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: USUARIOS REGISTRADOS
// ═══════════════════════════════════════════════
const TabUsuarios: React.FC<{
  users: ApiUserSummary[];
  search: string;
  setSearch: (v: string) => void;
}> = ({ users, search, setSearch }) => {
  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const s = search.toLowerCase();
    return users.filter(u =>
      u.email.toLowerCase().includes(s) ||
      u.first_name.toLowerCase().includes(s) ||
      u.last_name.toLowerCase().includes(s) ||
      (u.role?.name || '').toLowerCase().includes(s)
    );
  }, [users, search]);

  return (
    <div className="space-y-4">
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Buscar por nombre, email o rol..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Usuario</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Rol</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Estado</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const roleColor = ROLE_COLORS[u.role?.code ?? ''] || '#9E9E9E';
                  return (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-green-50/30 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
                            style={{ backgroundColor: roleColor }}>
                            {(u.first_name?.[0] || '') + (u.last_name?.[0] || '')}
                          </div>
                          <span className="font-medium text-gray-800 text-xs">{u.first_name} {u.last_name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">{u.email}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant="outline" className="text-[10px]"
                          style={{ color: roleColor, borderColor: roleColor }}>
                          {u.role?.name || 'Sin rol'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          u.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {u.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-gray-400">
                        Registrado en BD
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">{filtered.length} usuario(s) en la base de datos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════
// TAB: CREAR USUARIO
// ═══════════════════════════════════════════════
const TabCrear: React.FC<{
  roles: RoleApiResponse[];
  careers: CareerApiResponse[];
  studyPlans: StudyPlanApiResponse[];
  terms: TermApiResponse[];
  subareas: SubareaApiResponse[];
  teachers: TeacherProfileApiResponse[];
  students: StudentProfileApiResponse[];
  onCreated: () => void;
}> = ({ roles, careers, studyPlans, terms, subareas, teachers, students, onCreated }) => {
  const [selectedRole, setSelectedRole] = useState<RolCode>('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successDialog, setSuccessDialog] = useState<{ email: string; role: string; password: string } | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('Demo123456!');

  // Student specific
  const [studentCode, setStudentCode] = useState('');
  const [careerId, setCareerId] = useState('');
  const [studyPlanId, setStudyPlanId] = useState('');
  const [admissionYear, setAdmissionYear] = useState(2026);
  // Assignment
  const [subareaId, setSubareaId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [termId, setTermId] = useState('');
  const [createAssignmentFlag, setCreateAssignmentFlag] = useState(true);

  // Teacher specific
  const [employeeCode, setEmployeeCode] = useState('');

  // Jefatura specific
  const [jefCareerId, setJefCareerId] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeTerm = useMemo(() => terms.find(t => !t.is_closed) ?? terms[0], [terms]);

  useEffect(() => {
    if (activeTerm) setTermId(activeTerm.id);
  }, [activeTerm]);

  const resetForm = () => {
    setEmail(''); setFirstName(''); setLastName(''); setPassword('Demo123456!');
    setStudentCode(''); setCareerId(''); setStudyPlanId(''); setAdmissionYear(2026);
    setSubareaId(''); setTeacherId(''); setTermId(activeTerm?.id || '');
    setEmployeeCode(''); setJefCareerId('');
    setErrors({}); setCreateAssignmentFlag(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Requerido';
    else if (!email.includes('@')) e.email = 'Email inválido';
    if (!firstName.trim()) e.firstName = 'Requerido';
    if (!lastName.trim()) e.lastName = 'Requerido';
    if (!password || password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (!selectedRole) e.role = 'Selecciona un rol';

    if (selectedRole === 'estudiante') {
      if (!studentCode.trim()) e.studentCode = 'Requerido';
      if (!careerId) e.careerId = 'Requerido';
      if (!studyPlanId) e.studyPlanId = 'Requerido';
    }
    if (selectedRole === 'jefatura') {
      if (!jefCareerId) e.jefCareerId = 'Requerido';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const roleObj = roles.find(r => r.code === selectedRole);
      if (!roleObj) throw new Error('Rol no encontrado');

      // Step 1: Create user
      const newUser = await createUser({
        email, first_name: firstName, last_name: lastName,
        password, role_id: roleObj.id,
      });

      // Step 2: Create role-specific profile
      if (selectedRole === 'estudiante') {
        const newStudent = await createStudent({
          user_id: newUser.id,
          student_code: studentCode,
          career_id: careerId,
          study_plan_id: studyPlanId,
          admission_year: admissionYear,
        });

        // Step 3: Create assignment if requested
        if (createAssignmentFlag && subareaId && teacherId && termId) {
          await createAssignment({
            student_id: newStudent.id,
            subarea_id: subareaId,
            teacher_profile_id: teacherId,
            term_id: termId,
          });
        }
      } else if (selectedRole === 'docente') {
        await createTeacher({
          user_id: newUser.id,
          employee_code: employeeCode || undefined,
        });
      } else if (selectedRole === 'jefatura') {
        await createDepartmentHead({
          user_id: newUser.id,
          career_id: jefCareerId,
        });
      }

      setSuccessDialog({ email, role: roleObj.name, password });
      toast.success(`Usuario ${firstName} ${lastName} creado exitosamente`);
      resetForm();
      onCreated();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  };

  const roleCards: { code: RolCode; label: string; desc: string; icon: React.ElementType; color: string }[] = [
    { code: 'estudiante', label: 'Estudiante Becado', desc: 'Puede ver su progreso y asistencia', icon: GraduationCap, color: '#1565C0' },
    { code: 'docente', label: 'Docente Responsable', desc: 'Registra horas de estudiantes', icon: Users, color: '#6A1B9A' },
    { code: 'jefatura', label: 'Jefe de Carrera', desc: 'Valida y aprueba horas', icon: Building2, color: '#EF6C00' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        {/* Role selection */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Shield className="w-4 h-4" /> 1. Seleccionar Tipo de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roleCards.map(rc => (
                <button key={rc.code}
                  onClick={() => { setSelectedRole(rc.code); setErrors({}); }}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    selectedRole === rc.code
                      ? 'shadow-lg scale-[1.02]'
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                  }`}
                  style={selectedRole === rc.code ? { borderColor: rc.color, backgroundColor: `${rc.color}08` } : {}}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: selectedRole === rc.code ? rc.color : `${rc.color}15` }}>
                      <rc.icon className="w-5 h-5" style={{ color: selectedRole === rc.code ? 'white' : rc.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: selectedRole === rc.code ? rc.color : '#374151' }}>{rc.label}</p>
                      <p className="text-[10px] text-gray-400">{rc.desc}</p>
                    </div>
                  </div>
                  {selectedRole === rc.code && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: rc.color }}>
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {errors.role && <p className="text-[10px] text-red-500 mt-2">{errors.role}</p>}
          </CardContent>
        </Card>

        {/* User data */}
        {selectedRole && (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
              <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
                <UserPlus className="w-4 h-4" /> 2. Datos del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Common fields */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#2E7D32]" /> Datos de Cuenta
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nombre(s) *</Label>
                    <Input placeholder="Ej: Juan Carlos" value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className={errors.firstName ? 'border-red-400' : ''} />
                    {errors.firstName && <p className="text-[10px] text-red-500">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Apellido(s) *</Label>
                    <Input placeholder="Ej: Pérez García" value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className={errors.lastName ? 'border-red-400' : ''} />
                    {errors.lastName && <p className="text-[10px] text-red-500">{errors.lastName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Correo Electrónico *</Label>
                    <Input type="email" placeholder="correo@sibec.local" value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={errors.email ? 'border-red-400' : ''} />
                    {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Contraseña *</Label>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={errors.password ? 'border-red-400 pr-10' : 'pr-10'} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
                  </div>
                </div>
              </div>

              {/* Student-specific fields */}
              {selectedRole === 'estudiante' && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#1565C0]" /> Datos Académicos
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Matrícula *</Label>
                      <Input placeholder="Ej: EST100" value={studentCode}
                        onChange={e => setStudentCode(e.target.value)}
                        className={errors.studentCode ? 'border-red-400' : ''} />
                      {errors.studentCode && <p className="text-[10px] text-red-500">{errors.studentCode}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Año de Ingreso</Label>
                      <Input type="number" value={admissionYear}
                        onChange={e => setAdmissionYear(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Carrera *</Label>
                      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                        value={careerId} onChange={e => setCareerId(e.target.value)}>
                        <option value="">Seleccionar carrera</option>
                        {careers.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                      </select>
                      {errors.careerId && <p className="text-[10px] text-red-500">{errors.careerId}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Plan de Estudios *</Label>
                      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                        value={studyPlanId} onChange={e => setStudyPlanId(e.target.value)}>
                        <option value="">Seleccionar plan</option>
                        {studyPlans.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                      </select>
                      {errors.studyPlanId && <p className="text-[10px] text-red-500">{errors.studyPlanId}</p>}
                    </div>
                  </div>

                  {/* Assignment section */}
                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <input type="checkbox" checked={createAssignmentFlag}
                        onChange={e => setCreateAssignmentFlag(e.target.checked)}
                        className="rounded border-gray-300" id="assignCheck" />
                      <label htmlFor="assignCheck" className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#2E7D32]" /> Crear Asignación (Opcional)
                      </label>
                    </div>
                    {createAssignmentFlag && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-green-50/50 rounded-xl">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Subárea</Label>
                          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                            value={subareaId} onChange={e => setSubareaId(e.target.value)}>
                            <option value="">Seleccionar subárea</option>
                            {subareas.map(s => <option key={s.id} value={s.id}>{s.area.name} → {s.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Docente Responsable</Label>
                          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                            value={teacherId} onChange={e => setTeacherId(e.target.value)}>
                            <option value="">Seleccionar docente</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.user.first_name} {t.user.last_name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Periodo</Label>
                          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                            value={termId} onChange={e => setTermId(e.target.value)}>
                            {terms.map(t => <option key={t.id} value={t.id}>{t.name} ({t.academic_year})</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Teacher-specific fields */}
              {selectedRole === 'docente' && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#6A1B9A]" /> Datos de Docente
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Código de Empleado (opcional)</Label>
                      <Input placeholder="Ej: DOC-100" value={employeeCode}
                        onChange={e => setEmployeeCode(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Jefatura-specific fields */}
              {selectedRole === 'jefatura' && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#EF6C00]" /> Datos de Jefe de Carrera
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Carrera que Dirige *</Label>
                      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                        value={jefCareerId} onChange={e => setJefCareerId(e.target.value)}>
                        <option value="">Seleccionar carrera</option>
                        {careers.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                      </select>
                      {errors.jefCareerId && <p className="text-[10px] text-red-500">{errors.jefCareerId}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center gap-3 pt-3 border-t">
                <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-1.5" onClick={handleSubmit} disabled={saving}>
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {saving ? 'Creando...' : 'Crear Usuario'}
                </Button>
                <Button variant="outline" onClick={resetForm}>Limpiar Formulario</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Side info */}
      <div className="space-y-4">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <Shield className="w-4 h-4" /> Guía Rápida
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              { icon: Shield, text: 'Selecciona el tipo de rol para el nuevo usuario.' },
              { icon: Users, text: 'El nombre y email son obligatorios para todos los roles.' },
              { icon: GraduationCap, text: 'Los estudiantes requieren matrícula, carrera y plan de estudios.' },
              { icon: Building2, text: 'Las jefaturas se asignan a una carrera específica.' },
              { icon: Clock, text: 'La contraseña por defecto es Demo123456!' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
                <item.icon className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0 mt-0.5" />
                <span>{item.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
            <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base">
              <AlertCircle className="w-4 h-4" /> Flujo de Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2.5">
              {[
                { step: '1', text: 'Admin crea un estudiante aquí', color: '#1565C0' },
                { step: '2', text: 'Admin crea un docente aquí', color: '#6A1B9A' },
                { step: '3', text: 'Admin crea una asignación', color: '#2E7D32' },
                { step: '4', text: 'Docente registra horas', color: '#6A1B9A' },
                { step: '5', text: 'Jefatura valida/aprueba', color: '#EF6C00' },
                { step: '6', text: 'Estudiante ve progreso', color: '#1565C0' },
              ].map(item => (
                <div key={item.step} className="flex items-center gap-2.5 text-xs">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
                    style={{ backgroundColor: item.color }}>{item.step}</div>
                  <span className="text-gray-600">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success dialog */}
      <Dialog open={!!successDialog} onOpenChange={() => setSuccessDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2E7D32] flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> ¡Usuario Creado!
            </DialogTitle>
            <DialogDescription>El usuario se registró exitosamente en la base de datos.</DialogDescription>
          </DialogHeader>
          {successDialog && (
            <div className="space-y-3 py-2">
              <div className="bg-green-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-mono font-bold text-gray-800">{successDialog.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rol:</span>
                  <span className="font-bold text-gray-800">{successDialog.role}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Contraseña:</span>
                  <span className="font-mono font-bold text-gray-800">{successDialog.password}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Ya puede iniciar sesión con estas credenciales
              </p>
              <Button className="w-full bg-[#2E7D32] hover:bg-[#1B5E20]" onClick={() => setSuccessDialog(null)}>
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
