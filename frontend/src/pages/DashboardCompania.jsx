import { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { MatchMeter, SkillTags } from '../components/Match';
import {
  Avatar, Button, EmptyState, Field, Icon, Input, Modal, Pill, Segmented, Select, SkillPicker, Stat,
  APPLICATION_TONE, MODERATION_TONE, OFFER_TONE,
} from '../components/ui';
import { useApp } from '../store/AppContext';
import { APPLICATION_STATUS, MODALITY, MODERATION, OFFER_STATUS } from '../data/mock';
import { matchOffer, placeLabel, timeAgo } from '../lib/format';

const MODALITY_OPTIONS = Object.entries(MODALITY).map(([value, label]) => ({ value, label }));
const EMPTY_FORM = { title: '', modality: 'remote', location: '', salary: '', skills: [] };

export default function DashboardCompania() {
  const { state, actions } = useApp();
  const companyId = state.session.companyId;
  const companyName = state.companies[companyId];

  const offers = useMemo(() => state.offers.filter((o) => o.companyId === companyId), [state.offers, companyId]);
  const applicationsOf = (offerId) => state.applications.filter((a) => a.offerId === offerId);

  const [publishOpen, setPublishOpen] = useState(false);
  const [candidatesOf, setCandidatesOf] = useState(null);
  const [toRemove, setToRemove] = useState(null);

  const live = offers.filter((o) => o.status === 'active' && o.moderation === 'approved').length;
  const received = offers.reduce((n, o) => n + applicationsOf(o.id).length, 0);
  const accepted = offers.reduce((n, o) => n + applicationsOf(o.id).filter((a) => a.status === 'accepted').length, 0);

  const nav = [{ key: 'offers', label: 'Mis vacantes', count: offers.length }];

  return (
    <AppShell nav={nav} section="offers" onSection={() => {}}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{companyName}</h1>
          <p className="mt-2 text-muted">Publica vacantes y revisa a quienes se postulan.</p>
        </div>
        <Button onClick={() => setPublishOpen(true)}>
          <Icon name="plus" />
          Publicar vacante
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Vacantes visibles" value={live} note="Activas y aprobadas" />
        <Stat label="Postulaciones recibidas" value={received} tone="brand" />
        <Stat label="Candidatos aceptados" value={accepted} tone="ok" />
      </div>

      {offers.length ? (
        <ul className="space-y-3">
          {offers.map((offer) => {
            const apps = applicationsOf(offer.id);
            const fresh = apps.filter((a) => a.status === 'pending').length;
            const blocked = offer.moderation === 'blocked';
            return (
              <li key={offer.id} className="rounded-xl border border-line bg-surface p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">{offer.title}</h2>
                      <Pill tone={MODERATION_TONE[offer.moderation]}>{MODERATION[offer.moderation]}</Pill>
                      {offer.moderation === 'approved' && <Pill tone={OFFER_TONE[offer.status]}>{OFFER_STATUS[offer.status]}</Pill>}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {placeLabel(offer)} · {offer.salary} · Publicada {timeAgo(offer.daysAgo).toLowerCase()}
                    </p>
                    {offer.moderation === 'pending' && <p className="mt-2 text-sm text-warn">Espera la aprobación de un administrador para aparecer en las búsquedas.</p>}
                    {blocked && <p className="mt-2 text-sm text-bad">Un administrador la bloqueó. No se muestra a los profesionales.</p>}
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {offer.skills.map((s) => (
                        <li key={s} className="rounded-md bg-sunken px-2 py-0.5 text-xs font-medium text-muted">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex shrink-0 items-center gap-6 md:flex-col md:items-end md:gap-3">
                    <div className="md:text-right">
                      <p className="font-display text-2xl font-bold leading-none">{apps.length}</p>
                      <p className="text-xs text-muted">{apps.length === 1 ? 'postulación' : 'postulaciones'}{fresh > 0 && ` · ${fresh} sin revisar`}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setCandidatesOf(offer.id)} disabled={!apps.length}>
                        <Icon name="users" />
                        Candidatos
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={blocked}
                        onClick={() => actions.setOfferStatus(offer.id, offer.status === 'active' ? 'paused' : 'active')}
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
          })}
        </ul>
      ) : (
        <EmptyState title="Aún no publicas vacantes" action={<Button onClick={() => setPublishOpen(true)}>Publicar la primera</Button>}>
          Tus vacantes aparecerán aquí junto con las postulaciones que reciban.
        </EmptyState>
      )}

      <PublishDialog
        key={publishOpen ? 'open' : 'closed'}
        open={publishOpen}
        skills={state.skills}
        onClose={() => setPublishOpen(false)}
        onSubmit={(form) => {
          actions.createOffer({ ...form, companyId, status: 'active' });
          setPublishOpen(false);
        }}
      />

      <CandidatesDialog
        offer={offers.find((o) => o.id === candidatesOf)}
        applications={candidatesOf ? applicationsOf(candidatesOf) : []}
        professionals={state.professionals}
        onClose={() => setCandidatesOf(null)}
        onStatus={actions.setApplicationStatus}
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
            <Button
              variant="danger"
              onClick={() => {
                actions.removeOffer(toRemove.id);
                setToRemove(null);
              }}
            >
              Eliminar vacante
            </Button>
          </>
        }
      >
        {toRemove && (
          <p className="text-sm">
            Se eliminará <strong>{toRemove.title}</strong> con sus {applicationsOf(toRemove.id).length} postulaciones. No se puede deshacer. Si solo quieres dejar de recibir candidatos, usa Pausar.
          </p>
        )}
      </Modal>
    </AppShell>
  );
}

function PublishDialog({ open, skills, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((cur) => ({ ...cur, [key]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = 'Escribe el cargo que buscas.';
    if (form.modality !== 'remote' && !form.location.trim()) next.location = 'Indica la ciudad de trabajo.';
    if (!form.salary.trim()) next.salary = 'Indica el rango de salario mensual.';
    if (!form.skills.length) next.skills = 'Elige al menos una skill requerida.';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({
      title: form.title.trim(),
      modality: form.modality,
      location: form.modality === 'remote' ? '' : form.location.trim(),
      salary: form.salary.trim(),
      skills: form.skills,
    });
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
          <Button type="submit" form="publish-form">
            Enviar a revisión
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

function CandidatesDialog({ offer, applications, professionals, onClose, onStatus }) {
  const rows = offer
    ? applications
        .map((a) => ({ application: a, person: professionals.find((p) => p.id === a.professionalId) }))
        .filter((r) => r.person)
        .map((r) => ({ ...r, match: matchOffer(offer, r.person.skills) }))
        .sort((a, b) => b.match.pct - a.match.pct)
    : [];

  return (
    <Modal open={Boolean(offer)} wide title={offer ? `Candidatos para ${offer.title}` : 'Candidatos'} onClose={onClose}>
      <ul className="space-y-4">
        {rows.map(({ application, person, match }) => (
          <li key={application.id} className="rounded-xl border border-line p-4">
            <div className="flex items-start gap-3">
              <Avatar name={person.name} />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{person.name}</p>
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
                {person.cv ? person.cv.name : 'Sin currículum'}
              </span>
              <div className="flex items-center gap-2">
                <Pill tone={APPLICATION_TONE[application.status]}>{APPLICATION_STATUS[application.status]}</Pill>
                <Select
                  value={application.status}
                  onChange={(e) => onStatus(application.id, e.target.value)}
                  aria-label={`Estado de la postulación de ${person.name}`}
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
        ))}
      </ul>
    </Modal>
  );
}
