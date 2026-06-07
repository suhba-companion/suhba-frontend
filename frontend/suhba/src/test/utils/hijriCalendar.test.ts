import { getTodayHijri } from '@utils/hijriCalendar'

describe('getTodayHijri', () => {
  it('returns object with required fields', () => {
    const result = getTodayHijri()
    expect(result).toHaveProperty('day')
    expect(result).toHaveProperty('month')
    expect(result).toHaveProperty('monthName')
    expect(result).toHaveProperty('year')
    expect(result).toHaveProperty('formatted')
  })

  it('day is between 1 and 30', () => {
    const { day } = getTodayHijri()
    expect(day).toBeGreaterThanOrEqual(1)
    expect(day).toBeLessThanOrEqual(30)
  })

  it('month is between 1 and 12', () => {
    const { month } = getTodayHijri()
    expect(month).toBeGreaterThanOrEqual(1)
    expect(month).toBeLessThanOrEqual(12)
  })

  it('year is in the 1440s-1450s Hijri range', () => {
    const { year } = getTodayHijri()
    expect(year).toBeGreaterThan(1440)
    expect(year).toBeLessThan(1500)
  })

  it('monthName is a non-empty string', () => {
    const { monthName } = getTodayHijri()
    expect(typeof monthName).toBe('string')
    expect(monthName.length).toBeGreaterThan(0)
  })

  it('formatted matches pattern "D. MonthName YYYY H."', () => {
    const { formatted, day, monthName, year } = getTodayHijri()
    expect(formatted).toBe(`${day}. ${monthName} ${year} H.`)
  })

  it('formatted ends with "H."', () => {
    const { formatted } = getTodayHijri()
    expect(formatted).toMatch(/H\.$/)
  })
})
