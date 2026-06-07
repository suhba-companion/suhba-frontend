import { render, screen, waitFor } from '@testing-library/react'
import { SpotDetailPage } from './SpotDetailPage'
import type { PrayerSpot, SpotReview } from '../../types'

vi.mock('./SpotDetailMap', () => ({
  SpotDetailMap: () => <div data-testid="detail-map" />,
}))

const MOCK_SPOT: PrayerSpot = {
  id: 'izw',
  name: 'Islamisches Zentrum Wien',
  type: 'Moschee',
  address: 'Am Bruckhaufen 4',
  district: '1210 Wien',
  lat: 48.2636,
  lng: 16.3986,
  open: true,
  jumaTime: '12:30',
  wudu: true,
  sisters: true,
  parking: true,
  openingHours: 'Mo–So 08:00–22:00',
  distanceKm: 5.5,
}

const MOCK_REVIEWS: SpotReview[] = [
  { id: 'r1', spotId: 'izw', user: 'Test User', stars: 5, text: 'Sehr gut!', createdAt: '2025-11-14' },
]

vi.mock('@services/masjidiService', () => ({
  getSpotById: (id: string) => Promise.resolve(id === 'izw' ? MOCK_SPOT : undefined),
  getReviewsBySpotId: (id: string) => (id === 'izw' ? MOCK_REVIEWS : []),
}))

describe('SpotDetailPage', () => {
  it('renders spot name in hero', async () => {
    render(<SpotDetailPage spotId="izw" />)
    await waitFor(() => expect(screen.getByText('Islamisches Zentrum Wien')).toBeInTheDocument())
  })

  it('renders address in info section', async () => {
    render(<SpotDetailPage spotId="izw" />)
    await waitFor(() => expect(screen.getByText(/Am Bruckhaufen 4/)).toBeInTheDocument())
  })

  it('renders Juma time', async () => {
    render(<SpotDetailPage spotId="izw" />)
    await waitFor(() => expect(screen.getByText(/12:30 Uhr/)).toBeInTheDocument())
  })

  it('renders reviews', async () => {
    render(<SpotDetailPage spotId="izw" />)
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument())
  })

  it('renders the Änderung button', async () => {
    render(<SpotDetailPage spotId="izw" />)
    await waitFor(() => expect(screen.getByRole('button', { name: /änderung/i })).toBeInTheDocument())
  })

  it('shows not found message for unknown spotId', async () => {
    render(<SpotDetailPage spotId="does-not-exist" />)
    await waitFor(() => expect(screen.getByText(/nicht gefunden/i)).toBeInTheDocument())
  })
})
