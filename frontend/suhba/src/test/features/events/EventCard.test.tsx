import { render, screen, fireEvent } from '@testing-library/react'
import { EventCard } from '@features/events/EventCard'
import type { Event } from '../../../types'

const EVENT: Event = {
  id: '1',
  title: 'Freitagsgebet',
  category: 'Gebet',
  address: 'Am Bruckhaufen 4',
  district: '1210 Wien',
  lat: 48.26,
  lng: 16.39,
  startTime: '2026-06-05T12:00:00Z',
  endTime: '2026-06-05T13:00:00Z',
  isFree: true,
  organizer: 'IZW',
  distanceKm: 2.5,
}

describe('EventCard', () => {
  it('renders event title', () => {
    render(<ul><EventCard event={EVENT} /></ul>)
    expect(screen.getByText('Freitagsgebet')).toBeInTheDocument()
  })

  it('renders organizer name', () => {
    render(<ul><EventCard event={EVENT} /></ul>)
    expect(screen.getByText('IZW')).toBeInTheDocument()
  })

  it('renders address', () => {
    render(<ul><EventCard event={EVENT} /></ul>)
    expect(screen.getByText(/Am Bruckhaufen/)).toBeInTheDocument()
  })

  it('renders category label', () => {
    render(<ul><EventCard event={EVENT} /></ul>)
    expect(screen.getByText('Gebet')).toBeInTheDocument()
  })

  it('renders distance when provided', () => {
    render(<ul><EventCard event={EVENT} /></ul>)
    expect(screen.getByText('2.5 km')).toBeInTheDocument()
  })

  it('shows "Kostenlos" when isFree is true', () => {
    render(<ul><EventCard event={EVENT} /></ul>)
    expect(screen.getByText('Kostenlos')).toBeInTheDocument()
  })

  it('does not show "Kostenlos" when isFree is false', () => {
    render(<ul><EventCard event={{ ...EVENT, isFree: false }} /></ul>)
    expect(screen.queryByText('Kostenlos')).not.toBeInTheDocument()
  })

  it('does not show distance when distanceKm is undefined', () => {
    const { container } = render(<ul><EventCard event={{ ...EVENT, distanceKm: undefined }} /></ul>)
    expect(container.textContent).not.toContain('km')
  })

  it('calls onSelect with event id when clicked', () => {
    const onSelect = vi.fn()
    render(<ul><EventCard event={EVENT} onSelect={onSelect} /></ul>)
    const li = screen.getByText('Freitagsgebet').closest('li')!
    fireEvent.click(li)
    expect(onSelect).toHaveBeenCalledWith('1')
  })

  it('does not throw when onSelect is not provided', () => {
    expect(() => render(<ul><EventCard event={EVENT} /></ul>)).not.toThrow()
  })

  it('renders empty string for organizer when not provided', () => {
    render(<ul><EventCard event={{ ...EVENT, organizer: undefined }} /></ul>)
    expect(screen.getByText('Freitagsgebet')).toBeInTheDocument()
  })
})
