// Cliente de la API de Laravel. Todas las pantallas hablan con el backend por aquí.
// Contrato de rutas y respuestas: docs/api.md

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

// El token no se maneja desde JavaScript: el backend lo entrega en una cookie httpOnly y el
// navegador la manda sola en cada petición (credentials: 'include'). Así un XSS no puede robarlo.
// El frontend y la API deben usar el mismo host (localhost con localhost) para que la cookie viaje.

/** Error de la API: `errors` trae los mensajes por campo cuando la respuesta es 422. */
export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  /** Primer mensaje de un campo, o undefined. */
  first(field) {
    return this.errors?.[field]?.[0];
  }
}

let onUnauthorized = () => {};

/** Lo llama la API cuando la sesión ya no sirve (401), para cerrar la sesión en pantalla. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

/** Arma ?a=1&skills[]=PHP&skills[]=Laravel; omite valores vacíos. */
function buildUrl(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) value.forEach((item) => query.append(`${key}[]`, item));
    else query.append(key, value);
  });
  const qs = query.toString();
  return `${BASE}${path}${qs ? `?${qs}` : ''}`;
}

async function request(method, path, { params, body, signal, silent401 = false } = {}) {
  const headers = { Accept: 'application/json' };

  const options = { method, headers, signal, credentials: 'include' };
  if (body instanceof FormData) {
    options.body = body; // el navegador pone el Content-Type con su boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(buildUrl(path, params), options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.');
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // `silent401`: comprobaciones que esperan un 401 sin avisar (abrir la página sin sesión, cerrar sesión)
    if (response.status === 401 && !silent401) onUnauthorized();
    throw new ApiError(response.status, data?.message || 'Ocurrió un error inesperado.', data?.errors || {});
  }
  return data;
}

export const api = {
  get: (path, params, options) => request('GET', path, { params, ...options }),
  post: (path, body, options) => request('POST', path, { body, ...options }),
  put: (path, body, options) => request('PUT', path, { body, ...options }),
  patch: (path, body, options) => request('PATCH', path, { body, ...options }),
  delete: (path, options) => request('DELETE', path, options),
};
