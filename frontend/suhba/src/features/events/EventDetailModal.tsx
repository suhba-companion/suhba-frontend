import { useTranslation } from 'react-i18next'
import {
  HandsPraying, Microphone, BookOpen, Users, Person, SoccerBall,
  HandHeart, Question, MapPin, Clock, Phone, ArrowSquareOut,
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

const CATEGORY_COLORS: Record<EventCategory, string> = {
  Gebet: 'bg-emerald-100 text-emerald-800',
  Vortrag: 'bg-blue-100 text-blue-800',
  Kurs: 'bg-purple-100 text-purple-800',
  Community: 'bg-orange-100 text-orange-800',
  Jugend: 'bg-yellow-100 text-yellow-800',
  Sport: 'bg-red-100 text-red-800',
  Spende: 'bg-pink-100 text-pink-800',
  Sonstige: 'bg-gray-100 text-gray-800',
}

function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('de-AT', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('de-AT', {
    hour: '2-digit', minute: '2-digit',
  })
}

interface EventDetailModalProps {
  event: Event
}

export function EventDetailModal({ event }: EventDetailModalProps): JSX.Element {
  const { t } = useTranslation()
  const CategoryIcon = CATEGORY_ICONS[event.category]
  const colorClass = CATEGORY_COLORS[event.category]

  function handleRoute(): void {
    const url = event.googleMapsUrl ?? `https://maps.google.com/maps?daddr=${event.lat},${event.lng}&travelmode=transit`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <div className="bg-cream-card px-5 pt-5 pb-4 border-b border-divider">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-pill ${colorClass}`}>
            <CategoryIcon size={11} weight="bold" aria-hidden="true" />
            {event.category}
          </span>
          {event.isFree && (
            <span className="text-xs font-medium text-primary bg-sage-tint px-2.5 py-1 rounded-pill">
              {t('events.free')}
            </span>
          )}
        </div>
        <h3 className="text-xl font-semibold text-text-dark leading-snug mb-2">{event.title}</h3>
        {event.distanceKm !== undefined && (
          <p className="text-text-muted text-sm">{event.distanceKm} km</p>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3 bg-sage-tint rounded-card p-4">
          <Clock size={18} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-text-dark">{formatDate(event.startTime)}</p>
            <p className="text-sm text-text-muted">
              {formatTime(event.startTime)}
              {event.endTime !== undefined && ` – ${formatTime(event.endTime)}`}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm text-text-dark">{event.address}</p>
            <p className="text-xs text-text-muted">{event.district}</p>
          </div>
        </div>

        {event.organizer !== undefined && (
          <div className="flex items-start gap-3">
            <Users size={18} className="text-text-muted mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-text-dark">{event.organizer}</p>
          </div>
        )}

        {event.contactInfo !== undefined && (
          <div className="flex items-start gap-3">
            <Phone size={18} className="text-text-muted mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-text-dark">{event.contactInfo}</p>
          </div>
        )}

        {event.description !== undefined && (
          <p className="text-sm text-text-muted leading-relaxed">{event.description}</p>
        )}

        <button
          type="button"
          onClick={handleRoute}
          className="w-full py-3 text-sm font-medium text-cream-card bg-primary rounded-card hover:bg-moss active:bg-moss transition-colors flex items-center justify-center gap-2"
        >
          <ArrowSquareOut size={16} aria-hidden="true" />
          {t('spots.route')}
        </button>
      </div>
    </div>
  )
}
