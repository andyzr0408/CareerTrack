import { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import OfferCard from '../components/OfferCard';
import { SkillTags } from '../components/Match';
import { Button, EmptyState, Icon, Input, Modal, Pill, Segmented, Select, SkillPicker, APPLICATION_TONE, cx } from '../components/ui';
import { useApp } from '../store/AppContext';
import { APPLICATION_STATUS, MODALITY } from '../data/mock';
import { matchOffer, placeLabel, salaryFloor, timeAgo } from '../lib/format';

const MODALITY_OPTIONS = [{ value: 'all', label: 'Todas' }, ...Object.entries(MODALITY).map(([value, label]) => ({ value, label }))];
const SORTS = {
  match: 'Mayor compatibilidad',
  recent: 'Más recientes',
  salary: 'Mayor salario',
};
const MAX_CV_BYTES = 5 * 1024 * 1024;

export default function DashboardProfesional() {
  const { state, actions } = useApp();
  const me = state.professionals.find((p) => p.id === state.session.profileId);
  const mySkills = me.skills;

  const [section, setSection] = useState('explore');
  const [query, setQuery] = useState('');
  const [modality, setModality] = useState('all');
  const [sort, setSort] = useState('match');
  const [skillFilter, setSkillFilter] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [applyTo, setApplyTo] = useState(null);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);

  const published = useMemo(() => state.offers.filter((o) => o.status === 'active' && o.moderation === 'approved'), [state.offers]);
  const myApplications = useMemo(() => state.applications.filter((a) => a.professionalId === me.id), [state.applications, me.id]);
  const applicationFor = (offerId) => myApplications.find((a) => a.offerId === offerId);

  const filterOptions = useMemo(() => [...new Set(published.flatMap((o) => o.skills))].sort((a, b) => a.localeCompare(b)), [published]);

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    const list = published
      .map((offer) => ({ offer, match: matchOffer(offer, mySkills) }))
      .filter(({ offer }) => modality === 'all' || offer.modality === modality)
      .filter(({ offer }) => skillFilter.every((s) => offer.skills.includes(s)))
      .filter(({ offer }) => {
        if (!text) return true;
        const company = state.companies[offer.companyId] || '';
        return [offer.title, company, offer.location, ...offer.skills].join(' ').toLowerCase().includes(text);
      });
    const by = {
      match: (a, b) => b.match.pct - a.match.pct || a.offer.daysAgo - b.offer.daysAgo,
      recent: (a, b) => a.offer.daysAgo - b.offer.daysAgo,
      salary: (a, b) => salaryFloor(b.offer.salary) - salaryFloor(a.offer.salary),
    };
    return list.sort(by[sort]);
  }, [published, mySkills, modality, skillFilter, query, sort, state.companies]);

  const strongMatches = published.filter((o) => matchOffer(o, mySkills).pct >= 70).length;
  const favorites = state.favorites.map((id) => state.offers.find((o) => o.id === id)).filter(Boolean);
  const hasFilters = query || modality !== 'all' || skillFilter.length;
  const clearFilters = () => {
    setQuery('');
    setModality('all');
    setSkillFilter([]);
  };

  const nav = [
    { key: 'explore', label: 'Explorar' },
    { key: 'applications', label: 'Mis postulaciones', count: myApplications.length },
    { key: 'favorites', label: 'Favoritas', count: favorites.length },
  ];

  const renderCard = ({ offer, match }) => (
    <OfferCard
      key={offer.id}
      offer={offer}
      match={match}
      company={state.companies[offer.companyId]}
      saved={state.favorites.includes(offer.id)}
      application={applicationFor(offer.id)}
      onSave={() => actions.toggleFavorite(offer.id, state.favorites.includes(offer.id))}
      onApply={() => setApplyTo(offer)}
    />
  );

  return (
    <AppShell nav={nav} section={section} onSection={setSection}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hola, {me.name.split(' ')[0]}</h1>
        <p className="mt-2 text-muted">
          {mySkills.length === 0
            ? 'Agrega tus skills para ver cuánto encajas con cada oferta.'
            : strongMatches > 0
              ? `${strongMatches} ${strongMatches === 1 ? 'oferta encaja' : 'ofertas encajan'} al 70% o más con tus skills.`
              : 'Ninguna oferta encaja todavía al 70%. Suma skills para mejorar tus resultados.'}
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
                {filtersOpen && <SkillPicker all={filterOptions} value={skillFilter} onChange={setSkillFilter} label="Skills que debe pedir la oferta" />}
              </div>

              <div className="flex items-center justify-between text-sm text-muted" aria-live="polite">
                <span>
                  {results.length} {results.length === 1 ? 'oferta' : 'ofertas'}
                </span>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="font-semibold text-brand hover:underline">
                    Quitar filtros
                  </button>
                )}
              </div>

              {results.length ? (
                results.map(renderCard)
              ) : (
                <EmptyState
                  title="Ninguna oferta coincide"
                  action={hasFilters && <Button variant="secondary" onClick={clearFilters}>Quitar filtros</Button>}
                >
                  Prueba con otra palabra o quita algún filtro.
                </EmptyState>
              )}
            </>
          )}

          {section === 'applications' &&
            (myApplications.length ? (
              myApplications.map((a) => <ApplicationRow key={a.id} application={a} offer={state.offers.find((o) => o.id === a.offerId)} companies={state.companies} />)
            ) : (
              <EmptyState title="Aún no te has postulado" action={<Button onClick={() => setSection('explore')}>Explorar ofertas</Button>}>
                Cuando te postules, aquí verás en qué etapa va cada proceso.
              </EmptyState>
            ))}

          {section === 'favorites' &&
            (favorites.length ? (
              favorites.map((offer) => renderCard({ offer, match: matchOffer(offer, mySkills) }))
            ) : (
              <EmptyState title="No has guardado ofertas" action={<Button onClick={() => setSection('explore')}>Explorar ofertas</Button>}>
                Usa Guardar en una oferta para volver a ella después.
              </EmptyState>
            ))}
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="mis-skills">
            <h2 id="mis-skills" className="text-lg font-bold">
              {me.name}
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
                  <p className="text-xs text-muted">
                    Subido el {me.cv.date} · {me.cv.size}
                  </p>
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
        company={applyTo && state.companies[applyTo.companyId]}
        match={applyTo && matchOffer(applyTo, mySkills)}
        hasCv={Boolean(me.cv)}
        onClose={() => setApplyTo(null)}
        onConfirm={() => {
          actions.apply(me.id, applyTo);
          setApplyTo(null);
        }}
        onUploadCv={() => {
          setApplyTo(null);
          setCvOpen(true);
        }}
      />
      <SkillsDialog key={skillsOpen ? 'open' : 'closed'} open={skillsOpen} all={state.skills} value={mySkills} onClose={() => setSkillsOpen(false)} onSave={(skills) => {
        actions.updateProfile(me.id, { skills }, 'Skills actualizadas. Las ofertas se reordenaron.');
        setSkillsOpen(false);
      }} />
      <CvDialog key={cvOpen ? 'cv-open' : 'cv-closed'} open={cvOpen} onClose={() => setCvOpen(false)} onSave={(cv) => {
        actions.updateProfile(me.id, { cv }, 'Currículum actualizado');
        setCvOpen(false);
      }} />
    </AppShell>
  );
}

