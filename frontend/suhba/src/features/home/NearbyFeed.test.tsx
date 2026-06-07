import { render, screen } from '@testing-library/react'
import { NearbyFeed } from './NearbyFeed'
import type { FeedEvent } from '../../types'

const MOCK_ITEMS: FeedEvent[] = [
  { id: '1', title: 'Ereignis Eins', location: 'Wien 1010', distanceKm: 0.5, tag: 'Juma', time: 'Fr. 12:00' },
  { id: '2', title: 'Ereignis Zwei', location: 'Wien 1020', distanceKm: 1.2, tag: 'Neu', time: 'Heute' },
  { id: '3', title: 'Ereignis Drei', location: 'Wien 1030', distanceKm: 2.0, tag: 'Moschee', time: 'Täglich' },
  { id: '4', title: 'Ereignis Vier', location: 'Wien 1040', distanceKm: 3.1, tag: 'Event', time: 'Sa. 10:00' },
]

describe('NearbyFeed', () => {
  it('renders default feed items', () => {
    render(<NearbyFeed />)
    expect(screen.getByText('Freitagsgebet — IZW')).toBeInTheDocument()
  })

  it('renders at most 3 items when more are passed', () => {
    render(<NearbyFeed items={MOCK_ITEMS} />)
    expect(screen.queryByText('Ereignis Vier')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('shows empty state when items list is empty', () => {
    render(<NearbyFeed items={[]} />)
    expect(screen.getByText(/keine ereignisse/i)).toBeInTheDocument()
  })

  it('renders tag chips', () => {
    render(<NearbyFeed items={MOCK_ITEMS} />)
    expect(screen.getByText('Juma')).toBeInTheDocument()
  })

  it('renders distance', () => {
    render(<NearbyFeed items={MOCK_ITEMS} />)
    expect(screen.getByText(/0\.5 km/)).toBeInTheDocument()
  })
})
