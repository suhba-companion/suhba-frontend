import { useTranslation } from 'react-i18next'
import { House, Mosque, Calendar, BookOpen } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

export type NavTab = 'start' | 'orte' | 'halal' | 'events' | 'azkar'

interface NavBarProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

const NAV_ICONS: Record<NavTab, Icon | null> = {
  start: House,
  orte: Mosque,
  halal: null,
  events: Calendar,
  azkar: BookOpen,
}

export function NavBar({ activeTab, onTabChange }: NavBarProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <nav
      className="bg-cream-card border-t border-divider flex items-stretch shrink-0 h-16 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]"
      aria-label={t('nav.label')}
    >
      {(['start', 'orte', 'halal', 'events', 'azkar'] as NavTab[]).map((id) => {
        const isActive = id === activeTab
        const IconComp = NAV_ICONS[id]
        return (
          <button
            key={id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onTabChange(id)}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-0.5',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              isActive ? 'text-primary' : 'text-primary/35',
            ].join(' ')}
          >
            {IconComp !== null ? (
              <IconComp
                size={22}
                weight={isActive ? 'fill' : 'regular'}
                aria-hidden="true"
              />
            ) : (
              <span
                className={[
                  'font-amiri text-xl leading-none',
                  isActive ? 'text-primary' : 'text-primary/35',
                ].join(' ')}
                aria-hidden="true"
              >
                حلال
              </span>
            )}
            <span className="text-[11px] font-medium">{t(`nav.${id}`)}</span>
          </button>
        )
      })}
    </nav>
  )
}
