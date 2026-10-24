import { useTranslation } from 'react-i18next'
import {
  HandsPraying, Microphone, BookOpen, Users, Person, SoccerBall,
  HandHeart, Question, MapPin, Clock, UserPlus, NotePencil
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { buildDirectionsUrl } from '@utils/maps'
import { formatEventTime } from '@utils/eventTime'
import type { Event, EventCategory } from '../../types'
import { AUDIENCE_LABEL_KEYS } from './audience'

const CATEGORY_ICONS: Record<EventCategory, Icon> = {
  Gebet: HandsPraying,
  Vortrag: Microphone,
  Kurs: BookOpen,
  Community: Users,
  Jugend: Person,
  Sport: SoccerBall,
  Spende: HandHeart,
  'Neue Muslime': UserPlus,
  Sonstige: Question,
}

function formatDate(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleDateString('de-AT', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Vienna',
  })
}

interface EventCardProps {
  event: Event
  onSelect?: (id: string) => void
}

function openRoute(e: React.MouseEvent, event: Event): void {
  e.stopPropagation()
  window.open(buildDirectionsUrl(event), '_blank', 'noopener,noreferrer')
}

export function EventCard({ event, onSelect }: EventCardProps): JSX.Element {
  const { t } = useTranslation()
  return (
    <li
      className={[
        'bg-cream-card border border-divider rounded-card p-4 flex flex-col gap-3 shadow-sm',
        onSelect ? 'cursor-pointer hover:border-sage-light active:border-sage-light transition-colors' : '',
      ].join(' ')}
      onClick={onSelect ? () => onSelect(event.id) : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text-dark text-sm m-0 leading-snug truncate">{event.title}</p>
          {event.organizer && (
            <p className="text-text-muted text-xs mt-0.5 m-0 truncate">{event.organizer}</p>
          )}
        </div>
      </div>

      {event.categories.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 list-none m-0 p-0">
          {event.categories.map((category) => {
            const CategoryIcon = CATEGORY_ICONS[category]
            return (
              <li
                key={category}
                className="inline-flex items-center gap-1 text-text-muted text-[11px] font-semibold bg-sage-tint px-2 py-0.5 rounded-pill"
              >
                <CategoryIcon size={10} weight="bold" aria-hidden="true" />
                {category}
              </li>
            )
          })}
        </ul>
      )}

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock size={12} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{formatDate(event.startTime)}, {formatEventTime(event, t)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <MapPin size={12} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{event.address}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center flex-wrap gap-2 min-w-0">
          {event.isFree && (
            <span className="text-[11px] font-medium text-moss bg-sage-tint px-2 py-0.5 rounded-pill">
              {t('events.free')}
            </span>
          )}
          {event.requiresRegistration && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-moss bg-cream-card border border-sage-light px-2 py-0.5 rounded-pill truncate">
              <NotePencil size={11} weight="bold" aria-hidden="true" className="shrink-0" />
              {t('events.registrationRequired')}
            </span>
          )}
          {event.audience !== undefined && (
            <span className="text-[11px] font-medium text-moss bg-cream-card border border-sage-light px-2 py-0.5 rounded-pill whitespace-nowrap">
              {t(AUDIENCE_LABEL_KEYS[event.audience])}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => openRoute(e, event)}
          className="bg-primary text-cream-card text-xs font-medium px-4 py-2 rounded-pill hover:bg-moss active:bg-moss transition-colors shrink-0 min-h-[36px]"
        >
          {t('spots.route')}
        </button>
      </div>
    </li>
  )
}
