import { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { Button, EmptyState, Field, Icon, Input, Pill, Segmented, Select, Stat, MODERATION_TONE } from '../components/ui';
import { useApp } from '../store/AppContext';
import { MODERATION, ROLE_LABEL } from '../data/mock';
import { placeLabel, timeAgo } from '../lib/format';

const MODERATION_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Por revisar' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'blocked', label: 'Bloqueadas' },
];

export default function BackofficeAdmin() {
  const { state } = useApp();
  const [section, setSection] = useState('offers');

  const pending = state.offers.filter((o) => o.moderation === 'pending').length;
  const nav = [
    { key: 'offers', label: 'Ofertas', count: pending },
    { key: 'users', label: 'Usuarios', count: state.users.length },
    { key: 'skills', label: 'Skills', count: state.skills.length },
  ];

  return (
    <AppShell nav={nav} section={section} onSection={setSection}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Administración</h1>
        <p className="mt-2 text-muted">Revisa las ofertas antes de que se publiquen, administra las cuentas y mantén el catálogo de skills.</p>
      </div>
      {section === 'offers' && <OffersPanel />}
      {section === 'users' && <UsersPanel />}
      {section === 'skills' && <SkillsPanel />}
    </AppShell>
  );
}

function OffersPanel() {
  const { state, actions } = useApp();
  const [filter, setFilter] = useState('pending');
  const [query, setQuery] = useState('');

  const count = (m) => state.offers.filter((o) => o.moderation === m).length;
  const rows = useMemo(() => {
    const text = query.trim().toLowerCase();
    return state.offers
      .filter((o) => filter === 'all' || o.moderation === filter)
      .filter((o) => !text || `${o.title} ${state.companies[o.companyId]}`.toLowerCase().includes(text))
      .sort((a, b) => a.daysAgo - b.daysAgo);
  }, [state.offers, state.companies, filter, query]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Por revisar" value={count('pending')} tone={count('pending') ? 'brand' : undefined} />
        <Stat label="Aprobadas" value={count('approved')} tone="ok" />
        <Stat label="Bloqueadas" value={count('blocked')} />
        <Stat label="Postulaciones" value={state.applications.length} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented label="Filtrar por estado" options={MODERATION_FILTERS} value={filter} onChange={setFilter} className="w-full sm:w-auto" />
        <div className="relative sm:w-72">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cargo o empresa" aria-label="Buscar ofertas" className="pl-9" />
        </div>
      </div>

      {rows.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {rows.map((offer) => (
            <li key={offer.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{offer.title}</p>
                  <Pill tone={MODERATION_TONE[offer.moderation]}>{MODERATION[offer.moderation]}</Pill>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {state.companies[offer.companyId]} · {placeLabel(offer)} · {offer.salary} · {timeAgo(offer.daysAgo)}
                </p>
                <p className="mt-1 text-sm text-muted">Pide: {offer.skills.join(', ')}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {offer.moderation !== 'approved' && (
                  <Button variant="ok" size="sm" onClick={() => actions.moderateOffer(offer.id, 'approved')} aria-label={`Aprobar ${offer.title}`}>
                    <Icon name="check" />
                    Aprobar
                  </Button>
                )}
                {offer.moderation !== 'blocked' && (
                  <Button variant="danger" size="sm" onClick={() => actions.moderateOffer(offer.id, 'blocked')} aria-label={`Bloquear ${offer.title}`}>
                    <Icon name="x" />
                    Bloquear
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={filter === 'pending' && !query ? 'No hay ofertas por revisar' : 'Ninguna oferta coincide'}>
          {filter === 'pending' && !query ? 'Cuando una empresa publique una vacante, aparecerá aquí.' : 'Cambia el filtro o la búsqueda.'}
        </EmptyState>
      )}
    </div>
  );
}

function UsersPanel() {
  const { state, actions } = useApp();
  const [role, setRole] = useState('all');
  const [query, setQuery] = useState('');

  const rows = state.users
    .filter((u) => role === 'all' || u.role === role)
    .filter((u) => !query.trim() || u.email.includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filtrar por tipo de cuenta" className="sm:w-56">
          <option value="all">Todos los tipos</option>
          {Object.entries(ROLE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <div className="relative sm:w-72">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por correo" aria-label="Buscar usuarios" className="pl-9" />
        </div>
      </div>

      {rows.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {rows.map((user) => {
            const isSelf = user.email === state.session.email;
            const active = user.status === 'active';
            return (
              <li key={user.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="break-all font-semibold">{user.email}</p>
                  <p className="text-sm text-muted">{ROLE_LABEL[user.role]}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Pill tone={active ? 'ok' : 'neutral'}>{active ? 'Activa' : 'Desactivada'}</Pill>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isSelf}
                    title={isSelf ? 'No puedes desactivar tu propia cuenta' : undefined}
                    onClick={() => actions.setUserStatus(user.id, active ? 'inactive' : 'active')}
                    aria-label={`${active ? 'Desactivar' : 'Activar'} la cuenta ${user.email}`}
                  >
                    {active ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="Ningún usuario coincide">Cambia el tipo de cuenta o la búsqueda.</EmptyState>
      )}
      <p className="text-sm text-muted">Una cuenta desactivada no puede iniciar sesión, pero conserva su historial.</p>
    </div>
  );
}

function SkillsPanel() {
  const { state, actions } = useApp();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const add = (e) => {
    e.preventDefault();
    const value = name.trim();
    if (!value) return setError('Escribe el nombre de la skill.');
    if (state.skills.some((s) => s.toLowerCase() === value.toLowerCase())) return setError('Esa skill ya existe en el catálogo.');
    setError('');
    setName('');
    actions.addSkill(value);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={add} noValidate className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-start">
        <Field label="Nueva skill" error={error} className="flex-1">
          {(props) => <Input {...props} value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="Kubernetes" />}
        </Field>
        <Button type="submit" className="sm:mt-7">
          <Icon name="plus" />
          Agregar
        </Button>
      </form>

      <ul className="flex flex-wrap gap-2">
        {state.skills.map((skill) => (
          <li key={skill} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface py-1 pl-3 pr-1 text-sm font-medium">
            {skill}
            <button
              type="button"
              onClick={() => actions.removeSkill(skill)}
              aria-label={`Eliminar la skill ${skill}`}
              className="rounded-full p-1 text-muted hover:bg-bad-soft hover:text-bad"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
