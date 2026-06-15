import { useTranslation } from 'react-i18next'
import type { FeedEvent } from '../../types'

interface NearbyFeedProps {
  items?: readonly FeedEvent[]
  loading?: boolean
  error?: Error | null
  onSelect?: (item: FeedEvent) => void
}

function routeUrl(item: FeedEvent): string | undefined {
  if (item.googleMapsUrl) return item.googleMapsUrl
  if (item.lat !== undefined && item.lng !== undefined) {
    return `https://maps.google.com/maps?daddr=${item.lat},${item.lng}&travelmode=transit`
  }
  return undefined
}

function openRoute(e: React.MouseEvent, item: FeedEvent): void {
  e.stopPropagation()
  const url = routeUrl(item)
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

export function NearbyFeed({ items = [], loading = false, error = null, onSelect }: NearbyFeedProps): JSX.Element {
  const { t } = useTranslation()

  if (loading) {
    return (
      <p className="text-text-muted text-sm text-center py-6">
        {t('home.nearbyLoading')}
      </p>
    )
  }

  if (error) {
    return (
      <p className="text-text-muted text-sm text-center py-6">
        {t('home.nearbyError')}
      </p>
    )
  }

  if (items.length === 0) {
    return (
      <p className="text-text-muted text-sm text-center py-6">
        {t('home.nearbyEmpty')}
      </p>
    )
  }

  return (
    <ul className="space-y-4 list-none p-0 m-0">
      {items.slice(0, 3).map((item) => {
        const canSelect = item.kind !== undefined && onSelect !== undefined
        return (
          <li
            key={item.id}
            className={[
              'bg-cream-card border border-divider rounded-card p-4 space-y-3 shadow-sm',
              canSelect ? 'cursor-pointer hover:border-sage-light active:border-sage-light transition-colors' : '',
            ].join(' ')}
            onClick={canSelect ? () => onSelect(item) : undefined}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-dark text-sm m-0 truncate">{item.title}</p>
                <p className="text-text-muted text-xs mt-0.5 m-0 truncate">{item.location}</p>
              </div>
              <span className="text-text-muted text-xs font-medium shrink-0">{item.tag}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-text-muted text-xs">
                {item.distanceKm !== undefined && `~${item.distanceKm} km`}
                {item.distanceKm !== undefined && item.time ? ' · ' : ''}
                {item.time}
              </span>
              {routeUrl(item) !== undefined && (
                <button
                  type="button"
                  onClick={(e) => openRoute(e, item)}
                  className="bg-primary text-cream-card text-xs font-medium px-4 py-2 rounded-pill hover:bg-moss active:bg-moss transition-colors shrink-0 min-h-[36px]"
                >
                  {t('spots.route')}
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
