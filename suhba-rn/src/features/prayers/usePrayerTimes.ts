import { useState, useEffect, useCallback, useRef } from 'react'
import { AppState } from 'react-native'
import { fetchPrayerTimes, type PrayerTimesData } from '../../services/prayerTimesService'

export function getViennaDateKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('de-AT', {
    timeZone: 'Europe/Vienna',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

// Module-level session cache — avoids re-resolving on every render.
let sessionKey = ''
let sessionPromise: Promise<PrayerTimesData> | null = null

function getCachedPrayerTimes(dateKey: string): Promise<PrayerTimesData> {
  if (dateKey === sessionKey && sessionPromise !== null) return sessionPromise
  sessionKey = dateKey
  sessionPromise = fetchPrayerTimes(new Date())
  // A rejected promise must not be the cached answer for the rest of the day, or the
  // first failed fetch is also the last one.
  sessionPromise.catch(() => {
    if (sessionKey === dateKey) {
      sessionKey = ''
      sessionPromise = null
    }
  })
  return sessionPromise
}

interface UsePrayerTimesReturn {
  data: PrayerTimesData | null
  loading: boolean
  error: Error | null
  retry: () => void
}

export function usePrayerTimes(): UsePrayerTimesReturn {
  const [data, setData] = useState<PrayerTimesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadCount, setReloadCount] = useState(0)
  const loadedKey = useRef('')

  const retry = useCallback((): void => {
    sessionKey = ''
    sessionPromise = null
    setReloadCount((c) => c + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    const dateKey = getViennaDateKey()
    loadedKey.current = dateKey
    setLoading(true)
    getCachedPrayerTimes(dateKey)
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error('Unbekannter Fehler'))
        setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadCount])

  // A browser tab gets reloaded overnight; an app stays in memory for days and would
  // otherwise show yesterday's times and count down to a prayer that has passed.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') return
      if (getViennaDateKey() !== loadedKey.current) retry()
    })
    return () => sub.remove()
  }, [retry])

  return { data, loading, error, retry }
}
