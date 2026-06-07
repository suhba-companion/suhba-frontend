import { useTranslation } from 'react-i18next'
import type { PrayerSpot } from '../../types'
import { SpotAmenityIcons } from './SpotAmenityIcons'

interface SpotCardProps {
  spot: PrayerSpot
  onSelect?: (id: string, name: string) => void
}

function handleRoute(e: React.MouseEvent, lat: number, lng: number): void {
  e.stopPropagation()
  window.open(
    `https://maps.google.com/maps?daddr=${lat},${lng}&travelmode=transit`,
    '_blank',
    'noopener,noreferrer',
  )
}

export function SpotCard({ spot, onSelect }: SpotCardProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <li
      className={[
        'bg-cream-card border border-divider rounded-card p-4 space-y-3 shadow-sm',
        onSelect !== undefined ? 'cursor-pointer hover:border-sage-light active:border-sage-light transition-colors' : '',
      ].join(' ')}
      onClick={onSelect !== undefined ? () => onSelect(spot.id, spot.name) : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text-dark text-sm m-0 truncate">{spot.name}</p>
          <p className="text-text-muted text-xs mt-0.5 m-0 truncate">{spot.address}, {spot.district}</p>
        </div>
        <span className="text-text-muted text-xs font-medium shrink-0">
          {spot.type}
        </span>
      </div>

      <SpotAmenityIcons spot={spot} showOpen={false} />

      <div className="flex items-center justify-between gap-2">
        <span className="text-text-muted text-xs">
          {spot.distanceKm !== undefined && `~${spot.distanceKm} km`}
        </span>
        <button
          type="button"
          onClick={(e) => handleRoute(e, spot.lat, spot.lng)}
          className="bg-primary text-cream-card text-xs font-medium px-4 py-2 rounded-pill hover:bg-moss active:bg-moss transition-colors shrink-0 min-h-[36px]"
        >
          {t('spots.route')}
        </button>
      </div>
    </li>
  )
}
