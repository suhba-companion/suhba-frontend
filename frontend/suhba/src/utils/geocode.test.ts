import { geocodeAddress } from './geocode'
import { VIENNA_CENTER } from './location'

function stubFetch(impl: unknown): void {
  vi.stubGlobal('fetch', impl)
}

afterEach(() => vi.unstubAllGlobals())

describe('geocodeAddress', () => {
  it('returns the coordinates Nominatim found', async () => {
    stubFetch(vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ lat: '48.26484', lon: '16.39584' }]),
    }))
    await expect(geocodeAddress('Am Hubertusdamm 17', '1210 Wien')).resolves.toEqual({
      lat: 48.26484,
      lng: 16.39584,
    })
  })

  it('scopes the query to Vienna, Austria', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    stubFetch(fetchMock)
    await geocodeAddress('Testgasse 1', '1100 Wien')
    const url = String(fetchMock.mock.calls[0][0])
    expect(decodeURIComponent(url)).toContain('Testgasse 1, 1100 Wien, Wien, Österreich')
    expect(url).toContain('countrycodes=at')
  })

  it('falls back to Vienna centre on an empty result', async () => {
    stubFetch(vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) }))
    await expect(geocodeAddress('Nirgendwo 0', '9999 Wien')).resolves.toEqual(VIENNA_CENTER)
  })

  it('falls back to Vienna centre on a non-ok response', async () => {
    stubFetch(vi.fn().mockResolvedValue({ ok: false, status: 429, json: () => Promise.resolve([]) }))
    await expect(geocodeAddress('Testgasse 1', '1100 Wien')).resolves.toEqual(VIENNA_CENTER)
  })

  it('falls back to Vienna centre rather than throwing when the network fails', async () => {
    stubFetch(vi.fn().mockRejectedValue(new Error('offline')))
    await expect(geocodeAddress('Testgasse 1', '1100 Wien')).resolves.toEqual(VIENNA_CENTER)
  })

  it('falls back to Vienna centre when the payload is unparseable', async () => {
    stubFetch(vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve([{ lat: 'nope', lon: 'nope' }]),
    }))
    await expect(geocodeAddress('Testgasse 1', '1100 Wien')).resolves.toEqual(VIENNA_CENTER)
  })
})
