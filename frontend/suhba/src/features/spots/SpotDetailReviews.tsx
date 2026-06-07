import { useTranslation } from 'react-i18next'
import { Star } from '@phosphor-icons/react'
import { Sect } from '@components'
import type { SpotReview } from '../../types'

interface StarRatingProps {
  stars: number
}

function StarRating({ stars }: StarRatingProps): JSX.Element {
  const { t } = useTranslation()
  const filled = Math.min(5, Math.max(0, Math.round(stars)))
  return (
    <span className="text-sand text-sm flex items-center gap-0.5" aria-label={t('spots.detail.stars', { count: filled })}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={14} weight={i < filled ? 'fill' : 'regular'} aria-hidden="true" />
      ))}
    </span>
  )
}

interface SpotDetailReviewsProps {
  reviews: SpotReview[]
}

export function SpotDetailReviews({ reviews }: SpotDetailReviewsProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <section>
      <Sect label={t('spots.detail.reviews')} />
      {reviews.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6 mt-3">
          {t('spots.detail.noReviews')}
        </p>
      ) : (
        <ul className="space-y-3 list-none p-0 m-0 mt-3">
          {reviews.map((review) => (
            <li key={review.id} className="bg-cream-card border border-divider rounded-card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-text-dark text-sm">{review.user}</span>
                <StarRating stars={review.stars} />
              </div>
              <p className="text-text-muted text-xs m-0 leading-relaxed">{review.text}</p>
              <p className="text-text-muted text-[11px] mt-2 m-0">{review.createdAt}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
