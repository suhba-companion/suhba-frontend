import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AzkarCard } from './AzkarCard'
import { DuaaCard } from './DuaaCard'
import { AzkarCounterModal } from './AzkarCounterModal'
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

export function AzkarSection({ activeTab, setTab, dhikrList, duaaList, sabahList, masaList }: AzkarSectionProps): JSX.Element {
  const { t } = useTranslation()
  const [selectedDhikr, setSelectedDhikr] = useState<Dhikr | null>(null)

  const tabLabel = (tab: AzkarTab): string => {
    if (tab === 'sabah') return t('azkar.tabSabah')
    if (tab === 'masa') return t('azkar.tabMasa')
    if (tab === 'azkar') return t('azkar.tabAzkar')
    return t('azkar.tabDuaa')
  }

  const activeList = activeTab === 'sabah' ? sabahList : activeTab === 'masa' ? masaList : activeTab === 'azkar' ? dhikrList : null

  return (
    <>
      <div className="space-y-3">
        <Sect label={t('azkar.afterPrayerLabel')} />
      <div className="flex gap-2" role="tablist" aria-label={t('azkar.tabsLabel')}>
          {TABS.map((tab) => {
            const isActive = tab === activeTab
            return (
              <button
                key={tab}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setTab(tab)}
                className={[
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0',
                  isActive
                    ? 'bg-moss text-cream-card'
                    : 'bg-cream-card border border-divider text-text-muted hover:text-text-dark',
                ].join(' ')}
              >
                {tabLabel(tab)}
              </button>
            )
          })}
        </div>

        {activeList !== null && (
          <ul
            className="space-y-3 list-none p-0 m-0"
            role="tabpanel"
            aria-label={activeTab === 'sabah' ? t('azkar.sabahListLabel') : activeTab === 'masa' ? t('azkar.masaListLabel') : t('azkar.azkarListLabel')}
          >
            {activeList.map((dhikr) => (
              <AzkarCard key={dhikr.id} dhikr={dhikr} onSelect={setSelectedDhikr} />
            ))}
          </ul>
        )}

        {activeTab === 'duaa' && (
          <ul
            className="space-y-3 list-none p-0 m-0"
            role="tabpanel"
            aria-label={t('azkar.duaaListLabel')}
          >
            {duaaList.map((duaa) => (
              <DuaaCard key={duaa.id} duaa={duaa} />
            ))}
          </ul>
        )}
      </div>

      {selectedDhikr !== null && (
        <AzkarCounterModal
          dhikr={selectedDhikr}
          onClose={() => setSelectedDhikr(null)}
        />
      )}
    </>
  )
}
