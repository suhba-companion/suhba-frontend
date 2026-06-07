import { useState, useEffect, useMemo, useCallback } from 'react'
import type { PrayerSpot, SpotType } from '../../types'
import { getSpots } from '@services/masjidiService'
import { useGeolocation } from '../../hooks/useGeolocation'

export interface SpotFilters {
  type: SpotType | 'Alle'
  juma: boolean
  wudu: boolean
  sisters: boolean
  parking: boolean
  hijab: boolean
  prayerClothes: boolean
  openNow: boolean
  search: string
}

export type SpotSort = 'Distanz' | 'Name'

const DEFAULT_FILTERS: SpotFilters = {
  type: 'Alle',
  juma: false,
  wudu: false,
  sisters: false,
  parking: false,
  hijab: false,
  prayerClothes: false,
  openNow: false,
  search: '',
}

interface UseSpotsReturn {
  spots: readonly PrayerSpot[]
  filteredSpots: PrayerSpot[]
  filters: SpotFilters
  updateFilters: (updates: Partial<SpotFilters>) => void
  resetFilters: () => void
  activeFilterCount: number
  sort: SpotSort
  setSort: (s: SpotSort) => void
  loading: boolean
  error: Error | null
}

export function useSpots(): UseSpotsReturn {
  const userPos = useGeolocation()
  const [allSpots, setAllSpots] = useState<readonly PrayerSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<SpotFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SpotSort>('Distanz')

  useEffect(() => {
    getSpots(userPos)
      .then(setAllSpots)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false))
  }, [userPos.lat, userPos.lng])

  const filteredSpots = useMemo<PrayerSpot[]>(() => {
    const filtered = allSpots.filter((spot): spot is PrayerSpot => {
      const q = filters.search.toLowerCase()
      if (q && !spot.name.toLowerCase().includes(q) && !spot.address.toLowerCase().includes(q)) {
        return false
      }
      if (filters.type !== 'Alle' && spot.type !== filters.type) return false
      if (filters.juma && spot.jumaTime === null) return false
      if (filters.wudu && !spot.wudu) return false
      if (filters.sisters && !spot.sisters) return false
      if (filters.parking && !spot.parking) return false
      if (filters.hijab && !spot.hijab) return false
      if (filters.prayerClothes && !spot.prayerClothes) return false
      if (filters.openNow && !spot.open) return false
      return true
    })

    return [...filtered].sort((a, b) => {
      if (sort === 'Name') return a.name.localeCompare(b.name)
      return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    })
  }, [allSpots, filters, sort])

  const activeFilterCount = useMemo<number>(() => {
    let count = 0
    if (filters.type !== 'Alle') count++
    if (filters.juma) count++
    if (filters.wudu) count++
    if (filters.sisters) count++
    if (filters.parking) count++
    if (filters.hijab) count++
    if (filters.prayerClothes) count++
    if (filters.openNow) count++
    return count
  }, [filters])

  const updateFilters = useCallback((updates: Partial<SpotFilters>): void => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const resetFilters = useCallback((): void => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  return { spots: allSpots, filteredSpots, filters, updateFilters, resetFilters, activeFilterCount, sort, setSort, loading, error }
}
