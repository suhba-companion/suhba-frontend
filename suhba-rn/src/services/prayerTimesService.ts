import { API_BASE } from '../config'
import { apiGet } from './apiFetch'

export interface PrayerTimings {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

export interface HijriInfo {
  day: string
  monthEn: string
  year: string
}

export interface PrayerTimesData {
  timings: PrayerTimings
  hijri: HijriInfo | null
}

interface PrayerTimeResponse {
  id: number
  date: string
  fajr: string
  shuruq: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

function stripSeconds(t: string): string {
  // API returns "HH:mm:ss" — strip to "HH:mm"
  return t.slice(0, 5)
}

function toDateParam(date: Date): string {
  const parts = new Intl.DateTimeFormat('de-AT', {
    timeZone: 'Europe/Vienna',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

export async function fetchPrayerTimes(date: Date): Promise<PrayerTimesData> {
  const dateParam = toDateParam(date)
  const json = await apiGet<PrayerTimeResponse>(`${API_BASE}/prayer-times/${dateParam}`)
  if (json === undefined) throw new Error(`Prayer times API returned nothing for ${dateParam}`)

  return {
    timings: {
      fajr:    stripSeconds(json.fajr),
      sunrise: stripSeconds(json.shuruq),
      dhuhr:   stripSeconds(json.dhuhr),
      asr:     stripSeconds(json.asr),
      maghrib: stripSeconds(json.maghrib),
      isha:    stripSeconds(json.isha),
    },
    hijri: null,
  }
}
