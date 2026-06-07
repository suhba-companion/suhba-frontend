import { SunHorizon, Sun, Moon } from '@phosphor-icons/react'
import type { Prayer, PrayerKey } from './prayerUtils'

const ICONS: Record<PrayerKey, typeof SunHorizon> = {
  fajr:    SunHorizon,
  dhuhr:   Sun,
  asr:     Sun,
  maghrib: SunHorizon,
  isha:    Moon,
}

interface PrayerCardProps {
  prayer: Prayer
  isNext: boolean
}

export function PrayerCard({ prayer, isNext }: PrayerCardProps): JSX.Element {
  const IconComp = ICONS[prayer.key]

  return (
    <li
      className={[
        'flex items-center gap-4 rounded-card px-4 py-3 border transition-all',
        isNext
          ? 'bg-primary border-primary text-cream-card'
          : 'bg-cream-card border-divider text-text-dark',
      ].join(' ')}
    >
      <div
        className={[
          'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
          isNext ? 'bg-white/15' : 'bg-cream-bg',
        ].join(' ')}
      >
        <IconComp
          size={20}
          weight="regular"
          aria-hidden="true"
          className={isNext ? 'text-cream-card' : 'text-primary'}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className={['text-sm font-semibold m-0', isNext ? 'text-cream-card' : 'text-text-dark'].join(' ')}>
          {prayer.nameDE}
        </p>
        <p
          className={['text-xs m-0 font-amiri', isNext ? 'text-cream-card/70' : 'text-text-muted'].join(' ')}
          dir="rtl"
          lang="ar"
        >
          {prayer.nameAR}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className={['text-lg font-bold tabular-nums m-0', isNext ? 'text-cream-card' : 'text-text-dark'].join(' ')}>
          {prayer.time}
        </p>
        {isNext && (
          <p className="text-[10px] text-cream-card/60 m-0 uppercase tracking-wide">Nächstes</p>
        )}
      </div>
    </li>
  )
}
