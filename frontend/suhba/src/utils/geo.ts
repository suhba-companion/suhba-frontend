import type { GeoPosition } from './location'

/**
 * Distance math. One implementation, used by every service and every screen.
 *
 * `distanceKm` is carried at full precision through the app and only rounded
 * when it is rendered, so two spots 60 m apart still sort in the right order
 * instead of tying on a shared one-decimal value.
 */

// WGS84 ellipsoid, the datum GPS and Google Maps both report positions in.
const WGS84_A = 6378.137 // equatorial radius, km
const WGS84_F = 1 / 298.257223563 // flattening
const WGS84_E2 = WGS84_F * (2 - WGS84_F) // first eccentricity squared

const EARTH_RADIUS_KM = 6371 // spherical mean, used by haversineKm

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Great-circle distance on a sphere. Kept because it is the textbook formula
 * and the backend computes the same thing, so the two agree to the metre.
 */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Straight-line ground distance on the WGS84 ellipsoid.
 *
 * Uses the local radii of curvature at the midpoint latitude, which is accurate
 * to well under a metre for the city-scale distances this app shows, and
 * matches the geodesic distance Google Maps measures between two pins. A sphere
 * of radius 6371 km is ~0.05 % off at Vienna's latitude; this removes that.
 */
export function distanceBetweenKm(from: GeoPosition, to: GeoPosition): number {
  const midLat = toRad((from.lat + to.lat) / 2)
  const sinMid = Math.sin(midLat)
  const w = 1 - WGS84_E2 * sinMid * sinMid

  // Meridional (north-south) and prime-vertical (east-west) radii of curvature.
  const meridional = (WGS84_A * (1 - WGS84_E2)) / (w * Math.sqrt(w))
  const normal = WGS84_A / Math.sqrt(w)

  const north = meridional * toRad(to.lat - from.lat)
  const east = normal * Math.cos(midLat) * toRad(to.lng - from.lng)

  return Math.hypot(north, east)
}

/**
 * The one rule for turning a backend distance plus a position into the number
 * the app carries. The backend sets `distanceKm` on `/nearby` responses but not
 * on `/{id}` responses, so every caller needs the same fallback or detail
 * screens disagree with the card that linked to them.
 */
export function resolveDistanceKm(
  backendKm: number | null | undefined,
  userPos: GeoPosition,
  target: GeoPosition,
): number {
  return backendKm ?? distanceBetweenKm(userPos, target)
}

/** Legacy one-decimal rounding. Prefer `formatDistance` for anything rendered. */
export function roundKm(km: number): number {
  return parseFloat(km.toFixed(1))
}

/**
 * Renders a distance the way a maps app does: metres below a kilometre, one
 * decimal up to 10 km, whole kilometres above that. Previously every caller
 * inlined `~${km} km`, which printed "~0.4 km" where "400 m" reads better and
 * "~12.3 km" where the decimal is noise.
 */
export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return ''
  if (km < 1) {
    const metres = Math.round((km * 1000) / 10) * 10
    // 0.9996 km rounds to 1000 m; show it as the kilometre it is.
    return metres >= 1000 ? '1,0 km' : `${metres} m`
  }
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`
  return `${Math.round(km)} km`
}
