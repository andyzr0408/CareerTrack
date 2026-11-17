import { MODALITY } from '../data/constants';

/** Cuánto coincide el perfil con la oferta, según las skills que pide la oferta. */
export function matchOffer(offer, mySkills) {
  const wanted = offer.skills || [];
  const have = wanted.filter((s) => mySkills.includes(s));
  const missing = wanted.filter((s) => !mySkills.includes(s));
  const pct = wanted.length ? Math.round((have.length / wanted.length) * 100) : 0;
  return { pct, have, missing };
}

/** Texto relativo a partir de `days_ago` (lo calcula el backend). */
export function timeAgo(daysAgo) {
  if (daysAgo <= 0) return 'Hoy';
  if (daysAgo === 1) return 'Ayer';
  if (daysAgo < 7) return `Hace ${daysAgo} días`;
  const weeks = Math.round(daysAgo / 7);
  return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
}

export function placeLabel(offer) {
  const base = MODALITY[offer.modality];
  return offer.location ? `${base} · ${offer.location}` : base;
}

export function salaryLabel(offer) {
  return offer.salary_range ? `${offer.salary_range} al mes` : 'Salario no indicado';
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
