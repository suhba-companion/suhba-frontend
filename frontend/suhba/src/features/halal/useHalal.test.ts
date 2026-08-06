import { renderHook, act, waitFor } from '@testing-library/react'
import { useHalal } from './useHalal'
import type { HalalBusiness } from '../../types'

vi.mock('@services/halalService', () => ({
  getHalalBusinesses: vi.fn().mockResolvedValue([
    { id: '1', name: 'Taqwa Restaurant', type: 'Restaurant', address: 'Quellenstraße 26', district: '1100 Wien', lat: 48.193, lng: 16.367, certStatus: 'HMA-Zertifiziert', rating: 4.7, featured: true, distanceKm: 2.1 },
    { id: '2', name: 'Vienna Halal Market', type: 'Lebensmittel', address: 'Mariahilfer Str. 140', district: '1150 Wien', lat: 48.198, lng: 16.330, certStatus: 'HMA-Zertifiziert', rating: 4.5, featured: true, distanceKm: 3.2 },
    { id: '3', name: 'Özlem Café', type: 'Café', address: 'Praterstraße 34', district: '1020 Wien', lat: 48.214, lng: 16.390, certStatus: 'Selbst-zertifiziert', rating: 4.3, featured: true, distanceKm: 1.5 },
    { id: '4', name: 'Al-Sham Restaurant', type: 'Restaurant', address: 'Favoritenstraße 62', district: '1100 Wien', lat: 48.185, lng: 16.370, certStatus: 'Selbst-zertifiziert', rating: 4.1, featured: false, distanceKm: 3.0 },
    { id: '5', name: 'Halal Metzgerei Özkan', type: 'Metzgerei', address: 'Schönbrunner Str. 77', district: '1050 Wien', lat: 48.189, lng: 16.340, certStatus: 'HMA-Zertifiziert', rating: 4.6, featured: false, distanceKm: 2.5 },
  ] as HalalBusiness[]),
}))

describe('useHalal', () => {
  it('returns all businesses with no filters', async () => {
    const { result } = renderHook(() => useHalal())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.totalCount).toBeGreaterThan(0)
  })

  it('totalCount equals number of businesses', async () => {
    const { result } = renderHook(() => useHalal())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const { businesses, totalCount } = result.current
    expect(totalCount).toBe(businesses.length)
  })

  it('businesses have distanceKm computed', async () => {
    const { result } = renderHook(() => useHalal())
    await waitFor(() => expect(result.current.loading).toBe(false))
    result.current.businesses.forEach((b) => {
      expect(b.distanceKm).toBeDefined()
    })
  })

  it('search filters by name', async () => {
    const { result } = renderHook(() => useHalal())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ search: 'Taqwa' }))
    expect(result.current.totalCount).toBe(1)
    expect(result.current.businesses[0]?.name).toBe('Taqwa Restaurant')
  })

  it('search is case-insensitive', async () => {
    const { result } = renderHook(() => useHalal())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ search: 'taqwa' }))
    expect(result.current.totalCount).toBe(1)
  })

  it('category filter returns only matching type', async () => {
    const { result } = renderHook(() => useHalal())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ type: 'Metzgerei' }))
    const all = result.current.businesses
    expect(all.every((b) => b.type === 'Metzgerei')).toBe(true)
    expect(all.length).toBeGreaterThan(0)
  })

  it('activeFilterCount is 0 by default', async () => {
    const { result } = renderHook(() => useHalal())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.activeFilterCount).toBe(0)
  })

  it('activeFilterCount increments when category is set', async () => {
    const { result } = renderHook(() => useHalal())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ type: 'Café' }))
    expect(result.current.activeFilterCount).toBe(1)
  })

  it('resetFilters clears category filter', async () => {
    const { result } = renderHook(() => useHalal())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ type: 'Restaurant' }))
    act(() => result.current.resetFilters())
    expect(result.current.filters.type).toBe('Alle')
    expect(result.current.activeFilterCount).toBe(0)
  })

  it('empty results when search matches nothing', async () => {
    const { result } = renderHook(() => useHalal())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.updateFilters({ search: 'xyznonexistent999' }))
    expect(result.current.totalCount).toBe(0)
  })
})
