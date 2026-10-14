import { render, screen, fireEvent } from '@testing-library/react'
import { EventCard } from './EventCard'
import type { Event } from '../../types'

const MOCK_EVENT: Event = {
  id: 'event-1',
  title: 'Vortrag über Tajweed',
  address: 'Am Bruckhaufen 3',
  district: '1210 Wien',
  lat: 48.2482,
  lng: 16.4,
  startTime: '2026-10-20T18:00:00Z',
  categories: ['Vortrag'],
  isFree: true,
  distanceKm: 2.4,
}

describe('EventCard', () => {
  it('renders the route button', () => {
    render(<ul><EventCard event={MOCK_EVENT} /></ul>)
    expect(screen.getByRole('button', { name: /route/i })).toBeInTheDocument()
  })

  it('routes to the saved address rather than the coordinates', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ul><EventCard event={MOCK_EVENT} /></ul>)
    fireEvent.click(screen.getByRole('button', { name: /route/i }))
    expect(openSpy).toHaveBeenCalledWith(
      'https://maps.google.com/maps?daddr=Am%20Bruckhaufen%203%2C%201210%20Wien%2C%20%C3%96sterreich&travelmode=transit',
      '_blank',
      'noopener,noreferrer',
    )
    openSpy.mockRestore()
  })

  it('does not open the detail when the route button is clicked', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const onSelect = vi.fn()
    render(<ul><EventCard event={MOCK_EVENT} onSelect={onSelect} /></ul>)
    fireEvent.click(screen.getByRole('button', { name: /route/i }))
    expect(onSelect).not.toHaveBeenCalled()
    openSpy.mockRestore()
  })
})
