import { useTranslation } from 'react-i18next'
import { ErrorBoundary, Sect } from '@components'
import type { NavTab } from '@components'
import { useDhikr } from './useDhikr'
import { DhikrCard } from './DhikrCard'
import { QuickGrid } from './QuickGrid'
import { NearbyFeed } from './NearbyFeed'
import { PrayerTimesWidget } from './PrayerTimesWidget'

interface HomePageProps {
  onNavigate: (tab: NavTab) => void
}

export function HomePage({ onNavigate }: HomePageProps): JSX.Element {
  const { t } = useTranslation()
  const { dhikrList, current, index, goToNext, goTo } = useDhikr()

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
          <NearbyFeed />
        </div>
      </section>

    </div>
  )
}
