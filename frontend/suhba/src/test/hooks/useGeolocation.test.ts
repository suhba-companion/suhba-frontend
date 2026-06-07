import { renderHook, waitFor } from '@testing-library/react'
import { useGeolocation } from '@hooks/useGeolocation'

const VIENNA = { lat: 48.2082, lng: 16.3738 }

describe('useGeolocation', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
      writable: true,
    })
  })

  it('defaults to Vienna center on initial render', () => {
    const { result } = renderHook(() => useGeolocation())
    expect(result.current).toEqual(VIENNA)
  })

  it('stays at Vienna when geolocation API is unavailable', () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    })
    const { result } = renderHook(() => useGeolocation())
    expect(result.current).toEqual(VIENNA)
  })

  it('updates to real position when getCurrentPosition succeeds', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((success: (p: GeolocationPosition) => void) =>
          success({
            coords: { latitude: 48.3, longitude: 16.4, accuracy: 10 } as GeolocationCoordinates,
            timestamp: Date.now(),
            toJSON: () => ({}),
          } as GeolocationPosition),
        ),
      },
      configurable: true,
    })
    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => {
      expect(result.current.lat).toBe(48.3)
      expect(result.current.lng).toBe(16.4)
    })
  })

  it('stays at Vienna when getCurrentPosition fails', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((_success: unknown, error: () => void) => error()),
      },
      configurable: true,
    })
    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => {
      expect(result.current).toEqual(VIENNA)
    })
  })

  it('returns an object with lat and lng', () => {
    const { result } = renderHook(() => useGeolocation())
    expect(result.current).toHaveProperty('lat')
    expect(result.current).toHaveProperty('lng')
  })
})
