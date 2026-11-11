/**
 * Spec §8.4. Every date in this app is formatted in `Europe/Vienna`, and Hermes ships
 * only partial Intl. Retrofitting `@formatjs/intl-datetimeformat` after the screens are
 * built means re-testing every date on screen, so this runs on every dev launch rather
 * than waiting to be remembered. Run it on a physical device of each platform.
 *
 * Measured on an iOS 26.5 simulator, 2026-11-01:
 *  - `format()` is correct — right zone, right language, right date.
 *  - `formatToParts()` is correct for the year/month/day shape the date key uses, but
 *    mislabels a mixed date-and-time shape: `day` and `month` come back as `literal`,
 *    and `hour` and `minute` are swapped. Both checks below exist because of that.
 */
const SAMPLE = new Date('2026-11-08T17:00:00Z') // 18:00 in Vienna, CET that date

/**
 * Full ICU renders "So., 8. Nov., 18:00"; iOS Hermes drops the comma after the weekday.
 * Only the separators may differ — the zone, the language and the date may not.
 */
const CARD_REFERENCE = 'So., 8. Nov., 18:00'

function stripSeparators(s: string): string {
  return s.replace(/[\s.,]/g, '')
}

export function runIntlSmokeTest(): void {
  // 1. The card and sheet date lines, which go through `format()`.
  let card: string
  try {
    card = new Intl.DateTimeFormat('de-AT', {
      timeZone: 'Europe/Vienna',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(SAMPLE)
  } catch (err) {
    fail(`Intl.DateTimeFormat threw with timeZone 'Europe/Vienna': ${String(err)}`)
    return
  }

  if (stripSeparators(card) !== stripSeparators(CARD_REFERENCE)) {
    fail(`Vienna formatting is wrong. Expected "${CARD_REFERENCE}" give or take separators, got "${card}".`)
    return
  }
  if (card !== CARD_REFERENCE) {
    console.warn(
      `[intl] Zone, language and date are correct. Separators differ from full ICU: ` +
      `"${card}" vs "${CARD_REFERENCE}". Visible in the event card's date line.`,
    )
  }

  // 2. The date key behind `/prayer-times/{YYYY-MM-DD}`. This one goes through
  //    `formatToParts`, so a mislabelled part would silently request `/prayer-times/--`
  //    and empty the widget rather than look merely odd.
  const parts = new Intl.DateTimeFormat('de-AT', {
    timeZone: 'Europe/Vienna',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(SAMPLE)
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? ''
  const key = `${get('year')}-${get('month')}-${get('day')}`
  if (key !== '2026-11-08') {
    fail(`formatToParts gave the date key "${key}", expected "2026-11-08". The prayer-times request would be malformed.`)
  }
}

function fail(message: string): void {
  console.error(
    `[intl] ${message}\n` +
    '[intl] Add @formatjs/intl-datetimeformat with its time zone data (and ' +
    '@formatjs/intl-pluralrules for i18next) at the app entry point, before any other ' +
    'import.',
  )
}
