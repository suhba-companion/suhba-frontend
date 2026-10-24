import type { TFunction } from 'i18next'
import { formatRecurrence, formatRecurrenceEnd } from './recurrence'

// Mirrors i18next interpolation so the built label can be asserted on.
const t = ((key: string, opts?: Record<string, unknown>) => {
  const labels: Record<string, string> = {
    'events.recurrence.weekly':   `Jeden ${String(opts?.weekday)}`,
    'events.recurrence.biweekly': `Jeden 2. ${String(opts?.weekday)}`,
    'events.recurrence.monthly':  `Monatlich am ${String(opts?.day)}.`,
    'events.recurrence.until':    `bis ${String(opts?.date)}`,
  }
  return labels[key] ?? key
}) as unknown as TFunction

describe('formatRecurrence', () => {
  it('names the weekday the series actually falls on', () => {
    // 2026-10-24 is a Saturday in Vienna.
    expect(formatRecurrence(
      { startTime: '2026-10-24T16:00:00Z', recurrence: 'Wöchentlich' }, t,
    )).toBe('Jeden Samstag')
  })

  it('marks a biweekly series as every second week', () => {
    expect(formatRecurrence(
      { startTime: '2026-10-24T16:00:00Z', recurrence: 'Zweiwöchentlich' }, t,
    )).toBe('Jeden 2. Samstag')
  })

  it('names the day of month for a monthly series', () => {
    expect(formatRecurrence(
      { startTime: '2026-10-24T16:00:00Z', recurrence: 'Monatlich' }, t,
    )).toBe('Monatlich am 24.')
  })

  it('reads the weekday in Vienna time, not UTC', () => {
    // 23:30 UTC on a Friday is already Saturday in Vienna.
    expect(formatRecurrence(
      { startTime: '2026-10-23T23:30:00Z', recurrence: 'Wöchentlich' }, t,
    )).toBe('Jeden Samstag')
  })

  it('says nothing for a one-off event', () => {
    expect(formatRecurrence({ startTime: '2026-10-24T16:00:00Z' }, t)).toBeUndefined()
  })
})

describe('formatRecurrenceEnd', () => {
  it('names the last date of a series that ends', () => {
    expect(formatRecurrenceEnd(
      { startTime: '2026-10-24T16:00:00Z', recurrence: 'Wöchentlich', recurrenceUntil: '2026-12-31' }, t,
    )).toBe('bis 31. Dezember 2026')
  })

  it('says nothing for an open-ended series', () => {
    expect(formatRecurrenceEnd(
      { startTime: '2026-10-24T16:00:00Z', recurrence: 'Wöchentlich' }, t,
    )).toBeUndefined()
  })

  it('says nothing for a one-off event with no recurrence', () => {
    expect(formatRecurrenceEnd(
      { startTime: '2026-10-24T16:00:00Z', recurrenceUntil: '2026-12-31' }, t,
    )).toBeUndefined()
  })
})
