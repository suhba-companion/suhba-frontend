import { render, screen } from '@testing-library/react'
import { HalalFeaturedCard } from './HalalFeaturedCard'
import type { HalalBusiness } from '../../types'

const MOCK_BUSINESS: HalalBusiness = {
  id: 'test-1',
  name: 'Test Restaurant',
  type: 'Restaurant',
  address: 'Testgasse 1',
  district: '1010 Wien',
  lat: 48.2082,
  lng: 16.3738,
  certStatus: 'HMA-Zertifiziert',
  rating: 4.5,
  featured: true,
  distanceKm: 1.2,
}

describe('HalalFeaturedCard', () => {
  it('renders business name', () => {
    render(<HalalFeaturedCard business={MOCK_BUSINESS} />)
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument()
  })

  it('renders Empfohlen badge', () => {
    render(<HalalFeaturedCard business={MOCK_BUSINESS} />)
    expect(screen.getByText('Empfohlen')).toBeInTheDocument()
  })

  it('renders distance', () => {
    render(<HalalFeaturedCard business={MOCK_BUSINESS} />)
    expect(screen.getByText(/1\.2 km/)).toBeInTheDocument()
  })

  it('renders type icon area', () => {
    render(<HalalFeaturedCard business={MOCK_BUSINESS} />)
    expect(document.querySelector('[data-testid="type-icon"]')).toBeInTheDocument()
  })
})
