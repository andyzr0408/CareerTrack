import { useCallback, useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PagedList from '../components/PagedList';
import { Button, EmptyState, Field, Icon, Input, Pill, Segmented, Select, Stat, MODERATION_TONE } from '../components/ui';
import { useApp } from '../store/AppContext';
import { usePaginated, useDebounced } from '../hooks/usePaginated';
import { api } from '../lib/api';
import { MODERATION, ROLE_LABEL } from '../data/constants';
import { placeLabel, salaryLabel, timeAgo } from '../lib/format';

const MODERATION_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Por revisar' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'blocked', label: 'Bloqueadas' },
];
const PER_PAGE = 8;

export default function BackofficeAdmin() {
  const { actions } = useApp();
  const [section, setSection] = useState('offers');
  const [stats, setStats] = useState(null);

  // Totales del sistema (calculados por el backend sobre todos los registros)
  const loadStats = useCallback(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch((error) => actions.toast(error.message, 'bad'));
  }, [actions]);
  useEffect(loadStats, [loadStats]);

  const nav = [
    { key: 'offers', label: 'Ofertas', count: stats?.offers.pending },
    { key: 'users', label: 'Usuarios', count: stats?.users },
    { key: 'skills', label: 'Skills', count: stats?.skills },
  ];

  return (
    <AppShell nav={nav} section={section} onSection={setSection}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Administración</h1>
        <p className="mt-2 text-muted">Revisa las ofertas antes de que se publiquen, administra las cuentas y mantén el catálogo de skills.</p>
      </div>
      {section === 'offers' && <OffersPanel stats={stats} onChanged={loadStats} />}
      {section === 'users' && <UsersPanel />}
      {section === 'skills' && <SkillsPanel onChanged={loadStats} />}
    </AppShell>
  );
}

function OffersPanel({ stats, onChanged }) {
  const { actions } = useApp();
  const [filter, setFilter] = useState('pending');
  const [query, setQuery] = useState('');
  const search = useDebounced(query);

  const offersQ = usePaginated('/admin/job-offers', {
    moderation_status: filter === 'all' ? undefined : filter,
    search,
    per_page: PER_PAGE,
  });

  const moderate = async (offer, moderation_status) => {
    try {
      await api.patch(`/admin/job-offers/${offer.id}/moderation`, { moderation_status });
      offersQ.reload();
      onChanged();
      actions.toast(moderation_status === 'approved' ? 'Oferta aprobada' : 'Oferta bloqueada', moderation_status === 'approved' ? 'ok' : 'bad');
    } catch (error) {
      actions.toast(error.message, 'bad');
    }
  };

  const count = (key) => stats?.offers[key] ?? '–';
  const pendingCount = stats?.offers.pending;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Por revisar" value={count('pending')} tone={pendingCount ? 'brand' : undefined} />
        <Stat label="Aprobadas" value={count('approved')} tone="ok" />
        <Stat label="Bloqueadas" value={count('blocked')} />
        <Stat label="Postulaciones" value={stats?.applications ?? '–'} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented label="Filtrar por estado" options={MODERATION_FILTERS} value={filter} onChange={setFilter} className="w-full sm:w-auto" />
        <div className="relative sm:w-72">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cargo o empresa" aria-label="Buscar ofertas" className="pl-9" />
        </div>
      </div>

      <PagedList
        query={offersQ}
        as="ul"
        className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface"
        empty={
          <EmptyState title={filter === 'pending' && !query ? 'No hay ofertas por revisar' : 'Ninguna oferta coincide'}>
            {filter === 'pending' && !query ? 'Cuando una empresa publique una vacante, aparecerá aquí.' : 'Cambia el filtro o la búsqueda.'}
          </EmptyState>
        }
      >
        {(offer) => (
          <li key={offer.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{offer.title}</p>
                <Pill tone={MODERATION_TONE[offer.moderation_status]}>{MODERATION[offer.moderation_status]}</Pill>
              </div>
              <p className="mt-0.5 text-sm text-muted">
                {offer.company?.trade_name} · {placeLabel(offer)} · {salaryLabel(offer)} · {timeAgo(offer.days_ago)}
              </p>
              <p className="mt-1 text-sm text-muted">Pide: {(offer.skills || []).join(', ')}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {offer.moderation_status !== 'approved' && (
                <Button variant="ok" size="sm" onClick={() => moderate(offer, 'approved')} aria-label={`Aprobar ${offer.title}`}>
                  <Icon name="check" />
                  Aprobar
                </Button>
              )}
              {offer.moderation_status !== 'blocked' && (
                <Button variant="danger" size="sm" onClick={() => moderate(offer, 'blocked')} aria-label={`Bloquear ${offer.title}`}>
                  <Icon name="x" />
                  Bloquear
                </Button>
              )}
            </div>
          </li>
        )}
      </PagedList>
    </div>
  );
}

function UsersPanel() {
  const { state, actions } = useApp();
  const [role, setRole] = useState('all');
  const [query, setQuery] = useState('');
  const search = useDebounced(query);

  const usersQ = usePaginated('/admin/users', {
    role: role === 'all' ? undefined : role,
    search,
    per_page: PER_PAGE,
  });

  const setStatus = async (user, status) => {
    try {
      const { data } = await api.patch(`/admin/users/${user.id}/status`, { status });
      usersQ.patch(user.id, { status: data.status });
      actions.toast(status === 'active' ? 'Cuenta activada' : 'Cuenta desactivada');
    } catch (error) {
      actions.toast(error.message, 'bad');
    }
  };

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

      <PagedList
        query={usersQ}
        as="ul"
        className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface"
        empty={<EmptyState title="Ningún usuario coincide">Cambia el tipo de cuenta o la búsqueda.</EmptyState>}
      >
        {(user) => {
          const isSelf = user.id === state.session.id;
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
                  onClick={() => setStatus(user, active ? 'inactive' : 'active')}
                  aria-label={`${active ? 'Desactivar' : 'Activar'} la cuenta ${user.email}`}
                >
                  {active ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </li>
          );
        }}
      </PagedList>
      <p className="text-sm text-muted">Una cuenta desactivada no puede iniciar sesión, pero conserva su historial.</p>
    </div>
  );
}

function SkillsPanel({ onChanged }) {
  const { state, actions } = useApp();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const add = async (e) => {
    e.preventDefault();
    const value = name.trim();
    if (!value) return setError('Escribe el nombre de la skill.');
    try {
      await api.post('/admin/skills', { name: value });
      setError('');
      setName('');
      await actions.reloadSkills();
      onChanged();
      actions.toast('Skill agregada al catálogo');
    } catch (err) {
      if (err.status === 422) setError(err.first('name') || err.message);
      else actions.toast(err.message, 'bad');
    }
  };

  const remove = async (skill) => {
    try {
      await api.delete(`/admin/skills/${skill.id}`);
      await actions.reloadSkills();
      onChanged();
      actions.toast('Skill eliminada del catálogo');
    } catch (err) {
      actions.toast(err.message, 'bad');
    }
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
          <li key={skill.id} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface py-1 pl-3 pr-1 text-sm font-medium">
            {skill.name}
            <button
              type="button"
              onClick={() => remove(skill)}
              aria-label={`Eliminar la skill ${skill.name}`}
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
