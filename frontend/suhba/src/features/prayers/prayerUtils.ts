import type { PrayerTimings } from '@services/prayerTimesService'

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export interface Prayer {
  key: PrayerKey
  nameDE: string
  nameAR: string
  time: string
}

export interface NextPrayer {
  prayer: Prayer
  minutesLeft: number
}

const PRAYER_META: Array<{ key: PrayerKey; nameDE: string; nameAR: string }> = [
  { key: 'fajr',    nameDE: 'Fajr',    nameAR: 'الفجر' },
  { key: 'dhuhr',   nameDE: 'Dhuhr',   nameAR: 'الظهر' },
  { key: 'asr',     nameDE: 'Asr',     nameAR: 'العصر' },
  { key: 'maghrib', nameDE: 'Maghrib', nameAR: 'المغرب' },
  { key: 'isha',    nameDE: 'Isha',    nameAR: 'العشاء' },
]

export function buildPrayers(timings: PrayerTimings): Prayer[] {
  return PRAYER_META.map((m) => ({ ...m, time: timings[m.key] }))
}

function toMinutes(time: string): number {
  const [h, min] = time.split(':').map(Number)
  return h * 60 + min
}

export function getNextPrayer(prayers: Prayer[]): NextPrayer {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  for (const prayer of prayers) {
    const prayerMinutes = toMinutes(prayer.time)
    if (currentMinutes < prayerMinutes) {
      return { prayer, minutesLeft: prayerMinutes - currentMinutes }
    }
  }

  const fajr = prayers[0]
  const fajrMinutes = toMinutes(fajr.time)
  return { prayer: fajr, minutesLeft: 24 * 60 - currentMinutes + fajrMinutes }
}

export function formatCountdown(minutesLeft: number): string {
  const h = Math.floor(minutesLeft / 60)
  const m = minutesLeft % 60
  if (h > 0) return `${h}h ${m} Min.`
  return `${m} Min.`
}
