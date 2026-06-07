interface Coordinate {
  lat: number
  lng: number
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

interface DistanceMatrixResponse {
  status: string
  rows: Array<{
    elements: Array<{
      status: string
      distance: { value: number }
    }>
  }>
}

export async function getRoadDistancesKm(
  origin: Coordinate,
  destinations: Coordinate[],
): Promise<number[] | null> {
  if (!GOOGLE_API_KEY || destinations.length === 0) return null

  const originStr = `${origin.lat},${origin.lng}`
  const destStr = destinations.map((d) => `${d.lat},${d.lng}`).join('|')

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destStr}&mode=walking&key=${GOOGLE_API_KEY}`
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null

    const json: DistanceMatrixResponse = await res.json()
    if (json.status !== 'OK' || !json.rows[0]) return null

    return json.rows[0].elements.map((el) =>
      el.status === 'OK' ? parseFloat((el.distance.value / 1000).toFixed(1)) : 0,
    )
  } catch {
    return null
  }
}
