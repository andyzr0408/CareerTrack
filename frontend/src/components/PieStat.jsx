import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// Las clases completas van escritas aquí para que Tailwind las incluya en el CSS.
const TONES = {
  brand: { fill: 'fill-brand', dot: 'bg-brand' },
  ok: { fill: 'fill-ok', dot: 'bg-ok' },
  warn: { fill: 'fill-warn', dot: 'bg-warn' },
  bad: { fill: 'fill-bad', dot: 'bg-bad' },
  neutral: { fill: 'fill-muted', dot: 'bg-muted' },
};

/** Convierte { clave: cantidad } en porciones con su etiqueta y color: [{ key, label, value, tone }]. */
export function slicesFrom(counts, labels, tones) {
  return Object.keys(labels).map((key) => ({ key, label: labels[key], value: counts?.[key] ?? 0, tone: tones[key] }));
}

const TOOLTIP_STYLE = {
  background: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--line))',
  borderRadius: 8,
  color: 'rgb(var(--ink))',
  fontSize: 13,
};

/** Gráfico de pastel con su leyenda en texto (con cantidad y porcentaje), legible sin ver los colores. */
export default function PieStat({ title, slices }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const drawn = slices.filter((s) => s.value > 0);
  const summary = slices.map((s) => `${s.label}: ${s.value}`).join(', ');
  // Porción señalada con el ratón, el teclado o la leyenda: el resto se atenúa y el centro muestra su cifra.
  const [active, setActive] = useState(null);
  const current = slices.find((s) => s.key === active);
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <section className="animate-rise rounded-xl border border-line bg-surface p-5 transition-shadow duration-200 hover:shadow-lg" aria-label={title}>
      <h3 className="text-base font-bold">{title}</h3>

      {total === 0 ? (
        <p className="mt-4 text-sm text-muted">Todavía no hay datos para este gráfico.</p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative h-40 w-40 shrink-0" role="img" aria-label={`${title}. ${summary}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={drawn} dataKey="value" nameKey="label" innerRadius={42} outerRadius={72} paddingAngle={drawn.length > 1 ? 2 : 0} stroke="none" isAnimationActive={!reduce} animationDuration={800} onMouseEnter={(_, i) => setActive(drawn[i].key)} onMouseLeave={() => setActive(null)}>
                  {drawn.map((s) => (
                    <Cell
                      key={s.key}
                      className={`${TONES[s.tone]?.fill} cursor-pointer transition-opacity duration-200`}
                      style={{ opacity: active && active !== s.key ? 0.35 : 1, outline: 'none' }}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: 'rgb(var(--ink))' }} />
              </PieChart>
            </ResponsiveContainer>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-bold tabular-nums">{current ? current.value : total}</span>
              <span className="max-w-[4.5rem] truncate text-[11px] text-muted">{current ? current.label : 'total'}</span>
            </div>
          </div>

          <ul className="w-full space-y-1.5 text-sm">
            {slices.map((s) => (
              <li
                key={s.key}
                onMouseEnter={() => setActive(s.key)}
                onMouseLeave={() => setActive(null)}
                className={`flex cursor-default items-center justify-between gap-3 rounded-md px-2 py-1 transition-all duration-150 ${active === s.key ? 'bg-sunken' : ''} ${active && active !== s.key ? 'opacity-50' : ''}`}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${TONES[s.tone]?.dot}`} />
                  {s.label}
                </span>
                <span className="font-semibold tabular-nums">
                  {s.value} <span className="font-normal text-muted">({Math.round((s.value / total) * 100)}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
