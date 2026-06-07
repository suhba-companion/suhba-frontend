const BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/v1`

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

async function post<T>(url: string, body?: unknown, userId?: string): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Id': userId ?? 'anonymous' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

async function patch<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'PATCH' })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

// ── Types ──────────────────────────────────────────────────────────────────

export type PrayerSpotType = 'MOSQUE' | 'MUSALLA' | 'PUBLIC' | 'OFFICE' | 'OTHER'
export type HalalCategory = 'RESTAURANT' | 'GROCERY' | 'BUTCHER' | 'CAFE' | 'BAKERY' | 'OTHER'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface PrayerSpot {
  id: number
  name: string
  description?: string
  address: string
  district: string
  latitude: number
  longitude: number
  type: PrayerSpotType
  wuduAvailable?: boolean
  sistanAvailable?: boolean
  fridayPrayer?: boolean
  status?: ApprovalStatus
  upvotes?: number
  distanceKm?: number
}

export interface HalalSpot {
  id: number
  name: string
  description?: string
  address: string
  district: string
  latitude: number
  longitude: number
  category: HalalCategory
  cuisines?: string[]
  phone?: string
  website?: string
  certified?: boolean
  certificationBody?: string
  featured?: boolean
  status?: ApprovalStatus
  upvotes?: number
  distanceKm?: number
}

// ── Prayer Spots ───────────────────────────────────────────────────────────

export const prayerSpotsApi = {
  getAll: () =>
    get<PrayerSpot[]>(`${BASE}/prayer-spots`),

  findNearby: (lat: number, lng: number, radiusKm = 5) =>
    get<PrayerSpot[]>(`${BASE}/prayer-spots/nearby?latitude=${lat}&longitude=${lng}&radiusKm=${radiusKm}`),

  getById: (id: number) =>
    get<PrayerSpot>(`${BASE}/prayer-spots/${id}`),

  getPending: () =>
    get<PrayerSpot[]>(`${BASE}/prayer-spots/pending`),

  submit: (spot: Omit<PrayerSpot, 'id' | 'status' | 'upvotes' | 'distanceKm'>, userId?: string) =>
    post<PrayerSpot>(`${BASE}/prayer-spots`, spot, userId),

  upvote: (id: number) =>
    post<PrayerSpot>(`${BASE}/prayer-spots/${id}/upvote`),

  approve: (id: number) =>
    patch<PrayerSpot>(`${BASE}/prayer-spots/${id}/approve`),

  reject: (id: number) =>
    patch<PrayerSpot>(`${BASE}/prayer-spots/${id}/reject`),
}

// ── Halal Spots ────────────────────────────────────────────────────────────

export const halalSpotsApi = {
  getAll: () =>
    get<HalalSpot[]>(`${BASE}/halal-spots`),

  findNearby: (lat: number, lng: number, radiusKm = 5, category?: HalalCategory) => {
    const params = new URLSearchParams({ latitude: String(lat), longitude: String(lng), radiusKm: String(radiusKm) })
    if (category) params.set('category', category)
    return get<HalalSpot[]>(`${BASE}/halal-spots/nearby?${params}`)
  },

  getFeatured: () =>
    get<HalalSpot[]>(`${BASE}/halal-spots/featured`),

  getById: (id: number) =>
    get<HalalSpot>(`${BASE}/halal-spots/${id}`),

  getPending: () =>
    get<HalalSpot[]>(`${BASE}/halal-spots/pending`),

  submit: (spot: Omit<HalalSpot, 'id' | 'featured' | 'status' | 'upvotes' | 'distanceKm'>, userId?: string) =>
    post<HalalSpot>(`${BASE}/halal-spots`, spot, userId),

  upvote: (id: number) =>
    post<HalalSpot>(`${BASE}/halal-spots/${id}/upvote`),

  approve: (id: number) =>
    patch<HalalSpot>(`${BASE}/halal-spots/${id}/approve`),

  reject: (id: number) =>
    patch<HalalSpot>(`${BASE}/halal-spots/${id}/reject`),
}
