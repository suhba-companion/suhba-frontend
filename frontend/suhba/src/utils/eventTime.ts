import type { TFunction } from 'i18next'
import type { Event } from '../types'

const VIENNA = 'Europe/Vienna'

export function formatEventClock(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('de-AT', {
    hour: '2-digit', minute: '2-digit', timeZone: VIENNA,
  })
}

type EventTime = Pick<Event, 'startTime' | 'endTime' | 'startPrayer'>

/**
 * An event announced as "nach dem Maghrib-Gebet" has no clock time of its own:
 * startTime only anchors sorting. Printing it would claim a precision the
 * announcement never gave, so the prayer is shown instead.
 */
export function formatEventTime(event: EventTime, t: TFunction): string {
  if (event.startPrayer !== undefined) {
    return t('events.afterPrayer', { prayer: event.startPrayer })
  }
  const start = formatEventClock(event.startTime)
  return event.endTime !== undefined ? `${start} – ${formatEventClock(event.endTime)}` : start
}
