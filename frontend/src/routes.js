// Todas las rutas de pantalla del frontend en un solo lugar.
// Si una URL cambia, se cambia aquí y se actualizan App, los enlaces y las redirecciones.

export const ROUTES = {
  login: '/',
  register: '/registro',
  professional: '/dashboard',
  company: '/empresa',
  admin: '/admin',
};

/** Pantalla de inicio de cada tipo de usuario después de iniciar sesión. */
export const HOME_BY_ROLE = {
  professional: ROUTES.professional,
  company: ROUTES.company,
  admin: ROUTES.admin,
};
