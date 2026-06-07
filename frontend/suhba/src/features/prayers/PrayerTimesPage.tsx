import { Fragment, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, MapPin } from '@phosphor-icons/react'
import { usePrayerTimes } from './usePrayerTimes'
import { PrayerCard } from './PrayerCard'
import { ShoroukRow } from './ShoroukRow'
import { buildPrayers, getNextPrayer, formatCountdown } from './prayerUtils'

export function PrayerTimesPage(): JSX.Element {
  const { t } = useTranslation()
  const { data, loading, error, staleWarning, retry } = usePrayerTimes()

  const { prayers, next } = useMemo(() => {
    if (!data) return { prayers: [], next: null }
    const p = buildPrayers(data.timings)
    return { prayers: p, next: getNextPrayer(p) }
  }, [data])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-text-muted text-sm">{t('prayers.loading')}</p>
      </div>
    )
  }

  if (error !== null || data === null) {
    return (
      <div className="flex flex-col justify-center items-center py-20 px-6 text-center gap-4">
        <p className="text-text-muted text-sm">{t('prayers.error')}</p>
        <button
          onClick={retry}
          className="text-sm text-primary font-medium underline underline-offset-2"
        >
          {t('prayers.retry')}
        </button>
      </div>
    )
  }

  const hijriLabel = data.hijri
    ? `${data.hijri.day}. ${data.hijri.monthEn} ${data.hijri.year} H.`
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Hero header */}
      <div className="bg-hero-gradient px-5 pt-5 pb-6 shrink-0">
        <div className="flex items-center gap-1.5 text-cream-card/60 text-xs mb-3">
          <MapPin size={12} aria-hidden="true" />
          <span>Wien</span>
          <span className="mx-1">·</span>
          {hijriLabel !== null && <span>{hijriLabel}</span>}
        </div>

        {next !== null && (
          <div className="bg-white/10 rounded-card px-4 py-3 flex items-center gap-3">
            <Clock size={18} className="text-cream-card/70 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-cream-card/60 text-xs m-0">{t('prayers.nextPrayer')}</p>
              <p className="text-cream-card text-base font-semibold m-0">{next.prayer.nameDE}</p>
            </div>
            <p className="text-cream-card font-bold text-lg tabular-nums m-0 shrink-0">
              {formatCountdown(next.minutesLeft)}
            </p>
          </div>
        )}
      </div>

      {/* Stale data notice */}
      {staleWarning !== null && (
        <div className="mx-4 mt-3 rounded-card border border-sage-light bg-sage-tint px-3 py-2.5">
          <p className="text-xs text-text-muted m-0">
            {t('prayers.offlineWarning', { date: staleWarning.date })}
          </p>
        </div>
      )}

      {/* Prayer list — order: Fajr → Shorouk → Dhuhr → Asr → Maghrib → Isha */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-2 list-none p-0 m-0">
          {prayers.map((prayer, idx) => (
            <Fragment key={prayer.key}>
              <PrayerCard prayer={prayer} isNext={next?.prayer.key === prayer.key} />
              {idx === 0 && <ShoroukRow time={data.timings.sunrise} />}
            </Fragment>
          ))}
        </ul>
      </div>
    </div>
  )
}
