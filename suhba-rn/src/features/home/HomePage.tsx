import { ScrollView, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Sect } from '../../components/Sect'
import type { NavTab } from '../../components/NavBar'
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
  onEventSelect?: (id: string, title: string) => void
  footer?: React.ReactNode
}

export function HomePage({
  onNavigate, onSpotSelect, onEventSelect, footer,
}: HomePageProps): React.JSX.Element {
  const { t } = useTranslation()
  const { dhikrList, current, index, goToNext, goTo } = useDhikr()
  const { items: nearbyItems, loading: nearbyLoading, error: nearbyError } = useNearbyFeed()

  function handleFeedSelect(item: FeedEvent): void {
    if (item.kind === undefined) return
    const rawId = item.id.slice(item.kind.length + 1)
    if (item.kind === 'spot') onSpotSelect?.(rawId, item.title)
    else if (item.kind === 'event') onEventSelect?.(rawId, item.title)
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <PrayerTimesWidget />

      <DhikrCard
        key={current.id}
        current={current}
        total={dhikrList.length}
        index={index}
        onNext={goToNext}
        onGoTo={goTo}
      />

      <View style={styles.section}>
        <Sect label={t('home.quickAccess')} />
        <View style={styles.sectionBody}>
          <QuickGrid onNavigate={onNavigate} />
        </View>
      </View>

      <View style={styles.section}>
        <Sect label={t('home.nearby')} />
        <View style={styles.sectionBody}>
          <NearbyFeed
            items={nearbyItems}
            loading={nearbyLoading}
            error={nearbyError}
            onSelect={handleFeedSelect}
          />
        </View>
      </View>

      {footer}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 24, paddingBottom: 32 },
  section: {},
  sectionBody: { marginTop: 12 },
})
