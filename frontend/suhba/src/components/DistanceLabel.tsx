import { useTranslation } from 'react-i18next'
import { formatDistance } from '@utils/geo'

interface DistanceLabelProps {
  /** Full-precision kilometres, or undefined when no distance is known. */
  km?: number
  className?: string
}

/**
 * The only place a distance turns into text.
 *
 * Every card and hero used to inline its own `~${km} km`, which is how the app
 * ended up printing "~0.4 km" next to "~12.3 km". The title attribute spells
 * out that this is a straight line, not the walking route a maps app quotes.
 */
export function DistanceLabel({ km, className }: DistanceLabelProps): JSX.Element | null {
  const { t } = useTranslation()
  if (km === undefined) return null
  const text = formatDistance(km)
  if (text === '') return null
  return (
    <span className={className} title={t('location.asTheCrowFlies')}>
      {text}
    </span>
  )
}
