import type { HalalBusiness, BusinessType, CertStatus } from '../types'
import { haversineKm, roundKm } from '../utils/geo'
import { getRoadDistancesKm } from './routingService'
import type { GeoPosition } from '../hooks/useGeolocation'

const API_BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/v1`
const VIENNA_CENTER: GeoPosition = { lat: 48.2082, lng: 16.3738 }

type BackendHalalSpot = {
  id: number
  name: string
  address: string
  district: string
  latitude: number
  longitude: number
  category: 'RESTAURANT' | 'GROCERY' | 'BUTCHER' | 'CAFE' | 'BAKERY' | 'OTHER'
  certified: boolean | null
  certificationBody: string | null
  featured: boolean
  parking: boolean | null
  openingHours: string | null
  rating: number | null
  phone: string | null
  website: string | null
  distanceKm?: number | null
}

function toBusinessType(category: BackendHalalSpot['category']): BusinessType {
  if (category === 'RESTAURANT') return 'Restaurant'
  if (category === 'GROCERY') return 'Lebensmittel'
  if (category === 'CAFE') return 'Café'
  if (category === 'BUTCHER') return 'Metzgerei'
  return 'Sonstige'
}

function toCertStatus(certified: boolean | null, body: string | null): CertStatus {
  if (certified && body === 'HMA') return 'HMA-Zertifiziert'
  if (body === 'Muslim-Owned') return 'Muslim-Owned'
  return 'Selbst-zertifiziert'
}

function toFrontendBusiness(dto: BackendHalalSpot, userPos: GeoPosition): HalalBusiness {
  const distanceKm = roundKm(
    dto.distanceKm != null
      ? dto.distanceKm
      : haversineKm(userPos.lat, userPos.lng, dto.latitude, dto.longitude),
  )
  return {
    id: String(dto.id),
    name: dto.name,
    type: toBusinessType(dto.category),
    address: dto.address,
    district: dto.district,
    lat: dto.latitude,
    lng: dto.longitude,
    phone: dto.phone ?? undefined,
    website: dto.website ?? undefined,
    openingHours: dto.openingHours ?? undefined,
    certStatus: toCertStatus(dto.certified, dto.certificationBody),
    rating: dto.rating ?? undefined,
    featured: dto.featured,
    parking: dto.parking ?? false,
    distanceKm,
  }
}

export async function getHalalBusinessById(id: string, userPos: GeoPosition = VIENNA_CENTER): Promise<HalalBusiness | undefined> {
  const res = await fetch(`${API_BASE}/halal-spots/${id}`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error(`Failed to fetch halal spot: ${res.status}`)
  return toFrontendBusiness(await res.json(), userPos)
}

const NEARBY_RADIUS_KM = 15

export async function getHalalBusinesses(userPos: GeoPosition = VIENNA_CENTER): Promise<readonly HalalBusiness[]> {
  const params = new URLSearchParams({
    latitude: String(userPos.lat),
    longitude: String(userPos.lng),
    radiusKm: String(NEARBY_RADIUS_KM),
  })
  const res = await fetch(`${API_BASE}/halal-spots/nearby?${params}`)
  if (!res.ok) throw new Error(`Failed to fetch halal spots: ${res.status}`)
  const data: BackendHalalSpot[] = await res.json()
  const businesses = data.map((dto) => toFrontendBusiness(dto, userPos))
  const roadDists = await getRoadDistancesKm(userPos, businesses.map((b) => ({ lat: b.lat, lng: b.lng })))
  if (roadDists) {
    return businesses.map((b, i) => ({
      ...b,
      distanceKm: roadDists[i] > 0 ? roadDists[i] : b.distanceKm,
    }))
  }
  return businesses
}
