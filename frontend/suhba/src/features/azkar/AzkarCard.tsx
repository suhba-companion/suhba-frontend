import { useTranslation } from 'react-i18next'
import type { Dhikr } from '../../types'

interface AzkarCardProps {
  dhikr: Dhikr
  onSelect?: (dhikr: Dhikr) => void
}

export function AzkarCard({ dhikr, onSelect }: AzkarCardProps): JSX.Element {
  const { t } = useTranslation()
  const selectable = onSelect !== undefined

  return (
    <li
      className={[
        'bg-cream-card border border-divider rounded-card shadow-sm overflow-hidden',
        selectable ? 'cursor-pointer hover:border-sage-light active:scale-[0.99] transition-all' : '',
      ].join(' ')}
      onClick={selectable ? () => onSelect(dhikr) : undefined}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <span
          className="bg-primary text-cream-card text-xs font-bold px-3 py-1 rounded-pill"
          aria-label={t('azkar.repetitions', { count: dhikr.count })}
        >
          {dhikr.count}
        </span>
        {selectable && (
          <span className="text-[11px] text-text-muted">Tippen zum Zählen →</span>
        )}
      </div>

      <p
        className="font-amiri text-[1.65rem] text-text-dark leading-loose text-right m-0 px-4 pb-5"
        dir="rtl"
        lang="ar"
      >
        {dhikr.ar}
      </p>

      <div className="border-t border-divider px-4 py-3 space-y-1.5">
        <p className="text-sm italic text-moss m-0" style={{ fontFamily: 'Georgia, serif' }}>
          {dhikr.latin}
        </p>
        <p className="text-[13px] text-text-muted m-0 leading-relaxed">{dhikr.en}</p>
      </div>
    </li>
  )
}
