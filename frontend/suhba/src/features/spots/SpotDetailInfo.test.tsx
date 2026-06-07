import { render, screen } from '@testing-library/react'
import { SpotDetailInfo } from './SpotDetailInfo'
import type { PrayerSpot } from '../../types'

const BASE_SPOT: PrayerSpot = {
  id: 'test-1',
  name: 'Testmoschee',
  type: 'Moschee',
  address: 'Testgasse 5',
  district: '1010 Wien',
  lat: 48.2082,
  lng: 16.3738,
  open: true,
  jumaTime: '13:00',
  wudu: false,
  sisters: false,
  parking: false,
  openingHours: 'Mo–Fr 09:00–18:00',
}

describe('SpotDetailInfo', () => {
  it('renders address', () => {
    render(<SpotDetailInfo spot={BASE_SPOT} />)
    expect(screen.getByText(/Testgasse 5/)).toBeInTheDocument()
  })

  it('renders district as part of address', () => {
    render(<SpotDetailInfo spot={BASE_SPOT} />)
    expect(screen.getByText(/1010 Wien/)).toBeInTheDocument()
  })

  it('renders Juma time when available', () => {
    render(<SpotDetailInfo spot={BASE_SPOT} />)
    expect(screen.getByText(/13:00 Uhr/)).toBeInTheDocument()
  })

  it('does not render Juma row when jumaTime is null', () => {
    render(<SpotDetailInfo spot={{ ...BASE_SPOT, jumaTime: null }} />)
    expect(screen.queryByText(/juma/i)).not.toBeInTheDocument()
  })

  it('renders opening hours when available', () => {
    render(<SpotDetailInfo spot={BASE_SPOT} />)
    expect(screen.getByText('Mo–Fr 09:00–18:00')).toBeInTheDocument()
  })

  it('does not render opening hours row when undefined', () => {
    render(<SpotDetailInfo spot={{ ...BASE_SPOT, openingHours: undefined }} />)
    expect(screen.queryByText(/öffnungszeiten/i)).not.toBeInTheDocument()
  })
})
