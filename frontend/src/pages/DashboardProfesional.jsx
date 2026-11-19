import { useState } from 'react';
import AppShell from '../components/AppShell';
import OfferCard from '../components/OfferCard';
import PagedList from '../components/PagedList';
import PieStat, { slicesFrom } from '../components/PieStat';
import { SkillTags } from '../components/Match';
import { Button, EmptyState, Icon, Input, Modal, Pill, Segmented, Select, SkillPicker, Stat, APPLICATION_TONE, cx } from '../components/ui';
import { useApp } from '../store/AppContext';
import { usePaginated, useDebounced } from '../hooks/usePaginated';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { APPLICATION_STATUS, MODALITY, MODALITY_TONE } from '../data/constants';
import { matchOffer, placeLabel, timeAgo } from '../lib/format';

const MODALITY_OPTIONS = [{ value: 'all', label: 'Todas' }, ...Object.entries(MODALITY).map(([value, label]) => ({ value, label }))];
const SORTS = {
  match: 'Mayor compatibilidad',
  recent: 'Más recientes',
};
const MAX_CV_BYTES = 5 * 1024 * 1024;
const PER_PAGE = 6;

export default function DashboardProfesional() {
  const { state, actions } = useApp();
  const me = state.session.professional;
  const mySkills = me.skills || [];
  const catalog = state.skills.map((s) => s.name);

  const [section, setSection] = useState('explore');
  const [query, setQuery] = useState('');
  const [modality, setModality] = useState('all');
  const [sort, setSort] = useState('match');
  const [skillFilter, setSkillFilter] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [applyTo, setApplyTo] = useState(null);
  const [applying, setApplying] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);

  // Cada lista pide su página al backend; el texto se envía con retraso para no pedir en cada tecla.
  const search = useDebounced(query);
  const offersQ = usePaginated('/job-offers', {
    search,
    modality: modality === 'all' ? undefined : modality,
    skills: skillFilter,
    sort,
    per_page: PER_PAGE,
  });
  const applicationsQ = usePaginated('/applications', { per_page: PER_PAGE });
  const favoritesQ = usePaginated('/favorites', { per_page: PER_PAGE });
  const statsQ = useApi('/profile/stats'); // números de los gráficos de pastel

  const hasFilters = query || modality !== 'all' || skillFilter.length;
  const clearFilters = () => {
    setQuery('');
    setModality('all');
    setSkillFilter([]);
  };

  const nav = [
    { key: 'explore', label: 'Explorar' },
    { key: 'summary', label: 'Mi resumen' },
    { key: 'applications', label: 'Mis postulaciones', count: applicationsQ.meta?.total },
    { key: 'favorites', label: 'Favoritas', count: favoritesQ.meta?.total },
  ];

  const toggleSave = async (offer) => {
    try {
      if (offer.saved) await api.delete(`/job-offers/${offer.id}/favorite`);
      else await api.post(`/job-offers/${offer.id}/favorite`);
      offersQ.patch(offer.id, { saved: !offer.saved });
      favoritesQ.patch(offer.id, { saved: !offer.saved });
      favoritesQ.reload();
      statsQ.reload();
      actions.toast(offer.saved ? 'Quitada de favoritos' : 'Guardada en favoritos');
    } catch (error) {
      actions.toast(error.message, 'bad');
    }
  };

  const confirmApply = async () => {
    setApplying(true);
    try {
      const { data } = await api.post(`/job-offers/${applyTo.id}/applications`);
      const application = { id: data.id, status: data.status, applied_at: data.applied_at };
      offersQ.patch(applyTo.id, { application });
      favoritesQ.patch(applyTo.id, { application });
      applicationsQ.reload();
      statsQ.reload();
      actions.toast(`Te postulaste a ${applyTo.title}`);
    } catch (error) {
      if (error.status === 409) offersQ.reload();
      actions.toast(error.message, error.status === 409 ? 'ok' : 'bad');
    }
    setApplying(false);
    setApplyTo(null);
  };

  const saveSkills = async (skills) => {
    try {
      const { data } = await api.put('/profile/skills', { skills });
      actions.setProfessional(data);
      offersQ.reload();
      actions.toast('Skills actualizadas. Las ofertas se reordenaron.');
      setSkillsOpen(false);
    } catch (error) {
      actions.toast(error.message, 'bad');
    }
  };

  const saveCv = async (file) => {
    const body = new FormData();
    body.append('cv', file);
    const { data } = await api.post('/profile/cv', body);
    actions.setProfessional(data);
    actions.toast('Currículum actualizado');
    setCvOpen(false);
  };

  const renderCard = (offer) => (
    <OfferCard
      key={offer.id}
      offer={offer}
      match={matchOffer(offer, mySkills)}
      onSave={() => toggleSave(offer)}
      onApply={() => setApplyTo(offer)}
    />
  );

  return (
    <AppShell nav={nav} section={section} onSection={setSection}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hola, {me.full_name.split(' ')[0]}</h1>
        <p className="mt-2 text-muted">
          {mySkills.length === 0
            ? 'Agrega tus skills para ver cuánto encajas con cada oferta.'
            : 'Ordena las ofertas por compatibilidad para ver primero las que mejor encajan con tus skills.'}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          {section === 'explore' && (
            <>
              <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca por cargo, empresa, ciudad o skill" aria-label="Buscar ofertas" className="pl-9" />
                  </div>
                  <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar por">
                    {Object.entries(SORTS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Segmented label="Modalidad" options={MODALITY_OPTIONS} value={modality} onChange={setModality} className="w-auto" />
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((v) => !v)}
                    aria-expanded={filtersOpen}
                    className="text-sm font-semibold text-brand hover:underline"
                  >
                    {skillFilter.length ? `Skills (${skillFilter.length})` : 'Filtrar por skills'}
                  </button>
                </div>
                {filtersOpen && <SkillPicker all={catalog} value={skillFilter} onChange={setSkillFilter} label="Skills que debe pedir la oferta" />}
              </div>

              <div className="flex items-center justify-between text-sm text-muted" aria-live="polite">
                <span>
                  {offersQ.meta ? `${offersQ.meta.total} ${offersQ.meta.total === 1 ? 'oferta' : 'ofertas'}` : ' '}
                </span>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="font-semibold text-brand hover:underline">
                    Quitar filtros
                  </button>
                )}
              </div>

              <PagedList
                query={offersQ}
                empty={
                  <EmptyState
                    title="Ninguna oferta coincide"
                    action={hasFilters && <Button variant="secondary" onClick={clearFilters}>Quitar filtros</Button>}
                  >
                    Prueba con otra palabra o quita algún filtro.
                  </EmptyState>
                }
              >
                {renderCard}
              </PagedList>
            </>
          )}

          {section === 'summary' && <Summary stats={statsQ.data} error={statsQ.error} />}

          {section === 'applications' && (
            <PagedList
              query={applicationsQ}
              empty={
                <EmptyState title="Aún no te has postulado" action={<Button onClick={() => setSection('explore')}>Explorar ofertas</Button>}>
                  Cuando te postules, aquí verás en qué etapa va cada proceso.
                </EmptyState>
              }
            >
              {(a) => <ApplicationRow key={a.id} application={a} />}
            </PagedList>
          )}

          {section === 'favorites' && (
            <PagedList
              query={favoritesQ}
              empty={
                <EmptyState title="No has guardado ofertas" action={<Button onClick={() => setSection('explore')}>Explorar ofertas</Button>}>
                  Usa Guardar en una oferta para volver a ella después.
                </EmptyState>
              }
            >
              {renderCard}
            </PagedList>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="mis-skills">
            <h2 id="mis-skills" className="text-lg font-bold">
              {me.full_name}
            </h2>
            <p className="text-sm text-muted">{me.headline || 'Sin titular'}</p>
            <div className="mt-4">
              {mySkills.length ? (
                <ul className="flex flex-wrap gap-1.5">
                  {mySkills.map((s) => (
                    <li key={s} className="rounded-md bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Todavía no tienes skills.</p>
              )}
            </div>
            <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setSkillsOpen(true)}>
              Editar mis skills
            </Button>
          </section>

          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="mi-cv">
            <h2 id="mi-cv" className="text-lg font-bold">
              Currículum
            </h2>
            {me.cv ? (
              <div className="mt-3 flex items-start gap-3 rounded-lg bg-sunken p-3">
                <Icon name="file" className="mt-0.5 h-5 w-5 text-brand" />
                <div className="min-w-0">
                  <p className="break-all text-sm font-semibold">{me.cv.name}</p>
                  <a href={me.cv.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand hover:underline">
                    Ver archivo
                  </a>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">Las empresas necesitan tu currículum para evaluarte.</p>
            )}
            <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setCvOpen(true)}>
              {me.cv ? 'Actualizar currículum' : 'Subir currículum'}
            </Button>
          </section>
        </aside>
      </div>

      <ApplyDialog
        offer={applyTo}
        match={applyTo && matchOffer(applyTo, mySkills)}
        hasCv={Boolean(me.cv)}
        busy={applying}
        onClose={() => setApplyTo(null)}
        onConfirm={confirmApply}
        onUploadCv={() => {
          setApplyTo(null);
          setCvOpen(true);
        }}
      />
      <SkillsDialog key={skillsOpen ? 'open' : 'closed'} open={skillsOpen} all={catalog} value={mySkills} onClose={() => setSkillsOpen(false)} onSave={saveSkills} />
      <CvDialog key={cvOpen ? 'cv-open' : 'cv-closed'} open={cvOpen} onClose={() => setCvOpen(false)} onSave={saveCv} />
    </AppShell>
  );
}

const STEPS = ['Enviada', 'En revisión', 'Decisión'];
const STEP_REACHED = { pending: 0, reviewed: 1, accepted: 2, rejected: 2 };

/** Gráficos de pastel de la actividad del profesional. */
function Summary({ stats, error }) {
  if (error) return <EmptyState title="No se pudo cargar el resumen">{error}</EmptyState>;
  if (!stats) return <p className="py-12 text-center text-sm text-muted" role="status">Cargando…</p>;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Postulaciones enviadas" value={stats.total_applications} tone="brand" />
        <Stat label="Ofertas guardadas" value={stats.favorites} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <PieStat title="Postulaciones por estado" slices={slicesFrom(stats.applications_by_status, APPLICATION_STATUS, APPLICATION_TONE)} />
        <PieStat title="Postulaciones por modalidad" slices={slicesFrom(stats.applications_by_modality, MODALITY, MODALITY_TONE)} />
      </div>
    </div>
  );
}

function ApplicationRow({ application }) {
  const offer = application.offer;
  if (!offer) return null;
  const reached = STEP_REACHED[application.status];
  const decisionTone = application.status === 'accepted' ? 'bg-ok' : application.status === 'rejected' ? 'bg-bad' : 'bg-brand';
  return (
    <article className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{offer.company?.trade_name}</span> · Postulaste {timeAgo(application.days_ago).toLowerCase()}
          </p>
          <h3 className="mt-1 text-lg font-bold">{offer.title}</h3>
          <p className="text-sm text-muted">{placeLabel(offer)}</p>
        </div>
        <Pill tone={APPLICATION_TONE[application.status]}>{APPLICATION_STATUS[application.status]}</Pill>
      </div>
      <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Etapas del proceso">
        {STEPS.map((label, i) => (
          <li key={label}>
            <div className={cx('h-1.5 rounded-full', i <= reached ? (i === 2 ? decisionTone : 'bg-brand') : 'bg-sunken')} />
            <p className={cx('mt-1.5 text-xs', i <= reached ? 'font-semibold text-ink' : 'text-muted')}>{label}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}

function ApplyDialog({ offer, match, hasCv, busy, onClose, onConfirm, onUploadCv }) {
  return (
    <Modal
      open={Boolean(offer)}
      title="Confirmar postulación"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          {hasCv ? <Button onClick={onConfirm} disabled={busy}>{busy ? 'Enviando…' : 'Postularme'}</Button> : <Button onClick={onUploadCv}>Subir currículum</Button>}
        </>
      }
    >
      {offer && (
        <div className="space-y-4">
          <div>
            <p className="font-bold">{offer.title}</p>
            <p className="text-sm text-muted">
              {offer.company?.trade_name} · {placeLabel(offer)}
            </p>
          </div>
          <SkillTags have={match.have} missing={match.missing} />
          <p className="text-sm text-muted">
            {match.missing.length === 0
              ? 'Tienes todas las skills que pide la oferta.'
              : `Te ${match.missing.length === 1 ? 'falta 1 skill' : `faltan ${match.missing.length} skills`} de las que pide la oferta. Puedes postularte igual.`}
          </p>
          {!hasCv && <p className="rounded-lg bg-warn-soft p-3 text-sm text-warn">Necesitas subir tu currículum antes de postularte.</p>}
        </div>
      )}
    </Modal>
  );
}

function SkillsDialog({ open, all, value, onClose, onSave }) {
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    await onSave(draft);
    setBusy(false);
  };
  return (
    <Modal
      open={open}
      wide
      title="Mis skills"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={busy}>{busy ? 'Guardando…' : 'Guardar skills'}</Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-muted">Marca las que dominas. Las ofertas se ordenan según cuánto coinciden contigo.</p>
      <SkillPicker all={all} value={draft} onChange={setDraft} label="Mis skills" />
    </Modal>
  );
}

function CvDialog({ open, onClose, onSave }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const pick = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') return setError('El archivo debe ser un PDF.');
    if (f.size > MAX_CV_BYTES) return setError('El PDF pesa más de 5 MB. Súbelo comprimido.');
    setError('');
    setFile(f);
  };

  const save = async () => {
    if (!file) return setError('Elige un archivo PDF para continuar.');
    setBusy(true);
    try {
      await onSave(file);
    } catch (e) {
      setError(e.first?.('cv') || e.message);
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Actualizar currículum"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={busy}>{busy ? 'Subiendo…' : 'Guardar currículum'}</Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-muted">Las empresas a las que ya te postulaste verán la versión nueva.</p>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={cx(
          'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-brand',
          over ? 'border-brand bg-brand-soft' : 'border-line hover:border-brand/60',
        )}
      >
        <Icon name="upload" className="h-6 w-6 text-brand" />
        <span className="text-sm font-semibold">{file ? file.name : 'Elige un PDF o arrástralo aquí'}</span>
        <span className="text-xs text-muted">Máximo 5 MB</span>
        <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => pick(e.target.files[0])} />
      </label>
      {error && (
        <p role="alert" className="mt-3 text-sm text-bad">
          {error}
        </p>
      )}
    </Modal>
  );
}
