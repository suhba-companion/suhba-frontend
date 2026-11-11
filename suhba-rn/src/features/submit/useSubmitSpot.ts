import { useState } from 'react'
import i18next from 'i18next'
import type { SpotType } from '../../types'

import { API_BASE } from '../../config'
import { apiPost } from '../../services/apiFetch'
import { geocodeAddress } from '../../services/geocodeService'

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
      const point = await geocodeAddress(data.address.trim(), data.district.trim())
      // Submitting an unresolvable address used to post the centre of Vienna and show a
      // success screen, so a typo became a pin kilometres from the real place and nobody
      // could tell. Send the user back to the field instead.
      if (point === null) {
        setErrors((prev) => ({ ...prev, address: i18next.t('submit.spot.addressNotFound') }))
        setStatus('idle')
        return
      }
      const { lat, lng } = point
      await apiPost(`${API_BASE}/prayer-spots`, {
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
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return { data, errors, status, update, submit }
}
