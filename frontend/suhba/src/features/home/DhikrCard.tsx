import { useState, type KeyboardEvent, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CircleNotch } from '@phosphor-icons/react'
import { AzkarCounterModal } from '@features/azkar'
import type { Dhikr } from '../../types'

interface DhikrCardProps {
  current: Dhikr
  total: number
  index: number
  onNext: () => void
  onGoTo: (i: number) => void
}

export function DhikrCard({ current, total, index, onNext, onGoTo }: DhikrCardProps): JSX.Element {
  const { t } = useTranslation()
  const [counting, setCounting] = useState(false)

  const openCounter = (): void => setCounting(true)

  const onCardKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openCounter()
    }
  }

  // Die Navigation sitzt in der Karte, darf aber nicht den Zähler öffnen.
  const withoutOpeningCounter = (action: () => void) => (e: MouseEvent): void => {
    e.stopPropagation()
    action()
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openCounter}
        onKeyDown={onCardKeyDown}
        aria-label={t('dhikr.openCounter')}
        className="relative rounded-card overflow-hidden bg-hero-gradient p-5 text-cream-card cursor-pointer active:scale-[0.99] transition-transform"
      >
        <svg
          className="absolute -top-10 -right-10 opacity-10 pointer-events-none"
          width="200"
          height="200"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="42" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        <div className="relative flex items-start justify-between mb-4">
          <span className="bg-white/20 text-cream-card text-xs font-semibold px-3 py-1 rounded-pill">
            {current.count}
          </span>
        </div>

        <p
          className="relative font-amiri text-3xl leading-relaxed text-right mb-2"
          dir="rtl"
          lang="ar"
        >
          {current.ar}
        </p>
        <p className="text-sm italic text-cream-card/80 mb-1">{current.latin}</p>
        <p className="text-sm text-cream-card/70 mb-4">{current.en}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2" role="group" aria-label={t('dhikr.navGroup')}>
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={withoutOpeningCounter(() => onGoTo(i))}
                aria-label={t('dhikr.navItem', { number: i + 1, total })}
                aria-current={i === index ? true : undefined}
                className={[
                  'rounded-full transition-all',
                  i === index
                    ? 'w-4 h-2 bg-cream-card'
                    : 'w-2 h-2 bg-cream-card/40 hover:bg-cream-card/60',
                ].join(' ')}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            {/* Zeigt an, dass die Karte den Zähler öffnet; die Karte selbst ist der Button. */}
            <CircleNotch
              size={18}
              weight="bold"
              aria-hidden="true"
              className="text-cream-card/70"
            />
            <button
              type="button"
              onClick={withoutOpeningCounter(onNext)}
              className="text-xs font-medium text-cream-card/80 hover:text-cream-card transition-colors flex items-center gap-1"
            >
              {t('dhikr.next')}
              <ArrowRight size={13} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {counting && <AzkarCounterModal dhikr={current} onClose={() => setCounting(false)} />}
    </>
  )
}
