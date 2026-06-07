import { useState } from 'react'
import type { Dhikr } from '../../types'
import { DHIKR_LIST } from '../../data/dhikr'

interface UseDhikrReturn {
  dhikrList: Dhikr[]
  current: Dhikr
  index: number
  goToNext: () => void
  goTo: (i: number) => void
}

export function useDhikr(): UseDhikrReturn {
  const [index, setIndex] = useState(0)

  const goToNext = (): void => {
    setIndex((prev) => (prev + 1) % DHIKR_LIST.length)
  }

  const goTo = (i: number): void => {
    if (i >= 0 && i < DHIKR_LIST.length) {
      setIndex(i)
    }
  }

  return {
    dhikrList: DHIKR_LIST,
    current: DHIKR_LIST[index] as Dhikr,
    index,
    goToNext,
    goTo,
  }
}
