import { renderHook, waitFor } from '@testing-library/react'
import { useNearbyFeed } from './useNearbyFeed'
import type { Event } from '../../types'

vi.mock('@services/eventService', () => {
  const soon  = new Date(Date.now() + 60 * 1000).toISOString()
  const later = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  const last  = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  return {
    getUpcomingEvents: vi.fn().mockResolvedValue([
      { id: '2', title: 'Islamvortrag',  category: 'Vortrag', address: 'Islamzentrum',    district: '1210 Wien', lat: 48.26, lng: 16.39, startTime: later, isFree: false, distanceKm: 3.2 },
      { id: '1', title: 'Freitagsgebet', category: 'Gebet',   address: 'Moschee',         district: '1010 Wien', lat: 48.2,  lng: 16.37, startTime: soon,  isFree: true,  distanceKm: 1.1 },
      { id: '3', title: 'Jugendtreff',   category: 'Jugend',  address: 'Gemeindezentrum', district: '1100 Wien', lat: 48.18, lng: 16.37, startTime: last,  isFree: true,  distanceKm: 0.5 },
      { id: '4', title: 'Spendenaktion', category: 'Spende',  address: 'Saal',            district: '1020 Wien', lat: 48.21, lng: 16.38, startTime: last,  isFree: true,  distanceKm: 0.9 },
    ] as Event[]),
  }
})

describe('useNearbyFeed', () => {
  it('starts with loading true', () => {
    const { result } = renderHook(() => useNearbyFeed())
    expect(result.current.loading).toBe(true)
  })

  it('loads events and sets loading to false', async () => {
    const { result } = renderHook(() => useNearbyFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it('returns at most 3 items', async () => {
    const { result } = renderHook(() => useNearbyFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toHaveLength(3)
  })

  it('sorts items by start time ascending', async () => {
    const { result } = renderHook(() => useNearbyFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items[0].title).toBe('Freitagsgebet')
  })

  it('maps category to tag and district to location', async () => {
    const { result } = renderHook(() => useNearbyFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const first = result.current.items[0]
    expect(first.tag).toBe('Gebet')
    expect(first.location).toBe('1010 Wien')
    expect(first.distanceKm).toBe(1.1)
  })
})
