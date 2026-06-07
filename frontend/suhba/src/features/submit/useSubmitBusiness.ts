import { useState } from 'react'
import i18next from 'i18next'
import type { BusinessType, CertStatus } from '../../types'

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

interface BusinessFormData {
  name: string
  type: BusinessType | ''
  address: string
  district: string
  certStatus: CertStatus | ''
  openingHours: string
  phone: string
  website: string
  note: string
}

type BusinessFormErrors = Partial<Record<keyof BusinessFormData, string>>
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseSubmitBusinessReturn {
  data: BusinessFormData
  errors: BusinessFormErrors
  status: SubmitStatus
  update: <K extends keyof BusinessFormData>(field: K, value: BusinessFormData[K]) => void
  submit: () => Promise<void>
}

const INITIAL_DATA: BusinessFormData = {
  name: '',
  type: '',
  address: '',
  district: '',
  certStatus: '',
  openingHours: '',
  phone: '',
  website: '',
  note: '',
}

const CATEGORY_MAP: Record<BusinessType, string> = {
  Restaurant: 'RESTAURANT',
  Café: 'CAFE',
  Metzgerei: 'BUTCHER',
  Lebensmittel: 'GROCERY',
  Sonstige: 'OTHER',
}

const CERT_MAP: Record<CertStatus, { certified: boolean; certificationBody: string | null }> = {
  'HMA-Zertifiziert': { certified: true, certificationBody: 'HMA' },
  'Selbst-zertifiziert': { certified: false, certificationBody: null },
  'Muslim-Owned': { certified: false, certificationBody: 'Muslim-Owned' },
}

function validate(data: BusinessFormData): BusinessFormErrors {
  const errors: BusinessFormErrors = {}
  if (!data.name.trim()) errors.name = i18next.t('submit.business.nameRequired')
  if (!data.type) errors.type = i18next.t('submit.business.typeRequired')
  if (!data.address.trim()) errors.address = i18next.t('submit.business.addressRequired')
  if (!data.district.trim()) errors.district = i18next.t('submit.business.districtRequired')
  return errors
}

export function useSubmitBusiness(): UseSubmitBusinessReturn {
  const [data, setData] = useState<BusinessFormData>(INITIAL_DATA)
  const [errors, setErrors] = useState<BusinessFormErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')

  const update = <K extends keyof BusinessFormData>(field: K, value: BusinessFormData[K]): void => {
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
      const cert = data.certStatus ? CERT_MAP[data.certStatus as CertStatus] : { certified: false, certificationBody: null }
      const res = await fetch(`${API_BASE}/api/v1/halal-spots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.note.trim() || null,
          address: data.address.trim(),
          district: data.district.trim(),
          latitude: lat,
          longitude: lng,
          category: CATEGORY_MAP[data.type as BusinessType],
          certified: cert.certified,
          certificationBody: cert.certificationBody,
          openingHours: data.openingHours.trim() || null,
          phone: data.phone.trim() || null,
          website: data.website.trim() || null,
          featured: false,
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
