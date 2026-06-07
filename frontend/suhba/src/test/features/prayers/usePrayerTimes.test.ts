import { renderHook, act, waitFor } from '@testing-library/react'
import { usePrayerTimes } from '@features/prayers/usePrayerTimes'

vi.mock('@services/prayerTimesService', () => ({
  fetchPrayerTimes: vi.fn().mockResolvedValue({
    timings: {
      fajr: '04:30',
      sunrise: '06:15',
      dhuhr: '12:00',
      asr: '15:30',
      maghrib: '19:45',
      isha: '21:30',
    },
    hijri: null,
  }),
}))

describe('usePrayerTimes', () => {
  it('starts with loading true', () => {
    const { result } = renderHook(() => usePrayerTimes())
    expect(result.current.loading).toBe(true)
  })

  it('resolves data after fetch completes', async () => {
    const { result } = renderHook(() => usePrayerTimes())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).not.toBeNull()
  })

  it('returns correct fajr time', async () => {
    const { result } = renderHook(() => usePrayerTimes())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data?.timings.fajr).toBe('04:30')
  })

  it('returns correct isha time', async () => {
    const { result } = renderHook(() => usePrayerTimes())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data?.timings.isha).toBe('21:30')
  })

  it('error is null on successful fetch', async () => {
    const { result } = renderHook(() => usePrayerTimes())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it('staleWarning is always null', async () => {
    const { result } = renderHook(() => usePrayerTimes())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.staleWarning).toBeNull()
  })

  it('provides a retry function', () => {
    const { result } = renderHook(() => usePrayerTimes())
    expect(typeof result.current.retry).toBe('function')
  })

  it('retry resets loading and refetches', async () => {
    const { result } = renderHook(() => usePrayerTimes())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).not.toBeNull()
  })
})
