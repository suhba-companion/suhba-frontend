import { useState, useEffect, useMemo } from 'react'
import type { Event, FeedEvent } from '../../types'
import { getUpcomingEvents } from '@services/eventService'
import { useGeolocation } from '../../hooks/useGeolocation'

const MAX_FEED_ITEMS = 3

interface UseNearbyFeedReturn {
  items: readonly FeedEvent[]
  loading: boolean
  error: Error | null
}

function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function formatFeedTime(isoStr: string): string {
  const d = new Date(isoStr)
  const time = d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })
  if (isToday(d)) return `Heute ${time}`
  const day = d.toLocaleDateString('de-AT', { weekday: 'short' })
  return `${day} ${time}`
}

function toFeedEvent(event: Event): FeedEvent {
  return {
    id: event.id,
    title: event.title,
    location: event.district || event.address,
    distanceKm: event.distanceKm,
    tag: event.category,
    time: formatFeedTime(event.startTime),
  }
}

export function useNearbyFeed(): UseNearbyFeedReturn {
  const userPos = useGeolocation()
  const [events, setEvents] = useState<readonly Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    getUpcomingEvents(userPos)
      .then((data) => {
        setEvents(data)
        setError(null)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userPos.lat, userPos.lng])

  const items = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, MAX_FEED_ITEMS)
      .map(toFeedEvent)
  }, [events])

  return { items, loading, error }
}
