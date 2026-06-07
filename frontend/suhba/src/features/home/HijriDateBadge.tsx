import { useMemo } from 'react'
import { getTodayHijri } from '../../utils/hijriCalendar'

export function HijriDateBadge(): JSX.Element {
  const { formatted } = useMemo(() => getTodayHijri(), [])

  return (
    <p className="text-center text-xs text-text-muted tracking-wide m-0">
      {formatted}
    </p>
  )
}
