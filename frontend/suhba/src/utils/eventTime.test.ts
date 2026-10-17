import type { TFunction } from 'i18next'
import { formatEventClock, formatEventTime } from './eventTime'

// Mirrors i18next interpolation so the prayer label can be asserted on.
const t = ((key: string, opts?: Record<string, unknown>) =>
  key === 'events.afterPrayer' ? `nach dem ${String(opts?.prayer)}-Gebet` : key) as unknown as TFunction

describe('formatEventClock', () => {
  it('renders an instant in Vienna time', () => {
    expect(formatEventClock('2026-10-16T16:07:00Z')).toBe('18:07')
  })
})

describe('formatEventTime', () => {
  it('renders start and end when both are given', () => {
    expect(formatEventTime(
      { startTime: '2026-10-16T16:07:00Z', endTime: '2026-10-16T17:37:00Z' }, t,
    )).toBe('18:07 – 19:37')
  })

  it('renders only the start when there is no end', () => {
    expect(formatEventTime({ startTime: '2026-10-16T16:07:00Z' }, t)).toBe('18:07')
  })

  it('names the prayer instead of a clock time', () => {
    expect(formatEventTime(
      { startTime: '2026-10-16T16:07:00Z', startPrayer: 'Maghrib' }, t,
    )).toBe('nach dem Maghrib-Gebet')
  })

  it('never shows an end time once a prayer starts the event', () => {
    expect(formatEventTime(
      { startTime: '2026-10-16T16:07:00Z', endTime: '2026-10-16T17:37:00Z', startPrayer: 'Maghrib' }, t,
    )).toBe('nach dem Maghrib-Gebet')
  })
})
