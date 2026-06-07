import { useState } from 'react'
import i18next from 'i18next'
import type { SpotType } from '../../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const VIENNA_LAT = 48.2082
const VIENNA_LNG = 16.3738

async function geocodeAddress(address: string, district: string): Promise<{ lat: number; lng: number }> {
  try {
    const q = encodeURIComponent(`${address}, ${district}, Wien, Österreich`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=at`,
      { headers: { 'Accept-Language': 'de', 'User-Agent': 'Suhba-App/1.0' } },
    )
    if (!res.ok) return { lat: VIENNA_LAT, lng: VIENNA_LNG }
    const json: unknown = await res.json()
    if (Array.isArray(json) && json.length > 0) {
      const first = json[0] as Record<string, unknown>
      const lat = parseFloat(String(first['lat']))
      const lng = parseFloat(String(first['lon']))
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }
  } catch { /* fall through to Vienna default */ }
  return { lat: VIENNA_LAT, lng: VIENNA_LNG }
}

interface SpotFormData {
  name: string
  type: SpotType | ''
  address: string
  district: string
  juma: boolean
  jumaTime: string
  wudu: boolean
  sisters: boolean
  parking: boolean
  openingHours: string
  note: string
}

type SpotFormErrors = Partial<Record<keyof SpotFormData, string>>
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseSubmitSpotReturn {
  data: SpotFormData
  errors: SpotFormErrors
  status: SubmitStatus
  update: <K extends keyof SpotFormData>(field: K, value: SpotFormData[K]) => void
  submit: () => Promise<void>
}

const INITIAL_DATA: SpotFormData = {
  name: '',
  type: '',
  address: '',
  district: '',
  juma: false,
  jumaTime: '',
  wudu: false,
  sisters: false,
  parking: false,
  openingHours: '',
  note: '',
}

const TYPE_MAP: Record<SpotType, string> = {
  Moschee: 'MOSQUE',
  Gebetsort: 'MUSALLA',
  Sonstige: 'OTHER',
}

function validate(data: SpotFormData): SpotFormErrors {
  const errors: SpotFormErrors = {}
  if (!data.name.trim()) errors.name = i18next.t('submit.spot.nameRequired')
  if (!data.type) errors.type = i18next.t('submit.spot.typeRequired')
  if (!data.address.trim()) errors.address = i18next.t('submit.spot.addressRequired')
  if (!data.district.trim()) errors.district = i18next.t('submit.spot.districtRequired')
  return errors
}

export function useSubmitSpot(): UseSubmitSpotReturn {
  const [data, setData] = useState<SpotFormData>(INITIAL_DATA)
  const [errors, setErrors] = useState<SpotFormErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')

  const update = <K extends keyof SpotFormData>(field: K, value: SpotFormData[K]): void => {
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
      const { lat, lng } = await geocodeAddress(data.address.trim(), data.district.trim())
      const res = await fetch(`${API_BASE}/api/v1/prayer-spots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.note.trim() || null,
          address: data.address.trim(),
          district: data.district.trim(),
          latitude: lat,
          longitude: lng,
          type: TYPE_MAP[data.type as SpotType],
          wuduAvailable: data.wudu,
          sistanAvailable: data.sisters,
          fridayPrayer: data.juma,
          jumaTime: data.juma && data.jumaTime.trim() ? data.jumaTime.trim() : null,
          parking: data.parking,
          openingHours: data.openingHours.trim() || null,
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
