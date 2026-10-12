import { useTranslation } from 'react-i18next'

const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const STROKE_WIDTH = 7
const TRACK_OPACITY = 0.12

interface CounterRingProps {
  count: number
  target: number
  complete: boolean
}

export function CounterRing({ count, target, complete }: CounterRingProps): JSX.Element {
  const { t } = useTranslation()
  const dashOffset = CIRCUMFERENCE * (1 - Math.min(1, count / target))

  return (
    <div className="relative w-[min(68vw,16rem)] h-[min(68vw,16rem)] max-w-full max-h-full">
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <circle
          cx="100" cy="100" r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          strokeOpacity={TRACK_OPACITY}
          className="stroke-[var(--color-cream-card)]"
        />
        <circle
          cx="100" cy="100" r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className={[
            'transition-all duration-300',
            complete ? 'stroke-[var(--color-sage-light)]' : 'stroke-[var(--color-cream-card)]',
          ].join(' ')}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {complete ? (
          <p className="font-amiri text-[clamp(1.75rem,9vw,2.25rem)] text-cream-card m-0" lang="ar">
            {t('azkar.counter.mashallah')}
          </p>
        ) : (
          <>
            <span className="text-[clamp(3rem,18vw,4.5rem)] font-bold text-cream-card tabular-nums leading-none">
              {count}
            </span>
            <span className="text-cream-card/50 text-sm mt-1">
              {t('azkar.counter.of', { target })}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
