import { useTranslation } from 'react-i18next'
import { useGeolocationState } from '@hooks/useGeolocation'

/**
 * Tells the user when distances are measured from Vienna centre rather than
 * from them. Previously this banner existed only on Spots and Halal, as a
 * hardcoded German string, while Home and Events showed the same Vienna-centre
 * distances with no warning at all.
 */
export function LocationNotice(): JSX.Element | null {
  const { t } = useTranslation()
  const { status, refresh } = useGeolocationState()

  if (status === 'pending' || status === 'ready') return null

  return (
    <div className="bg-sand/20 border-b border-sand/40 px-4 py-2 text-xs text-text-muted text-center shrink-0">
      {status === 'denied' ? t('location.denied') : t('location.unavailable')}
      <button
        type="button"
        onClick={refresh}
        className="ml-2 underline underline-offset-2 hover:text-primary"
      >
        {t('location.retry')}
      </button>
    </div>
  )
}
