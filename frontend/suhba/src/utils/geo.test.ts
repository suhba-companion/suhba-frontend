import { haversineKm } from './geo'

describe('haversineKm', () => {
  it('returns 0 for the same point', () => {
    expect(haversineKm(48.2082, 16.3738, 48.2082, 16.3738)).toBe(0)
  })

  it('calculates approximate distance between Vienna and IZW', () => {
    const dist = haversineKm(48.2082, 16.3738, 48.2636, 16.3986)
    expect(dist).toBeGreaterThan(5)
    expect(dist).toBeLessThan(8)
  })

  it('is symmetric', () => {
    const d1 = haversineKm(48.2082, 16.3738, 48.2636, 16.3986)
    const d2 = haversineKm(48.2636, 16.3986, 48.2082, 16.3738)
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001)
  })
})

