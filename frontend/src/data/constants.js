// Etiquetas fijas de la interfaz. Los datos (ofertas, usuarios, skills) vienen de la API.

export const MODALITY = { remote: 'Remoto', onsite: 'Presencial', hybrid: 'Híbrido' };
export const OFFER_STATUS = { active: 'Activa', paused: 'En pausa' };
export const MODERATION = { pending: 'Por revisar', approved: 'Aprobada', blocked: 'Bloqueada' };
export const APPLICATION_STATUS = {
  pending: 'Pendiente',
  reviewed: 'En revisión',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
};
export const ROLE_LABEL = { professional: 'Profesional', company: 'Empresa', admin: 'Administrador' };

// Cuentas que crea el seeder (backend/database/seeders), todas con la clave "password".
export const DEMO_ACCOUNTS = {
  professional: { email: 'profesional@careertrack.test', password: 'password' },
  company: { email: 'empresa@careertrack.test', password: 'password' },
  admin: { email: 'admin@careertrack.test', password: 'password' },
};
