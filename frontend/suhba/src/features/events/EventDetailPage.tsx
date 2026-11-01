import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@components'
import { getEventById } from '@services/eventService'
import { useGeolocationState, isGeoResolved } from '@hooks/useGeolocation'
import type { Event } from '../../types'
import { EventDetailModal } from './EventDetailModal'

interface EventDetailPageProps {
  eventId: string
}

export function EventDetailPage({ eventId }: EventDetailPageProps): JSX.Element {
  const { t } = useTranslation()
  const { pos: userPos, status: geoStatus } = useGeolocationState()
  const [event, setEvent] = useState<Event | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isGeoResolved(geoStatus)) return
    let cancelled = false
    setLoading(true)
    getEventById(eventId, userPos)
      .then((e) => { if (!cancelled) setEvent(e) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [eventId, userPos, geoStatus])

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
