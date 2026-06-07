import { render, screen } from '@testing-library/react'
import { SpotDetailHero } from './SpotDetailHero'
import type { PrayerSpot } from '../../types'

const MOCK_SPOT: PrayerSpot = {
  id: 'test-1',
  name: 'Testmoschee Wien',
  type: 'Moschee',
  address: 'Testgasse 1',
  district: '1010 Wien',
  lat: 48.2082,
  lng: 16.3738,
  open: true,
  jumaTime: '12:30',
  wudu: true,
  sisters: true,
  parking: false,
  openingHours: 'Mo–So 08:00–22:00',
  distanceKm: 1.5,
}

describe('SpotDetailHero', () => {
  it('renders spot name', () => {
    render(<SpotDetailHero spot={MOCK_SPOT} />)
    expect(screen.getByText('Testmoschee Wien')).toBeInTheDocument()
  })

  it('renders type chip', () => {
    render(<SpotDetailHero spot={MOCK_SPOT} />)
    expect(screen.getByText('Moschee')).toBeInTheDocument()
  })

  it('renders open status', () => {
    render(<SpotDetailHero spot={MOCK_SPOT} />)
    expect(screen.getByText(/geöffnet/i)).toBeInTheDocument()
  })

  it('renders closed status for closed spots', () => {
    render(<SpotDetailHero spot={{ ...MOCK_SPOT, open: false }} />)
    expect(screen.getByText(/geschlossen/i)).toBeInTheDocument()
  })

  it('renders distance', () => {
    render(<SpotDetailHero spot={MOCK_SPOT} />)
    expect(screen.getByText(/1\.5 km/)).toBeInTheDocument()
  })

  it('renders amenity icons', () => {
    render(<SpotDetailHero spot={MOCK_SPOT} />)
    expect(screen.getByTitle('Wudu-Möglichkeit')).toBeInTheDocument()
  })
})
