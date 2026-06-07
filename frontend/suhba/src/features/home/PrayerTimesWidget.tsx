import { useMemo } from 'react'
import { Clock, SunHorizon, Sun, Moon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { usePrayerTimes } from '@features/prayers/usePrayerTimes'
import { buildPrayers, getNextPrayer, formatCountdown } from '@features/prayers/prayerUtils'
import type { Prayer, PrayerKey } from '@features/prayers/prayerUtils'
import { useClockTick } from '@hooks/useClockTick'

const ICONS: Record<PrayerKey, Icon> = {
  fajr:    SunHorizon,
  dhuhr:   Sun,
  asr:     Sun,
  maghrib: SunHorizon,
  isha:    Moon,
}

function PrayerCol({ prayer, isNext }: { prayer: Prayer; isNext: boolean }): JSX.Element {
  const IconComp = ICONS[prayer.key]
  return (
    <div
      className={[
        'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all',
        isNext ? 'bg-white/20 ring-2 ring-white/40' : 'bg-white/10',
      ].join(' ')}
    >
      <IconComp
        size={18}
        weight="regular"
        aria-hidden="true"
        className={isNext ? 'text-amber-200' : 'text-emerald-100/60'}
      />
      <span className={['text-[10px] leading-none', isNext ? 'text-white font-medium' : 'text-emerald-50/60'].join(' ')}>
        {prayer.nameDE}
      </span>
      <span className={['text-xs tabular-nums font-medium leading-none', isNext ? 'text-white' : 'text-emerald-100/60'].join(' ')}>
        {prayer.time}
      </span>
    </div>
  )
}

function ShoroukCol({ time }: { time: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl bg-white/10">
      <SunHorizon size={18} weight="regular" aria-hidden="true" className="text-emerald-100/40" />
      <span className="text-[10px] leading-none text-emerald-50/40">Shorouk</span>
      <span className="text-xs tabular-nums font-medium leading-none text-emerald-100/40">{time}</span>
    </div>
  )
}

export function PrayerTimesWidget(): JSX.Element {
  const { data, loading } = usePrayerTimes()
  const tick = useClockTick()

  const { prayers, next } = useMemo(() => {
    void tick
    if (!data) return { prayers: [], next: null }
    const p = buildPrayers(data.timings)
    return { prayers: p, next: getNextPrayer(p) }
  }, [data, tick])

  if (loading) {
    return (
      <div className="bg-hero-gradient rounded-card p-4 h-[116px] flex items-center justify-center">
        <span className="text-cream-card/60 text-xs">Gebetszeiten werden geladen…</span>
      </div>
    )
  }

  if (!data) return <></>

  return (
    <div className="bg-hero-gradient rounded-card p-4 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-cream-card/70">
          <Clock size={14} weight="regular" aria-hidden="true" />
          <span className="text-xs">Gebetszeiten</span>
        </div>
        {next !== null && (
          <span className="text-white font-semibold text-sm">
            {formatCountdown(next.minutesLeft)} bis {next.prayer.nameDE}
          </span>
        )}
      </div>

      {/* 6 columns: Fajr · Shorouk · Dhuhr · Asr · Maghrib · Isha */}
      <div className="grid grid-cols-6 gap-1">
        {prayers.flatMap((prayer, idx) => {
          const col = (
            <PrayerCol
              key={prayer.key}
              prayer={prayer}
              isNext={next?.prayer.key === prayer.key}
            />
          )
          if (idx === 0) {
            return [col, <ShoroukCol key="shorouk" time={data.timings.sunrise} />]
          }
          return [col]
        })}
      </div>
    </div>
  )
}
