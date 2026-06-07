import { useTranslation } from 'react-i18next'
import { Mosque, Calendar, BookOpen } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { NavTab } from '@components'

interface QuickTile {
  readonly id: string
  readonly Icon: Icon | null
  readonly labelKey: string
  readonly tab: NavTab
}

const TILES: readonly QuickTile[] = [
  { id: 'orte',   Icon: Mosque,   labelKey: 'home.tiles.orte.label',   tab: 'orte' },
  { id: 'halal',  Icon: null,     labelKey: 'home.tiles.halal.label',  tab: 'halal' },
  { id: 'events', Icon: Calendar, labelKey: 'home.tiles.events.label', tab: 'events' },
  { id: 'azkar',  Icon: BookOpen, labelKey: 'home.tiles.azkar.label',  tab: 'azkar' },
]

interface QuickGridProps {
  onNavigate: (tab: NavTab) => void
}

export function QuickGrid({ onNavigate }: QuickGridProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-3">
      {TILES.map((tile) => (
        <button
          key={tile.id}
          type="button"
          onClick={() => onNavigate(tile.tab)}
          className="bg-tip-gradient rounded-card py-4 px-2 flex flex-col items-center gap-2 hover:opacity-90 active:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {tile.Icon !== null ? (
            <tile.Icon size={24} weight="duotone" className="text-cream-card" aria-hidden="true" />
          ) : (
            <span className="font-amiri text-2xl leading-none text-cream-card" aria-hidden="true">حلال</span>
          )}
          <span className="font-semibold text-cream-card text-xs text-center leading-tight">
            {t(tile.labelKey)}
          </span>
        </button>
      ))}
    </div>
  )
}
