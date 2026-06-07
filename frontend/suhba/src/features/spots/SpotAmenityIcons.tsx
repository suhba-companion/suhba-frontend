import { useTranslation } from 'react-i18next'
import { Circle, Drop, Garage, TShirt } from '@phosphor-icons/react'
import { HijabIcon, Tooltip } from '@components'
import type { PrayerSpot } from '../../types'

interface SpotAmenityIconsProps {
  spot: Pick<PrayerSpot, 'open' | 'jumaTime' | 'wudu' | 'sisters' | 'parking' | 'hijab' | 'prayerClothes'>
  showOpen?: boolean
}

export function SpotAmenityIcons({ spot, showOpen = true }: SpotAmenityIconsProps): JSX.Element {
  const { t } = useTranslation()
  const openLabel = spot.open ? t('spots.amenity.open') : t('spots.amenity.closed')

  return (
    <div className="flex items-center gap-4 text-base leading-none">
      {showOpen && (
        <Tooltip label={openLabel}>
          <Circle weight="fill" size={12} aria-hidden="true" className={spot.open ? 'text-green-500' : 'text-red-500'} />
        </Tooltip>
      )}
{spot.wudu && (
        <Tooltip label={t('spots.amenity.wudu')}>
          <Drop size={18} weight="regular" aria-hidden="true" className="text-primary" />
        </Tooltip>
      )}
      {spot.sisters && (
        <Tooltip label={t('spots.amenity.sisters')}>
          <HijabIcon className="h-4 w-auto text-primary" />
        </Tooltip>
      )}
      {spot.parking && (
        <Tooltip label={t('spots.amenity.parking')}>
          <Garage size={18} weight="regular" aria-hidden="true" className="text-primary" />
        </Tooltip>
      )}
      {spot.hijab && (
        <Tooltip label={t('spots.amenity.hijab')}>
          <HijabIcon className="h-4 w-auto text-primary opacity-70" />
        </Tooltip>
      )}
      {spot.prayerClothes && (
        <Tooltip label={t('spots.amenity.prayerClothes')}>
          <TShirt size={18} weight="regular" aria-hidden="true" className="text-primary" />
        </Tooltip>
      )}
    </div>
  )
}
