import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Mail, ExternalLink, Send, Search, Users, User,
  GraduationCap, ShieldCheck, Clock, Building2, Layers,
  AlertCircle, Crown
} from 'lucide-react';
import { mockEstudiantes, mockDocentes, areas, carreras } from '../data/mockData';

const AREA_COLORS: Record<string, string> = {
  'Asistencia Docente': '#2E7D32', 'Biblioteca': '#1565C0', 'Bienestar Estudiantil': '#6A1B9A',
  'CIDTEA': '#00838F', 'Extensión Universitaria': '#EF6C00', 'Brigada Ambiental': '#2E7D32',
  'Comunicación Institucional': '#C62828', 'Decanatura': '#283593', 'Educación a Distancia': '#F57F17',
  'Registro Académico': '#4E342E',
};

const getAreaColor = (a: string) => AREA_COLORS[a] || '#9E9E9E';
const getCarreraCode = (c: string) => c.split(' - ')[0];

// ─── Mock jefaturas ───
const mockJefaturas = [
  { id: 'jef-1', nombre: 'Ing. Marco A. Rivera', email: 'jefatura.ice@ulsa.mx', jefatura: 'ICE/IEM', carreras: ['ICE - Ingeniería en Cibernética Electrónica', 'IEM - Ingeniería Electromédica'], color: '#6A1B9A' },
  { id: 'jef-2', nombre: 'Ing. Patricia Flores Gómez', email: 'jefatura.ime@ulsa.mx', jefatura: 'IME', carreras: ['IME - Ingeniería Mecánica y Energías Renovables'], color: '#F57F17' },
  { id: 'jef-3', nombre: 'Mtro. Fernando Silva Reyes', email: 'jefatura@ulsa.mx', jefatura: 'IMS/IEL', carreras: ['IMS - Ingeniería Mecatrónica y Sistemas de Control', 'IEL - Ingeniería Eléctrica'], color: '#2E7D32' },
  { id: 'jef-4', nombre: 'Ing. Laura Ramírez Torres', email: 'jefatura.igi@ulsa.mx', jefatura: 'IGI', carreras: ['IGI - Ingeniería en Gestión Industrial'], color: '#C62828' },
  { id: 'jef-5', nombre: 'Lic. Carlos Vega Mendoza', email: 'jefatura.lcm@ulsa.mx', jefatura: 'LCM/LAF', carreras: ['LCM - Licenciatura Comercial con Énfasis en Mercadeo', 'LAF - Licenciatura Administrativa con énfasis en Finanzas'], color: '#EF6C00' },
];

type Tab = 'docentes' | 'jefaturas' | 'estudiantes' | 'masivo';

