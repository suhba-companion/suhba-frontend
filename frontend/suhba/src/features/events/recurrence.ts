import type { TFunction } from 'i18next'
import type { Event, EventRecurrence } from '../../types'

const VIENNA = 'Europe/Vienna'

const RECURRENCE_LABEL_KEYS: Record<EventRecurrence, string> = {
  'Wöchentlich':     'events.recurrence.weekly',
  'Zweiwöchentlich': 'events.recurrence.biweekly',
  'Monatlich':       'events.recurrence.monthly',
}

type EventRepeat = Pick<Event, 'startTime' | 'recurrence' | 'recurrenceUntil'>

/**
 * The series is never spelled out as "WEEKLY" — the weekday it actually falls on is
 * what a reader recognises their own week by, and it is only knowable from the date
 * the backend projected, so the label is built here rather than shipped by the API.
 */
export function formatRecurrence(event: EventRepeat, t: TFunction): string | undefined {
  if (event.recurrence === undefined) return undefined
  const date = new Date(event.startTime)
  return t(RECURRENCE_LABEL_KEYS[event.recurrence], {
    weekday: date.toLocaleDateString('de-AT', { weekday: 'long', timeZone: VIENNA }),
    day: date.toLocaleDateString('de-AT', { day: 'numeric', timeZone: VIENNA }),
  })
}

/** Absent for an open-ended series, which is the common case. */
export function formatRecurrenceEnd(event: EventRepeat, t: TFunction): string | undefined {
  if (event.recurrence === undefined || event.recurrenceUntil === undefined) return undefined
  return t('events.recurrence.until', {
    date: new Date(event.recurrenceUntil).toLocaleDateString('de-AT', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: VIENNA,
    }),
  })
}
