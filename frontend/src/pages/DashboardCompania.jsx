import { useCallback, useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PagedList from '../components/PagedList';
import { MatchMeter, SkillTags } from '../components/Match';
import {
  Avatar, Button, EmptyState, Field, Icon, Input, Modal, Pill, Segmented, Select, SkillPicker, Stat,
  APPLICATION_TONE, MODERATION_TONE, OFFER_TONE,
} from '../components/ui';
import { useApp } from '../store/AppContext';
import { usePaginated } from '../hooks/usePaginated';
import { api } from '../lib/api';
import { APPLICATION_STATUS, MODALITY, MODERATION, OFFER_STATUS } from '../data/constants';
import { matchOffer, placeLabel, salaryLabel, timeAgo } from '../lib/format';

const MODALITY_OPTIONS = Object.entries(MODALITY).map(([value, label]) => ({ value, label }));
const EMPTY_FORM = { title: '', modality: 'remote', location: '', salary: '', skills: [] };
const PER_PAGE = 6;

export default function DashboardCompania() {
  const { state, actions } = useApp();
  const [company, setCompany] = useState(null);

  const offersQ = usePaginated('/company/job-offers', { per_page: PER_PAGE });

  const [publishOpen, setPublishOpen] = useState(false);
  const [candidatesOf, setCandidatesOf] = useState(null);
  const [toRemove, setToRemove] = useState(null);

  // Datos de la empresa y sus totales (el backend los calcula sobre todas las vacantes, no solo la página)
  const loadCompany = useCallback(() => {
    api.get('/company').then(({ data }) => setCompany(data)).catch((error) => actions.toast(error.message, 'bad'));
  }, [actions]);
  useEffect(loadCompany, [loadCompany]);

  const stats = company?.stats;
  const nav = [{ key: 'offers', label: 'Mis vacantes', count: stats?.total_offers }];

  const publish = async (form) => {
    await api.post('/company/job-offers', form); // si el servidor rechaza, el diálogo muestra los errores
    offersQ.setPage(1);
    offersQ.reload();
    loadCompany();
    setPublishOpen(false);
    actions.toast('Vacante enviada a revisión. Se publicará cuando la apruebe un administrador.');
  };

  const setStatus = async (offer, status) => {
    try {
      const { data } = await api.patch(`/company/job-offers/${offer.id}/status`, { status });
      offersQ.patch(offer.id, data);
      loadCompany();
      actions.toast(status === 'paused' ? 'Vacante pausada' : 'Vacante reactivada');
    } catch (error) {
      actions.toast(error.message, 'bad');
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/company/job-offers/${toRemove.id}`);
      offersQ.reload();
      loadCompany();
      actions.toast('Vacante eliminada');
    } catch (error) {
      actions.toast(error.message, 'bad');
    }
    setToRemove(null);
  };

  const renderOffer = (offer) => {
    const received = offer.applications_count ?? 0;
    const fresh = offer.pending_applications_count ?? 0;
    const blocked = offer.moderation_status === 'blocked';
    return (
      <li key={offer.id} className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold">{offer.title}</h2>
              <Pill tone={MODERATION_TONE[offer.moderation_status]}>{MODERATION[offer.moderation_status]}</Pill>
              {offer.moderation_status === 'approved' && <Pill tone={OFFER_TONE[offer.status]}>{OFFER_STATUS[offer.status]}</Pill>}
            </div>
            <p className="mt-1 text-sm text-muted">
              {placeLabel(offer)} · {salaryLabel(offer)} · Publicada {timeAgo(offer.days_ago).toLowerCase()}
            </p>
            {offer.moderation_status === 'pending' && <p className="mt-2 text-sm text-warn">Espera la aprobación de un administrador para aparecer en las búsquedas.</p>}
            {blocked && <p className="mt-2 text-sm text-bad">Un administrador la bloqueó. No se muestra a los profesionales.</p>}
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {(offer.skills || []).map((s) => (
                <li key={s} className="rounded-md bg-sunken px-2 py-0.5 text-xs font-medium text-muted">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex shrink-0 items-center gap-6 md:flex-col md:items-end md:gap-3">
            <div className="md:text-right">
              <p className="font-display text-2xl font-bold leading-none">{received}</p>
              <p className="text-xs text-muted">{received === 1 ? 'postulación' : 'postulaciones'}{fresh > 0 && ` · ${fresh} sin revisar`}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCandidatesOf(offer)} disabled={!received}>
                <Icon name="users" />
                Candidatos
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={blocked}
                onClick={() => setStatus(offer, offer.status === 'active' ? 'paused' : 'active')}
                aria-label={`${offer.status === 'active' ? 'Pausar' : 'Reactivar'} ${offer.title}`}
              >
                <Icon name={offer.status === 'active' ? 'pause' : 'play'} />
                {offer.status === 'active' ? 'Pausar' : 'Reactivar'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setToRemove(offer)} aria-label={`Eliminar ${offer.title}`}>
                <Icon name="trash" />
              </Button>
            </div>
          </div>
        </div>
      </li>
    );
  };

  return (
    <AppShell nav={nav} section="offers" onSection={() => {}}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{company?.trade_name || state.session.name}</h1>
          <p className="mt-2 text-muted">Publica vacantes y revisa a quienes se postulan.</p>
        </div>
        <Button onClick={() => setPublishOpen(true)}>
          <Icon name="plus" />
          Publicar vacante
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Vacantes visibles" value={stats?.live_offers ?? '–'} note="Activas y aprobadas" />
        <Stat label="Postulaciones recibidas" value={stats?.applications_received ?? '–'} tone="brand" />
        <Stat label="Candidatos aceptados" value={stats?.accepted ?? '–'} tone="ok" />
      </div>

      <PagedList
        query={offersQ}
        as="ul"
        className="space-y-3"
        empty={
          <EmptyState title="Aún no publicas vacantes" action={<Button onClick={() => setPublishOpen(true)}>Publicar la primera</Button>}>
            Tus vacantes aparecerán aquí junto con las postulaciones que reciban.
          </EmptyState>
        }
      >
        {renderOffer}
      </PagedList>

      <PublishDialog
        key={publishOpen ? 'open' : 'closed'}
        open={publishOpen}
        skills={state.skills.map((s) => s.name)}
        onClose={() => setPublishOpen(false)}
        onSubmit={publish}
      />

      <CandidatesDialog
        key={candidatesOf?.id ?? 'none'}
        offer={candidatesOf}
        onClose={() => setCandidatesOf(null)}
        onChanged={() => {
          offersQ.reload();
          loadCompany();
        }}
      />

      <Modal
        open={Boolean(toRemove)}
        title="Eliminar vacante"
        onClose={() => setToRemove(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setToRemove(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={remove}>
              Eliminar vacante
            </Button>
          </>
        }
      >
        {toRemove && (
          <p className="text-sm">
            Se eliminará <strong>{toRemove.title}</strong> con sus {toRemove.applications_count ?? 0} postulaciones. No se puede deshacer. Si solo quieres dejar de recibir candidatos, usa Pausar.
          </p>
        )}
      </Modal>
    </AppShell>
  );
}

function PublishDialog({ open, skills, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((cur) => ({ ...cur, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = 'Escribe el cargo que buscas.';
    if (form.modality !== 'remote' && !form.location.trim()) next.location = 'Indica la ciudad de trabajo.';
    if (!form.salary.trim()) next.salary = 'Indica el rango de salario mensual.';
    if (!form.skills.length) next.skills = 'Elige al menos una skill requerida.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        modality: form.modality,
        location: form.modality === 'remote' ? null : form.location.trim(),
        salary_range: form.salary.trim(),
        skills: form.skills,
      });
    } catch (error) {
      if (error.status === 422) {
        setErrors({
          title: error.first('title'),
          location: error.first('location'),
          salary: error.first('salary_range'),
          skills: error.first('skills'),
        });
      } else {
        setErrors({ skills: error.message });
      }
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      wide
      title="Publicar vacante"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="publish-form" disabled={busy}>
            {busy ? 'Enviando…' : 'Enviar a revisión'}
          </Button>
        </>
      }
    >
      <form id="publish-form" onSubmit={submit} noValidate className="space-y-5">
        <Field label="Cargo" error={errors.title}>
          {(props) => <Input {...props} value={form.title} onChange={set('title')} placeholder="Desarrollador backend" />}
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-semibold">Modalidad</p>
          <Segmented label="Modalidad" options={MODALITY_OPTIONS} value={form.modality} onChange={(modality) => setForm((f) => ({ ...f, modality }))} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {form.modality !== 'remote' && (
            <Field label="Ciudad" error={errors.location}>
              {(props) => <Input {...props} value={form.location} onChange={set('location')} placeholder="Bogotá" />}
            </Field>
          )}
          <Field label="Salario mensual" error={errors.salary} hint="Por ejemplo, $2,400 - $3,200">
            {(props) => <Input {...props} value={form.salary} onChange={set('salary')} placeholder="$2,400 - $3,200" />}
          </Field>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Skills requeridas</p>
          <SkillPicker all={skills} value={form.skills} onChange={(value) => { setForm((f) => ({ ...f, skills: value })); setErrors((cur) => ({ ...cur, skills: undefined })); }} label="Skills requeridas" />
          {errors.skills && (
            <p role="alert" className="mt-2 text-sm text-bad">
              {errors.skills}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}

function CandidatesDialog({ offer, onClose, onChanged }) {
  const { actions } = useApp();
  const query = usePaginated(offer ? `/company/job-offers/${offer.id}/applications` : '', { per_page: 4 }, { enabled: Boolean(offer) });

  const changeStatus = async (application, status) => {
    try {
      const { data } = await api.patch(`/company/applications/${application.id}`, { status });
      query.patch(application.id, { status: data.status });
      onChanged();
    } catch (error) {
      actions.toast(error.message, 'bad');
    }
  };

  return (
    <Modal open={Boolean(offer)} wide title={offer ? `Candidatos para ${offer.title}` : 'Candidatos'} onClose={onClose}>
      {offer && (
        <PagedList query={query} as="ul" empty={<EmptyState title="Aún no hay postulaciones" />}>
          {(application) => {
            const person = application.professional;
            const match = matchOffer(offer, person.skills || []);
            return (
              <li key={application.id} className="rounded-xl border border-line p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={person.full_name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{person.full_name}</p>
                    <p className="text-sm text-muted">{person.headline}</p>
                  </div>
                  <MatchMeter pct={match.pct} />
                </div>
                <div className="mt-3">
                  <SkillTags have={match.have} missing={match.missing} />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                    <Icon name="file" />
                    {person.cv ? (
                      <a href={person.cv.url} target="_blank" rel="noreferrer" className="font-semibold text-brand hover:underline">
                        {person.cv.name}
                      </a>
                    ) : (
                      'Sin currículum'
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <Pill tone={APPLICATION_TONE[application.status]}>{APPLICATION_STATUS[application.status]}</Pill>
                    <Select
                      value={application.status}
                      onChange={(e) => changeStatus(application, e.target.value)}
                      aria-label={`Estado de la postulación de ${person.full_name}`}
                      className="w-auto py-1.5"
                    >
                      {Object.entries(APPLICATION_STATUS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </li>
            );
          }}
        </PagedList>
      )}
    </Modal>
  );
}
