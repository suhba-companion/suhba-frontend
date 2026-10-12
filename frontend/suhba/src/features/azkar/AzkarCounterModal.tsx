import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X, ArrowCounterClockwise } from '@phosphor-icons/react'
import { CounterRing } from './CounterRing'
import type { Dhikr } from '../../types'

const FALLBACK_TARGET = 33

function parseTarget(countStr: string): number {
  const n = parseInt(countStr, 10)
  return isNaN(n) || n <= 0 ? FALLBACK_TARGET : n
}

interface AzkarCounterModalProps {
  dhikr: Dhikr
  onClose: () => void
}

export function AzkarCounterModal({ dhikr, onClose }: AzkarCounterModalProps): JSX.Element {
  const { t } = useTranslation()
  const target = parseTarget(dhikr.count)
  const [count, setCount] = useState(0)
  const complete = count >= target

  const increment = useCallback((): void => {
    setCount((c) => Math.min(target, c + 1))
  }, [target])

  const reset = useCallback((): void => {
    setCount(0)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ' || e.key === 'Enter') {
        // Sonst zählt der Browser den Treffer doppelt: Keydown plus erzeugter Klick.
        e.preventDefault()
        increment()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, increment])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 h-[100dvh] w-screen flex flex-col bg-hero-gradient select-none touch-manipulation overscroll-contain pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] [-webkit-tap-highlight-color:transparent]"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <button
          type="button"
          onClick={reset}
          aria-label={t('azkar.counter.reset')}
          className="p-3 -m-1 rounded-full text-cream-card/60 hover:text-cream-card hover:bg-white/10 transition-colors"
        >
          <ArrowCounterClockwise size={22} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('azkar.counter.close')}
          className="p-3 -m-1 rounded-full text-cream-card/60 hover:text-cream-card hover:bg-white/10 transition-colors"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="px-6 shrink-0 text-center space-y-1 max-h-[38dvh] overflow-y-auto overscroll-contain">
        <p
          className="font-amiri text-[clamp(1.15rem,5.5vw,1.6rem)] text-cream-card leading-relaxed m-0"
          dir="rtl"
          lang="ar"
        >
          {dhikr.ar}
        </p>
        <p className="font-georgia text-cream-card/55 text-[clamp(0.75rem,3.4vw,0.875rem)] italic m-0">
          {dhikr.latin}
        </p>
      </div>

      <button
        type="button"
        onClick={increment}
        disabled={complete}
        aria-label={t('azkar.counter.progress', { current: count, target })}
        className="flex-1 min-h-0 w-full flex items-center justify-center py-4 focus-visible:outline-none active:scale-95 transition-transform"
      >
        <CounterRing count={count} target={target} complete={complete} />
      </button>

      <div className="px-6 pb-6 shrink-0">
        <button
          type="button"
          onClick={complete ? onClose : increment}
          className={[
            'w-full py-4 rounded-card text-base font-semibold transition-colors',
            complete
              ? 'bg-cream-card text-primary'
              : 'bg-moss text-cream-card hover:bg-selected',
          ].join(' ')}
        >
          {complete ? t('azkar.counter.done') : t('azkar.counter.tapToCount')}
        </button>
      </div>
    </div>,
    document.body,
  )
}
