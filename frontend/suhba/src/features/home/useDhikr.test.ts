import { renderHook, act } from '@testing-library/react'
import { useDhikr } from './useDhikr'

describe('useDhikr', () => {
  it('starts at index 0 with a valid dhikr', () => {
    const { result } = renderHook(() => useDhikr())
    expect(result.current.index).toBe(0)
    expect(result.current.current).toBeDefined()
    expect(result.current.current.id).toBe('dhikr-1')
  })

  it('has the full dhikr list loaded', () => {
    const { result } = renderHook(() => useDhikr())
    expect(result.current.dhikrList.length).toBeGreaterThan(0)
  })

  it('goToNext advances the index', () => {
    const { result } = renderHook(() => useDhikr())
    act(() => result.current.goToNext())
    expect(result.current.index).toBe(1)
  })

  it('goToNext wraps around to 0 from the last item', () => {
    const { result } = renderHook(() => useDhikr())
    const total = result.current.dhikrList.length
    for (let i = 0; i < total; i++) {
      act(() => result.current.goToNext())
    }
    expect(result.current.index).toBe(0)
  })

  it('goTo sets a specific index', () => {
    const { result } = renderHook(() => useDhikr())
    act(() => result.current.goTo(2))
    expect(result.current.index).toBe(2)
    expect(result.current.current.id).toBe('dhikr-3')
  })

  it('goTo ignores negative indices', () => {
    const { result } = renderHook(() => useDhikr())
    act(() => result.current.goTo(-1))
    expect(result.current.index).toBe(0)
  })

  it('goTo ignores out-of-bounds indices', () => {
    const { result } = renderHook(() => useDhikr())
    const total = result.current.dhikrList.length
    act(() => result.current.goTo(total))
    expect(result.current.index).toBe(0)
  })
})
