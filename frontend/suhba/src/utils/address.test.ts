import { formatAddress } from './address'

describe('formatAddress', () => {
  it('does not repeat the district the address already carries', () => {
    expect(formatAddress('Bösendorferstraße 3, 1010 Wien', '1010 Wien')).toBe(
      'Bösendorferstraße 3, 1010 Wien',
    )
  })

  it('appends the district when the address lacks it', () => {
    expect(formatAddress('Garbergasse 7', '1060 Wien')).toBe('Garbergasse 7, 1060 Wien')
  })

  it('completes a bare postal code with the city instead of repeating it', () => {
    expect(formatAddress('Prager Straße 36, 1210', '1210 Wien')).toBe('Prager Straße 36, 1210 Wien')
  })

  it('keeps an address whose district column is only the city', () => {
    expect(formatAddress('Quellenstraße 143, 1100 Wien', 'Wien')).toBe(
      'Quellenstraße 143, 1100 Wien',
    )
  })

  it('appends a city-only district when the address omits it', () => {
    expect(formatAddress('Westfield Shopping City Süd', '2334 Vösendorf')).toBe(
      'Westfield Shopping City Süd, 2334 Vösendorf',
    )
  })

  it('trims stray whitespace', () => {
    expect(formatAddress('  Operngasse 14, 1010 Wien  ', '  1010 Wien  ')).toBe(
      'Operngasse 14, 1010 Wien',
    )
  })
})
