import { render, screen } from '@testing-library/react'
import { SpotDetailReviews } from './SpotDetailReviews'
import type { SpotReview } from '../../types'

const MOCK_REVIEWS: SpotReview[] = [
  {
    id: 'r1',
    spotId: 'spot-1',
    user: 'Test User',
    stars: 5,
    text: 'Sehr gute Moschee.',
    createdAt: '2025-11-01',
  },
  {
    id: 'r2',
    spotId: 'spot-1',
    user: 'Zweiter Nutzer',
    stars: 3,
    text: 'Geht so.',
    createdAt: '2025-10-15',
  },
]

describe('SpotDetailReviews', () => {
  it('renders all reviews', () => {
    render(<SpotDetailReviews reviews={MOCK_REVIEWS} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Zweiter Nutzer')).toBeInTheDocument()
  })

  it('renders review text', () => {
    render(<SpotDetailReviews reviews={MOCK_REVIEWS} />)
    expect(screen.getByText('Sehr gute Moschee.')).toBeInTheDocument()
  })

  it('renders star ratings', () => {
    render(<SpotDetailReviews reviews={MOCK_REVIEWS} />)
    expect(screen.getByLabelText('5 von 5 Sternen')).toBeInTheDocument()
    expect(screen.getByLabelText('3 von 5 Sternen')).toBeInTheDocument()
  })

  it('renders dates', () => {
    render(<SpotDetailReviews reviews={MOCK_REVIEWS} />)
    expect(screen.getByText('2025-11-01')).toBeInTheDocument()
  })

  it('shows empty state when no reviews', () => {
    render(<SpotDetailReviews reviews={[]} />)
    expect(screen.getByText(/noch keine bewertungen/i)).toBeInTheDocument()
  })
})
