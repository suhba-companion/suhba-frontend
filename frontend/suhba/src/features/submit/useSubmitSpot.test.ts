import { renderHook, act } from '@testing-library/react'
import { useSubmitSpot } from './useSubmitSpot'

describe('useSubmitSpot', () => {
  it('starts with idle status', () => {
    const { result } = renderHook(() => useSubmitSpot())
    expect(result.current.status).toBe('idle')
  })

  it('starts with empty form data', () => {
    const { result } = renderHook(() => useSubmitSpot())
    expect(result.current.data.name).toBe('')
    expect(result.current.data.type).toBe('')
  })

  it('update sets field value', () => {
    const { result } = renderHook(() => useSubmitSpot())
    act(() => { result.current.update('name', 'IZW') })
    expect(result.current.data.name).toBe('IZW')
  })

  it('submit with empty fields sets validation errors', async () => {
    const { result } = renderHook(() => useSubmitSpot())
    await act(async () => { await result.current.submit() })
    expect(result.current.errors.name).toBeTruthy()
    expect(result.current.errors.type).toBeTruthy()
    expect(result.current.errors.address).toBeTruthy()
    expect(result.current.errors.district).toBeTruthy()
    expect(result.current.status).toBe('idle')
  })

  it('submit with valid data reaches success', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ lat: '48.2082', lon: '16.3738' }]) } as unknown as Response)
      .mockResolvedValueOnce({ ok: true } as Response),
    )
    const { result } = renderHook(() => useSubmitSpot())
    act(() => {
      result.current.update('name', 'Test Moschee')
      result.current.update('type', 'Moschee')
      result.current.update('address', 'Testgasse 1')
      result.current.update('district', '1100 Wien')
    })
    await act(async () => { await result.current.submit() })
    expect(result.current.status).toBe('success')
    vi.unstubAllGlobals()
  })

  it('update clears error for that field', async () => {
    const { result } = renderHook(() => useSubmitSpot())
    await act(async () => { await result.current.submit() })
    expect(result.current.errors.name).toBeTruthy()
    act(() => { result.current.update('name', 'Test') })
    expect(result.current.errors.name).toBeUndefined()
  })
})
