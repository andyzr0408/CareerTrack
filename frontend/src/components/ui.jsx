import { useEffect, useId, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { initials } from '../lib/format';

export const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ---------- Iconos ---------- */
const ICONS = {
  heart: 'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4.5 4.5',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-13v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
  x: 'm6 6 12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  file: 'M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6m-6 3h6',
  upload: 'M12 16V5m0 0-4 4m4-4 4 4M5 19h14',
  pause: 'M9 5v14m6-14v14',
  play: 'm8 5 11 7-11 7V5Z',
  trash: 'M5 7h14M10 7V4h4v3m-8 0 1 13h10l1-13M10 11v6m4-6v6',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0M17 4.5a3.5 3.5 0 0 1 0 6.5m2 2.5a6 6 0 0 1 3 6.5',
  logout: 'M10 4H5v16h5m4-4 4-4-4-4m4 4H9',
  pin: 'M12 21s6-5.7 6-11a6 6 0 1 0-12 0c0 5.3 6 11 6 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  money: 'M3 7h18v10H3V7Zm9 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 10v4m12-4v4',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeoff: 'M3 3l18 18M10.6 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.4 7.6A17 17 0 0 0 2 12s3.5 6 10 6c1.3 0 2.5-.2 3.6-.6',
};

export function Icon({ name, className = 'h-4 w-4', ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx('shrink-0', className)}
      {...rest}
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

/* ---------- Botones ---------- */
const BUTTON_VARIANTS = {
  primary: 'bg-brand text-brand-ink hover:bg-brand/90 disabled:bg-brand/40',
  secondary: 'border border-line bg-surface text-ink hover:bg-sunken disabled:text-muted',
  ghost: 'text-muted hover:bg-sunken hover:text-ink',
  danger: 'bg-bad-soft text-bad hover:bg-bad/20',
  ok: 'bg-ok-soft text-ok hover:bg-ok/20',
};

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed',
        size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm',
        BUTTON_VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

/* ---------- Formularios ---------- */
export function Field({ label, error, hint, children, className }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-bad">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL =
  'w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 aria-[invalid=true]:border-bad';

export function Input({ className, ...props }) {
  return <input className={cx(CONTROL, 'border-line', className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cx(CONTROL, 'border-line pr-8', className)} {...props}>
      {children}
    </select>
  );
}

/** Selector de una opción entre pocas (roles, modalidad). */
export function Segmented({ label, options, value, onChange, className = 'w-full' }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('inline-flex rounded-lg bg-sunken p-1', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cx(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
              active ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Skills como botones de activar y desactivar. */
export function SkillPicker({ all, value, onChange, label = 'Skills' }) {
  const toggle = (skill) => onChange(value.includes(skill) ? value.filter((s) => s !== skill) : [...value, skill]);
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {all.map((skill) => {
        const on = value.includes(skill);
        return (
          <button
            key={skill}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(skill)}
            className={cx(
              'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
              on ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface text-muted hover:border-muted hover:text-ink',
            )}
          >
            {on && <Icon name="check" className="h-3.5 w-3.5" />}
            {skill}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Estados y etiquetas ---------- */
const PILL_TONES = {
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  brand: 'bg-brand-soft text-brand',
  neutral: 'bg-sunken text-muted',
};

export function Pill({ tone = 'neutral', children, className }) {
  return (
    <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', PILL_TONES[tone], className)}>
      {children}
    </span>
  );
}

export const APPLICATION_TONE = { pending: 'neutral', reviewed: 'warn', accepted: 'ok', rejected: 'bad' };
export const MODERATION_TONE = { pending: 'warn', approved: 'ok', blocked: 'bad' };
export const OFFER_TONE = { active: 'ok', paused: 'neutral' };

export function Avatar({ name, className }) {
  return (
    <span
      aria-hidden="true"
      className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand', className)}
    >
      {initials(name)}
    </span>
  );
}

export function Stat({ label, value, note, tone }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={cx('mt-1 font-display text-3xl font-bold', tone === 'ok' ? 'text-ok' : tone === 'brand' ? 'text-brand' : 'text-ink')}>{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Diálogo ---------- */
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({ open, title, onClose, children, footer, wide }) {
  const panel = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector(FOCUSABLE)?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panel.current) return;
      const items = [...panel.current.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          'relative flex max-h-[92vh] w-full animate-pop flex-col rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-md',
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1.5 text-muted hover:bg-sunken hover:text-ink">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Aviso ---------- */
export function Toast() {
  const { state, dispatch } = useApp();
  const { toast } = state;

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => dispatch({ type: 'toast/clear' }), 3800);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
      {toast && (
        <div
          key={toast.id}
          className={cx(
            'pointer-events-auto flex max-w-md animate-pop items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg',
            toast.tone === 'bad' ? 'bg-bad text-canvas' : 'bg-ink text-canvas',
          )}
        >
          <span>{toast.message}</span>
          <button type="button" onClick={() => dispatch({ type: 'toast/clear' })} aria-label="Cerrar aviso" className="opacity-70 hover:opacity-100">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
