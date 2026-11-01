import type { PrayerSpot, SpotType } from '../types'
import { resolveDistanceKm } from '../utils/geo'
import { VIENNA_CENTER, nearbyParams, type GeoPosition } from '../utils/location'

const API_BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/v1`

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
  verified: boolean | null
  distanceKm?: number | null
}

function toSpotType(type: BackendPrayerSpot['type']): SpotType {
  if (type === 'MOSQUE') return 'Moschee'
  if (type === 'MUSALLA' || type === 'PUBLIC' || type === 'OFFICE') return 'Gebetsort'
  return 'Sonstige'
}

function toFrontendSpot(dto: BackendPrayerSpot, userPos: GeoPosition): PrayerSpot {
  // `/nearby` sets distanceKm, `/{id}` does not; resolveDistanceKm covers both.
  const distanceKm = resolveDistanceKm(dto.distanceKm, userPos, {
    lat: dto.latitude,
    lng: dto.longitude,
  })
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
    verified: dto.verified ?? undefined,
    distanceKm,
  }
}

export async function getSpots(userPos: GeoPosition = VIENNA_CENTER): Promise<readonly PrayerSpot[]> {
  const res = await fetch(`${API_BASE}/prayer-spots/nearby?${nearbyParams(userPos)}`)
  if (!res.ok) throw new Error(`Failed to fetch prayer spots: ${res.status}`)
  const data: BackendPrayerSpot[] = await res.json()
  return data.map((dto) => toFrontendSpot(dto, userPos))
}

export async function getSpotById(id: string, userPos: GeoPosition = VIENNA_CENTER): Promise<PrayerSpot | undefined> {
  const res = await fetch(`${API_BASE}/prayer-spots/${id}`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error(`Failed to fetch prayer spot: ${res.status}`)
  return toFrontendSpot(await res.json(), userPos)
}