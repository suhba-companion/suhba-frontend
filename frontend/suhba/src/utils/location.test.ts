import { VIENNA_CENTER, VIENNA_CENTER_TUPLE, NEARBY_RADIUS_KM, nearbyParams } from './location'

describe('location constants', () => {
  it('pins the Vienna fallback to Stephansplatz', () => {
    expect(VIENNA_CENTER).toEqual({ lat: 48.2082, lng: 16.3738 })
  })

  it('exposes the same point as a Leaflet tuple', () => {
    expect(VIENNA_CENTER_TUPLE).toEqual([VIENNA_CENTER.lat, VIENNA_CENTER.lng])
  })

  it('uses one radius wide enough to cover Vienna from any point in it', () => {
    expect(NEARBY_RADIUS_KM).toBe(15)
  })
})

describe('nearbyParams', () => {
  it('builds the query every /nearby endpoint expects', () => {
    const params = nearbyParams({ lat: 48.3, lng: 16.4 })
    expect(params.get('latitude')).toBe('48.3')
    expect(params.get('longitude')).toBe('16.4')
    expect(params.get('radiusKm')).toBe('15')
  })

  it('serialises to the same string for spots, halal and events', () => {
    expect(String(nearbyParams(VIENNA_CENTER))).toBe(
      'latitude=48.2082&longitude=16.3738&radiusKm=15',
    )
  })
})
