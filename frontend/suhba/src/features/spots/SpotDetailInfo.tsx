import { useTranslation } from 'react-i18next'
import { CheckCircle } from '@phosphor-icons/react'
import type { PrayerSpot } from '../../types'

interface InfoRowProps {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps): JSX.Element {
  return (
    <div className="flex gap-3">
      <span className="text-text-muted text-xs w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-text-dark text-xs">{value}</span>
    </div>
  )
}

interface SpotDetailInfoProps {
  spot: PrayerSpot
}

export function SpotDetailInfo({ spot }: SpotDetailInfoProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <section>
      <div className="flex items-center gap-2 mb-1 px-0.5">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
          {t('spots.detail.info')}
        </span>
        {spot.verified && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-sage-tint px-2 py-0.5 rounded-pill">
            <CheckCircle size={10} weight="fill" aria-hidden="true" />
            {t('spots.detail.verified')}
          </span>
        )}
      </div>
      <div className="bg-cream-card border border-divider rounded-card p-4 space-y-3 mt-1">
        <InfoRow label={t('spots.detail.address')} value={`${spot.address}, ${spot.district}`} />
        {spot.jumaTimeSummer && spot.jumaTimeWinter ? (
          <>
            <InfoRow label={t('spots.detail.jumaSummer')} value={spot.jumaTimeSummer} />
            <InfoRow label={t('spots.detail.jumaWinter')} value={spot.jumaTimeWinter} />
          </>
        ) : spot.jumaTime !== null ? (
          <InfoRow label={t('spots.detail.juma')} value={t('spots.detail.jumaTime', { time: spot.jumaTime })} />
        ) : null}
        {spot.openingHours !== undefined && (
          <InfoRow label={t('spots.detail.hours')} value={spot.openingHours} />
        )}
        {spot.language && (
          <InfoRow label={t('spots.detail.language')} value={spot.language} />
        )}
        {spot.googleMapsUrl && (
          <div className="flex gap-3">
            <span className="text-text-muted text-xs w-28 shrink-0 pt-0.5">{t('spots.detail.directions')}</span>
            <a
              href={spot.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-xs underline"
            >
              Google Maps →
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
