import { useTranslation } from 'react-i18next'
import type { SpotType } from '../../types'
import type { SpotFilters } from './useSpots'

interface TypeOption {
  value: SpotType | 'Alle'
  labelKey: string
}

const TYPE_OPTIONS: TypeOption[] = [
  { value: 'Alle',       labelKey: 'spots.filter_.typeAll' },
  { value: 'Moschee',   labelKey: 'spots.filter_.typeMoscheen' },
  { value: 'Gebetsort', labelKey: 'spots.filter_.typeGebetsorte' },
  { value: 'Sonstige',  labelKey: 'spots.filter_.typeSonstige' },
]

interface AmenityOption {
  key: keyof Pick<SpotFilters, 'juma' | 'wudu' | 'sisters' | 'parking' | 'hijab' | 'prayerClothes' | 'openNow'>
  labelKey: string
}

const AMENITY_OPTIONS: AmenityOption[] = [
  { key: 'juma',         labelKey: 'spots.filter_.amenityJuma' },
  { key: 'wudu',         labelKey: 'spots.filter_.amenityWudu' },
  { key: 'sisters',      labelKey: 'spots.filter_.amenitySisters' },
  { key: 'parking',      labelKey: 'spots.filter_.amenityParking' },
  { key: 'hijab',        labelKey: 'spots.filter_.amenityHijab' },
  { key: 'prayerClothes', labelKey: 'spots.filter_.amenityPrayerClothes' },
  { key: 'openNow',      labelKey: 'spots.filter_.amenityOpen' },
]

interface SpotsFilterProps {
  filters: SpotFilters
  onUpdate: (updates: Partial<SpotFilters>) => void
  onReset: () => void
  onApply: () => void
}

const PILL_BASE = 'px-3 py-1 rounded-full text-xs font-medium transition-colors'
const PILL_ACTIVE = 'bg-moss text-cream-card'
const PILL_INACTIVE = 'bg-cream-card border border-divider text-text-muted hover:text-text-dark'

export function SpotsFilter({ filters, onUpdate, onReset, onApply }: SpotsFilterProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="bg-cream-card border border-divider rounded-card p-4 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-medium mb-2">
          {t('spots.filter_.type')}
        </p>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(({ value, labelKey }) => (
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
          {t('spots.filter_.amenities')}
        </p>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              onClick={() => onUpdate({ [key]: !filters[key] })}
              className={`${PILL_BASE} ${filters[key] ? PILL_ACTIVE : PILL_INACTIVE}`}
            >
              {t(labelKey)}
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
          {t('spots.filter_.reset')}
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 py-2 text-xs font-medium bg-moss text-cream-card rounded-full hover:bg-selected transition-colors"
        >
          {t('spots.filter_.apply')}
        </button>
      </div>
    </div>
  )
}
