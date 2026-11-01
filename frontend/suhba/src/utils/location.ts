/**
 * Single source of truth for "where things are" in the web app.
 *
 * Before this module the Vienna fallback was copy-pasted into eight files in
 * three different shapes, and the nearby radius into four. Anything that needs
 * a coordinate, a fallback, or a search radius imports it from here.
 */

export interface GeoPosition {
  lat: number
  lng: number
}

/** Stephansplatz. The fallback whenever the real position is unknown. */
export const VIENNA_CENTER: GeoPosition = { lat: 48.2082, lng: 16.3738 }

/** Leaflet wants `[lat, lng]` tuples rather than objects. */
export const VIENNA_CENTER_TUPLE: readonly [number, number] = [VIENNA_CENTER.lat, VIENNA_CENTER.lng]

/**
 * Radius for every `/nearby` query. 15 km from any point in Vienna covers the
 * whole city plus the near suburbs, so no list is ever cut short by the radius.
 */
export const NEARBY_RADIUS_KM = 15

/** Query params shared by `/prayer-spots/nearby`, `/halal-spots/nearby` and `/events/nearby`. */
export function nearbyParams(userPos: GeoPosition): URLSearchParams {
  return new URLSearchParams({
    latitude: String(userPos.lat),
    longitude: String(userPos.lng),
    radiusKm: String(NEARBY_RADIUS_KM),
  })
}
