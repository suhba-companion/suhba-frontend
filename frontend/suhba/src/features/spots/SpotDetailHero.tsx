import { useTranslation } from 'react-i18next'
import type { PrayerSpot } from '../../types'
import { SpotAmenityIcons } from './SpotAmenityIcons'

interface SpotDetailHeroProps {
  spot: PrayerSpot
}

export function SpotDetailHero({ spot }: SpotDetailHeroProps): JSX.Element {
  const { t } = useTranslation()
  const openLabel = spot.open ? t('spots.amenity.open') : t('spots.amenity.closed')

  return (
    <div className="bg-cream-card px-5 pt-5 pb-4 border-b border-divider">
      <span className="bg-sage-tint text-primary text-xs font-medium px-2.5 py-1 rounded-pill">
        {spot.type}
      </span>

      <p className="font-amiri text-2xl mt-3 mb-1 leading-snug text-text-dark">{spot.name}</p>

      <div className="flex items-center gap-3 mb-4 text-sm">
        <span
          className={spot.open ? 'text-green-600' : 'text-red-500'}
          aria-label={openLabel}
        >
          ● {openLabel}
        </span>
        {spot.distanceKm !== undefined && (
          <span className="text-text-muted">
            ~{spot.distanceKm} km
          </span>
        )}
      </div>

      <SpotAmenityIcons spot={spot} showOpen={false} />
    </div>
  )
}
