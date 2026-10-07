import { instantToDatetimeLocal, datetimeLocalToInstant } from './datetimeLocal'

describe('datetimeLocal', () => {
  it('round-trips a stored instant through the input value unchanged', () => {
    const stored = '2026-10-06T16:00:00.000Z'
    expect(datetimeLocalToInstant(instantToDatetimeLocal(stored))).toBe(stored)
  })

  it('shows the instant in local wall-clock time', () => {
    const local = new Date(2026, 9, 6, 18, 30)
    expect(instantToDatetimeLocal(local.toISOString())).toBe('2026-10-06T18:30')
  })

  it('converts local wall-clock input to the matching UTC instant', () => {
    expect(datetimeLocalToInstant('2026-10-06T18:30')).toBe(new Date(2026, 9, 6, 18, 30).toISOString())
  })

  it('returns empty values for missing or invalid input', () => {
    expect(instantToDatetimeLocal('')).toBe('')
    expect(instantToDatetimeLocal('garbage')).toBe('')
    expect(datetimeLocalToInstant('')).toBeNull()
  })
})
