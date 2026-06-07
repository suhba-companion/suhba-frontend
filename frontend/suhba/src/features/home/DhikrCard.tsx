import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from '@phosphor-icons/react'
import { Modal } from '@components'
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
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="relative rounded-card overflow-hidden bg-hero-gradient p-5 text-cream-card">
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
                onClick={() => onGoTo(i)}
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
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-xs font-medium bg-white/20 hover:bg-white/30 transition-colors text-cream-card px-3 py-1 rounded-pill"
            >
              {t('dhikr.details')}
            </button>
            <button
              type="button"
              onClick={onNext}
              className="text-xs font-medium text-cream-card/80 hover:text-cream-card transition-colors flex items-center gap-1"
            >
              {t('dhikr.next')}
              <ArrowRight size={13} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal title={t('dhikr.detailTitle')} onClose={() => setShowModal(false)}>
          <div className="p-5 space-y-4">
            <div className="text-center">
              <p
                className="font-amiri text-4xl leading-relaxed text-primary mb-3"
                dir="rtl"
                lang="ar"
              >
                {current.ar}
              </p>
              <p className="text-sm italic text-text-muted mb-1">{current.latin}</p>
              <p className="text-sm text-text-muted">{current.en}</p>
            </div>

            <div className="bg-sage-tint rounded-card p-4">
              <h3 className="text-xs font-semibold text-sand uppercase tracking-wider mb-2">
                {t('dhikr.hadithLabel')}
              </h3>
              <p className="text-sm text-text-dark leading-relaxed">{current.hadithInfo}</p>
            </div>

            <div className="bg-sage-tint/50 border border-divider rounded-card p-4 flex items-center justify-between">
              <span className="text-sm text-text-muted">{t('dhikr.countLabel')}</span>
              <span className="text-sm font-semibold text-primary">{current.count}</span>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
