import { renderHook, act, waitFor } from '@testing-library/react'
import { useEvents } from '@features/events/useEvents'
import type { Event } from '../../../types'

vi.mock('@services/eventService', () => {
  const future   = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  const nextWeek = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  const today    = new Date(Date.now() + 60 * 1000).toISOString() // 1 min ahead = same day
  return {
    getUpcomingEvents: vi.fn().mockResolvedValue([
      { id: '1', title: 'Freitagsgebet', category: 'Gebet',   address: 'Moschee',          district: '1010 Wien', lat: 48.2,  lng: 16.37, startTime: today,    isFree: true  },
      { id: '2', title: 'Islamvortrag',  category: 'Vortrag', address: 'Islamzentrum',      district: '1210 Wien', lat: 48.26, lng: 16.39, startTime: future,   isFree: false },
      { id: '3', title: 'Jugendtreff',   category: 'Jugend',  address: 'Gemeindezentrum',   district: '1100 Wien', lat: 48.18, lng: 16.37, startTime: nextWeek, isFree: true  },
    ] as Event[]),
  }
})

describe('useEvents', () => {
  it('starts with loading true', () => {
    const { result } = renderHook(() => useEvents())
    expect(result.current.loading).toBe(true)
  })

  it('loads events and sets loading to false', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.events).toHaveLength(3)
  })

  it('default activeFilter is Alle', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.activeFilter).toBe('Alle')
  })

  it('Alle filter returns all events', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.filteredEvents).toHaveLength(3)
  })

  it('category filter narrows events to matching category', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setFilter('Vortrag'))
    expect(result.current.filteredEvents).toHaveLength(1)
    expect(result.current.filteredEvents[0].category).toBe('Vortrag')
  })

  it('Jugend filter returns only Jugend events', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setFilter('Jugend'))
    expect(result.current.filteredEvents.every((e) => e.category === 'Jugend')).toBe(true)
  })

  it('switching back to Alle shows all events again', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setFilter('Gebet'))
    act(() => result.current.setFilter('Alle'))
    expect(result.current.filteredEvents).toHaveLength(3)
  })

  it('setFilter updates activeFilter', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setFilter('Kurs'))
    expect(result.current.activeFilter).toBe('Kurs')
  })

  it('unknown category filter returns empty array', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setFilter('Kurs'))
    expect(result.current.filteredEvents).toHaveLength(0)
  })

  it('error is null on successful load', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it('query filters by title', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setQuery('freitag'))
    expect(result.current.filteredEvents).toHaveLength(1)
    expect(result.current.filteredEvents[0].title).toBe('Freitagsgebet')
  })

  it('query filters by address', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setQuery('islamzentrum'))
    expect(result.current.filteredEvents).toHaveLength(1)
    expect(result.current.filteredEvents[0].address).toBe('Islamzentrum')
  })

  it('query filters by category', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setQuery('jugend'))
    expect(result.current.filteredEvents).toHaveLength(1)
    expect(result.current.filteredEvents[0].category).toBe('Jugend')
  })

  it('empty query shows all events', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setQuery('freitag'))
    act(() => result.current.setQuery(''))
    expect(result.current.filteredEvents).toHaveLength(3)
  })

  it('Heute filter returns only today\'s events', async () => {
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setFilter('Heute'))
    result.current.filteredEvents.forEach((e) => {
      const d = new Date(e.startTime)
      const now = new Date()
      expect(d.getFullYear()).toBe(now.getFullYear())
      expect(d.getMonth()).toBe(now.getMonth())
      expect(d.getDate()).toBe(now.getDate())
    })
  })
})
