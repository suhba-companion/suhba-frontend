import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HalalPage } from './HalalPage'
import type { HalalBusiness } from '../../types'

vi.mock('@services/halalService', () => ({
  getHalalBusinesses: vi.fn().mockResolvedValue([
    { id: '1', name: 'Taqwa Restaurant', type: 'Restaurant', address: 'Quellenstraße 26', district: '1100 Wien', lat: 48.193, lng: 16.367, certStatus: 'HMA-Zertifiziert', rating: 4.7, featured: true, distanceKm: 1.2 },
    { id: '2', name: 'Vienna Halal Market', type: 'Lebensmittel', address: 'Mariahilfer Str. 140', district: '1150 Wien', lat: 48.198, lng: 16.330, certStatus: 'HMA-Zertifiziert', rating: 4.5, featured: true, distanceKm: 2.3 },
    { id: '3', name: 'Istanbul Grill', type: 'Restaurant', address: 'Reinprechtsdorfer Str. 21', district: '1050 Wien', lat: 48.195, lng: 16.355, certStatus: 'Selbst-zertifiziert', featured: false, distanceKm: 1.8 },
  ] as HalalBusiness[]),
}))

describe('HalalPage', () => {
  it('renders search input', () => {
    render(<HalalPage />)
    expect(screen.getByPlaceholderText(/halal-betriebe suchen/i)).toBeInTheDocument()
  })

  it('renders regular businesses', async () => {
    render(<HalalPage />)
    await waitFor(() => expect(screen.getByText(/\d+ betriebe/i)).toBeInTheDocument())
  })

  it('shows total count', async () => {
    render(<HalalPage />)
    await waitFor(() => expect(screen.getByText(/\d+ betriebe/i)).toBeInTheDocument())
  })

  it('searching filters results', async () => {
    render(<HalalPage />)
    await waitFor(() => expect(screen.getByText(/\d+ betriebe/i)).toBeInTheDocument())
    const initial = screen.getByText(/\d+ betriebe/i).textContent
    await userEvent.type(screen.getByPlaceholderText(/suchen/i), 'Taqwa')
    const filtered = screen.getByText(/\d+ betriebe/i).textContent
    expect(filtered).not.toBe(initial)
  })

  it('renders filter button', () => {
    render(<HalalPage />)
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument()
  })

  it('opens filter panel when filter button is clicked', async () => {
    render(<HalalPage />)
    await userEvent.click(screen.getByRole('button', { name: /filter/i }))
    expect(screen.getByText('Restaurants')).toBeInTheDocument()
    expect(screen.getByText('Cafés')).toBeInTheDocument()
  })

  it('shows empty state when nothing matches', async () => {
    render(<HalalPage />)
    await waitFor(() => expect(screen.getByText(/\d+ betriebe/i)).toBeInTheDocument())
    await userEvent.type(screen.getByPlaceholderText(/suchen/i), 'xyznonexistent999')
    expect(screen.getByText(/keine betriebe gefunden/i)).toBeInTheDocument()
  })

  it('renders + Betrieb CTA', () => {
    render(<HalalPage />)
    expect(screen.getByText('+ Betrieb')).toBeInTheDocument()
  })
})
