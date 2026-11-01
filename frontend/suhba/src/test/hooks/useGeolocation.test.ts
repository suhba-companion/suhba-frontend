import { renderHook, waitFor, act } from '@testing-library/react'
import {
  useGeolocation,
  useGeolocationState,
  resetGeolocationForTests,
} from '@hooks/useGeolocation'

const VIENNA = { lat: 48.2082, lng: 16.3738 }

function mockGeolocation(impl: Geolocation['getCurrentPosition']): void {
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition: vi.fn(impl) },
    configurable: true,
    writable: true,
  })
}

function succeedsAt(lat: number, lng: number): Geolocation['getCurrentPosition'] {
  return ((success: PositionCallback) =>
    success({
      coords: { latitude: lat, longitude: lng, accuracy: 10 } as GeolocationCoordinates,
      timestamp: Date.now(),
      toJSON: () => ({}),
    } as GeolocationPosition)) as Geolocation['getCurrentPosition']
}

describe('useGeolocation', () => {
  beforeEach(() => {
    // The store is module level and deliberately outlives a single render.
    resetGeolocationForTests()
  })

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

  it('reports unavailable when the geolocation API is missing', () => {
    const { result } = renderHook(() => useGeolocationState())
    expect(result.current.pos).toEqual(VIENNA)
    expect(result.current.status).toBe('unavailable')
  })

  it('updates to real position when getCurrentPosition succeeds', async () => {
    mockGeolocation(succeedsAt(48.3, 16.4))
    const { result } = renderHook(() => useGeolocationState())
    await waitFor(() => {
      expect(result.current.pos).toEqual({ lat: 48.3, lng: 16.4 })
      expect(result.current.status).toBe('ready')
    })
  })

  it('falls back to Vienna and reports denied when the lookup fails', async () => {
    mockGeolocation(((_success: PositionCallback, error: PositionErrorCallback) =>
      error({} as GeolocationPositionError)) as Geolocation['getCurrentPosition'])
    const { result } = renderHook(() => useGeolocationState())
    await waitFor(() => {
      expect(result.current.pos).toEqual(VIENNA)
      expect(result.current.status).toBe('denied')
    })
  })

  it('asks the browser only once no matter how many components subscribe', async () => {
    mockGeolocation(succeedsAt(48.25, 16.42))
    const a = renderHook(() => useGeolocationState())
    const b = renderHook(() => useGeolocationState())
    const c = renderHook(() => useGeolocation())

    await waitFor(() => expect(a.result.current.status).toBe('ready'))

    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
    // Every subscriber sees the same answer, which is the point of the store.
    expect(b.result.current.pos).toEqual({ lat: 48.25, lng: 16.42 })
    expect(c.result.current).toEqual({ lat: 48.25, lng: 16.42 })
  })

  it('hands every subscriber the identical position object', async () => {
    mockGeolocation(succeedsAt(48.25, 16.42))
    const a = renderHook(() => useGeolocationState())
    const b = renderHook(() => useGeolocationState())
    await waitFor(() => expect(a.result.current.status).toBe('ready'))
    // Reference equality is what lets effects depend on `userPos` directly.
    expect(a.result.current.pos).toBe(b.result.current.pos)
  })

  it('re-asks the browser on refresh, e.g. after a late permission grant', async () => {
    mockGeolocation(((_success: PositionCallback, error: PositionErrorCallback) =>
      error({} as GeolocationPositionError)) as Geolocation['getCurrentPosition'])
    const { result } = renderHook(() => useGeolocationState())
    await waitFor(() => expect(result.current.status).toBe('denied'))

    mockGeolocation(succeedsAt(48.19, 16.35))
    act(() => result.current.refresh())

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
      expect(result.current.pos).toEqual({ lat: 48.19, lng: 16.35 })
    })
  })
})
