import { useNavigate } from 'react-router-dom';
import { useApp, useTheme } from '../store/AppContext';
import { ROLE_LABEL } from '../data/mock';
import { Avatar, Button, Icon, Toast, cx } from './ui';

export function Logo({ className }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-display text-sm font-bold text-brand-ink">CT</span>
      <span className="font-display text-xl font-bold tracking-tight">CareerTrack</span>
    </span>
  );
}

export function ThemeToggle({ className }) {
  const { dark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className={cx('rounded-lg p-2 text-muted transition-colors hover:bg-sunken hover:text-ink', className)}
    >
      <Icon name={dark ? 'sun' : 'moon'} className="h-5 w-5" />
    </button>
  );
}

/**
 * Marco de las pantallas con sesión: barra superior, navegación por secciones y aviso.
 * `nav` = [{ key, label, count? }]; `section` y `onSection` controlan la sección activa.
 */
export default function AppShell({ nav, section, onSection, children }) {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const { session } = state;

  const leave = () => {
    actions.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav aria-label="Secciones" className="ml-4 hidden gap-1 md:flex">
            {nav.map((item) => (
              <NavButton key={item.key} item={item} active={section === item.key} onClick={() => onSection(item.key)} />
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={session?.name} />
              <div className="leading-tight">
                <p className="text-sm font-semibold">{session?.name}</p>
                <p className="text-xs text-muted">{ROLE_LABEL[session?.role]}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={leave} aria-label="Cerrar sesión">
              <Icon name="logout" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
        <nav aria-label="Secciones" className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 md:hidden">
          {nav.map((item) => (
            <NavButton key={item.key} item={item} active={section === item.key} onClick={() => onSection(item.key)} />
          ))}
        </nav>
      </header>
      <main id="contenido" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
      <Toast />
    </div>
  );
}

function NavButton({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
        active ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-sunken hover:text-ink',
      )}
    >
      {item.label}
      {item.count !== undefined && (
        <span className={cx('rounded-full px-1.5 text-xs', active ? 'bg-brand/15' : 'bg-sunken')}>{item.count}</span>
      )}
    </button>
  );
}
