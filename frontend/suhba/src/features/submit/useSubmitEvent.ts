import { useState } from 'react'
import i18next from 'i18next'
import type { EventAudience, EventCategory, EventRecurrence, PrayerName } from '../../types'
import { toSafeHttpUrl } from '@utils/url'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// Vienna centre — used when the user doesn't pick a precise location
const VIENNA_LAT = 48.2082
const VIENNA_LNG = 16.3738

const PRAYER_TO_ENUM: Record<PrayerName, string> = {
  Fajr:    'FAJR',
  Dhuhr:   'DHUHR',
  Asr:     'ASR',
  Maghrib: 'MAGHRIB',
  Isha:    'ISHA',
}

const AUDIENCE_TO_ENUM: Record<EventAudience, string> = {
  'Nur Schwestern': 'SISTERS_ONLY',
  'Nur Brüder':     'BROTHERS_ONLY',
}

const RECURRENCE_TO_ENUM: Record<EventRecurrence, string> = {
  'Wöchentlich':     'WEEKLY',
  'Zweiwöchentlich': 'BIWEEKLY',
  'Monatlich':       'MONTHLY',
}

const CATEGORY_TO_ENUM: Record<EventCategory, string> = {
  Gebet:     'PRAYER',
  Vortrag:   'LECTURE',
  Kurs:      'CLASS',
  Community: 'COMMUNITY',
  Jugend:    'YOUTH',
  Sport:     'SPORT',
  Spende:    'FUNDRAISER',
  'Neue Muslime': 'NEW_MUSLIMS',
  Sonstige:  'OTHER',
}

function toInstant(datetimeLocal: string): string {
  // datetime-local gives "YYYY-MM-DDTHH:mm" as *local* wall-clock time. Date parses it
  // in the browser's zone, so toISOString() yields the real UTC instant the backend stores.
  const parsed = new Date(datetimeLocal)
  return Number.isNaN(parsed.getTime()) ? datetimeLocal : parsed.toISOString()
}

interface EventFormData {
  title: string
  categories: EventCategory[]
  address: string
  district: string
  startTime: string
  endTime: string
  // Empty when the event starts at a clock time; a prayer when the announcement only
  // says "nach dem Maghrib-Gebet". The backend then derives startTime's time of day.
  startPrayer: PrayerName | ''
  // Empty for a one-off event. When set, startTime is the first occurrence of a series
  // and the app works the later ones out itself.
  recurrence: EventRecurrence | ''
  // "YYYY-MM-DD"; empty means the series runs open-ended.
  recurrenceUntil: string
  description: string
  organizer: string
  registrationUrl: string
  requiresRegistration: boolean
  // Empty when the event is open to everyone, which is the default.
  audience: EventAudience | ''
  isFree: boolean
}

type EventFormErrors = Partial<Record<keyof EventFormData, string>>
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseSubmitEventReturn {
  data: EventFormData
  errors: EventFormErrors
  status: SubmitStatus
  update: <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => void
  selectStartPrayer: (prayer: PrayerName | '') => void
  selectRecurrence: (recurrence: EventRecurrence | '') => void
  submit: () => Promise<void>
}

const INITIAL_DATA: EventFormData = {
  title: '',
  categories: [],
  address: '',
  district: '',
  startTime: '',
  endTime: '',
  startPrayer: '',
  recurrence: '',
  recurrenceUntil: '',
  description: '',
  organizer: '',
  registrationUrl: '',
  requiresRegistration: false,
  audience: '',
  isFree: false,
}

function validate(data: EventFormData): EventFormErrors {
  const errors: EventFormErrors = {}
  if (!data.title.trim()) errors.title = i18next.t('submit.event.titleRequired')
  if (data.categories.length === 0) errors.categories = i18next.t('submit.event.categoryRequired')
  if (!data.address.trim()) errors.address = i18next.t('submit.event.addressRequired')
  if (!data.district.trim()) errors.district = i18next.t('submit.event.districtRequired')
  if (!data.startTime) {
    errors.startTime = data.startPrayer
      ? i18next.t('submit.event.startDateRequired')
      : i18next.t('submit.event.startTimeRequired')
  }
  // Mirrors the backend's own guard, so a series that ends before it starts is caught
  // on the field rather than coming back as a nameless failed submit.
  if (data.recurrence && data.recurrenceUntil && data.startTime
      && data.recurrenceUntil < data.startTime.slice(0, 10)) {
    errors.recurrenceUntil = i18next.t('submit.event.recurrenceUntilInvalid')
  }
  if (data.registrationUrl.trim() && toSafeHttpUrl(data.registrationUrl) === undefined) {
    errors.registrationUrl = i18next.t('submit.event.registrationUrlInvalid')
  }
  return errors
}

export function useSubmitEvent(): UseSubmitEventReturn {
  const [data, setData] = useState<EventFormData>(INITIAL_DATA)
  const [errors, setErrors] = useState<EventFormErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')

  const update = <K extends keyof EventFormData>(field: K, value: EventFormData[K]): void => {
    setData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // A prayer start carries no announced end time, so switching to it clears the end.
  const selectStartPrayer = (prayer: PrayerName | ''): void => {
    setData((prev) => ({ ...prev, startPrayer: prayer, endTime: prayer ? '' : prev.endTime }))
  }

  // An end date only means anything for a series, so dropping back to a one-off clears it.
  const selectRecurrence = (recurrence: EventRecurrence | ''): void => {
    setData((prev) => ({
      ...prev, recurrence, recurrenceUntil: recurrence ? prev.recurrenceUntil : '',
    }))
    setErrors((prev) => ({ ...prev, recurrenceUntil: undefined }))
  }

  const submit = async (): Promise<void> => {
    const fieldErrors = validate(data)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    setStatus('loading')
    try {
      const res = await fetch(`${API_BASE}/api/v1/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title.trim(),
          categories: data.categories.map((c) => CATEGORY_TO_ENUM[c]),
          address: data.address.trim(),
          district: data.district.trim(),
          startTime: toInstant(data.startTime),
          endTime: data.endTime ? toInstant(data.endTime) : null,
          startPrayer: data.startPrayer ? PRAYER_TO_ENUM[data.startPrayer] : null,
          recurrence: data.recurrence ? RECURRENCE_TO_ENUM[data.recurrence] : null,
          recurrenceUntil: data.recurrence && data.recurrenceUntil ? data.recurrenceUntil : null,
          description: data.description.trim() || null,
          organizer: data.organizer.trim() || null,
          isFree: data.isFree,
          registrationUrl: toSafeHttpUrl(data.registrationUrl) ?? null,
          requiresRegistration: data.requiresRegistration,
          audience: data.audience ? AUDIENCE_TO_ENUM[data.audience] : null,
          latitude: VIENNA_LAT,
          longitude: VIENNA_LNG,
        }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return { data, errors, status, update, selectStartPrayer, selectRecurrence, submit }
}
