import { useEffect, useState } from 'react'
import * as Location from 'expo-location'
import { VIENNA_CENTER } from '../theme/tokens'

export interface GeoPosition {
  lat: number
  lng: number
}

export type GeoStatus = 'pending' | 'ready' | 'denied' | 'unavailable'

export interface GeoState {
  pos: GeoPosition
  status: GeoStatus
}

/** The web passed `{ timeout: 8000, maximumAge: 60_000 }`; expo-location has neither. */
const MAX_AGE_MS = 60_000
const TIMEOUT_MS = 8_000

// One fix is shared by every hook instance. Without this, opening Orte starts two
// independent fixes — one for the banner, one for the `radiusKm` query — which can
// settle on different coordinates, and every tab switch re-fixes from scratch instead
// of reusing a reading that is seconds old.
let pending: Promise<GeoState> | null = null
let cached: { state: GeoState; at: number } | null = null

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

async function resolvePosition(): Promise<GeoState> {
  // The permission dialog has to be awaited to the end. Asking and then reading a
  // position while the system sheet is still open answers "denied" on the user's
  // behalf, which is how the iOS port showed "Standort nicht verfügbar" before anyone
  // had tapped anything.
  let granted = false
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    granted = status === Location.PermissionStatus.GRANTED
  } catch {
    // A throwing permission call used to reject out of this function unhandled, which
    // left `status` on 'pending' forever and the banner mid-spin.
    return { pos: VIENNA_CENTER, status: 'unavailable' }
  }
  if (!granted) {
    return { pos: VIENNA_CENTER, status: 'denied' }
  }
  try {
    const last = await Location.getLastKnownPositionAsync({ maxAge: MAX_AGE_MS })
    if (last !== null) {
      return { pos: { lat: last.coords.latitude, lng: last.coords.longitude }, status: 'ready' }
    }
    const p = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      TIMEOUT_MS,
    )
    return { pos: { lat: p.coords.latitude, lng: p.coords.longitude }, status: 'ready' }
  } catch {
    return { pos: VIENNA_CENTER, status: 'unavailable' }
  }
}

function getPosition(): Promise<GeoState> {
  if (cached !== null && Date.now() - cached.at < MAX_AGE_MS) return Promise.resolve(cached.state)
  if (pending !== null) return pending
  pending = resolvePosition()
    .then((state) => {
      // Only a real fix is worth caching; a denial should be re-askable later.
      if (state.status === 'ready') cached = { state, at: Date.now() }
      return state
    })
    .finally(() => {
      pending = null
    })
  return pending
}

export function useGeolocation(): GeoPosition {
  const { pos } = useGeolocationState()
  return pos
}

export function useGeolocationState(): GeoState {
  const [state, setState] = useState<GeoState>(
    () => cached?.state ?? { pos: VIENNA_CENTER, status: 'pending' },
  )

  useEffect(() => {
    let cancelled = false
    void getPosition().catch(() => ({
      pos: VIENNA_CENTER, status: 'unavailable' as GeoStatus,
    })).then((next) => {
      if (!cancelled) setState(next)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