export const ComunicacionAdmin: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState<Tab>('docentes');
  const [filterArea, setFilterArea] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const firma = `Saludos cordiales,\nOficina de Bienestar Estudiantil\nUniversidad Tecnológica La Salle`;

  const generarGmailLink = (email: string, asunto: string = '', cuerpo: string = '') => {
    const params = new URLSearchParams();
    params.set('to', email);
    if (asunto) params.set('su', asunto);
    if (cuerpo) params.set('body', cuerpo);
    return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
  };

  const generarIniciales = (nombre: string) =>
    nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const uniqueAreas = useMemo(() => [...new Set(mockDocentes.map(d => d.area))].sort(), []);
  const uniqueCarreras = useMemo(() => [...new Set(mockEstudiantes.map(e => getCarreraCode(e.carrera)))].sort(), []);

  const docentesFiltrados = useMemo(() => {
    return mockDocentes.filter(d => {
      const matchSearch = !busqueda ||
        d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.email.toLowerCase().includes(busqueda.toLowerCase());
      const matchArea = !filterArea || d.area === filterArea;
      return matchSearch && matchArea;
    });
  }, [busqueda, filterArea]);

  const jefaturasFiltradas = useMemo(() => {
    return mockJefaturas.filter(j => {
      if (!busqueda) return true;
      return j.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.jefatura.toLowerCase().includes(busqueda.toLowerCase());
    });
  }, [busqueda]);

  const estudiantesFiltrados = useMemo(() => {
    return mockEstudiantes.filter(e => {
      const matchSearch = !busqueda ||
        e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.matricula.includes(busqueda);
      const matchArea = !filterArea || e.areaActual === filterArea;
      const matchCarrera = !filterCarrera || getCarreraCode(e.carrera) === filterCarrera;
      const matchEstado = !filterEstado || e.estado === filterEstado;
      return matchSearch && matchArea && matchCarrera && matchEstado;
    });
  }, [busqueda, filterArea, filterCarrera, filterEstado]);

  const asuntosDocente = [
    { label: 'Seguimiento', asunto: 'SIBEC - Seguimiento de Horas Sociales', icono: '📋' },
    { label: 'Reporte', asunto: 'SIBEC - Solicitud de Reporte', icono: '📊' },
    { label: 'Coordinación', asunto: 'SIBEC - Coordinación Institucional', icono: '🤝' },
  ];

  const asuntosJefatura = [
    { label: 'Reporte', asunto: 'SIBEC - Reporte de Estudiantes Becados', icono: '📊' },
    { label: 'Validación', asunto: 'SIBEC - Solicitud de Validación de Horas', icono: '✅' },
    { label: 'Coordinación', asunto: 'SIBEC - Coordinación Académica', icono: '🤝' },
  ];

  const asuntosEstudiante = [
    { label: 'Seguimiento', asunto: 'SIBEC - Seguimiento de Horas Sociales', icono: '📋' },
    { label: 'Situación', asunto: 'SIBEC - Revisión de Situación', icono: '📊' },
    { label: 'Recordatorio', asunto: 'SIBEC - Recordatorio Importante', icono: '🔔' },
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-300';
      case 'completado': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const gruposMasivos = useMemo(() => {
    const byArea: Record<string, { emails: string[]; count: number }> = {};
    mockEstudiantes.filter(e => e.estado === 'activo').forEach(e => {
      const a = e.areaActual || 'Sin asignar';
      if (!byArea[a]) byArea[a] = { emails: [], count: 0 };
      byArea[a].emails.push(e.email);
      byArea[a].count++;
    });
    return byArea;
  }, []);

  const estudiantesEnRiesgo = mockEstudiantes.filter(e => e.estado === 'activo' && (e.horasCompletadas / e.horasRequeridas) < 0.3);

  const resetFilters = () => { setBusqueda(''); setFilterArea(''); setFilterCarrera(''); setFilterEstado(''); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] text-white p-5 rounded-xl shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm mb-0.5">Bienestar Estudiantil · Comunicación</p>
            <h2 className="text-2xl font-bold mb-0.5">Centro de Comunicación</h2>
            <p className="text-white/90 text-sm">Contacta docentes, jefaturas, estudiantes y envía comunicados masivos</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'Docentes', value: mockDocentes.length },
              { label: 'Jefaturas', value: mockJefaturas.length },
              { label: 'Becados', value: mockEstudiantes.length },
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
        {([
          { key: 'docentes' as Tab, label: `Docentes (${mockDocentes.length})`, icon: GraduationCap },
          { key: 'jefaturas' as Tab, label: `Jefaturas (${mockJefaturas.length})`, icon: Crown },
          { key: 'estudiantes' as Tab, label: `Estudiantes (${mockEstudiantes.length})`, icon: Users },
          { key: 'masivo' as Tab, label: 'Correo Masivo', icon: Send },
        ]).map(t => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); resetFilters(); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive ? 'bg-white text-[#2E7D32] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ══════ DOCENTES TAB ══════ */}
      {tab === 'docentes' && (
        <>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Buscar docente por nombre o correo..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-10" />
                </div>
                <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700">
                  <option value="">Todas las áreas</option>
                  {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <Badge className="bg-[#2E7D32] text-white">{docentesFiltrados.length} docentes</Badge>
              </div>
            </CardContent>
          </Card>

          {docentesFiltrados.length > 0 && (
            <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
                    <div>
                      <p className="font-semibold text-[#2E7D32]">Correo a Todos los Docentes Filtrados</p>
                      <p className="text-sm text-gray-600">Enviar comunicado a {docentesFiltrados.length} docentes</p>
                    </div>
                  </div>
                  <a href={generarGmailLink(docentesFiltrados.map(d => d.email).join(','), 'SIBEC - Comunicado de Bienestar Estudiantil', `Estimados docentes,\n\n\n\n${firma}`)} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2"><Mail className="w-4 h-4" /> Enviar a Todos <ExternalLink className="w-3 h-3" /></Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {docentesFiltrados.map(doc => {
              const ac = getAreaColor(doc.area);
              const numEst = doc.estudiantesAsignados.length;
              return (
                <Card key={doc.id} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: ac }} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: ac }}>{generarIniciales(doc.nombre)}</div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base text-gray-900 truncate">{doc.nombre}</CardTitle>
                        <p className="text-[11px] text-gray-500 truncate">{doc.email}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px]" style={{ color: ac, borderColor: ac }}>{doc.area}</Badge>
                          {doc.subarea && <Badge variant="outline" className="text-[10px] bg-gray-50">{doc.subarea}</Badge>}
                          <span className="text-[10px] text-gray-400">{numEst} becado{numEst !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="border-t pt-3">
                      <p className="text-[10px] text-gray-500 mb-2 font-medium">Correo rápido:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {asuntosDocente.map(a => (
                          <a key={a.label} href={generarGmailLink(doc.email, a.asunto, `Estimado/a ${doc.nombre.split(' ')[0]},\n\n\n\n${firma}`)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-[#E8F5E9] hover:border-[#2E7D32]"><span>{a.icono}</span>{a.label}</Button>
                          </a>
                        ))}
                      </div>
                    </div>
                    <a href={generarGmailLink(doc.email)} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full gap-2" style={{ backgroundColor: ac }}><Send className="w-4 h-4" /> Redactar Correo <ExternalLink className="w-3 h-3 ml-auto" /></Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ══════ JEFATURAS TAB ══════ */}
      {tab === 'jefaturas' && (
        <>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Buscar jefatura por nombre, correo o carrera..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-10" />
                </div>
                <Badge className="bg-[#F57F17] text-white">{jefaturasFiltradas.length} jefaturas</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Correo grupal jefaturas */}
          <Card className="border-[#F57F17]/20 bg-gradient-to-r from-amber-50 to-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F57F17] flex items-center justify-center"><Crown className="w-5 h-5 text-white" /></div>
                  <div>
                    <p className="font-semibold text-[#F57F17]">Correo a Todas las Jefaturas</p>
                    <p className="text-sm text-gray-600">Enviar comunicado a las {mockJefaturas.length} jefaturas de carrera</p>
                  </div>
                </div>
                <a href={generarGmailLink(mockJefaturas.map(j => j.email).join(','), 'SIBEC - Comunicado a Jefaturas de Carrera', `Estimadas Jefaturas de Carrera,\n\n\n\n${firma}`)} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#F57F17] hover:bg-[#E65100] gap-2"><Mail className="w-4 h-4" /> Enviar a Todas <ExternalLink className="w-3 h-3" /></Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {jefaturasFiltradas.map(jef => {
              const estCarreras = mockEstudiantes.filter(e => jef.carreras.includes(e.carrera) && e.areaActual === 'Asistencia Docente');
              const docCarreras = mockDocentes.filter(d => d.area === 'Asistencia Docente' && d.jefaturaAsignada === jef.jefatura);
              return (
                <Card key={jef.id} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: jef.color }} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: jef.color }}>
                        {generarIniciales(jef.nombre)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base text-gray-900 truncate">{jef.nombre}</CardTitle>
                        <p className="text-[11px] text-gray-500 truncate">{jef.email}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px]" style={{ color: jef.color, borderColor: jef.color }}>
                            <Crown className="w-2.5 h-2.5 mr-0.5" /> Jefatura {jef.jefatura}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* Carreras */}
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-medium">Carreras a cargo:</p>
                      {jef.carreras.map(c => (
                        <div key={c} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <GraduationCap className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{c}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-[9px] text-gray-400">Docentes</p>
                        <p className="font-bold" style={{ color: jef.color }}>{docCarreras.length}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-[9px] text-gray-400">Becados Asist.</p>
                        <p className="font-bold" style={{ color: jef.color }}>{estCarreras.length}</p>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-[10px] text-gray-500 mb-2 font-medium">Correo rápido:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {asuntosJefatura.map(a => (
                          <a key={a.label} href={generarGmailLink(jef.email, a.asunto, `Estimado/a ${jef.nombre.split(' ')[0]},\n\n\n\n${firma}`)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-amber-50 hover:border-[#F57F17]"><span>{a.icono}</span>{a.label}</Button>
                          </a>
                        ))}
                      </div>
                    </div>

                    <a href={generarGmailLink(jef.email)} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full gap-2" style={{ backgroundColor: jef.color }}><Send className="w-4 h-4" /> Redactar Correo <ExternalLink className="w-3 h-3 ml-auto" /></Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ══════ ESTUDIANTES TAB ══════ */}
      {tab === 'estudiantes' && (
        <>
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Buscar por nombre, correo o matrícula..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-10" />
                </div>
                <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700">
                  <option value="">Todas las áreas</option>
                  {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select value={filterCarrera} onChange={e => setFilterCarrera(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700">
                  <option value="">Todas las carreras</option>
                  {uniqueCarreras.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700">
                  <option value="">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="completado">Completado</option>
                  <option value="inactivo">Inactivo</option>
                </select>
                <Badge className="bg-[#2E7D32] text-white">{estudiantesFiltrados.length} estudiantes</Badge>
              </div>
            </CardContent>
          </Card>

          {estudiantesFiltrados.length > 0 && (
            <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
                    <div>
                      <p className="font-semibold text-[#2E7D32]">Correo a Todos los Estudiantes Filtrados</p>
                      <p className="text-sm text-gray-600">Enviar comunicado a {estudiantesFiltrados.length} estudiantes</p>
                    </div>
                  </div>
                  <a href={generarGmailLink(estudiantesFiltrados.map(e => e.email).join(','), 'SIBEC - Comunicado de Bienestar Estudiantil', `Estimados estudiantes,\n\n\n\n${firma}`)} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2"><Mail className="w-4 h-4" /> Enviar a Todos <ExternalLink className="w-3 h-3" /></Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {estudiantesFiltrados.map(est => {
              const prog = (est.horasCompletadas / est.horasRequeridas) * 100;
              const ac = getAreaColor(est.areaActual || '');
              return (
                <Card key={est.id} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: ac }} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: ac }}>{generarIniciales(est.nombre)}</div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base text-gray-900 truncate">{est.nombre}</CardTitle>
                        <p className="text-[11px] text-gray-500 truncate">{est.email}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className={getEstadoColor(est.estado)}>{est.estado === 'activo' ? 'Activo' : est.estado === 'completado' ? 'Completado' : 'Inactivo'}</Badge>
                          <Badge variant="outline" className="text-[10px] bg-gray-50">{est.matricula}</Badge>
                          <Badge variant="outline" className="text-[10px]" style={{ color: ac, borderColor: ac }}>{getCarreraCode(est.carrera)}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500"><Building2 className="w-3.5 h-3.5" /><span className="truncate">{est.areaActual || 'Sin asignar'}</span></div>
                      <div className="flex items-center gap-1.5 text-gray-500"><Clock className="w-3.5 h-3.5" /><span>{est.horasCompletadas}/{est.horasRequeridas}h</span></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, prog)}%`, backgroundColor: prog < 30 ? '#EF5350' : prog < 60 ? '#FFC107' : '#2E7D32' }} />
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-[10px] text-gray-500 mb-2 font-medium">Correo rápido:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {asuntosEstudiante.map(a => (
                          <a key={a.label} href={generarGmailLink(est.email, a.asunto, `Estimado/a ${est.nombre.split(' ')[0]},\n\n\n\n${firma}`)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="text-xs h-7 gap-1 hover:bg-[#E8F5E9] hover:border-[#2E7D32]"><span>{a.icono}</span>{a.label}</Button>
                          </a>
                        ))}
                      </div>
                    </div>
                    <a href={generarGmailLink(est.email)} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full gap-2" style={{ backgroundColor: ac }}><Send className="w-4 h-4" /> Redactar Correo <ExternalLink className="w-3 h-3 ml-auto" /></Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ══════ MASIVO TAB ══════ */}
      {tab === 'masivo' && (
        <div className="space-y-4">
          <Card className="border-[#2E7D32]/20 bg-gradient-to-r from-[#E8F5E9] to-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
                  <div><p className="font-semibold text-[#2E7D32]">Todos los Becados Activos</p><p className="text-sm text-gray-600">{mockEstudiantes.filter(e => e.estado === 'activo').length} estudiantes activos</p></div>
                </div>
                <a href={generarGmailLink(mockEstudiantes.filter(e => e.estado === 'activo').map(e => e.email).join(','), 'SIBEC - Comunicado Institucional', `Estimados estudiantes becados,\n\n\n\n${firma}`)} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] gap-2"><Send className="w-4 h-4" /> Enviar a Todos <ExternalLink className="w-3 h-3" /></Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#1565C0]/20 bg-gradient-to-r from-blue-50 to-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1565C0] flex items-center justify-center"><GraduationCap className="w-5 h-5 text-white" /></div>
                  <div><p className="font-semibold text-[#1565C0]">Todos los Docentes</p><p className="text-sm text-gray-600">{mockDocentes.length} docentes responsables</p></div>
                </div>
                <a href={generarGmailLink(mockDocentes.map(d => d.email).join(','), 'SIBEC - Comunicado a Docentes', `Estimados docentes responsables,\n\n\n\n${firma}`)} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#1565C0] hover:bg-[#0D47A1] gap-2"><Send className="w-4 h-4" /> Enviar a Todos <ExternalLink className="w-3 h-3" /></Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#F57F17]/20 bg-gradient-to-r from-amber-50 to-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F57F17] flex items-center justify-center"><Crown className="w-5 h-5 text-white" /></div>
                  <div><p className="font-semibold text-[#F57F17]">Todas las Jefaturas de Carrera</p><p className="text-sm text-gray-600">{mockJefaturas.length} jefaturas registradas</p></div>
                </div>
                <a href={generarGmailLink(mockJefaturas.map(j => j.email).join(','), 'SIBEC - Comunicado a Jefaturas', `Estimadas Jefaturas de Carrera,\n\n\n\n${firma}`)} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#F57F17] hover:bg-[#E65100] gap-2"><Send className="w-4 h-4" /> Enviar a Todas <ExternalLink className="w-3 h-3" /></Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {estudiantesEnRiesgo.length > 0 && (
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EF5350] flex items-center justify-center"><AlertCircle className="w-5 h-5 text-white" /></div>
                    <div><p className="font-semibold text-[#EF5350]">Estudiantes en Riesgo (&lt;30%)</p><p className="text-sm text-gray-600">{estudiantesEnRiesgo.length} estudiantes con bajo avance</p></div>
                  </div>
                  <a href={generarGmailLink(estudiantesEnRiesgo.map(e => e.email).join(','), 'SIBEC - Seguimiento Urgente de Horas Sociales', `Estimado/a estudiante,\n\nNos permitimos comunicarte que tu avance en horas sociales se encuentra por debajo del 30%. Es importante que te comuniques con tu docente responsable para regularizar tu situación.\n\n${firma}`)} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#EF5350] hover:bg-[#D32F2F] gap-2"><Send className="w-4 h-4" /> Enviar Alerta <ExternalLink className="w-3 h-3" /></Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-[#E8F5E9] to-white pb-3 pt-4 px-5">
              <CardTitle className="text-[#2E7D32] flex items-center gap-2 text-base"><Building2 className="w-4 h-4" /> Correo por Área</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(gruposMasivos).sort((a, b) => b[1].count - a[1].count).map(([area, data]) => {
                  const ac = getAreaColor(area);
                  return (
                    <div key={area} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ac}15` }}><Building2 className="w-4 h-4" style={{ color: ac }} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-700 truncate">{area}</p>
                        <p className="text-[10px] text-gray-400">{data.count} estudiantes activos</p>
                      </div>
                      <a href={generarGmailLink(data.emails.join(','), `SIBEC - Comunicado para ${area}`, `Estimados estudiantes de ${area},\n\n\n\n${firma}`)} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" style={{ color: ac, borderColor: ac }}><Mail className="w-3.5 h-3.5" /> Enviar</Button>
                      </a>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {((tab === 'docentes' && docentesFiltrados.length === 0) ||
        (tab === 'jefaturas' && jefaturasFiltradas.length === 0) ||
        (tab === 'estudiantes' && estudiantesFiltrados.length === 0)) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <User className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium">No se encontraron resultados</p>
            <p className="text-sm">Intenta con otro término de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Nota */}
      <Card className="border-dashed border-gray-300 bg-gray-50 shadow-none">
        <CardContent className="p-4 flex items-start gap-3">
          <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-600 mb-1">Sobre la comunicación</p>
            <p>Los correos se envían a través de Gmail. Al hacer clic en cualquier botón de envío, se abrirá una nueva ventana de Gmail con el destinatario y asunto prellenados.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
