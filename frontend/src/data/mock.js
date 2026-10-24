// Datos de ejemplo. Reflejan el modelo de la base de datos (docs/modelo-datos.md)
// para que, al conectar el backend, solo cambie el origen de los datos.

export const SKILLS = [
  'PHP', 'Laravel', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Node.js',
  'Python', 'Java', 'C#', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Docker',
  'Git', 'AWS', 'Linux', 'HTML', 'CSS', 'Tailwind CSS', 'Figma', 'Testing',
  'Scrum', 'Inglés',
];

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

export const COMPANIES = {
  c1: 'TechVentures Inc.',
  c2: 'Fintech Global Inc.',
  c3: 'CloudScale AI Labs',
  c4: 'Atlas Logística',
  c5: 'Nube Verde Studio',
  c6: 'Global Crypto',
};

// Cuenta de cada rol con la que se inicia sesión en la demostración.
export const DEMO_ACCOUNTS = {
  professional: { email: 'profesional@careertrack.test', name: 'Andrés Zerpa', profileId: 'p1' },
  company: { email: 'empresa@careertrack.test', name: 'TechVentures Inc.', companyId: 'c1' },
  admin: { email: 'admin@careertrack.test', name: 'Administración' },
};

export const initialOffers = [
  { id: 'o1', companyId: 'c1', title: 'Desarrollador Backend Laravel', modality: 'remote', location: '', salary: '$2,800 - $3,600', skills: ['PHP', 'Laravel', 'MySQL', 'Git'], status: 'active', moderation: 'approved', daysAgo: 2 },
  { id: 'o2', companyId: 'c1', title: 'Desarrollador Frontend React', modality: 'hybrid', location: 'Bogotá', salary: '$2,400 - $3,200', skills: ['React', 'JavaScript', 'Tailwind CSS', 'Git'], status: 'active', moderation: 'approved', daysAgo: 6 },
  { id: 'o3', companyId: 'c1', title: 'Ingeniero DevOps', modality: 'remote', location: '', salary: '$3,800 - $4,800', skills: ['Docker', 'AWS', 'Linux', 'Git'], status: 'paused', moderation: 'approved', daysAgo: 9 },
  { id: 'o4', companyId: 'c1', title: 'Analista de Datos', modality: 'onsite', location: 'Caracas', salary: '$1,800 - $2,400', skills: ['SQL', 'Python', 'PostgreSQL'], status: 'active', moderation: 'pending', daysAgo: 1 },
  { id: 'o5', companyId: 'c2', title: 'Senior Frontend Engineer', modality: 'remote', location: '', salary: '$4,500 - $5,800', skills: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Testing'], status: 'active', moderation: 'approved', daysAgo: 0 },
  { id: 'o6', companyId: 'c3', title: 'Tech Lead Full Stack', modality: 'remote', location: '', salary: '$5,500 - $7,200', skills: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS'], status: 'active', moderation: 'approved', daysAgo: 1 },
  { id: 'o7', companyId: 'c4', title: 'Desarrollador PHP Senior', modality: 'hybrid', location: 'Madrid', salary: '$3,400 - $4,200', skills: ['PHP', 'Laravel', 'SQL', 'Testing', 'Scrum'], status: 'active', moderation: 'approved', daysAgo: 3 },
  { id: 'o8', companyId: 'c5', title: 'Diseñador UX/UI', modality: 'remote', location: '', salary: '$2,200 - $3,000', skills: ['Figma', 'HTML', 'CSS', 'Inglés'], status: 'active', moderation: 'approved', daysAgo: 4 },
  { id: 'o9', companyId: 'c6', title: 'Digitador Remoto', modality: 'remote', location: '', salary: '$300 - $500', skills: ['Inglés'], status: 'active', moderation: 'blocked', daysAgo: 5 },
  { id: 'o10', companyId: 'c2', title: 'Staff Backend Engineer', modality: 'remote', location: '', salary: '$6,000 - $7,500', skills: ['Java', 'SQL', 'AWS', 'Docker'], status: 'active', moderation: 'pending', daysAgo: 1 },
  { id: 'o11', companyId: 'c3', title: 'Lead AI Architect', modality: 'remote', location: '', salary: '$7,000 - $9,000', skills: ['Python', 'AWS', 'Docker'], status: 'active', moderation: 'pending', daysAgo: 1 },
];

export const initialProfessionals = [
  { id: 'p1', name: 'Andrés Zerpa', headline: 'Desarrollador Web', skills: ['PHP', 'Laravel', 'React', 'JavaScript', 'SQL'], cv: { name: 'CV_AndresZerpa_2026.pdf', size: '2.4 MB', date: '15 Oct 2026' } },
  { id: 'p2', name: 'Camila Rojas', headline: 'Desarrolladora Full Stack', skills: ['PHP', 'Laravel', 'Vue.js', 'MySQL', 'Git'], cv: { name: 'CV_CamilaRojas.pdf', size: '1.1 MB', date: '10 Oct 2026' } },
  { id: 'p3', name: 'Luis Peña', headline: 'Frontend Developer', skills: ['React', 'TypeScript', 'CSS', 'Tailwind CSS'], cv: { name: 'CV_LuisPena.pdf', size: '0.9 MB', date: '2 Oct 2026' } },
  { id: 'p4', name: 'Valentina Soto', headline: 'Ingeniera de Datos', skills: ['Python', 'SQL', 'PostgreSQL', 'AWS'], cv: { name: 'CV_ValentinaSoto.pdf', size: '1.6 MB', date: '8 Oct 2026' } },
  { id: 'p5', name: 'Diego Marín', headline: 'DevOps Engineer', skills: ['Docker', 'AWS', 'Linux', 'Git'], cv: { name: 'CV_DiegoMarin.pdf', size: '1.3 MB', date: '5 Oct 2026' } },
];

export const initialApplications = [
  { id: 'a1', professionalId: 'p1', offerId: 'o7', status: 'reviewed', daysAgo: 3 },
  { id: 'a2', professionalId: 'p1', offerId: 'o6', status: 'pending', daysAgo: 1 },
  { id: 'a3', professionalId: 'p2', offerId: 'o1', status: 'reviewed', daysAgo: 2 },
  { id: 'a4', professionalId: 'p3', offerId: 'o2', status: 'pending', daysAgo: 1 },
  { id: 'a5', professionalId: 'p5', offerId: 'o3', status: 'accepted', daysAgo: 7 },
  { id: 'a6', professionalId: 'p4', offerId: 'o4', status: 'pending', daysAgo: 0 },
  { id: 'a7', professionalId: 'p5', offerId: 'o1', status: 'rejected', daysAgo: 2 },
  { id: 'a8', professionalId: 'p1', offerId: 'o1', status: 'pending', daysAgo: 0 },
];

export const initialFavorites = ['o5', 'o8'];

export const initialUsers = [
  { id: 'u1', email: 'admin@careertrack.test', role: 'admin', status: 'active' },
  { id: 'u2', email: 'empresa@careertrack.test', role: 'company', status: 'active' },
  { id: 'u3', email: 'profesional@careertrack.test', role: 'professional', status: 'active' },
  { id: 'u4', email: 'inactivo@careertrack.test', role: 'professional', status: 'inactive' },
  { id: 'u5', email: 'camila.rojas@correo.test', role: 'professional', status: 'active' },
  { id: 'u6', email: 'luis.pena@correo.test', role: 'professional', status: 'active' },
  { id: 'u7', email: 'talento@fintechglobal.test', role: 'company', status: 'active' },
  { id: 'u8', email: 'rrhh@cloudscale.test', role: 'company', status: 'active' },
  { id: 'u9', email: 'info@globalcrypto.test', role: 'company', status: 'inactive' },
];
