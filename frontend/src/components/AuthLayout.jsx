import { useState } from 'react';
import { Logo, ThemeToggle } from './AppShell';
import { Icon, cx } from './ui';

const DEMO_SKILLS = ['React', 'TypeScript', 'Laravel', 'SQL', 'Docker'];
const DEMO_OFFERS = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'Fintech Global', salary: '$4,500 - $5,800', skills: ['React', 'TypeScript', 'SQL'] },
  { id: 2, title: 'Desarrollador Backend Laravel', company: 'TechVentures', salary: '$2,800 - $3,600', skills: ['Laravel', 'SQL', 'Docker'] },
  { id: 3, title: 'Ingeniero DevOps', company: 'CloudScale AI Labs', salary: '$3,800 - $4,800', skills: ['Docker', 'Linux', 'AWS'] },
];

/** Demostración del medidor de compatibilidad: marcar skills reordena las ofertas. */
function MatchDemo() {
  const [mine, setMine] = useState(['React', 'SQL']);
  const toggle = (s) => setMine((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const ranked = DEMO_OFFERS.map((o) => ({
    ...o,
    pct: Math.round((o.skills.filter((s) => mine.includes(s)).length / o.skills.length) * 100),
  })).sort((a, b) => b.pct - a.pct || a.id - b.id);

  return (
    <div className="w-full max-w-md">
      <h2 className="font-display text-4xl font-bold leading-tight text-white">Tus skills ordenan las ofertas.</h2>
      <p className="mt-3 text-blue-100/80">Marca lo que sabes hacer y mira cuánto encajas con cada vacante.</p>

      <div role="group" aria-label="Tus skills de ejemplo" className="mt-8 flex flex-wrap gap-2">
        {DEMO_SKILLS.map((s) => {
          const on = mine.includes(s);
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(s)}
              className={cx(
                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                on ? 'border-white bg-white text-[#0E1A3F]' : 'border-white/30 text-white/80 hover:border-white/70',
              )}
            >
              {on && <Icon name="check" className="h-3.5 w-3.5" />}
              {s}
            </button>
          );
        })}
      </div>

      <ol className="mt-6 space-y-3" aria-live="polite">
        {ranked.map((o) => (
          <li key={o.id} className="rounded-xl bg-white/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{o.title}</p>
                <p className="text-sm text-blue-100/70">
                  {o.company} · {o.salary}
                </p>
              </div>
              <span className="font-display text-2xl font-bold text-white">{o.pct}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${o.pct}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </div>
      <aside aria-label="Cómo funciona la compatibilidad" className="hidden bg-[#0E1A3F] p-12 lg:flex lg:items-center lg:justify-center">
        <MatchDemo />
      </aside>
    </div>
  );
}
