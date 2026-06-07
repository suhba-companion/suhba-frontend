import { buildPrayers, getNextPrayer, formatCountdown } from '@features/prayers/prayerUtils'
import type { PrayerTimings } from '@services/prayerTimesService'

const TIMINGS: PrayerTimings = {
  fajr: '04:30',
  sunrise: '06:15',
  dhuhr: '12:00',
  asr: '15:30',
  maghrib: '19:45',
  isha: '21:30',
}

describe('buildPrayers', () => {
  it('returns exactly 5 prayers', () => {
    expect(buildPrayers(TIMINGS)).toHaveLength(5)
  })

  it('first prayer is fajr with correct time', () => {
    const prayers = buildPrayers(TIMINGS)
    expect(prayers[0].key).toBe('fajr')
    expect(prayers[0].time).toBe('04:30')
  })

  it('last prayer is isha with correct time', () => {
    const prayers = buildPrayers(TIMINGS)
    expect(prayers[4].key).toBe('isha')
    expect(prayers[4].time).toBe('21:30')
  })

  it('prayers order is fajr, dhuhr, asr, maghrib, isha', () => {
    const prayers = buildPrayers(TIMINGS)
    expect(prayers.map((p) => p.key)).toEqual(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'])
  })

  it('all prayers have non-empty Arabic names', () => {
    buildPrayers(TIMINGS).forEach((p) => {
      expect(p.nameAR.length).toBeGreaterThan(0)
    })
  })

  it('all prayers have non-empty German names', () => {
    buildPrayers(TIMINGS).forEach((p) => {
      expect(p.nameDE.length).toBeGreaterThan(0)
    })
  })

  it('German names are correct', () => {
    const prayers = buildPrayers(TIMINGS)
    expect(prayers[0].nameDE).toBe('Fajr')
    expect(prayers[1].nameDE).toBe('Dhuhr')
    expect(prayers[2].nameDE).toBe('Asr')
    expect(prayers[3].nameDE).toBe('Maghrib')
    expect(prayers[4].nameDE).toBe('Isha')
  })
})

describe('getNextPrayer', () => {
  it('returns an object with prayer and minutesLeft', () => {
    const next = getNextPrayer(buildPrayers(TIMINGS))
    expect(next).toHaveProperty('prayer')
    expect(next).toHaveProperty('minutesLeft')
  })

  it('minutesLeft is a positive number', () => {
    const next = getNextPrayer(buildPrayers(TIMINGS))
    expect(next.minutesLeft).toBeGreaterThan(0)
  })

  it('minutesLeft is at most 24 hours', () => {
    const next = getNextPrayer(buildPrayers(TIMINGS))
    expect(next.minutesLeft).toBeLessThanOrEqual(24 * 60)
  })

  it('when all prayers are in the past, wraps to fajr next day', () => {
    const allPastTimings: PrayerTimings = {
      fajr: '00:01',
      sunrise: '00:02',
      dhuhr: '00:03',
      asr: '00:04',
      maghrib: '00:05',
      isha: '00:06',
    }
    const prayers = buildPrayers(allPastTimings)
    const next = getNextPrayer(prayers)
    expect(next.prayer.key).toBe('fajr')
  })
})

describe('formatCountdown', () => {
  it('formats minutes-only as "N Min."', () => {
    expect(formatCountdown(45)).toBe('45 Min.')
  })

  it('formats 0 minutes as "0 Min."', () => {
    expect(formatCountdown(0)).toBe('0 Min.')
  })

  it('formats 60 minutes as "1h 0 Min."', () => {
    expect(formatCountdown(60)).toBe('1h 0 Min.')
  })

  it('formats 90 minutes as "1h 30 Min."', () => {
    expect(formatCountdown(90)).toBe('1h 30 Min.')
  })

  it('formats 120 minutes as "2h 0 Min."', () => {
    expect(formatCountdown(120)).toBe('2h 0 Min.')
  })

  it('formats 75 minutes as "1h 15 Min."', () => {
    expect(formatCountdown(75)).toBe('1h 15 Min.')
  })

  it('returns only minutes when less than 60', () => {
    expect(formatCountdown(59)).toBe('59 Min.')
  })
})
