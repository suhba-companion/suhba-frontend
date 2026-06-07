import { useMemo } from 'react'
import { usePrayerTimes } from '@features/prayers/usePrayerTimes'
import { buildPrayers, getNextPrayer, formatCountdown } from '@features/prayers/prayerUtils'
import { useClockTick } from '@hooks/useClockTick'

export function PrayerCountdown(): JSX.Element {
  const { data } = usePrayerTimes()
  const tick = useClockTick()

  const next = useMemo(() => {
    void tick
    if (!data) return null
    return getNextPrayer(buildPrayers(data.timings))
  }, [data, tick])

  if (next === null) return <></>

  return (
    <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold">
      <span className="tabular-nums">{formatCountdown(next.minutesLeft)}</span>
      <span className="text-text-muted font-normal">bis</span>
      <span>{next.prayer.nameDE}</span>
    </span>
  )
}
