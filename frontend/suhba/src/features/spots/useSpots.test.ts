import { renderHook, act, waitFor } from '@testing-library/react'
import { useSpots } from './useSpots'
import type { PrayerSpot } from '../../types'

vi.mock('@services/masjidiService', () => ({
  getSpots: vi.fn().mockResolvedValue([
    { id: '1', name: 'Islamisches Zentrum Wien', type: 'Moschee', address: 'Am Bruckhaufen 4', district: '1210 Wien', lat: 48.2636, lng: 16.3986, open: true, jumaTime: '12:30', wudu: true, sisters: true, parking: true, distanceKm: 5.5 },
    { id: '2', name: 'ATIB Moschee Favoriten', type: 'Moschee', address: 'Laxenburger Str. 37', district: '1100 Wien', lat: 48.1817, lng: 16.3764, open: true, jumaTime: '13:00', wudu: true, sisters: false, parking: false, distanceKm: 3.5 },
    { id: '3', name: 'Albanische Moschee', type: 'Moschee', address: 'Darnautgasse 10', district: '1100 Wien', lat: 48.1809, lng: 16.3572, open: false, jumaTime: '12:30', wudu: true, sisters: true, parking: false, distanceKm: 3.8 },
    { id: '4', name: 'Gebetsraum Brigittenau', type: 'Gebetsort', address: 'Pappenheimgasse 35', district: '1200 Wien', lat: 48.2267, lng: 16.3625, open: true, jumaTime: null, wudu: false, sisters: false, parking: false, distanceKm: 2.0 },
    { id: '5', name: 'IGGÖ Hauptstelle', type: 'Moschee', address: 'Bernardgasse 3', district: '1070 Wien', lat: 48.2034, lng: 16.3491, open: true, jumaTime: '12:15', wudu: true, sisters: true, parking: false, distanceKm: 1.5 },
  ] as PrayerSpot[]),
}))

describe('useSpots', () => {
  it('returns all spots with no active filters', async () => {
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.filteredSpots.length).toBe(result.current.spots.length)
  })

  it('spots have distanceKm computed', async () => {
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const spot = result.current.spots[0]
    expect(spot.distanceKm).toBeDefined()
  })

  it('search filters by name (case-insensitive)', async () => {
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ search: 'islamisches' }))
    expect(result.current.filteredSpots.every((s) => s.name.toLowerCase().includes('islamisches'))).toBe(true)
  })

  it('search filters by address too', async () => {
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ search: 'Bernardgasse' }))
    expect(result.current.filteredSpots.length).toBeGreaterThan(0)
  })

  it('type filter returns only matching type', async () => {
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ type: 'Gebetsort' }))
    expect(result.current.filteredSpots.every((s) => s.type === 'Gebetsort')).toBe(true)
  })

  it('juma filter returns only spots with jumaTime', async () => {
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ juma: true }))
    expect(result.current.filteredSpots.every((s) => s.jumaTime !== null)).toBe(true)
  })

  it('openNow filter returns only open spots', async () => {
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ openNow: true }))
    expect(result.current.filteredSpots.every((s) => s.open)).toBe(true)
  })

  it('activeFilterCount increments for each active filter', async () => {
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.activeFilterCount).toBe(0)
    act(() => result.current.updateFilters({ type: 'Moschee' }))
    expect(result.current.activeFilterCount).toBe(1)
    act(() => result.current.updateFilters({ juma: true }))
    expect(result.current.activeFilterCount).toBe(2)
  })

  it('resetFilters clears all filters', async () => {
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ type: 'Moschee', juma: true, wudu: true }))
    act(() => result.current.resetFilters())
    expect(result.current.activeFilterCount).toBe(0)
    expect(result.current.filters.type).toBe('Alle')
  })

  it('combined filters narrow results', async () => {
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ type: 'Moschee', sisters: true }))
    const results = result.current.filteredSpots
    expect(results.every((s) => s.type === 'Moschee' && s.sisters)).toBe(true)
  })
})
