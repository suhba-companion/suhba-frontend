import { renderHook, act } from '@testing-library/react'
import { useSubmitBusiness } from './useSubmitBusiness'

describe('useSubmitBusiness', () => {
  it('starts with idle status', () => {
    const { result } = renderHook(() => useSubmitBusiness())
    expect(result.current.status).toBe('idle')
  })

  it('starts with empty form data', () => {
    const { result } = renderHook(() => useSubmitBusiness())
    expect(result.current.data.name).toBe('')
    expect(result.current.data.type).toBe('')
    expect(result.current.data.certStatus).toBe('')
  })

  it('update sets field value', () => {
    const { result } = renderHook(() => useSubmitBusiness())
    act(() => { result.current.update('name', 'Taqwa') })
    expect(result.current.data.name).toBe('Taqwa')
  })

  it('submit with empty fields sets validation errors', async () => {
    const { result } = renderHook(() => useSubmitBusiness())
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
    const { result } = renderHook(() => useSubmitBusiness())
    act(() => {
      result.current.update('name', 'Test Grill')
      result.current.update('type', 'Restaurant')
      result.current.update('address', 'Testgasse 1')
      result.current.update('district', '1100 Wien')
    })
    await act(async () => { await result.current.submit() })
    expect(result.current.status).toBe('success')
    vi.unstubAllGlobals()
  })

  it('certStatus is optional — empty value does not block submit', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ lat: '48.2082', lon: '16.3738' }]) } as unknown as Response)
      .mockResolvedValueOnce({ ok: true } as Response),
    )
    const { result } = renderHook(() => useSubmitBusiness())
    act(() => {
      result.current.update('name', 'Test Grill')
      result.current.update('type', 'Restaurant')
      result.current.update('address', 'Testgasse 1')
      result.current.update('district', '1100 Wien')
    })
    await act(async () => { await result.current.submit() })
    expect(result.current.status).toBe('success')
    vi.unstubAllGlobals()
  })
})
