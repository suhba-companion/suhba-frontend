import { useState } from 'react'
import type { Dhikr, Duaa } from '../../types'
import { DHIKR_LIST } from '../../data/dhikr'
import { DUAA_LIST } from '../../data/duaa'
import { AZKAR_SABAH } from '../../data/azkarSabah'
import { AZKAR_MASA } from '../../data/azkarMasa'

export type AzkarTab = 'sabah' | 'masa' | 'azkar' | 'duaa'

interface UseAzkarReturn {
  activeTab: AzkarTab
  setTab: (tab: AzkarTab) => void
  dhikrList: Dhikr[]
  duaaList: Duaa[]
  sabahList: Dhikr[]
  masaList: Dhikr[]
}

export function useAzkar(): UseAzkarReturn {
  const [activeTab, setTab] = useState<AzkarTab>('sabah')

  return {
    activeTab,
    setTab,
    dhikrList: DHIKR_LIST,
    duaaList: DUAA_LIST,
    sabahList: AZKAR_SABAH,
    masaList: AZKAR_MASA,
  }
}
