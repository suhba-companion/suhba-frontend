import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Event, EventAudience, EventCategory } from '../../types'
import { getUpcomingEvents } from '../../services/eventService'
import { useGeolocation } from '../../hooks/useGeolocation'

export type EventFilter = 'Alle' | 'Heute' | 'Diese Woche' | EventCategory

interface UseEventsReturn {
  events: readonly Event[]
  filteredEvents: readonly Event[]
  activeFilter: EventFilter
  setFilter: (f: EventFilter) => void
  // Audience is its own axis rather than another `EventFilter` value, so picking
  // "Nur Schwestern" narrows the current category instead of replacing it.
  audienceFilter: EventAudience | null
  setAudienceFilter: (a: EventAudience | null) => void
  query: string
  setQuery: (q: string) => void
  loading: boolean
  error: Error | null
  retry: () => void
}

const VIENNA = 'Europe/Vienna'

function viennaDayKey(date: Date): string {
  return new Intl.DateTimeFormat('de-AT', {
    timeZone: VIENNA, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
}

// "Heute" has to mean today in Vienna, the same zone every date on screen is printed
// in. Comparing in the device zone puts an evening event on the wrong day abroad.
function isToday(dateStr: string): boolean {
  return viennaDayKey(new Date(dateStr)) === viennaDayKey(new Date())
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
  const [audienceFilter, setAudienceFilter] = useState<EventAudience | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getUpcomingEvents(userPos)
      .then((result) => {
        if (cancelled) return
        setEvents(result)
        setError(null)
      })
      .catch((e: unknown) => {
        // A request abandoned by a tab switch must not strand the tab in an error
        // state it never retries out of.
        if (cancelled) return
        setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userPos.lat, userPos.lng, attempt])

  const filteredEvents = useMemo(() => {
    let result = events
    if (activeFilter === 'Heute') result = result.filter((e) => isToday(e.startTime))
    else if (activeFilter === 'Diese Woche') result = result.filter((e) => isThisWeek(e.startTime))
    else if (activeFilter !== 'Alle') result = result.filter((e) => e.categories.includes(activeFilter))
    if (audienceFilter !== null) result = result.filter((e) => e.audience === audienceFilter)
    if (query.trim() !== '') {
      const q = query.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.organizer?.toLowerCase().includes(q) ||
          e.address.toLowerCase().includes(q) ||
          e.district.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.categories.some((c) => c.toLowerCase().includes(q)),
      )
    }
    return [...result].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
  }, [events, activeFilter, audienceFilter, query])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  const setFilter = useCallback((f: EventFilter) => setActiveFilter(f), [])
  const handleSetAudienceFilter = useCallback((a: EventAudience | null) => setAudienceFilter(a), [])
  const handleSetQuery = useCallback((q: string) => setQuery(q), [])

  return {
    events, filteredEvents,
    activeFilter, setFilter,
    audienceFilter, setAudienceFilter: handleSetAudienceFilter,
    query, setQuery: handleSetQuery,
    loading, error, retry,
  }
}
