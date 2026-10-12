import { buildDirectionsUrl } from './maps'

function destination(url: string): string {
  return decodeURIComponent(new URL(url).searchParams.get('daddr') ?? '')
}

describe('buildDirectionsUrl', () => {
  it('builds a directions link from the postal address', () => {
    const url = buildDirectionsUrl({ address: 'Am Bruckhaufen 3, 1210 Wien', district: '1210 Wien' })
    expect(destination(url)).toBe('Am Bruckhaufen 3, 1210 Wien, Österreich')
  })

  it('appends the district when the address does not already carry it', () => {
    const url = buildDirectionsUrl({ address: 'Garbergasse 7', district: '1060 Wien' })
    expect(destination(url)).toBe('Garbergasse 7, 1060 Wien, Österreich')
  })

  it('anchors a bare postal-code district to Vienna', () => {
    const url = buildDirectionsUrl({ address: 'Lugner City- Gablenzgasse 11', district: '1150' })
    expect(destination(url)).toBe('Lugner City- Gablenzgasse 11, 1150, Wien, Österreich')
  })

  it('anchors a venue name with no street to Vienna', () => {
    const url = buildDirectionsUrl({ address: '6-7 Coffee', district: '1050' })
    expect(destination(url)).toBe('6-7 Coffee, 1050, Wien, Österreich')
  })

  it('falls back to coordinates when no address is given', () => {
    const url = buildDirectionsUrl({ address: '  ', lat: 48.2082, lng: 16.3738 })
    expect(destination(url)).toBe('48.2082,16.3738')
  })

  it('always asks for a route, never a plain place link', () => {
    const url = buildDirectionsUrl({ address: 'Teststraße 1, 1010 Wien' })
    expect(url).toContain('travelmode=transit')
    expect(url).not.toContain('maps.app.goo.gl')
  })
})