const STEPS = ['Enviada', 'En revisión', 'Decisión'];
const STEP_REACHED = { pending: 0, reviewed: 1, accepted: 2, rejected: 2 };

function ApplicationRow({ application, offer, companies }) {
  if (!offer) return null;
  const reached = STEP_REACHED[application.status];
  const decisionTone = application.status === 'accepted' ? 'bg-ok' : application.status === 'rejected' ? 'bg-bad' : 'bg-brand';
  return (
    <article className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{companies[offer.companyId]}</span> · Postulaste {timeAgo(application.daysAgo).toLowerCase()}
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

function ApplyDialog({ offer, company, match, hasCv, onClose, onConfirm, onUploadCv }) {
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
          {hasCv ? <Button onClick={onConfirm}>Postularme</Button> : <Button onClick={onUploadCv}>Subir currículum</Button>}
        </>
      }
    >
      {offer && (
        <div className="space-y-4">
          <div>
            <p className="font-bold">{offer.title}</p>
            <p className="text-sm text-muted">
              {company} · {placeLabel(offer)}
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
          <Button onClick={() => onSave(draft)}>Guardar skills</Button>
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

  const pick = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') return setError('El archivo debe ser un PDF.');
    if (f.size > MAX_CV_BYTES) return setError('El PDF pesa más de 5 MB. Súbelo comprimido.');
    setError('');
    setFile(f);
  };

  const save = () => {
    if (!file) return setError('Elige un archivo PDF para continuar.');
    onSave({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      date: new Date().toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
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
          <Button onClick={save}>Guardar currículum</Button>
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
