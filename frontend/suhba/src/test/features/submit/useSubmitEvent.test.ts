import { renderHook, act } from '@testing-library/react'
import { useSubmitEvent } from '@features/submit/useSubmitEvent'

describe('useSubmitEvent', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with idle status', () => {
    const { result } = renderHook(() => useSubmitEvent())
    expect(result.current.status).toBe('idle')
  })

  it('starts with empty form data', () => {
    const { result } = renderHook(() => useSubmitEvent())
    expect(result.current.data.title).toBe('')
    expect(result.current.data.category).toBe('')
    expect(result.current.data.address).toBe('')
    expect(result.current.data.district).toBe('')
    expect(result.current.data.startTime).toBe('')
  })

  it('isFree defaults to false', () => {
    const { result } = renderHook(() => useSubmitEvent())
    expect(result.current.data.isFree).toBe(false)
  })

  it('update changes the specified field', () => {
    const { result } = renderHook(() => useSubmitEvent())
    act(() => result.current.update('title', 'Freitagsgebet'))
    expect(result.current.data.title).toBe('Freitagsgebet')
  })

  it('update clears the error for that field', async () => {
    const { result } = renderHook(() => useSubmitEvent())
    await act(async () => { await result.current.submit() })
    expect(result.current.errors.title).toBeDefined()
    act(() => result.current.update('title', 'My Title'))
    expect(result.current.errors.title).toBeUndefined()
  })

  it('update does not affect other fields', () => {
    const { result } = renderHook(() => useSubmitEvent())
    act(() => result.current.update('title', 'Event'))
    expect(result.current.data.address).toBe('')
  })

  it('submit with empty form sets validation errors for all required fields', async () => {
    const { result } = renderHook(() => useSubmitEvent())
    await act(async () => { await result.current.submit() })
    expect(result.current.errors.title).toBeDefined()
    expect(result.current.errors.category).toBeDefined()
    expect(result.current.errors.address).toBeDefined()
    expect(result.current.errors.district).toBeDefined()
    expect(result.current.errors.startTime).toBeDefined()
  })

  it('submit with validation errors does not change status to loading', async () => {
    const { result } = renderHook(() => useSubmitEvent())
    await act(async () => { await result.current.submit() })
    expect(result.current.status).toBe('idle')
  })

  it('submit with valid data sets status to success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
    const { result } = renderHook(() => useSubmitEvent())
    act(() => {
      result.current.update('title', 'Test Event')
      result.current.update('category', 'Gebet')
      result.current.update('address', 'Teststraße 1')
      result.current.update('district', '1010 Wien')
      result.current.update('startTime', '2026-06-01T12:00')
    })
    await act(async () => { await result.current.submit() })
    expect(result.current.status).toBe('success')
  })

  it('submit with valid data calls POST /api/v1/events', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
    global.fetch = mockFetch
    const { result } = renderHook(() => useSubmitEvent())
    act(() => {
      result.current.update('title', 'Test Event')
      result.current.update('category', 'Gebet')
      result.current.update('address', 'Teststraße 1')
      result.current.update('district', '1010 Wien')
      result.current.update('startTime', '2026-06-01T12:00')
    })
    await act(async () => { await result.current.submit() })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('/events')
    expect(opts.method).toBe('POST')
  })

  it('sends the entered time as the matching instant, not as UTC wall-clock', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
    global.fetch = mockFetch
    const { result } = renderHook(() => useSubmitEvent())
    act(() => {
      result.current.update('title', 'Test Event')
      result.current.update('category', 'Gebet')
      result.current.update('address', 'Teststraße 1')
      result.current.update('district', '1010 Wien')
      result.current.update('startTime', '2026-06-01T12:00')
      result.current.update('endTime', '2026-06-01T14:00')
    })
    await act(async () => { await result.current.submit() })
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(new Date(body.startTime).getTime()).toBe(new Date('2026-06-01T12:00').getTime())
    expect(new Date(body.endTime).getTime()).toBe(new Date('2026-06-01T14:00').getTime())
  })

  it('submit with server error sets status to error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    const { result } = renderHook(() => useSubmitEvent())
    act(() => {
      result.current.update('title', 'Test Event')
      result.current.update('category', 'Gebet')
      result.current.update('address', 'Teststraße 1')
      result.current.update('district', '1010 Wien')
      result.current.update('startTime', '2026-06-01T12:00')
    })
    await act(async () => { await result.current.submit() })
    expect(result.current.status).toBe('error')
  })

  it('can toggle isFree to true', () => {
    const { result } = renderHook(() => useSubmitEvent())
    act(() => result.current.update('isFree', true))
    expect(result.current.data.isFree).toBe(true)
  })

  it('sends the registration link normalised to an absolute https url', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    global.fetch = mockFetch
    const { result } = renderHook(() => useSubmitEvent())
    act(() => {
      result.current.update('title', 'Test Event')
      result.current.update('category', 'Vortrag')
      result.current.update('address', 'Teststraße 1')
      result.current.update('district', '1010 Wien')
      result.current.update('startTime', '2026-06-01T12:00')
      result.current.update('registrationUrl', 'eventbrite.com/e/123')
    })
    await act(async () => { await result.current.submit() })
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.registrationUrl).toBe('https://eventbrite.com/e/123')
    expect(body.category).toBe('LECTURE')
  })

  it('rejects a registration link that is not an http(s) url', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch
    const { result } = renderHook(() => useSubmitEvent())
    act(() => {
      result.current.update('title', 'Test Event')
      result.current.update('category', 'Kurs')
      result.current.update('address', 'Teststraße 1')
      result.current.update('district', '1010 Wien')
      result.current.update('startTime', '2026-06-01T12:00')
      result.current.update('registrationUrl', 'javascript:alert(1)')
    })
    await act(async () => { await result.current.submit() })
    expect(result.current.errors.registrationUrl).toBeDefined()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('sends null when no registration link was entered', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    global.fetch = mockFetch
    const { result } = renderHook(() => useSubmitEvent())
    act(() => {
      result.current.update('title', 'Test Event')
      result.current.update('category', 'Gebet')
      result.current.update('address', 'Teststraße 1')
      result.current.update('district', '1010 Wien')
      result.current.update('startTime', '2026-06-01T12:00')
    })
    await act(async () => { await result.current.submit() })
    expect(JSON.parse(mockFetch.mock.calls[0][1].body).registrationUrl).toBeNull()
  })

  it('errors starts as empty object', () => {
    const { result } = renderHook(() => useSubmitEvent())
    expect(Object.keys(result.current.errors)).toHaveLength(0)
  })
})
