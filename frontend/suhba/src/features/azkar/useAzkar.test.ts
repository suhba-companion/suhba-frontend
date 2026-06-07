import { renderHook, act } from '@testing-library/react'
import { useAzkar } from './useAzkar'

describe('useAzkar', () => {
  it('starts on sabah tab', () => {
    const { result } = renderHook(() => useAzkar())
    expect(result.current.activeTab).toBe('sabah')
  })

  it('switches to masa tab', () => {
    const { result } = renderHook(() => useAzkar())
    act(() => { result.current.setTab('masa') })
    expect(result.current.activeTab).toBe('masa')
  })

  it('switches to azkar tab', () => {
    const { result } = renderHook(() => useAzkar())
    act(() => { result.current.setTab('azkar') })
    expect(result.current.activeTab).toBe('azkar')
  })

  it('switches to duaa tab', () => {
    const { result } = renderHook(() => useAzkar())
    act(() => { result.current.setTab('duaa') })
    expect(result.current.activeTab).toBe('duaa')
  })

  it('returns dhikr list with entries', () => {
    const { result } = renderHook(() => useAzkar())
    expect(result.current.dhikrList.length).toBeGreaterThan(0)
  })

  it('returns duaa list with entries', () => {
    const { result } = renderHook(() => useAzkar())
    expect(result.current.duaaList.length).toBeGreaterThan(0)
  })

  it('returns sabah list with entries', () => {
    const { result } = renderHook(() => useAzkar())
    expect(result.current.sabahList.length).toBeGreaterThan(0)
  })

  it('returns masa list with entries', () => {
    const { result } = renderHook(() => useAzkar())
    expect(result.current.masaList.length).toBeGreaterThan(0)
  })

  it('each dhikr has required fields', () => {
    const { result } = renderHook(() => useAzkar())
    for (const d of result.current.dhikrList) {
      expect(d.id).toBeTruthy()
      expect(d.ar).toBeTruthy()
      expect(d.latin).toBeTruthy()
      expect(d.en).toBeTruthy()
      expect(d.count).toBeTruthy()
    }
  })

  it('each duaa has required fields', () => {
    const { result } = renderHook(() => useAzkar())
    for (const d of result.current.duaaList) {
      expect(d.id).toBeTruthy()
      expect(d.title).toBeTruthy()
      expect(d.ar).toBeTruthy()
      expect(d.latin).toBeTruthy()
      expect(d.en).toBeTruthy()
    }
  })

  it('each sabah dhikr has required fields', () => {
    const { result } = renderHook(() => useAzkar())
    for (const d of result.current.sabahList) {
      expect(d.id).toBeTruthy()
      expect(d.ar).toBeTruthy()
      expect(d.latin).toBeTruthy()
      expect(d.en).toBeTruthy()
      expect(d.count).toBeTruthy()
    }
  })

  it('each masa dhikr has required fields', () => {
    const { result } = renderHook(() => useAzkar())
    for (const d of result.current.masaList) {
      expect(d.id).toBeTruthy()
      expect(d.ar).toBeTruthy()
      expect(d.latin).toBeTruthy()
      expect(d.en).toBeTruthy()
      expect(d.count).toBeTruthy()
    }
  })
})
