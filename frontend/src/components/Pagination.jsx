import { Button, Icon, cx } from './ui';

/** Números de página a mostrar: primera, última y las vecinas de la actual (null = "…"). */
function pageWindow(current, last) {
  const pages = new Set([1, last, current - 1, current, current + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
}

/** Controles de paginación para la respuesta `meta` de Laravel. */
export default function Pagination({ meta, onPage, loading }) {
  if (!meta || meta.total === 0) return null;
  const { current_page: current, last_page: last, from, to, total } = meta;

  return (
    <nav aria-label="Paginación" className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
      <p className="text-sm text-muted" aria-live="polite">
        Mostrando {from}–{to} de {total}
      </p>
      {last > 1 && (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" disabled={loading || current <= 1} onClick={() => onPage(current - 1)} aria-label="Página anterior">
            <Icon name="chevron" className="h-4 w-4 rotate-180" />
          </Button>
          {pageWindow(current, last).map((n, i) =>
            n === null ? (
              <span key={`gap-${i}`} className="px-1 text-muted" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                disabled={loading}
                onClick={() => onPage(n)}
                aria-label={`Página ${n}`}
                aria-current={n === current ? 'page' : undefined}
                className={cx(
                  'h-8 min-w-8 rounded-lg px-2 text-sm font-semibold transition-colors',
                  n === current ? 'bg-brand text-brand-ink' : 'text-muted hover:bg-sunken hover:text-ink',
                )}
              >
                {n}
              </button>
            ),
          )}
          <Button variant="ghost" size="sm" disabled={loading || current >= last} onClick={() => onPage(current + 1)} aria-label="Página siguiente">
            <Icon name="chevron" className="h-4 w-4" />
          </Button>
        </div>
      )}
    </nav>
  );
}
