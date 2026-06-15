import { useTranslation } from 'react-i18next'
import { House, Mosque, CalendarCheck, BookOpen } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { NavTab } from './NavBar'

interface SideBarItem {
  id: NavTab
  renderIcon: (isActive: boolean) => React.ReactNode
}

function PhosphorIcon({ IconComponent, isActive }: { IconComponent: Icon; isActive: boolean }): JSX.Element {
  return <IconComponent weight={isActive ? 'fill' : 'regular'} size={22} aria-hidden="true" />
}

function HalalArabicIcon(): JSX.Element {
  return (
    <span
      aria-hidden="true"
      style={{ fontFamily: "'Amiri', serif" }}
      className="text-[18px] leading-none font-bold select-none"
    >
      حلال
    </span>
  )
}

const SIDE_ITEMS: SideBarItem[] = [
  { id: 'start',  renderIcon: (a) => <PhosphorIcon IconComponent={House} isActive={a} /> },
  { id: 'orte',   renderIcon: (a) => <PhosphorIcon IconComponent={Mosque} isActive={a} /> },
  { id: 'halal',  renderIcon: () => <HalalArabicIcon /> },
  { id: 'events', renderIcon: (a) => <PhosphorIcon IconComponent={CalendarCheck} isActive={a} /> },
  { id: 'azkar',  renderIcon: (a) => <PhosphorIcon IconComponent={BookOpen} isActive={a} /> },
]

interface SideBarProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

export function SideBar({ activeTab, onTabChange }: SideBarProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <aside className="hidden lg:flex flex-col w-52 bg-hero-gradient border-r border-white/10 shrink-0 h-full">
      <div className="flex items-center px-5 h-14 shrink-0 border-b border-white/10">
        <span className="text-cream-card font-semibold text-lg tracking-wide">Suhba</span>
      </div>

      <nav className="flex-1 py-2" aria-label={t('nav.label')}>
        {SIDE_ITEMS.map((item) => {
          const isActive = item.id === activeTab
          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onTabChange(item.id)}
              className={[
                'w-full flex items-center gap-3 px-4 py-2.5 mx-2 rounded-card relative transition-all border',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                'w-[calc(100%-1rem)]',
                isActive
                  ? 'bg-white/20 text-cream-card border-white/20'
                  : 'text-cream-card border-transparent hover:bg-white/10 hover:border-white/30',
              ].join(' ')}
            >
              {item.renderIcon(isActive)}
              <span className="text-sm font-medium">{t(`nav.${item.id}`)}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
