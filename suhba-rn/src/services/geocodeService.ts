import * as Location from 'expo-location'

export interface GeoPoint {
  lat: number
  lng: number
}

const GEOCODE_TIMEOUT_MS = 8000

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('geocode timeout')), ms)),
  ])
}

/**
 * Turns a Vienna street address into coordinates, or `null` when it cannot.
 *
 * This used to call `nominatim.openstreetmap.org` directly, which the OSMF usage policy
 * forbids for a distributed app. The platform geocoder — CLGeocoder on iOS, Android's
 * `Geocoder` — costs nothing, needs no key, and one lookup per submitted spot is well
 * inside what it is for.
 *
 * It also used to answer with the centre of Vienna on every failure, which the caller
 * could not tell from a real hit: a mistyped street was accepted, the user was shown a
 * success screen, and the pin landed at Stephansplatz. `null` makes the caller say so.
 */
export async function geocodeAddress(address: string, district: string): Promise<GeoPoint | null> {
  try {
    const results = await withTimeout(
      Location.geocodeAsync(`${address}, ${district}, Wien, Österreich`),
      GEOCODE_TIMEOUT_MS,
    )
    const first = results[0]
    if (first === undefined) return null
    return { lat: first.latitude, lng: first.longitude }
  } catch (e: unknown) {
    if (__DEV__) console.warn('[geocode] lookup failed', e)
    return null
  }
}
