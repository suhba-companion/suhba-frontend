import { useState } from 'react'
import i18next from 'i18next'
import type { EventCategory } from '../../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// Vienna centre — used when the user doesn't pick a precise location
const VIENNA_LAT = 48.2082
const VIENNA_LNG = 16.3738

const CATEGORY_TO_ENUM: Record<EventCategory, string> = {
  Gebet:     'PRAYER',
  Vortrag:   'LECTURE',
  Kurs:      'CLASS',
  Community: 'COMMUNITY',
  Jugend:    'YOUTH',
  Sport:     'SPORT',
  Spende:    'FUNDRAISER',
  Sonstige:  'OTHER',
}

function toInstant(datetimeLocal: string): string {
  // datetime-local gives "YYYY-MM-DDTHH:mm" — backend needs a full ISO instant
  return datetimeLocal.length === 16 ? `${datetimeLocal}:00Z` : datetimeLocal
}

interface EventFormData {
  title: string
  category: EventCategory | ''
  address: string
  district: string
  startTime: string
  endTime: string
  description: string
  organizer: string
  isFree: boolean
}

type EventFormErrors = Partial<Record<keyof EventFormData, string>>
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseSubmitEventReturn {
  data: EventFormData
  errors: EventFormErrors
  status: SubmitStatus
  update: <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => void
  submit: () => Promise<void>
}

const INITIAL_DATA: EventFormData = {
  title: '',
  category: '',
  address: '',
  district: '',
  startTime: '',
  endTime: '',
  description: '',
  organizer: '',
  isFree: false,
}

function validate(data: EventFormData): EventFormErrors {
  const errors: EventFormErrors = {}
  if (!data.title.trim()) errors.title = i18next.t('submit.event.titleRequired')
  if (!data.category) errors.category = i18next.t('submit.event.categoryRequired')
  if (!data.address.trim()) errors.address = i18next.t('submit.event.addressRequired')
  if (!data.district.trim()) errors.district = i18next.t('submit.event.districtRequired')
  if (!data.startTime) errors.startTime = i18next.t('submit.event.startTimeRequired')
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
          category: CATEGORY_TO_ENUM[data.category as EventCategory],
          address: data.address.trim(),
          district: data.district.trim(),
          startTime: toInstant(data.startTime),
          endTime: data.endTime ? toInstant(data.endTime) : null,
          description: data.description.trim() || null,
          organizer: data.organizer.trim() || null,
          isFree: data.isFree,
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

  return { data, errors, status, update, submit }
}
