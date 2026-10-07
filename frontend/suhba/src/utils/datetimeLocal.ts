const MS_PER_MINUTE = 60_000
const DATETIME_LOCAL_LENGTH = 16

export function instantToDatetimeLocal(iso: string): string {
  const date = new Date(iso)
  if (!iso || Number.isNaN(date.getTime())) return ''
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * MS_PER_MINUTE)
  return shifted.toISOString().slice(0, DATETIME_LOCAL_LENGTH)
}

export function datetimeLocalToInstant(value: string): string | null {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return null
  return date.toISOString()
}
