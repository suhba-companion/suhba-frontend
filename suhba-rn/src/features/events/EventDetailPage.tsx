import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { getEventById } from '../../services/eventService'
import type { Event } from '../../types'
import { EventDetailModal } from './EventDetailModal'

export function EventDetailPage({ eventId }: { eventId: string }): React.JSX.Element {
  const { t } = useTranslation()
  const [event, setEvent] = useState<Event | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getEventById(eventId)
      .then((result) => {
        if (cancelled) return
        setEvent(result)
        setError(null)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [eventId, reload])

  if (loading) return <LoadingState size={36} />
  if (error !== null) {
    return <ErrorState label={t('home.nearbyError')} onRetry={() => setReload((c) => c + 1)} />
  }
  if (event === undefined) return <EmptyState label={t('events.notFound')} />

  return <EventDetailModal event={event} />
}
