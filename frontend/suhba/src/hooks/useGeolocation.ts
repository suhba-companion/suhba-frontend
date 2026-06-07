import { useState, useEffect } from 'react'

export interface GeoPosition {
  lat: number
  lng: number
}

export type GeoStatus = 'pending' | 'ready' | 'denied' | 'unavailable'

export interface GeoState {
  pos: GeoPosition
  status: GeoStatus
}

const VIENNA_CENTER: GeoPosition = { lat: 48.2082, lng: 16.3738 }

export function useGeolocation(): GeoPosition {
  const { pos } = useGeolocationState()
  return pos
}

export function useGeolocationState(): GeoState {
  const [state, setState] = useState<GeoState>({ pos: VIENNA_CENTER, status: 'pending' })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, status: 'unavailable' }))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setState({ pos: { lat: p.coords.latitude, lng: p.coords.longitude }, status: 'ready' }),
      () => setState((s) => ({ ...s, status: 'denied' })),
      { timeout: 8000, maximumAge: 60_000 },
    )
  }, [])

  return state
}
