import { renderHook, waitFor } from '@testing-library/react'
import { useNearbyFeed } from './useNearbyFeed'
import type { Event, PrayerSpot, HalalBusiness } from '../../types'

vi.mock('@services/masjidiService', () => ({
  getSpots: vi.fn().mockResolvedValue([
    { id: '10', name: 'Zentralmoschee', type: 'Moschee',   address: 'Hubergasse', district: '1010 Wien', lat: 48.2, lng: 16.37, open: true, jumaTime: '13:30', wudu: true,  sisters: true,  parking: false, distanceKm: 2.4 },
    { id: '11', name: 'Gebetsraum Uni', type: 'Gebetsort', address: 'Campus',     district: '1090 Wien', lat: 48.21, lng: 16.36, open: true, jumaTime: null,    wudu: false, sisters: false, parking: false, distanceKm: 0.8 },
  ] as PrayerSpot[]),
}))

vi.mock('@services/halalService', () => ({
  getHalalBusinesses: vi.fn().mockResolvedValue([
    { id: '20', name: 'Kebap Haus', type: 'Restaurant', address: 'Mariahilf', district: '1060 Wien', lat: 48.19, lng: 16.35, certStatus: 'HMA-Zertifiziert', rating: 4.6, featured: false, distanceKm: 1.5 },
    { id: '21', name: 'Halal Markt', type: 'Lebensmittel', address: 'Favoriten', district: '1100 Wien', lat: 48.18, lng: 16.37, certStatus: 'Selbst-zertifiziert', featured: false, distanceKm: 3.2 },
  ] as HalalBusiness[]),
}))

vi.mock('@services/eventService', () => {
  const soon  = new Date(Date.now() + 60 * 1000).toISOString()
  const later = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  return {
    getUpcomingEvents: vi.fn().mockResolvedValue([
      { id: '2', title: 'Islamvortrag',  category: 'Vortrag', address: 'Islamzentrum', district: '1210 Wien', lat: 48.26, lng: 16.39, startTime: later, isFree: false, distanceKm: 3.2 },
      { id: '1', title: 'Freitagsgebet', category: 'Gebet',   address: 'Moschee',      district: '1010 Wien', lat: 48.2,  lng: 16.37, startTime: soon,  isFree: true,  distanceKm: 1.1 },
    ] as Event[]),
  }
})

describe('useNearbyFeed', () => {
  it('starts with loading true', () => {
    const { result } = renderHook(() => useNearbyFeed())
    expect(result.current.loading).toBe(true)
  })

  it('loads all sources and clears loading/error', async () => {
    const { result } = renderHook(() => useNearbyFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it('returns one prayer spot, one halal spot and one event', async () => {
    const { result } = renderHook(() => useNearbyFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const ids = result.current.items.map((i) => i.id)
    expect(result.current.items).toHaveLength(3)
    expect(ids[0]).toMatch(/^spot-/)
    expect(ids[1]).toMatch(/^halal-/)
    expect(ids[2]).toMatch(/^event-/)
  })

  it('picks the nearest prayer spot', async () => {
    const { result } = renderHook(() => useNearbyFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const spot = result.current.items[0]
    expect(spot.title).toBe('Gebetsraum Uni')
    expect(spot.tag).toBe('Gebetsort')
    expect(spot.distanceKm).toBe(0.8)
  })

  it('picks the nearest halal spot', async () => {
    const { result } = renderHook(() => useNearbyFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const halal = result.current.items[1]
    expect(halal.title).toBe('Kebap Haus')
    expect(halal.tag).toBe('Restaurant')
    expect(halal.time).toBe('★ 4.6')
  })

  it('picks the soonest upcoming event', async () => {
    const { result } = renderHook(() => useNearbyFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const event = result.current.items[2]
    expect(event.title).toBe('Freitagsgebet')
    expect(event.tag).toBe('Gebet')
  })
})
