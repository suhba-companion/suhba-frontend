import { buildDirectionsUrl } from './maps'

describe('buildDirectionsUrl', () => {
  it('builds a directions link from the postal address', () => {
    const url = buildDirectionsUrl({ address: 'Am Bruckhaufen 3, 1210 Wien', district: '1210 Wien' })
    expect(url).toBe(
      'https://maps.google.com/maps?daddr=Am%20Bruckhaufen%203%2C%201210%20Wien&travelmode=transit',
    )
  })

  it('appends the district when the address does not already carry it', () => {
    const url = buildDirectionsUrl({ address: 'Garbergasse 7', district: '1060 Wien' })
    expect(decodeURIComponent(url)).toContain('daddr=Garbergasse 7, 1060 Wien')
  })

  it('falls back to coordinates when no address is given', () => {
    const url = buildDirectionsUrl({ address: '  ', lat: 48.2082, lng: 16.3738 })
    expect(decodeURIComponent(url)).toContain('daddr=48.2082,16.3738')
  })

  it('always asks for a route, never a plain place link', () => {
    const url = buildDirectionsUrl({ address: 'Teststraße 1, 1010 Wien' })
    expect(url).toContain('travelmode=transit')
    expect(url).not.toContain('maps.app.goo.gl')
  })
})
