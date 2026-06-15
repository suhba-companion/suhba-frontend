import { render, screen, fireEvent } from '@testing-library/react'
import { NearbyFeed } from './NearbyFeed'
import type { FeedEvent } from '../../types'

const MOCK_ITEMS: FeedEvent[] = [
  { id: '1', title: 'Ereignis Eins', location: 'Wien 1010', distanceKm: 0.5, tag: 'Juma', time: 'Fr. 12:00' },
  { id: '2', title: 'Ereignis Zwei', location: 'Wien 1020', distanceKm: 1.2, tag: 'Neu', time: 'Heute' },
  { id: '3', title: 'Ereignis Drei', location: 'Wien 1030', distanceKm: 2.0, tag: 'Moschee', time: 'Täglich' },
  { id: '4', title: 'Ereignis Vier', location: 'Wien 1040', distanceKm: 3.1, tag: 'Event', time: 'Sa. 10:00' },
]

describe('NearbyFeed', () => {
  it('renders loading state', () => {
    render(<NearbyFeed loading />)
    expect(screen.getByText(/wird geladen/i)).toBeInTheDocument()
  })

  it('renders error state', () => {
    render(<NearbyFeed error={new Error('boom')} />)
    expect(screen.getByText(/konnten nicht geladen/i)).toBeInTheDocument()
  })

  it('renders at most 3 items when more are passed', () => {
    render(<NearbyFeed items={MOCK_ITEMS} />)
    expect(screen.queryByText('Ereignis Vier')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('shows empty state when items list is empty', () => {
    render(<NearbyFeed items={[]} />)
    expect(screen.getByText(/nichts in der nähe/i)).toBeInTheDocument()
  })

  it('renders tag chips', () => {
    render(<NearbyFeed items={MOCK_ITEMS} />)
    expect(screen.getByText('Juma')).toBeInTheDocument()
  })

  it('renders distance', () => {
    render(<NearbyFeed items={MOCK_ITEMS} />)
    expect(screen.getByText(/0\.5 km/)).toBeInTheDocument()
  })

  it('opens the detail (calls onSelect) when a card is clicked', () => {
    const onSelect = vi.fn()
    const item: FeedEvent = { id: 'spot-1', title: 'Zentralmoschee', tag: 'Moschee', time: 'Offen', kind: 'spot', lat: 48.2, lng: 16.37 }
    render(<NearbyFeed items={[item]} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Zentralmoschee'))
    expect(onSelect).toHaveBeenCalledWith(item)
  })

  it('opens the map route via the route button without opening the detail', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const onSelect = vi.fn()
    const items: FeedEvent[] = [
      { id: 'spot-1', title: 'Zentralmoschee', tag: 'Moschee', time: 'Offen', kind: 'spot', lat: 48.2, lng: 16.37 },
    ]
    render(<NearbyFeed items={items} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /route/i }))
    expect(openSpy).toHaveBeenCalledWith(
      'https://maps.google.com/maps?daddr=48.2,16.37&travelmode=transit',
      '_blank',
      'noopener,noreferrer',
    )
    expect(onSelect).not.toHaveBeenCalled()
    openSpy.mockRestore()
  })

  it('prefers googleMapsUrl over coordinates for the route', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const items: FeedEvent[] = [
      { id: 'event-1', title: 'Vortrag', tag: 'Vortrag', time: 'Heute', kind: 'event', lat: 48.2, lng: 16.37, googleMapsUrl: 'https://maps.app.goo.gl/abc' },
    ]
    render(<NearbyFeed items={items} />)
    fireEvent.click(screen.getByRole('button', { name: /route/i }))
    expect(openSpy).toHaveBeenCalledWith('https://maps.app.goo.gl/abc', '_blank', 'noopener,noreferrer')
    openSpy.mockRestore()
  })
})
