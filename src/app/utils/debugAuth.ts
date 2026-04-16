import { mockUsers, mockDocentes, mockEstudiantes } from '../data/mockData';

/**
 * Función de debug para verificar la configuración de usuarios y datos
 * Llamar manualmente desde la consola del navegador si es necesario
 */
export function debugAuthData() {
  // Debug silencioso - solo ejecutar cuando se llama manualmente
  const data = {
    usuarios: Object.entries(mockUsers).map(([email, userData]) => ({
      email,
      role: userData.role,
      carrerasAsignadas: userData.carrerasAsignadas || 'N/A',
      jefatura: userData.jefatura || 'N/A'
    })),
    docentesConCarreras: mockDocentes
      .filter(d => d.carrerasAsignadas && d.carrerasAsignadas.length > 0)
      .map(d => ({
        nombre: d.nombre,
        id: d.id,
        carreras: d.carrerasAsignadas,
        estudiantes: d.estudiantesAsignados?.length || 0
      })),
    totalEstudiantes: mockEstudiantes.length
  };
  return data;
}

/**
 * Limpia la sesión y recarga la página
 */
export function forceLogout() {
  sessionStorage.removeItem('sibec_user');
  window.location.href = '/login';
}