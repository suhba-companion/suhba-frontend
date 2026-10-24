import { render, screen, fireEvent } from '@testing-library/react'
import { EventCard } from '@features/events/EventCard'
import type { Event } from '../../../types'

const EVENT: Event = {
  id: '1',
  title: 'Freitagsgebet',
  categories: ['Gebet'],
  address: 'Am Bruckhaufen 4',
  district: '1210 Wien',
  lat: 48.26,
  lng: 16.39,
  startTime: '2026-06-05T12:00:00Z',
  endTime: '2026-06-05T13:00:00Z',
  isFree: true,
  requiresRegistration: false,
  organizer: 'IZW',
}

describe('EventCard', () => {
  it('shows a sisters-only badge when the event is restricted to sisters', () => {
    render(<ul><EventCard event={{ ...EVENT, audience: 'Nur Schwestern' }} /></ul>)
    expect(screen.getByText('Nur Schwestern')).toBeInTheDocument()
  })

  it('shows a brothers-only badge when the event is restricted to brothers', () => {
    render(<ul><EventCard event={{ ...EVENT, audience: 'Nur Brüder' }} /></ul>)
    expect(screen.getByText('Nur Brüder')).toBeInTheDocument()
  })

  it('shows no audience badge when the event is open to everyone', () => {
    render(<ul><EventCard event={EVENT} /></ul>)
    expect(screen.queryByText('Nur Schwestern')).not.toBeInTheDocument()
    expect(screen.queryByText('Nur Brüder')).not.toBeInTheDocument()
  })

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

  it('shows "Kostenlos" when isFree is true', () => {
    render(<ul><EventCard event={EVENT} /></ul>)
    expect(screen.getByText('Kostenlos')).toBeInTheDocument()
  })

  it('does not show "Kostenlos" when isFree is false', () => {
    render(<ul><EventCard event={{ ...EVENT, isFree: false }} /></ul>)
    expect(screen.queryByText('Kostenlos')).not.toBeInTheDocument()
  })

  it('shows "Anmeldung erforderlich" when the event requires registration', () => {
    render(<ul><EventCard event={{ ...EVENT, requiresRegistration: true }} /></ul>)
    expect(screen.getByText('Anmeldung erforderlich')).toBeInTheDocument()
  })

  it('shows "Anmeldung erforderlich" without a link when registration is required', () => {
    render(<ul><EventCard event={{ ...EVENT, requiresRegistration: true, registrationUrl: undefined }} /></ul>)
    expect(screen.getByText('Anmeldung erforderlich')).toBeInTheDocument()
  })

  it('does not show "Anmeldung erforderlich" when registration is not required', () => {
    render(<ul><EventCard event={{ ...EVENT, registrationUrl: 'https://example.com/anmeldung' }} /></ul>)
    expect(screen.queryByText('Anmeldung erforderlich')).not.toBeInTheDocument()
  })

  it('shows the clock time when no start prayer is set', () => {
    render(<ul><EventCard event={EVENT} /></ul>)
    expect(screen.getByText(/14:00 – 15:00/)).toBeInTheDocument()
  })

  it('names the prayer instead of a time when the event starts after one', () => {
    render(<ul><EventCard event={{ ...EVENT, startPrayer: 'Maghrib' }} /></ul>)
    expect(screen.getByText(/nach dem Maghrib-Gebet/)).toBeInTheDocument()
    expect(screen.queryByText(/14:00/)).not.toBeInTheDocument()
  })

  it('renders the new Muslims category chip', () => {
    render(<ul><EventCard event={{ ...EVENT, categories: ['Kurs', 'Neue Muslime'] }} /></ul>)
    expect(screen.getByText('Neue Muslime')).toBeInTheDocument()
    expect(screen.getByText('Kurs')).toBeInTheDocument()
  })

  it('renders the workshop category chip', () => {
    render(<ul><EventCard event={{ ...EVENT, categories: ['Workshop'] }} /></ul>)
    expect(screen.getByText('Workshop')).toBeInTheDocument()
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
