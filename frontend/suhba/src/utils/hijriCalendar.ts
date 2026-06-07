const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabiʻ al-Awwal', 'Rabiʻ al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', 'Dhul Qiʻdah', 'Dhul Hijjah',
]

export interface HijriDate {
  day: number
  month: number
  monthName: string
  year: number
  formatted: string
}

export function getTodayHijri(): HijriDate {
  const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date())

  const get = (type: Intl.DateTimeFormatPartTypes): number =>
    parseInt(parts.find((p) => p.type === type)?.value ?? '1', 10)

  const day = get('day')
  const month = get('month')
  const year = get('year')
  const monthName = HIJRI_MONTHS[month - 1] ?? ''

  return {
    day,
    month,
    monthName,
    year,
    formatted: `${day}. ${monthName} ${year} H.`,
  }
}
