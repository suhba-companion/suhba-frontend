import type { Event, EventAudience, EventCategory, EventRecurrence, PrayerName } from '../types'
import { resolveDistanceKm } from '../utils/geo'
import { VIENNA_CENTER, nearbyParams, type GeoPosition } from '../utils/location'
import { toSafeHttpUrl } from '../utils/url'

const API_BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/v1`

type BackendPrayer = 'FAJR' | 'DHUHR' | 'ASR' | 'MAGHRIB' | 'ISHA'

type BackendAudience = 'SISTERS_ONLY' | 'BROTHERS_ONLY'

type BackendRecurrence = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'

type BackendCategory =
  | 'PRAYER' | 'LECTURE' | 'CLASS' | 'WORKSHOP' | 'COMMUNITY' | 'YOUTH' | 'SPORT' | 'FUNDRAISER'
  | 'NEW_MUSLIMS' | 'OTHER'

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
  startPrayer: BackendPrayer | null
  recurrence: BackendRecurrence | null
  recurrenceUntil: string | null
  categories: BackendCategory[]
  organizer: string | null
  contactInfo: string | null
  isFree: boolean
  registrationUrl: string | null
  requiresRegistration: boolean
  audience: BackendAudience | null
  status: string
  upvotes: number
  distanceKm: number | null
}

const CATEGORY_MAP: Record<BackendCategory, EventCategory> = {
  PRAYER: 'Gebet',
  LECTURE: 'Vortrag',
  CLASS: 'Kurs',
  WORKSHOP: 'Workshop',
  COMMUNITY: 'Community',
  YOUTH: 'Jugend',
  SPORT: 'Sport',
  FUNDRAISER: 'Spende',
  NEW_MUSLIMS: 'Neue Muslime',
  OTHER: 'Sonstige',
}

const AUDIENCE_MAP: Record<BackendAudience, EventAudience> = {
  SISTERS_ONLY:  'Nur Schwestern',
  BROTHERS_ONLY: 'Nur Brüder',
}

const RECURRENCE_MAP: Record<BackendRecurrence, EventRecurrence> = {
  WEEKLY:   'Wöchentlich',
  BIWEEKLY: 'Zweiwöchentlich',
  MONTHLY:  'Monatlich',
}

const PRAYER_MAP: Record<BackendPrayer, PrayerName> = {
  FAJR: 'Fajr',
  DHUHR: 'Dhuhr',
  ASR: 'Asr',
  MAGHRIB: 'Maghrib',
  ISHA: 'Isha',
}

function toFrontendEvent(dto: BackendEvent, userPos: GeoPosition): Event {
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
    startPrayer: dto.startPrayer != null ? PRAYER_MAP[dto.startPrayer] : undefined,
    recurrence: dto.recurrence != null ? RECURRENCE_MAP[dto.recurrence] : undefined,
    recurrenceUntil: dto.recurrenceUntil ?? undefined,
    categories: dto.categories.map((c) => CATEGORY_MAP[c]),
    organizer: dto.organizer ?? undefined,
    contactInfo: dto.contactInfo ?? undefined,
    isFree: dto.isFree,
    registrationUrl: toSafeHttpUrl(dto.registrationUrl ?? undefined),
    requiresRegistration: dto.requiresRegistration,
    audience: dto.audience != null ? AUDIENCE_MAP[dto.audience] : undefined,
    // Matches spots and halal: `/events/{id}` omits distanceKm, so fall back to
    // measuring it here instead of silently dropping the distance.
    distanceKm: resolveDistanceKm(dto.distanceKm, userPos, {
      lat: dto.latitude,
      lng: dto.longitude,
    }),
  }
}

export async function getUpcomingEvents(userPos: GeoPosition = VIENNA_CENTER): Promise<readonly Event[]> {
  const res = await fetch(`${API_BASE}/events/nearby?${nearbyParams(userPos)}`)
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`)
  const data: BackendEvent[] = await res.json()
  return data.map((dto) => toFrontendEvent(dto, userPos))
}

export async function getEventById(
  id: string,
  userPos: GeoPosition = VIENNA_CENTER,
): Promise<Event | undefined> {
  const res = await fetch(`${API_BASE}/events/${id}`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error(`Failed to fetch event: ${res.status}`)
  return toFrontendEvent(await res.json(), userPos)
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
  return toFrontendEvent(await res.json(), VIENNA_CENTER)
}
