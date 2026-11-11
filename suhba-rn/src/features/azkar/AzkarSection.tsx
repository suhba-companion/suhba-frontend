import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { AzkarCard } from './AzkarCard'
import { DuaaCard } from './DuaaCard'
import { AzkarCounterModal } from './AzkarCounterModal'
import { Pill } from '../../components/Pill'
import { Sect } from '../../components/Sect'
import type { AzkarTab } from './useAzkar'
import type { Dhikr, Duaa } from '../../types'

const TABS: AzkarTab[] = ['azkar', 'duaa']

interface AzkarSectionProps {
  activeTab: AzkarTab
  setTab: (tab: AzkarTab) => void
  dhikrList: Dhikr[]
  duaaList: Duaa[]
  sabahList: Dhikr[]
  masaList: Dhikr[]
}

export function AzkarSection({
  activeTab, setTab, dhikrList, duaaList, sabahList, masaList,
}: AzkarSectionProps): React.JSX.Element {
  const { t } = useTranslation()
  const [selectedDhikr, setSelectedDhikr] = useState<Dhikr | null>(null)

  const tabLabel = (tab: AzkarTab): string => {
    if (tab === 'sabah') return t('azkar.tabSabah')
    if (tab === 'masa') return t('azkar.tabMasa')
    if (tab === 'azkar') return t('azkar.tabAzkar')
    return t('azkar.tabDuaa')
  }

  const activeList =
    activeTab === 'sabah' ? sabahList
      : activeTab === 'masa' ? masaList
        : activeTab === 'azkar' ? dhikrList
          : null

  return (
    <>
      <View style={styles.section}>
        <Sect label={t('azkar.afterPrayerLabel')} />

        <View accessibilityRole="tablist" accessibilityLabel={t('azkar.tabsLabel')} style={styles.tabs}>
          {TABS.map((tab) => (
            <Pill
              key={tab}
              label={tabLabel(tab)}
              active={tab === activeTab}
              onPress={() => setTab(tab)}
              size="toolbar"
            />
          ))}
        </View>

        {activeList !== null && (
          <View style={styles.list}>
            {activeList.map((dhikr) => (
              <AzkarCard key={dhikr.id} dhikr={dhikr} onSelect={setSelectedDhikr} />
            ))}
          </View>
        )}

        {activeTab === 'duaa' && (
          <View style={styles.list}>
            {duaaList.map((duaa) => (
              <DuaaCard key={duaa.id} duaa={duaa} />
            ))}
          </View>
        )}
      </View>

      {selectedDhikr !== null && (
        <AzkarCounterModal dhikr={selectedDhikr} onClose={() => setSelectedDhikr(null)} />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  tabs: { flexDirection: 'row', gap: 8 },
  list: { gap: 12 },
})
