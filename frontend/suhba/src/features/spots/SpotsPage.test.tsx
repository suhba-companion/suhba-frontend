import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpotsPage } from './SpotsPage'
import type { PrayerSpot } from '../../types'

vi.mock('./SpotsMap', () => ({
  SpotsMap: () => <div data-testid="spots-map" />,
}))

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: () => number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({ key: i, index: i, start: i * estimateSize() })),
    getTotalSize: () => count * estimateSize(),
  }),
}))

vi.mock('@services/masjidiService', () => ({
  getSpots: vi.fn().mockResolvedValue([
    { id: '1', name: 'Islamisches Zentrum Wien', type: 'Moschee', address: 'Am Bruckhaufen 4', district: '1210 Wien', lat: 48.2636, lng: 16.3986, open: true, jumaTime: '12:30', wudu: true, sisters: true, parking: true, distanceKm: 5.5 },
    { id: '2', name: 'ATIB Moschee Favoriten', type: 'Moschee', address: 'Laxenburger Str. 37', district: '1100 Wien', lat: 48.1817, lng: 16.3764, open: true, jumaTime: '13:00', wudu: true, sisters: false, parking: false, distanceKm: 3.5 },
    { id: '3', name: 'Gebetsraum Brigittenau', type: 'Gebetsort', address: 'Pappenheimgasse 35', district: '1200 Wien', lat: 48.2267, lng: 16.3625, open: true, jumaTime: null, wudu: false, sisters: false, parking: false, distanceKm: 2.0 },
  ] as PrayerSpot[]),
}))

describe('SpotsPage', () => {
  it('renders search input', () => {
    render(<SpotsPage />)
    expect(screen.getByPlaceholderText(/suche nach gebetsort/i)).toBeInTheDocument()
  })

  it('renders all spots in list view by default', async () => {
    render(<SpotsPage />)
    await waitFor(() => expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0))
  })

  it('searching filters the list', async () => {
    render(<SpotsPage />)
    await waitFor(() => expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0))
    const initial = screen.getAllByRole('listitem').length
    await userEvent.type(screen.getByPlaceholderText(/suche/i), 'Islamisches')
    const filtered = screen.getAllByRole('listitem').length
    expect(filtered).toBeLessThan(initial)
  })

  it('renders filter button', () => {
    render(<SpotsPage />)
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument()
  })

  it('opens filter panel when filter button is clicked', async () => {
    render(<SpotsPage />)
    await userEvent.click(screen.getByRole('button', { name: /filter/i }))
    expect(screen.getByText('Zurücksetzen')).toBeInTheDocument()
    expect(screen.getByText('Anwenden')).toBeInTheDocument()
  })

  it('switching to map view shows the map', async () => {
    render(<SpotsPage />)
    await userEvent.click(screen.getByRole('button', { name: /karte/i }))
    expect(await screen.findByTestId('spots-map')).toBeInTheDocument()
  })

  it('shows empty state when no results match filters', async () => {
    render(<SpotsPage />)
    await userEvent.type(screen.getByPlaceholderText(/suche/i), 'xyznonexistent123')
    expect(screen.getByText(/keine gebetsorte gefunden/i)).toBeInTheDocument()
  })
})
