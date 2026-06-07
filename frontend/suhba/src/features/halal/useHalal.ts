import { useState, useEffect, useMemo, useCallback } from 'react'
import type { HalalBusiness, BusinessType } from '../../types'
import { getHalalBusinesses } from '@services/halalService'
import { useGeolocation } from '../../hooks/useGeolocation'

export interface HalalFilters {
  type: BusinessType | 'Alle'
  parking: boolean
  search: string
}

export type HalalSort = 'Distanz' | 'Name'

const DEFAULT_FILTERS: HalalFilters = {
  type: 'Alle',
  parking: false,
  search: '',
}

interface UseHalalReturn {
  featuredBusinesses: HalalBusiness[]
  regularBusinesses: HalalBusiness[]
  totalCount: number
  filters: HalalFilters
  updateFilters: (updates: Partial<HalalFilters>) => void
  resetFilters: () => void
  activeFilterCount: number
  sort: HalalSort
  setSort: (s: HalalSort) => void
  loading: boolean
  error: Error | null
}

export function useHalal(): UseHalalReturn {
  const userPos = useGeolocation()
  const [allBusinesses, setAllBusinesses] = useState<readonly HalalBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<HalalFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<HalalSort>('Distanz')

  useEffect(() => {
    getHalalBusinesses(userPos)
      .then(setAllBusinesses)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false))
  }, [userPos.lat, userPos.lng])

  const filteredAll = useMemo<HalalBusiness[]>(() => {
    const filtered = allBusinesses.filter((b): b is HalalBusiness => {
      const q = filters.search.toLowerCase()
      if (q && !b.name.toLowerCase().includes(q) && !b.address.toLowerCase().includes(q)) {
        return false
      }
      if (filters.type !== 'Alle' && b.type !== filters.type) return false
      if (filters.parking && !b.parking) return false
      return true
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'Name') return a.name.localeCompare(b.name)
      return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    })
  }, [allBusinesses, filters, sort])

  const featuredBusinesses = useMemo<HalalBusiness[]>(
    () => filteredAll.filter((b) => b.featured),
    [filteredAll],
  )

  const regularBusinesses = useMemo<HalalBusiness[]>(
    () => filteredAll.filter((b) => !b.featured),
    [filteredAll],
  )

  const activeFilterCount = useMemo<number>(
    () => (filters.type !== 'Alle' ? 1 : 0) + (filters.parking ? 1 : 0),
    [filters.type, filters.parking],
  )

  const updateFilters = useCallback((updates: Partial<HalalFilters>): void => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const resetFilters = useCallback((): void => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  return {
    featuredBusinesses,
    regularBusinesses,
    totalCount: filteredAll.length,
    filters,
    updateFilters,
    resetFilters,
    activeFilterCount,
    sort,
    setSort,
    loading,
    error,
  }
}
