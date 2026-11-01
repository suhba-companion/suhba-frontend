import { useSyncExternalStore } from 'react'
import { VIENNA_CENTER, type GeoPosition } from '@utils/location'

export type { GeoPosition }

export type GeoStatus = 'pending' | 'ready' | 'denied' | 'unavailable'

export interface GeoState {
  pos: GeoPosition
  /** `pending` means we do not yet know; never render a distance off it. */
  status: GeoStatus
  /** Re-asks the browser for a fix, e.g. after the user grants permission late. */
  refresh: () => void
}

/**
 * One geolocation session for the whole app.
 *
 * Each component used to hold its own `useState` and fire its own
 * `getCurrentPosition`, so the Spots page ran two independent lookups (one for
 * the banner, one for the list) whose answers could disagree. This is a module
 * level store instead: the first subscriber starts the lookup, every later one
 * reads the same snapshot.
 */

const GEO_OPTIONS: PositionOptions = { timeout: 8000, maximumAge: 60_000 }

interface InternalState {
  pos: GeoPosition
  status: GeoStatus
}

let state: InternalState = { pos: VIENNA_CENTER, status: 'pending' }
let requestStarted = false
const listeners = new Set<() => void>()
/** Rebuilt on every change so `useSyncExternalStore` sees a new reference. */
let snapshot: GeoState = { ...state, refresh }

function publish(next: InternalState): void {
  state = next
  snapshot = { ...next, refresh }
  listeners.forEach((listener) => listener())
}

function request(): void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    publish({ pos: VIENNA_CENTER, status: 'unavailable' })
    return
  }
  navigator.geolocation.getCurrentPosition(
    (p) => publish({ pos: { lat: p.coords.latitude, lng: p.coords.longitude }, status: 'ready' }),
    () => publish({ pos: VIENNA_CENTER, status: 'denied' }),
    GEO_OPTIONS,
  )
}

function refresh(): void {
  publish({ pos: state.pos, status: 'pending' })
  request()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (!requestStarted) {
    requestStarted = true
    request()
  }
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): GeoState {
  return snapshot
}

export function useGeolocationState(): GeoState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useGeolocation(): GeoPosition {
  return useGeolocationState().pos
}

/** True once we know whether we have a real fix, however that turned out. */
export function isGeoResolved(status: GeoStatus): boolean {
  return status !== 'pending'
}

/** Only the position lookup succeeded; `denied`/`unavailable` mean Vienna centre. */
export function isGeoReal(status: GeoStatus): boolean {
  return status === 'ready'
}

/** Test seam: the store outlives a single `renderHook`, so suites must clear it. */
export function resetGeolocationForTests(): void {
  requestStarted = false
  listeners.clear()
  publish({ pos: VIENNA_CENTER, status: 'pending' })
}
