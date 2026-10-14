import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Event, EventCategory } from '../../types'
import { getUpcomingEvents } from '@services/eventService'
import { useGeolocation } from '../../hooks/useGeolocation'

export type EventFilter = 'Alle' | 'Heute' | 'Diese Woche' | EventCategory

interface UseEventsReturn {
  events: readonly Event[]
  filteredEvents: readonly Event[]
  activeFilter: EventFilter
  setFilter: (f: EventFilter) => void
  query: string
  setQuery: (q: string) => void
  loading: boolean
  error: Error | null
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(now.getDate() + 7)
  return d >= now && d <= weekEnd
}

export function useEvents(): UseEventsReturn {
  const userPos = useGeolocation()
  const [events, setEvents] = useState<readonly Event[]>([])
  const [activeFilter, setActiveFilter] = useState<EventFilter>('Alle')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    getUpcomingEvents(userPos)
      .then(setEvents)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userPos.lat, userPos.lng])

  const filteredEvents = useMemo(() => {
    let result = events
    if (activeFilter === 'Heute') result = result.filter((e) => isToday(e.startTime))
    else if (activeFilter === 'Diese Woche') result = result.filter((e) => isThisWeek(e.startTime))
    else if (activeFilter !== 'Alle') result = result.filter((e) => e.category === activeFilter)
    if (query.trim() !== '') {
      const q = query.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.organizer?.toLowerCase().includes(q) ||
          e.address.toLowerCase().includes(q) ||
          e.district.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q),
      )
    }
    return [...result].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
  }, [events, activeFilter, query])

  const setFilter = useCallback((f: EventFilter) => setActiveFilter(f), [])
  const handleSetQuery = useCallback((q: string) => setQuery(q), [])

  return { events, filteredEvents, activeFilter, setFilter, query, setQuery: handleSetQuery, loading, error }
}
