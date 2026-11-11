const DIRECTIONS_BASE = 'https://maps.google.com/maps'
const TRAVEL_MODE = 'transit'
const CITY = 'Wien'
const COUNTRY = 'Österreich'

export interface DirectionsTarget {
  address?: string
  district?: string
  lat?: number
  lng?: number
}

/**
 * Address first: submitted coordinates default to Vienna's centre, so they point nowhere.
 * City and country must always be appended: "6-7 Coffee, 1050" alone geocodes to Kenya.
 */
function destinationFor({ address, district, lat, lng }: DirectionsTarget): string {
  const street = address?.trim() ?? ''
  if (!street) {
    return lat !== undefined && lng !== undefined ? `${lat},${lng}` : ''
  }
  const parts = [street]
  const area = district?.trim()
  if (area && !street.includes(area)) parts.push(area)
  if (!parts.join(', ').toLowerCase().includes(CITY.toLowerCase())) parts.push(CITY)
  parts.push(COUNTRY)
  return parts.join(', ')
}

/** Google Maps *directions* link — a plain place link (maps.app.goo.gl/…) shows no route. */
export function buildDirectionsUrl(target: DirectionsTarget): string {
  const daddr = encodeURIComponent(destinationFor(target))
  return `${DIRECTIONS_BASE}?daddr=${daddr}&travelmode=${TRAVEL_MODE}`
}
