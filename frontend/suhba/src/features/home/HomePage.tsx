import { useTranslation } from 'react-i18next'
import { ErrorBoundary, Sect } from '@components'
import type { NavTab } from '@components'
import type { FeedEvent } from '../../types'
import { useDhikr } from './useDhikr'
import { DhikrCard } from './DhikrCard'
import { QuickGrid } from './QuickGrid'
import { NearbyFeed } from './NearbyFeed'
import { useNearbyFeed } from './useNearbyFeed'
import { PrayerTimesWidget } from './PrayerTimesWidget'

interface HomePageProps {
  onNavigate: (tab: NavTab) => void
  onSpotSelect?: (id: string, name: string) => void
  onBusinessSelect?: (id: string) => void
  onEventSelect?: (id: string, title: string) => void
}

export function HomePage({ onNavigate, onSpotSelect, onBusinessSelect, onEventSelect }: HomePageProps): JSX.Element {
  const { t } = useTranslation()
  const { dhikrList, current, index, goToNext, goTo } = useDhikr()
  const { items: nearbyItems, loading: nearbyLoading, error: nearbyError } = useNearbyFeed()

  function handleFeedSelect(item: FeedEvent): void {
    if (item.kind === undefined) return
    const rawId = item.id.slice(item.kind.length + 1)
    if (item.kind === 'spot') onSpotSelect?.(rawId, item.title)
    else if (item.kind === 'halal') onBusinessSelect?.(rawId)
    else if (item.kind === 'event') onEventSelect?.(rawId, item.title)
  }

  return (
    <div className="p-4 space-y-6 pb-8">
      <PrayerTimesWidget />

      <ErrorBoundary>
        <DhikrCard
          key={current.id}
          current={current}
          total={dhikrList.length}
          index={index}
          onNext={goToNext}
          onGoTo={goTo}
        />
      </ErrorBoundary>

      <section>
        <Sect label={t('home.quickAccess')} />
        <div className="mt-3">
          <QuickGrid onNavigate={onNavigate} />
        </div>
      </section>

      <section>
        <Sect label={t('home.nearby')} />
        <div className="mt-3">
          <NearbyFeed items={nearbyItems} loading={nearbyLoading} error={nearbyError} onSelect={handleFeedSelect} />
        </div>
      </section>

    </div>
  )
}
