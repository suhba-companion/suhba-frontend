const DIRECTIONS_BASE = 'https://maps.google.com/maps'
const TRAVEL_MODE = 'transit'

export interface DirectionsTarget {
  address: string
  district?: string
  lat?: number
  lng?: number
}

/**
 * Postal address first: event coordinates are only as precise as whoever submitted
 * them, while the address is a required field and Google resolves it reliably.
 */
function destinationFor({ address, district, lat, lng }: DirectionsTarget): string {
  const street = address.trim()
  if (street) {
    const area = district?.trim()
    return area && !street.includes(area) ? `${street}, ${area}` : street
  }
  if (lat !== undefined && lng !== undefined) return `${lat},${lng}`
  return ''
}

/** Google Maps *directions* link — a plain place link (maps.app.goo.gl/…) shows no route. */
export function buildDirectionsUrl(target: DirectionsTarget): string {
  const daddr = encodeURIComponent(destinationFor(target))
  return `${DIRECTIONS_BASE}?daddr=${daddr}&travelmode=${TRAVEL_MODE}`
}
