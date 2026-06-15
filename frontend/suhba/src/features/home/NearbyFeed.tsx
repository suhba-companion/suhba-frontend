import { useTranslation } from 'react-i18next'
import type { FeedEvent } from '../../types'

interface NearbyFeedProps {
  items?: readonly FeedEvent[]
  loading?: boolean
  error?: Error | null
}

export function NearbyFeed({ items = [], loading = false, error = null }: NearbyFeedProps): JSX.Element {
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
      {items.slice(0, 3).map((item) => (
        <li
          key={item.id}
          className="bg-cream-card border border-divider rounded-card overflow-hidden flex shadow-sm"
        >
          <div className="w-1 bg-primary shrink-0" />
          <div className="flex items-start justify-between gap-3 flex-1 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-text-dark text-sm m-0 truncate">{item.title}</p>
              <p className="text-text-muted text-xs mt-1 m-0">
                {item.location}
                {item.distanceKm !== undefined && ` · ${item.distanceKm} km`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="bg-sage-tint text-text-dark text-xs font-medium px-2 py-0.5 rounded-pill">
                {item.tag}
              </span>
              <span className="text-text-muted text-xs">{item.time}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
