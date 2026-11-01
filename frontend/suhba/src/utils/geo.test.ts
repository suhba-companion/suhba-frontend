import { haversineKm, distanceBetweenKm, resolveDistanceKm, roundKm, formatDistance } from './geo'
import { VIENNA_CENTER } from './location'

/**
 * Ground truth from Vincenty's inverse solution on WGS84, the reference
 * geodesic (sub-millimetre). These are the same straight-line distances the
 * "measure distance" tool in Google Maps reports between the two pins.
 */
const VIENNA_LANDMARKS = {
  Stephansdom: { lat: 48.20849, lng: 16.3732 },
  Schoenbrunn: { lat: 48.18453, lng: 16.3122 },
  Riesenrad: { lat: 48.21657, lng: 16.3959 },
  Hauptbahnhof: { lat: 48.18561, lng: 16.3775 },
  IZW: { lat: 48.26484, lng: 16.39584 },
  Donauturm: { lat: 48.2403, lng: 16.4106 },
  Flughafen: { lat: 48.11027, lng: 16.56966 },
}

const GEODESIC_KM: ReadonlyArray<[keyof typeof VIENNA_LANDMARKS, keyof typeof VIENNA_LANDMARKS, number]> = [
  ['Stephansdom', 'Schoenbrunn', 5.2595],
  ['Stephansdom', 'Riesenrad', 1.9114],
  ['Stephansdom', 'Hauptbahnhof', 2.5641],
  ['Stephansdom', 'IZW', 6.4876],
  ['Stephansdom', 'Donauturm', 4.4981],
  ['Stephansdom', 'Flughafen', 18.2454],
  ['Schoenbrunn', 'IZW', 10.8796],
  ['Riesenrad', 'Hauptbahnhof', 3.7043],
]

describe('distanceBetweenKm', () => {
  it.each(GEODESIC_KM)('measures %s to %s as %f km', (from, to, expected) => {
    const actual = distanceBetweenKm(VIENNA_LANDMARKS[from], VIENNA_LANDMARKS[to])
    // Within one metre of the WGS84 geodesic.
    expect(Math.abs(actual - expected)).toBeLessThan(0.001)
  })

  it('beats the spherical haversine it replaced', () => {
    const { Stephansdom, Flughafen } = VIENNA_LANDMARKS
    const truth = 18.2454
    const ellipsoidal = Math.abs(distanceBetweenKm(Stephansdom, Flughafen) - truth)
    const spherical = Math.abs(
      haversineKm(Stephansdom.lat, Stephansdom.lng, Flughafen.lat, Flughafen.lng) - truth,
    )
    expect(ellipsoidal).toBeLessThan(spherical)
  })

  it('returns 0 for the same point', () => {
    expect(distanceBetweenKm(VIENNA_CENTER, VIENNA_CENTER)).toBe(0)
  })

  it('is symmetric', () => {
    const { Stephansdom, IZW } = VIENNA_LANDMARKS
    expect(distanceBetweenKm(Stephansdom, IZW)).toBeCloseTo(distanceBetweenKm(IZW, Stephansdom), 10)
  })
})

describe('haversineKm', () => {
  it('returns 0 for the same point', () => {
    expect(haversineKm(48.2082, 16.3738, 48.2082, 16.3738)).toBe(0)
  })

  it('agrees with the ellipsoidal distance to within 50 m across Vienna', () => {
    const { Stephansdom, IZW } = VIENNA_LANDMARKS
    const spherical = haversineKm(Stephansdom.lat, Stephansdom.lng, IZW.lat, IZW.lng)
    expect(Math.abs(spherical - distanceBetweenKm(Stephansdom, IZW))).toBeLessThan(0.05)
  })

  it('is symmetric', () => {
    const d1 = haversineKm(48.2082, 16.3738, 48.2636, 16.3986)
    const d2 = haversineKm(48.2636, 16.3986, 48.2082, 16.3738)
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001)
  })
})

describe('resolveDistanceKm', () => {
  const target = VIENNA_LANDMARKS.IZW

  it('trusts the distance the backend already measured', () => {
    expect(resolveDistanceKm(3.21, VIENNA_LANDMARKS.Stephansdom, target)).toBe(3.21)
  })

  it('measures it itself when the backend sent null, as /{id} endpoints do', () => {
    const resolved = resolveDistanceKm(null, VIENNA_LANDMARKS.Stephansdom, target)
    expect(resolved).toBeCloseTo(6.4876, 3)
  })

  it('treats undefined the same as null', () => {
    expect(resolveDistanceKm(undefined, VIENNA_LANDMARKS.Stephansdom, target)).toBeCloseTo(6.4876, 3)
  })

  it('keeps a backend zero instead of recomputing it', () => {
    expect(resolveDistanceKm(0, VIENNA_LANDMARKS.Stephansdom, target)).toBe(0)
  })
})

describe('formatDistance', () => {
  it.each([
    [0, '0 m'],
    [0.004, '0 m'],
    [0.05, '50 m'],
    [0.123, '120 m'],
    [0.4, '400 m'],
    [0.999, '1,0 km'],
    [1, '1,0 km'],
    [1.24, '1,2 km'],
    [2.45, '2,5 km'],
    [9.94, '9,9 km'],
    [10, '10 km'],
    [12.34, '12 km'],
    [18.2454, '18 km'],
  ])('renders %f km as "%s"', (km, expected) => {
    expect(formatDistance(km)).toBe(expected)
  })

  it('uses a German decimal comma, matching the rest of the UI', () => {
    expect(formatDistance(1.5)).toBe('1,5 km')
    expect(formatDistance(1.5)).not.toContain('.')
  })

  it('renders nothing for values that are not a usable distance', () => {
    expect(formatDistance(NaN)).toBe('')
    expect(formatDistance(Infinity)).toBe('')
    expect(formatDistance(-1)).toBe('')
  })
})

describe('roundKm', () => {
  it('rounds to one decimal', () => {
    expect(roundKm(1.26)).toBe(1.3)
    expect(roundKm(1.24)).toBe(1.2)
  })
})
