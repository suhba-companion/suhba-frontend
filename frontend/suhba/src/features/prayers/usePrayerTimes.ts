import { useState, useEffect, useCallback } from 'react'
import { fetchPrayerTimes, type PrayerTimesData } from '@services/prayerTimesService'

function getViennaDateKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('de-AT', {
    timeZone: 'Europe/Vienna',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

// Module-level session cache — avoids re-resolving on every render
let sessionKey = ''
let sessionPromise: Promise<PrayerTimesData> | null = null

function getCachedPrayerTimes(dateKey: string): Promise<PrayerTimesData> {
  if (dateKey === sessionKey && sessionPromise !== null) return sessionPromise
  sessionKey = dateKey
  sessionPromise = fetchPrayerTimes(new Date())
  return sessionPromise
}

export interface StaleWarning {
  date: string
}

interface UsePrayerTimesReturn {
  data: PrayerTimesData | null
  loading: boolean
  error: Error | null
  staleWarning: StaleWarning | null
  retry: () => void
}

export function usePrayerTimes(): UsePrayerTimesReturn {
  const [data, setData] = useState<PrayerTimesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const retry = useCallback((): void => {
    sessionKey = ''
    sessionPromise = null
    setRetryCount((c) => c + 1)
  }, [])

  useEffect(() => {
    const dateKey = getViennaDateKey()
    setLoading(true)
    getCachedPrayerTimes(dateKey)
      .then((result) => {
        setData(result)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error('Unbekannter Fehler'))
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [retryCount])

  return { data, loading, error, staleWarning: null, retry }
}
