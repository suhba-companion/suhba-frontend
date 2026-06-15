import type { Event } from '../types'
import type { GeoPosition } from '../hooks/useGeolocation'
import { roundKm } from '../utils/geo'
import { getRoadDistancesKm } from './routingService'

const API_BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/v1`
const VIENNA_CENTER: GeoPosition = { lat: 48.2082, lng: 16.3738 }
const NEARBY_RADIUS_KM = 15

type BackendEvent = {
  id: number
  title: string
  description: string | null
  address: string
  district: string
  latitude: number
  longitude: number
  startTime: string
  endTime: string | null
  category: 'PRAYER' | 'LECTURE' | 'CLASS' | 'COMMUNITY' | 'YOUTH' | 'SPORT' | 'FUNDRAISER' | 'OTHER'
  organizer: string | null
  contactInfo: string | null
  isFree: boolean
  googleMapsUrl: string | null
  status: string
  upvotes: number
  distanceKm: number | null
}

const CATEGORY_MAP: Record<BackendEvent['category'], Event['category']> = {
  PRAYER: 'Gebet',
  LECTURE: 'Vortrag',
  CLASS: 'Kurs',
  COMMUNITY: 'Community',
  YOUTH: 'Jugend',
  SPORT: 'Sport',
  FUNDRAISER: 'Spende',
  OTHER: 'Sonstige',
}

function toFrontendEvent(dto: BackendEvent): Event {
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description ?? undefined,
    address: dto.address,
    district: dto.district,
    lat: dto.latitude,
    lng: dto.longitude,
    startTime: dto.startTime,
    endTime: dto.endTime ?? undefined,
    category: CATEGORY_MAP[dto.category],
    organizer: dto.organizer ?? undefined,
    contactInfo: dto.contactInfo ?? undefined,
    isFree: dto.isFree,
    googleMapsUrl: dto.googleMapsUrl ?? undefined,
    distanceKm: dto.distanceKm != null ? roundKm(dto.distanceKm) : undefined,
  }
}

export async function getUpcomingEvents(userPos: GeoPosition = VIENNA_CENTER): Promise<readonly Event[]> {
  const params = new URLSearchParams({
    latitude: String(userPos.lat),
    longitude: String(userPos.lng),
    radiusKm: String(NEARBY_RADIUS_KM),
  })
  const res = await fetch(`${API_BASE}/events/nearby?${params}`)
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`)
  const data: BackendEvent[] = await res.json()
  const events = data.map(toFrontendEvent)
  const roadDists = await getRoadDistancesKm(userPos, events.map((e) => ({ lat: e.lat, lng: e.lng })))
  if (roadDists) {
    return events.map((e, i) => ({
      ...e,
      distanceKm: roadDists[i] > 0 ? roadDists[i] : e.distanceKm,
    }))
  }
  return events
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const res = await fetch(`${API_BASE}/events/${id}`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error(`Failed to fetch event: ${res.status}`)
  return toFrontendEvent(await res.json())
}

export async function submitEvent(
  data: Omit<BackendEvent, 'id' | 'status' | 'upvotes' | 'distanceKm'>,
): Promise<Event> {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to submit event: ${res.status}`)
  return toFrontendEvent(await res.json())
}
