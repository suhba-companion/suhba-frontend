import { useState, useEffect, useMemo } from 'react'
import type { Event, FeedEvent, PrayerSpot } from '../../types'
import { getUpcomingEvents } from '@services/eventService'
import { getSpots } from '@services/masjidiService'
import { useGeolocation } from '../../hooks/useGeolocation'

interface UseNearbyFeedReturn {
  items: readonly FeedEvent[]
  loading: boolean
  error: Error | null
}

interface NearbyData {
  spots: readonly PrayerSpot[]
  events: readonly Event[]
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

function byDistance<T extends { distanceKm?: number }>(a: T, b: T): number {
  return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
}

function spotToFeedEvent(spot: PrayerSpot): FeedEvent {
  return {
    id: `spot-${spot.id}`,
    title: spot.name,
    location: spot.district || spot.address,
    address: spot.address,
    district: spot.district,
    distanceKm: spot.distanceKm,
    tag: spot.type,
    time: spot.jumaTime ? `Juma ${spot.jumaTime}` : 'Offen',
    kind: 'spot',
    lat: spot.lat,
    lng: spot.lng,
  }
}

function eventToFeedEvent(event: Event): FeedEvent {
  return {
    id: `event-${event.id}`,
    title: event.title,
    location: event.district || event.address,
    address: event.address,
    district: event.district,
    distanceKm: event.distanceKm,
    tag: event.categories[0] ?? 'Sonstige',
    time: formatFeedTime(event.startTime),
    kind: 'event',
    lat: event.lat,
    lng: event.lng,
  }
}

export function useNearbyFeed(): UseNearbyFeedReturn {
  const userPos = useGeolocation()
  const [data, setData] = useState<NearbyData>({ spots: [], events: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.allSettled([getSpots(userPos), getUpcomingEvents(userPos)])
      .then(([spotsRes, eventsRes]) => {
        if (cancelled) return
        if (spotsRes.status === 'rejected' && eventsRes.status === 'rejected') {
          setError(spotsRes.reason instanceof Error ? spotsRes.reason : new Error('Feed failed'))
          return
        }
        setData({
          spots: spotsRes.status === 'fulfilled' ? spotsRes.value : [],
          events: eventsRes.status === 'fulfilled' ? eventsRes.value : [],
        })
        setError(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userPos.lat, userPos.lng])

  const items = useMemo(() => {
    const result: FeedEvent[] = []

    const nearestSpot = [...data.spots].sort(byDistance)[0]
    if (nearestSpot) result.push(spotToFeedEvent(nearestSpot))

    const nextEvent = [...data.events].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )[0]
    if (nextEvent) result.push(eventToFeedEvent(nextEvent))

    return result
  }, [data])

  return { items, loading, error }
}
