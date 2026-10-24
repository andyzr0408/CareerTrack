import { MODALITY } from '../data/mock';

/** Cuánto coincide el perfil con la oferta, según las skills que pide la oferta. */
export function matchOffer(offer, mySkills) {
  const have = offer.skills.filter((s) => mySkills.includes(s));
  const missing = offer.skills.filter((s) => !mySkills.includes(s));
  const pct = offer.skills.length ? Math.round((have.length / offer.skills.length) * 100) : 0;
  return { pct, have, missing };
}

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

/** Valor numérico inicial del rango salarial, para ordenar. */
export function salaryFloor(salary) {
  const first = /[\d,]+/.exec(salary || '');
  return first ? Number(first[0].replace(/,/g, '')) : 0;
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
