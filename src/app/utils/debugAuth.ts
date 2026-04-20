/**
 * Función de debug para verificar la configuración de usuarios y datos
 * Llamar manualmente desde la consola del navegador si es necesario
 */
export function debugAuthData() {
  const rawUser = sessionStorage.getItem('sibec_user');
  const parsedUser = rawUser ? JSON.parse(rawUser) : null;
  const accessToken = sessionStorage.getItem('sibec_access_token');
  const refreshToken = sessionStorage.getItem('sibec_refresh_token');

  // Debug silencioso - solo ejecutar cuando se llama manualmente
  const data = {
    autenticado: Boolean(parsedUser && accessToken),
    user: parsedUser
      ? {
          id: parsedUser.id,
          nombre: parsedUser.nombre,
          email: parsedUser.email,
          role: parsedUser.role,
          docenteId: parsedUser.docenteId ?? null,
          jefatura: parsedUser.jefatura ?? null,
          carrerasAsignadas: parsedUser.carrerasAsignadas ?? [],
        }
      : null,
    tokens: {
      accessPresent: Boolean(accessToken),
      refreshPresent: Boolean(refreshToken),
      accessPreview: accessToken ? `${accessToken.slice(0, 12)}...` : null,
    },
    storageKeys: Object.keys(sessionStorage).filter((key) => key.startsWith('sibec_')),
  };
  return data;
}

/**
 * Limpia la sesión y recarga la página
 */
export function forceLogout() {
  sessionStorage.removeItem('sibec_user');
  sessionStorage.removeItem('sibec_access_token');
  sessionStorage.removeItem('sibec_refresh_token');
  window.location.href = '/login';
}