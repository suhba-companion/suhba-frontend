import { useState, useEffect, useCallback } from 'react'
import { X, ArrowCounterClockwise } from '@phosphor-icons/react'
import type { Dhikr } from '../../types'

const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function parseTarget(countStr: string): number {
  const n = parseInt(countStr, 10)
  return isNaN(n) || n <= 0 ? 33 : n
}

interface RingProps {
  count: number
  target: number
  complete: boolean
}

function Ring({ count, target, complete }: RingProps): JSX.Element {
  const dashOffset = CIRCUMFERENCE * (1 - Math.min(1, count / target))

  return (
    <div className="relative w-64 h-64">
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="100" cy="100" r={RADIUS}
          fill="none"
          stroke="rgba(247,242,232,0.12)"
          strokeWidth="7"
        />
        {/* Progress arc */}
        <circle
          cx="100" cy="100" r={RADIUS}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="transition-all duration-300"
          style={{ stroke: complete ? 'var(--color-sage-light)' : 'var(--color-cream-card)' }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {complete ? (
          <p className="font-amiri text-4xl text-cream-card m-0" lang="ar">
            ما شاء الله
          </p>
        ) : (
          <>
            <span className="text-7xl font-bold text-cream-card tabular-nums leading-none">
              {count}
            </span>
            <span className="text-cream-card/50 text-sm mt-1">von {target}</span>
          </>
        )}
      </div>
    </div>
  )
}

interface AzkarCounterModalProps {
  dhikr: Dhikr
  onClose: () => void
}

export function AzkarCounterModal({ dhikr, onClose }: AzkarCounterModalProps): JSX.Element {
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
      if (e.key === ' ' || e.key === 'Enter') increment()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, increment])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-hero-gradient"
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0">
        <button
          type="button"
          onClick={reset}
          aria-label="Zurücksetzen"
          className="p-2 rounded-full text-cream-card/60 hover:text-cream-card hover:bg-white/10 transition-colors"
        >
          <ArrowCounterClockwise size={22} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="p-2 rounded-full text-cream-card/60 hover:text-cream-card hover:bg-white/10 transition-colors"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      {/* Dhikr text */}
      <div className="px-6 pt-2 shrink-0 text-center space-y-1">
        <p
          className="font-amiri text-2xl text-cream-card leading-relaxed m-0"
          dir="rtl"
          lang="ar"
        >
          {dhikr.ar}
        </p>
        <p
          className="text-cream-card/55 text-sm italic m-0"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {dhikr.latin}
        </p>
      </div>

      {/* Ring — tap area */}
      <button
        type="button"
        onClick={increment}
        disabled={complete}
        aria-label={`${count} von ${target}`}
        className="flex-1 flex items-center justify-center focus-visible:outline-none select-none"
      >
        <Ring count={count} target={target} complete={complete} />
      </button>

      {/* CTA */}
      <div className="px-6 pb-10 shrink-0">
        <button
          type="button"
          onClick={complete ? onClose : increment}
          className={[
            'w-full py-4 rounded-card text-base font-semibold transition-colors',
            complete
              ? 'bg-cream-card text-primary'
              : 'bg-primary text-cream-card hover:bg-moss',
          ].join(' ')}
        >
          {complete ? 'Fertig · Alhamdulillah' : 'Tippe zum Zählen'}
        </button>
      </div>
    </div>
  )
}
