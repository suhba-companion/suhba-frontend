import type { PrayerSpot, SpotReview, SpotType } from '../types'
import { haversineKm, roundKm } from '../utils/geo'
import { getRoadDistancesKm } from './routingService'

import type { GeoPosition } from '../hooks/useGeolocation'

const API_BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/v1`
const VIENNA_CENTER: GeoPosition = { lat: 48.2082, lng: 16.3738 }

type BackendPrayerSpot = {
  id: number
  name: string
  address: string
  district: string
  latitude: number
  longitude: number
  type: 'MOSQUE' | 'MUSALLA' | 'PUBLIC' | 'OFFICE' | 'OTHER'
  wuduAvailable: boolean | null
  sistanAvailable: boolean | null
  fridayPrayer: boolean | null
  jumaTime: string | null
  jumaTimeSummer: string | null
  jumaTimeWinter: string | null
  parking: boolean | null
  hijabAvailable: boolean | null
  prayerClothesAvailable: boolean | null
  openingHours: string | null
  language: string | null
  googleMapsUrl: string | null
  verified: boolean | null
  distanceKm?: number | null
}

function toSpotType(type: BackendPrayerSpot['type']): SpotType {
  if (type === 'MOSQUE') return 'Moschee'
  if (type === 'MUSALLA' || type === 'PUBLIC' || type === 'OFFICE') return 'Gebetsort'
  return 'Sonstige'
}

function toFrontendSpot(dto: BackendPrayerSpot, userPos: GeoPosition): PrayerSpot {
  const distanceKm = roundKm(
    dto.distanceKm != null
      ? dto.distanceKm
      : haversineKm(userPos.lat, userPos.lng, dto.latitude, dto.longitude),
  )
  return {
    id: String(dto.id),
    name: dto.name,
    type: toSpotType(dto.type),
    address: dto.address,
    district: dto.district,
    lat: dto.latitude,
    lng: dto.longitude,
    open: true,
    jumaTime: dto.jumaTime ?? null,
    jumaTimeSummer: dto.jumaTimeSummer ?? undefined,
    jumaTimeWinter: dto.jumaTimeWinter ?? undefined,
    wudu: dto.wuduAvailable ?? false,
    sisters: dto.sistanAvailable ?? false,
    parking: dto.parking ?? false,
    hijab: dto.hijabAvailable ?? false,
    prayerClothes: dto.prayerClothesAvailable ?? false,
    openingHours: dto.openingHours ?? undefined,
    language: dto.language ?? undefined,
    googleMapsUrl: dto.googleMapsUrl ?? undefined,
    verified: dto.verified ?? undefined,
    distanceKm,
  }
}

const NEARBY_RADIUS_KM = 15

export async function getSpots(userPos: GeoPosition = VIENNA_CENTER): Promise<readonly PrayerSpot[]> {
  const params = new URLSearchParams({
    latitude: String(userPos.lat),
    longitude: String(userPos.lng),
    radiusKm: String(NEARBY_RADIUS_KM),
  })
  const res = await fetch(`${API_BASE}/prayer-spots/nearby?${params}`)
  if (!res.ok) throw new Error(`Failed to fetch prayer spots: ${res.status}`)
  const data: BackendPrayerSpot[] = await res.json()
  const spots = data.map((dto) => toFrontendSpot(dto, userPos))
  const roadDists = await getRoadDistancesKm(userPos, spots.map((s) => ({ lat: s.lat, lng: s.lng })))
  if (roadDists) {
    return spots.map((s, i) => ({
      ...s,
      distanceKm: roadDists[i] > 0 ? roadDists[i] : s.distanceKm,
    }))
  }
  return spots
}

export async function getSpotById(id: string, userPos: GeoPosition = VIENNA_CENTER): Promise<PrayerSpot | undefined> {
  const res = await fetch(`${API_BASE}/prayer-spots/${id}`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error(`Failed to fetch prayer spot: ${res.status}`)
  return toFrontendSpot(await res.json(), userPos)
}

export function getReviewsBySpotId(_spotId: string): SpotReview[] {
  return []
}
