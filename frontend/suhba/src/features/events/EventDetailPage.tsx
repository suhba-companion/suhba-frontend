import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@components'
import { getEventById } from '@services/eventService'
import type { Event } from '../../types'
import { EventDetailModal } from './EventDetailModal'

interface EventDetailPageProps {
  eventId: string
}

export function EventDetailPage({ eventId }: EventDetailPageProps): JSX.Element {
  const { t } = useTranslation()
  const [event, setEvent] = useState<Event | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getEventById(eventId)
      .then(setEvent)
      .finally(() => setLoading(false))
  }, [eventId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-10">
        <Spinner size={36} />
      </div>
    )
  }

  if (event === undefined) {
    return (
      <div className="flex items-center justify-center h-full py-10 text-text-muted text-sm">
        {t('events.notFound')}
      </div>
    )
  }

  return <EventDetailModal event={event} />
}
