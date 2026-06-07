import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpotCard } from './SpotCard'
import type { PrayerSpot } from '../../types'

const MOCK_SPOT: PrayerSpot = {
  id: 'test-spot',
  name: 'Testmoschee Wien',
  type: 'Moschee',
  address: 'Testgasse 1',
  district: '1010 Wien',
  lat: 48.2082,
  lng: 16.3738,
  open: true,
  jumaTime: '12:30',
  wudu: true,
  sisters: false,
  parking: true,
  openingHours: 'Mo–So 08:00–22:00',
  distanceKm: 1.5,
}

describe('SpotCard', () => {
  it('renders spot name', () => {
    render(<ul><SpotCard spot={MOCK_SPOT} /></ul>)
    expect(screen.getByText('Testmoschee Wien')).toBeInTheDocument()
  })

  it('renders address and district', () => {
    render(<ul><SpotCard spot={MOCK_SPOT} /></ul>)
    expect(screen.getByText(/Testgasse 1/)).toBeInTheDocument()
  })

  it('renders type chip', () => {
    render(<ul><SpotCard spot={MOCK_SPOT} /></ul>)
    expect(screen.getByText('Moschee')).toBeInTheDocument()
  })

  it('renders distance', () => {
    render(<ul><SpotCard spot={MOCK_SPOT} /></ul>)
    expect(screen.getByText(/1\.5 km/)).toBeInTheDocument()
  })

  it('renders amenity icons for features', () => {
    render(<ul><SpotCard spot={MOCK_SPOT} /></ul>)
    expect(screen.getByTitle('Wudu-Möglichkeit')).toBeInTheDocument()
    expect(screen.getByTitle('Parkplatz')).toBeInTheDocument()
    expect(screen.queryByTitle('Frauenbereich')).not.toBeInTheDocument()
  })

  it('Route button opens google maps', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ul><SpotCard spot={MOCK_SPOT} /></ul>)
    await userEvent.click(screen.getByRole('button', { name: /route/i }))
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('maps.google.com'),
      '_blank',
      'noopener,noreferrer',
    )
    openSpy.mockRestore()
  })
})
