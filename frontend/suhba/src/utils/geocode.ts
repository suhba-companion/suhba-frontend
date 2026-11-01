import { VIENNA_CENTER, type GeoPosition } from './location'

/**
 * Turns a submitted street address into coordinates via Nominatim.
 *
 * This lived twice, byte-identical, in useSubmitSpot and useSubmitBusiness,
 * while useSubmitEvent had no geocoding at all and posted Vienna's centre for
 * every event. That made `distanceKm` and the radius filter meaningless for
 * user-submitted events, since they all sat on Stephansplatz.
 *
 * Falls back to Vienna centre so a geocoder outage never blocks a submission;
 * an admin can correct the pin during approval.
 */
export async function geocodeAddress(address: string, district: string): Promise<GeoPosition> {
  try {
    const q = encodeURIComponent(`${address}, ${district}, Wien, Österreich`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=at`,
      { headers: { 'Accept-Language': 'de', 'User-Agent': 'Suhba-App/1.0' } },
    )
    if (!res.ok) return VIENNA_CENTER
    const json: unknown = await res.json()
    if (Array.isArray(json) && json.length > 0) {
      const first = json[0] as Record<string, unknown>
      const lat = parseFloat(String(first['lat']))
      const lng = parseFloat(String(first['lon']))
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }
  } catch {
    /* fall through to the Vienna default */
  }
  return VIENNA_CENTER
}
