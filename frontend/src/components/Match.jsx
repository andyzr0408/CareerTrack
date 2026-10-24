import { cx, Icon } from './ui';

/** Porcentaje de compatibilidad entre las skills del perfil y las de la oferta. */
export function MatchMeter({ pct, className }) {
  const tone = pct >= 75 ? 'bg-ok' : pct >= 40 ? 'bg-brand' : 'bg-muted';
  const text = pct >= 75 ? 'text-ok' : pct >= 40 ? 'text-brand' : 'text-muted';
  return (
    <div className={cx('w-28', className)} role="img" aria-label={`Compatibilidad ${pct}%`}>
      <div className="flex items-baseline justify-between">
        <span className={cx('font-display text-2xl font-bold leading-none', text)}>{pct}%</span>
        <span className="text-xs text-muted">compatible</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
        <div className={cx('h-full rounded-full transition-all duration-300', tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Skills de la oferta: rellenas si ya las tienes, con borde punteado si te faltan. */
export function SkillTags({ have, missing }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {have.map((s) => (
        <li key={s} className="inline-flex items-center gap-1 rounded-md bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
          <Icon name="check" className="h-3 w-3" />
          {s}
          <span className="sr-only"> (la tienes)</span>
        </li>
      ))}
      {missing.map((s) => (
        <li key={s} className="rounded-md border border-dashed border-muted/60 px-2 py-0.5 text-xs font-medium text-muted">
          {s}
          <span className="sr-only"> (te falta)</span>
        </li>
      ))}
    </ul>
  );
}
