// Admin auth uses session + CSRF cookies. To avoid cross-site cookies (which
// Safari/iOS blocks), admin calls go to the SAME origin as the frontend and are
// reverse-proxied to the backend — by the Cloudflare Pages Function in production
// (functions/api/[[path]].ts) and by the Vite dev-server proxy locally. So this is
// a relative path, never the cross-origin VITE_API_BASE_URL the public services use.
const BASE = '/api/admin'

function csrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = (options?.method ?? 'GET').toUpperCase()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }
  if (method !== 'GET' && method !== 'HEAD') {
    headers['X-XSRF-TOKEN'] = csrfToken()
  }
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.error ?? `HTTP ${res.status}`), { status: res.status })
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export interface AdminUser {
  username: string
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface PendingSpot {
  id: number
  name: string
  description: string | null
  address: string
  district: string
  latitude: number
  longitude: number
  type: string
  wuduAvailable: boolean | null
  sistanAvailable: boolean | null
  fridayPrayer: boolean | null
  jumaTime: string | null
  openingHours: string | null
  parking: boolean | null
  status: ApprovalStatus
}

export interface PendingHalal {
  id: number
  name: string
  description: string | null
  address: string
  district: string
  latitude: number
  longitude: number
  category: string
  cuisines: string[] | null
  phone: string | null
  website: string | null
  certified: boolean | null
  certificationBody: string | null
  openingHours: string | null
  rating: number | null
  featured: boolean
  status: ApprovalStatus
}

export interface PendingEvent {
  id: number
  title: string
  description: string | null
  address: string
  district: string
  startTime: string
  endTime: string | null
  category: string
  organizer: string | null
  contactInfo: string | null
  isFree: boolean | null
  status: ApprovalStatus
}

export const adminService = {
  login(username: string, password: string): Promise<AdminUser> {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  logout(): Promise<void> {
    return request('/logout', { method: 'POST' })
  },

  me(): Promise<AdminUser> {
    return request('/me')
  },

  pendingPrayerSpots(): Promise<PendingSpot[]> {
    return request('/prayer-spots/pending')
  },
  allPrayerSpots(): Promise<PendingSpot[]> {
    return request('/prayer-spots')
  },
  approvePrayerSpot(id: number): Promise<PendingSpot> {
    return request(`/prayer-spots/${id}/approve`, { method: 'PATCH' })
  },
  rejectPrayerSpot(id: number): Promise<PendingSpot> {
    return request(`/prayer-spots/${id}/reject`, { method: 'PATCH' })
  },
  updatePrayerSpot(id: number, data: Partial<PendingSpot>): Promise<PendingSpot> {
    return request(`/prayer-spots/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deletePrayerSpot(id: number): Promise<void> {
    return request(`/prayer-spots/${id}`, { method: 'DELETE' })
  },

  pendingHalalSpots(): Promise<PendingHalal[]> {
    return request('/halal-spots/pending')
  },
  allHalalSpots(): Promise<PendingHalal[]> {
    return request('/halal-spots')
  },
  approveHalalSpot(id: number): Promise<PendingHalal> {
    return request(`/halal-spots/${id}/approve`, { method: 'PATCH' })
  },
  rejectHalalSpot(id: number): Promise<PendingHalal> {
    return request(`/halal-spots/${id}/reject`, { method: 'PATCH' })
  },
  updateHalalSpot(id: number, data: Partial<PendingHalal>): Promise<PendingHalal> {
    return request(`/halal-spots/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteHalalSpot(id: number): Promise<void> {
    return request(`/halal-spots/${id}`, { method: 'DELETE' })
  },

  pendingEvents(): Promise<PendingEvent[]> {
    return request('/events/pending')
  },
  allEvents(): Promise<PendingEvent[]> {
    return request('/events')
  },
  approveEvent(id: number): Promise<PendingEvent> {
    return request(`/events/${id}/approve`, { method: 'PATCH' })
  },
  rejectEvent(id: number): Promise<PendingEvent> {
    return request(`/events/${id}/reject`, { method: 'PATCH' })
  },
  updateEvent(id: number, data: Partial<PendingEvent>): Promise<PendingEvent> {
    return request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteEvent(id: number): Promise<void> {
    return request(`/events/${id}`, { method: 'DELETE' })
  },
}
