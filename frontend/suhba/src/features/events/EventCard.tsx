import { useTranslation } from 'react-i18next'
import {
  HandsPraying, Microphone, BookOpen, Users, Person, SoccerBall,
  HandHeart, Question, MapPin, Clock
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { Event, EventCategory } from '../../types'

const CATEGORY_ICONS: Record<EventCategory, Icon> = {
  Gebet: HandsPraying,
  Vortrag: Microphone,
  Kurs: BookOpen,
  Community: Users,
  Jugend: Person,
  Sport: SoccerBall,
  Spende: HandHeart,
  Sonstige: Question,
}


function formatDate(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleDateString('de-AT', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })
}

interface EventCardProps {
  event: Event
  onSelect?: (id: string) => void
}

export function EventCard({ event, onSelect }: EventCardProps): JSX.Element {
  const { t } = useTranslation()
  const CategoryIcon = CATEGORY_ICONS[event.category]

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
        <span className="inline-flex items-center gap-1 text-text-muted text-[11px] font-semibold shrink-0 bg-sage-tint px-2 py-0.5 rounded-pill">
          <CategoryIcon size={10} weight="bold" aria-hidden="true" />
          {event.category}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock size={12} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{formatDate(event.startTime)}, {formatTime(event.startTime)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <MapPin size={12} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{event.address}</span>
        </div>
      </div>

      {(event.distanceKm !== undefined || event.isFree) && (
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-text-muted text-xs">
            {event.distanceKm !== undefined && `${event.distanceKm} km`}
          </span>
          {event.isFree && (
            <span className="text-[11px] font-medium text-moss bg-sage-tint px-2 py-0.5 rounded-pill">
              {t('events.free')}
            </span>
          )}
        </div>
      )}
    </li>
  )
}
