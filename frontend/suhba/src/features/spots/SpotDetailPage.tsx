import { useState, useEffect, Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { Sect, Spinner } from '@components'
import { getSpotById, getReviewsBySpotId } from '@services/masjidiService'
import type { PrayerSpot, SpotReview } from '../../types'
import { SpotDetailHero } from './SpotDetailHero'
import { SpotDetailInfo } from './SpotDetailInfo'
import { SpotDetailReviews } from './SpotDetailReviews'

const SpotDetailMap = lazy(() =>
  import('./SpotDetailMap').then((m) => ({ default: m.SpotDetailMap })),
)

interface SpotDetailPageProps {
  spotId: string
}

export function SpotDetailPage({ spotId }: SpotDetailPageProps): JSX.Element {
  const { t } = useTranslation()
  const [spot, setSpot] = useState<PrayerSpot | undefined>(undefined)
  const [reviews, setReviews] = useState<SpotReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getSpotById(spotId)
      .then((s) => {
        setSpot(s)
        setReviews(getReviewsBySpotId(spotId))
      })
      .finally(() => setLoading(false))
  }, [spotId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={36} />
      </div>
    )
  }

  if (spot === undefined) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        {t('spots.detail.notFound')}
      </div>
    )
  }

  return (
    <div>
      <SpotDetailHero spot={spot} />

      <div className="p-4 pt-2 space-y-4">
        <SpotDetailInfo spot={spot} />

        <section>
          <Sect label={t('spots.detail.map')} />
          <div className="mt-3 rounded-card overflow-hidden h-48 border border-divider">
            <Suspense
              fallback={
                <div className="h-full bg-cream-card flex items-center justify-center text-text-muted text-sm">
                  {t('spots.detail.mapLoading')}
                </div>
              }
            >
              <SpotDetailMap spot={spot} />
            </Suspense>
          </div>
        </section>

        <SpotDetailReviews reviews={reviews} />

        <button
          type="button"
          className="w-full py-3 text-sm font-medium text-text-muted border border-divider rounded-card hover:bg-sage-tint transition-colors"
        >
          {t('spots.detail.suggestChange')}
        </button>
      </div>
    </div>
  )
}
