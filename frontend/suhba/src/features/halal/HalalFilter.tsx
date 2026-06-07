import { useTranslation } from 'react-i18next'
import type { BusinessType } from '../../types'
import type { HalalFilters } from './useHalal'

interface CategoryOption {
  value: BusinessType | 'Alle'
  labelKey: string
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'Alle',         labelKey: 'halal.filter_.all' },
  { value: 'Restaurant',   labelKey: 'halal.filter_.restaurants' },
  { value: 'Café',         labelKey: 'halal.filter_.cafes' },
  { value: 'Metzgerei',    labelKey: 'halal.filter_.butchers' },
  { value: 'Lebensmittel', labelKey: 'halal.filter_.grocery' },
  { value: 'Sonstige',     labelKey: 'halal.filter_.other' },
]

interface HalalFilterProps {
  filters: HalalFilters
  onUpdate: (updates: Partial<HalalFilters>) => void
  onReset: () => void
  onApply: () => void
}

const PILL_BASE = 'px-3 py-1 rounded-full text-xs font-medium transition-colors'
const PILL_ACTIVE = 'bg-moss text-cream-card'
const PILL_INACTIVE = 'bg-cream-card border border-divider text-text-muted hover:text-text-dark'

export function HalalFilter({ filters, onUpdate, onReset, onApply }: HalalFilterProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="bg-cream-card border border-divider rounded-card p-4 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-medium mb-2">
          {t('halal.filter_.category')}
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map(({ value, labelKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdate({ type: value })}
              className={`${PILL_BASE} ${filters.type === value ? PILL_ACTIVE : PILL_INACTIVE}`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-medium mb-2">
          {t('halal.filter_.extras')}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onUpdate({ parking: !filters.parking })}
            className={`${PILL_BASE} ${filters.parking ? PILL_ACTIVE : PILL_INACTIVE}`}
          >
            {t('halal.filter_.parking')}
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-2 text-xs font-medium text-text-muted border border-divider rounded-full hover:bg-selected hover:text-cream-card hover:border-selected transition-colors"
        >
          {t('halal.filter_.reset')}
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 py-2 text-xs font-medium bg-moss text-cream-card rounded-full hover:bg-selected transition-colors"
        >
          {t('halal.filter_.apply')}
        </button>
      </div>
    </div>
  )
}
