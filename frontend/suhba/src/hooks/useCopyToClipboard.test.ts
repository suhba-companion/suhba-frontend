import { renderHook, act, waitFor } from '@testing-library/react'
import { useCopyToClipboard } from './useCopyToClipboard'

function mockClipboard(writeText: () => Promise<void>): void {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText }, configurable: true, writable: true,
  })
}

describe('useCopyToClipboard', () => {
  it('starts out not copied', () => {
    const { result } = renderHook(() => useCopyToClipboard())
    expect(result.current.copied).toBe(false)
  })

  it('writes the text to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockClipboard(writeText)
    const { result } = renderHook(() => useCopyToClipboard())
    await act(async () => { await result.current.copy('https://example.com/anmeldung') })
    expect(writeText).toHaveBeenCalledWith('https://example.com/anmeldung')
  })

  it('confirms after a successful copy', async () => {
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    const { result } = renderHook(() => useCopyToClipboard())
    await act(async () => { await result.current.copy('https://example.com') })
    expect(result.current.copied).toBe(true)
  })

  it('stops confirming once the window has passed', async () => {
    vi.useFakeTimers()
    mockClipboard(vi.fn().mockResolvedValue(undefined))
    const { result } = renderHook(() => useCopyToClipboard())
    await act(async () => { await result.current.copy('https://example.com') })
    expect(result.current.copied).toBe(true)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(result.current.copied).toBe(false)
    vi.useRealTimers()
  })

  // A denied permission or an insecure origin must not leave the button claiming
  // it copied something the clipboard never received.
  it('does not confirm when the clipboard rejects', async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    const { result } = renderHook(() => useCopyToClipboard())
    await act(async () => { await result.current.copy('https://example.com') })
    await waitFor(() => expect(result.current.copied).toBe(false))
  })
})
