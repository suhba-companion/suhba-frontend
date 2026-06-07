import { useTranslation } from 'react-i18next'
import { ForkKnife, Coffee, Knife, ShoppingBag, Moon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { HalalBusiness, BusinessType } from '../../types'

const TYPE_ICONS: Record<BusinessType, Icon> = {
  Restaurant: ForkKnife,
  Café: Coffee,
  Metzgerei: Knife,
  Lebensmittel: ShoppingBag,
  Sonstige: Moon,
}

interface HalalFeaturedCardProps {
  business: HalalBusiness
  onSelect?: (id: string) => void
}

export function HalalFeaturedCard({ business, onSelect }: HalalFeaturedCardProps): JSX.Element {
  const { t } = useTranslation()
  const TypeIcon = TYPE_ICONS[business.type]

  return (
    <div
      className={[
        'bg-cream-card border border-divider rounded-card overflow-hidden shadow-sm',
        onSelect !== undefined ? 'cursor-pointer hover:border-sage-light active:border-sage-light transition-colors' : '',
      ].join(' ')}
      onClick={onSelect !== undefined ? () => onSelect(business.id) : undefined}
    >
      <div className="bg-hero-gradient h-20 flex items-center justify-center relative">
        <TypeIcon
          size={32}
          weight="duotone"
          className="text-cream-card"
          aria-hidden="true"
          data-testid="type-icon"
        />
        <span className="absolute top-2 right-2 bg-sand text-cream-card text-[10px] font-semibold px-2 py-0.5 rounded-pill">
          {t('halal.featured')}
        </span>
      </div>
      <div className="p-3 space-y-0.5">
        <p className="font-semibold text-text-dark text-sm m-0 truncate">{business.name}</p>
        {business.distanceKm !== undefined && (
          <p className="text-text-muted text-xs m-0">{business.distanceKm} km</p>
        )}
      </div>
    </div>
  )
}
