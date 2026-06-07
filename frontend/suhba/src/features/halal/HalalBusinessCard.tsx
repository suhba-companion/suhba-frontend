import { useTranslation } from 'react-i18next'
import { Star, Check, Garage } from '@phosphor-icons/react'
import { Tooltip } from '@components'
import type { HalalBusiness, CertStatus, BusinessType } from '../../types'

const TYPE_LABEL: Record<BusinessType, string> = {
  Restaurant: 'Restaurant',
  Café: 'Café',
  Metzgerei: 'Metzgerei',
  Lebensmittel: 'Lebensmittel',
  Sonstige: 'Sonstige',
}

interface CertBadgeProps {
  certStatus: CertStatus
}

function CertBadge({ certStatus }: CertBadgeProps): JSX.Element {
  const { t } = useTranslation()
  if (certStatus === 'HMA-Zertifiziert') {
    return (
      <span className="text-text-muted text-[10px] font-semibold shrink-0 flex items-center gap-1">
        <Check size={10} weight="bold" aria-hidden="true" />
        {t('halal.certHMA')}
      </span>
    )
  }
  return (
    <span className="text-text-muted text-[10px] shrink-0">{certStatus}</span>
  )
}

interface StarDisplayProps {
  rating: number
}

function StarDisplay({ rating }: StarDisplayProps): JSX.Element {
  const { t } = useTranslation()
  const full = Math.min(5, Math.max(0, Math.round(rating)))
  return (
    <span className="text-sand text-xs flex items-center gap-0.5" aria-label={t('halal.stars', { rating: rating.toFixed(1) })}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12} weight={i < full ? 'fill' : 'regular'} aria-hidden="true" />
      ))}
      <span className="ml-1 text-text-muted">{rating.toFixed(1)}</span>
    </span>
  )
}

interface HalalBusinessCardProps {
  business: HalalBusiness
  onSelect?: (id: string) => void
}

function openRoute(e: React.MouseEvent, lat: number, lng: number): void {
  e.stopPropagation()
  window.open(
    `https://maps.google.com/maps?daddr=${lat},${lng}&travelmode=transit`,
    '_blank',
    'noopener,noreferrer',
  )
}

export function HalalBusinessCard({ business, onSelect }: HalalBusinessCardProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <li
      className={[
        'bg-cream-card border border-divider rounded-card p-4 space-y-3 shadow-sm',
        onSelect !== undefined ? 'cursor-pointer hover:border-sage-light active:border-sage-light transition-colors' : '',
      ].join(' ')}
      onClick={onSelect !== undefined ? () => onSelect(business.id) : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-text-dark text-sm m-0 flex-1 min-w-0 truncate">{business.name}</p>
        <CertBadge certStatus={business.certStatus} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-text-muted text-xs font-medium">
          {TYPE_LABEL[business.type]}
        </span>
        {business.rating !== undefined && <StarDisplay rating={business.rating} />}
        {business.parking && (
          <Tooltip label={t('halal.amenity.parking')}>
            <Garage size={16} weight="regular" aria-hidden="true" className="text-primary" />
          </Tooltip>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-text-muted text-xs m-0 flex-1 min-w-0 truncate">
          {business.address}, {business.district}
          {business.distanceKm !== undefined && ` · ~${business.distanceKm} km`}
        </p>
        <button
          type="button"
          onClick={(e) => openRoute(e, business.lat, business.lng)}
          className="bg-primary text-cream-card text-xs font-medium px-4 py-2 rounded-pill hover:bg-moss active:bg-moss transition-colors shrink-0 min-h-[36px]"
        >
          {t('spots.route')}
        </button>
      </div>
    </li>
  )
}
