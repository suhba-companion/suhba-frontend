import { getSpots, getSpotById } from './masjidiService'
import { getHalalBusinesses, getHalalBusinessById } from './halalService'
import { getUpcomingEvents, getEventById } from './eventService'
import { formatDistance } from '../utils/geo'
import { VIENNA_CENTER } from '../utils/location'

/**
 * The bug this file exists for: list endpoints return `distanceKm`, `/{id}`
 * endpoints do not. Detail screens used to drop the user position entirely, so
 * they measured from Vienna centre and printed a different number than the card
 * the user had just tapped.
 */

// Floridsdorf, well north of the city centre, so a Vienna-centre fallback is
// obvious rather than a rounding difference.
const USER = { lat: 48.2566, lng: 16.3989 }

/** Islamisches Zentrum Wien. 0.944 km from USER, 6.507 km from Vienna centre. */
const TARGET = { latitude: 48.26484, longitude: 16.39584 }

const SPOT = {
  id: 7, name: 'IZW', address: 'Am Hubertusdamm 17', district: '1210 Wien',
  ...TARGET, type: 'MOSQUE' as const,
  wuduAvailable: true, sistanAvailable: true, fridayPrayer: true,
  jumaTime: '13:00', jumaTimeSummer: null, jumaTimeWinter: null,
  parking: true, hijabAvailable: null, prayerClothesAvailable: null,
  openingHours: null, language: null, verified: true,
}

const BUSINESS = {
  id: 7, name: 'Testlokal', address: 'Am Hubertusdamm 17', district: '1210 Wien',
  ...TARGET, category: 'RESTAURANT' as const,
  certified: true, certificationBody: 'HMA', featured: false, parking: null,
  openingHours: null, rating: null, phone: null, website: null,
}

const EVENT = {
  id: 7, title: 'Vortrag', description: null,
  address: 'Am Hubertusdamm 17', district: '1210 Wien', ...TARGET,
  startTime: '2026-12-01T18:00:00Z', endTime: null, startPrayer: null,
  recurrence: null, recurrenceUntil: null, categories: ['LECTURE' as const],
  organizer: null, contactInfo: null, isFree: true,
  registrationUrl: null, requiresRegistration: false, audience: null,
  status: 'APPROVED', upvotes: 0,
}

/** What the backend puts on `/nearby` responses: USER to TARGET, rounded as it rounds. */
const BACKEND_DISTANCE_KM = 0.94

function stubFetch(payload: unknown): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true, status: 200, json: () => Promise.resolve(payload),
  } as unknown as Response))
}

afterEach(() => vi.unstubAllGlobals())

describe.each([
  {
    label: 'prayer spots',
    listDto: { ...SPOT, distanceKm: BACKEND_DISTANCE_KM },
    detailDto: SPOT, // `/prayer-spots/{id}` carries no distanceKm
    list: () => getSpots(USER),
    detail: () => getSpotById('7', USER),
    detailAtVienna: () => getSpotById('7', VIENNA_CENTER),
  },
  {
    label: 'halal spots',
    listDto: { ...BUSINESS, distanceKm: BACKEND_DISTANCE_KM },
    detailDto: BUSINESS,
    list: () => getHalalBusinesses(USER),
    detail: () => getHalalBusinessById('7', USER),
    detailAtVienna: () => getHalalBusinessById('7', VIENNA_CENTER),
  },
  {
    label: 'events',
    listDto: { ...EVENT, distanceKm: BACKEND_DISTANCE_KM },
    detailDto: { ...EVENT, distanceKm: null },
    list: () => getUpcomingEvents(USER),
    detail: () => getEventById('7', USER),
    detailAtVienna: () => getEventById('7', VIENNA_CENTER),
  },
])('$label distance', ({ listDto, detailDto, list, detail, detailAtVienna }) => {
  it('takes the distance the backend measured for the list', async () => {
    stubFetch([listDto])
    const [item] = await list()
    expect(item.distanceKm).toBe(BACKEND_DISTANCE_KM)
  })

  it('still produces a distance on the detail endpoint, which sends none', async () => {
    stubFetch(detailDto)
    const item = await detail()
    expect(item?.distanceKm).toBeDefined()
  })

  it('shows the user the same distance on the card and on the detail screen', async () => {
    stubFetch([listDto])
    const [fromList] = await list()

    stubFetch(detailDto)
    const fromDetail = await detail()

    // The regression: these used to be 940 m and 6,5 km for the same place.
    expect(formatDistance(fromDetail!.distanceKm!)).toBe(formatDistance(fromList.distanceKm!))
    expect(Math.abs(fromDetail!.distanceKm! - fromList.distanceKm!)).toBeLessThan(0.05)
  })

  it('measures from wherever it is told, not from a hardcoded centre', async () => {
    stubFetch(detailDto)
    const near = await detail()
    stubFetch(detailDto)
    const far = await detailAtVienna()

    expect(near!.distanceKm).toBeCloseTo(0.944, 2)
    expect(far!.distanceKm).toBeCloseTo(6.507, 2)
  })
})

describe('nearby requests', () => {
  it('sends the user position and one shared radius to every endpoint', async () => {
    for (const call of [getSpots, getHalalBusinesses, getUpcomingEvents]) {
      stubFetch([])
      await call(USER)
      const url = String((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0])
      expect(url).toContain(`latitude=${USER.lat}`)
      expect(url).toContain(`longitude=${USER.lng}`)
      expect(url).toContain('radiusKm=15')
      vi.unstubAllGlobals()
    }
  })
})
