const POSTAL_CODE = /\d{4}/

/**
 * Seed addresses usually already end in their district ("Garbergasse 7, 1060 Wien"),
 * so appending the district column unconditionally printed the postal code twice.
 */
export function formatAddress(address: string, district: string): string {
  const street = address.trim()
  const area = district.trim()
  if (!area || street.includes(area)) return street

  const postal = area.match(POSTAL_CODE)?.[0]
  if (postal !== undefined && street.includes(postal)) {
    const city = area.replace(POSTAL_CODE, '').trim()
    return city && !street.includes(city) ? `${street} ${city}` : street
  }
  return `${street}, ${area}`
}
