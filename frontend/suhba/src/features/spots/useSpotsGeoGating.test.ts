import { renderHook, waitFor, act } from '@testing-library/react'
import { useSpots } from './useSpots'
import { resetGeolocationForTests } from '@hooks/useGeolocation'

/**
 * Before the gate, every list hook fired immediately against the Vienna centre
 * placeholder, rendered those distances as if they were real, then fired a
 * second request once the GPS fix landed. Two round trips and a visible flash
 * of wrong numbers on every list screen.
 */

let resolvePosition: ((lat: number, lng: number) => void) | undefined

function mockPendingGeolocation(): void {
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: vi.fn((success: PositionCallback) => {
        resolvePosition = (lat, lng) =>
          success({
            coords: { latitude: lat, longitude: lng, accuracy: 10 } as GeolocationCoordinates,
            timestamp: Date.now(),
            toJSON: () => ({}),
          } as GeolocationPosition)
      }),
    },
    configurable: true,
    writable: true,
  })
}

describe('useSpots geolocation gating', () => {
  beforeEach(() => {
    resolvePosition = undefined
    resetGeolocationForTests()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, status: 200, json: () => Promise.resolve([]),
    } as unknown as Response))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined, configurable: true, writable: true,
    })
  })

  it('does not fetch while the position is still unknown', async () => {
    mockPendingGeolocation()
    const { result } = renderHook(() => useSpots())

    await waitFor(() => expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled())
    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(true)
  })

  it('fetches exactly once, with the real position, after the fix lands', async () => {
    mockPendingGeolocation()
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(resolvePosition).toBeDefined())

    act(() => resolvePosition!(48.2566, 16.3989))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)

    const url = String((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0])
    expect(url).toContain('latitude=48.2566')
    expect(url).toContain('longitude=16.3989')
  })

  it('still fetches when the browser has no geolocation, using Vienna centre', async () => {
    const { result } = renderHook(() => useSpots())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(String((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]))
      .toContain('latitude=48.2082')
  })
})
