import { Button, Icon, Pill, APPLICATION_TONE, cx } from './ui';
import { MatchMeter, SkillTags } from './Match';
import { APPLICATION_STATUS } from '../data/mock';
import { placeLabel, timeAgo } from '../lib/format';

/** Una oferta publicada, vista por un profesional. */
export default function OfferCard({ offer, company, match, saved, application, onSave, onApply }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-brand/40">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{company}</span> · {timeAgo(offer.daysAgo)}
          </p>
          <h3 className="mt-1 text-xl font-bold">{offer.title}</h3>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="pin" />
              {placeLabel(offer)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="money" />
              {offer.salary} al mes
            </span>
          </p>
        </div>
        <MatchMeter pct={match.pct} className="sm:text-right" />
      </div>

      <div className="mt-4">
        <SkillTags have={match.have} missing={match.missing} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <button
          type="button"
          onClick={onSave}
          aria-pressed={saved}
          className={cx(
            'inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors',
            saved ? 'text-bad' : 'text-muted hover:text-ink',
          )}
        >
          <Icon name="heart" className={cx('h-5 w-5', saved && 'fill-current')} />
          {saved ? 'Guardada' : 'Guardar'}
        </button>

        {application ? (
          <Pill tone={APPLICATION_TONE[application.status]}>Postulada · {APPLICATION_STATUS[application.status]}</Pill>
        ) : (
          <Button onClick={onApply}>Postularme</Button>
        )}
      </div>
    </article>
  );
}
