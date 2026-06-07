import { useTranslation } from 'react-i18next'
import type { EventFilter } from './useEvents'
import type { EventCategory } from '../../types'

const TIME_OPTIONS: { value: EventFilter; labelKey: string }[] = [
  { value: 'Alle',          labelKey: 'events.filterAll' },
  { value: 'Heute',         labelKey: 'events.filterToday' },
  { value: 'Diese Woche',   labelKey: 'events.filterThisWeek' },
]

const CATEGORY_OPTIONS: EventCategory[] = [
  'Gebet', 'Vortrag', 'Kurs', 'Community', 'Jugend', 'Sport', 'Spende',
]

interface EventsFilterProps {
  activeFilter: EventFilter
  onSetFilter: (f: EventFilter) => void
  onReset: () => void
  onApply: () => void
}

const PILL_BASE = 'px-3 py-1 rounded-full text-xs font-medium transition-colors'
const PILL_ACTIVE = 'bg-moss text-cream-card'
const PILL_INACTIVE = 'bg-cream-card border border-divider text-text-muted hover:text-text-dark'

export function EventsFilter({ activeFilter, onSetFilter, onReset, onApply }: EventsFilterProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="bg-cream-card border border-divider rounded-card p-4 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-medium mb-2">
          {t('events.filter_.time')}
        </p>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map(({ value, labelKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => onSetFilter(value)}
              className={`${PILL_BASE} ${activeFilter === value ? PILL_ACTIVE : PILL_INACTIVE}`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-medium mb-2">
          {t('events.filter_.category')}
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSetFilter(cat)}
              className={`${PILL_BASE} ${activeFilter === cat ? PILL_ACTIVE : PILL_INACTIVE}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-2 text-xs font-medium text-text-muted border border-divider rounded-full hover:bg-selected hover:text-cream-card hover:border-selected transition-colors"
        >
          {t('events.filter_.reset')}
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 py-2 text-xs font-medium bg-moss text-cream-card rounded-full hover:bg-selected transition-colors"
        >
          {t('events.filter_.apply')}
        </button>
      </div>
    </div>
  )
}
