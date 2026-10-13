import { render, screen, fireEvent } from '@testing-library/react'
import { HalalBusinessCard } from './HalalBusinessCard'
import type { HalalBusiness } from '../../types'

const BASE_BUSINESS: HalalBusiness = {
  id: 'test-1',
  name: 'Test Grill',
  type: 'Restaurant',
  address: 'Testgasse 5',
  district: '1050 Wien',
  lat: 48.191,
  lng: 16.358,
  certStatus: 'Halal-zertifiziert',
  rating: 4.3,
  featured: false,
  distanceKm: 2.5,
}

describe('HalalBusinessCard', () => {
  it('renders business name', () => {
    render(<ul><HalalBusinessCard business={BASE_BUSINESS} /></ul>)
    expect(screen.getByText('Test Grill')).toBeInTheDocument()
  })

  it('renders type chip', () => {
    render(<ul><HalalBusinessCard business={BASE_BUSINESS} /></ul>)
    expect(screen.getByText('Restaurant')).toBeInTheDocument()
  })

  it('renders the certified badge for Halal-zertifiziert', () => {
    render(<ul><HalalBusinessCard business={BASE_BUSINESS} /></ul>)
    expect(screen.getByText('Zertifiziert')).toBeInTheDocument()
  })

  it('renders plain cert label for Selbst-zertifiziert', () => {
    render(<ul><HalalBusinessCard business={{ ...BASE_BUSINESS, certStatus: 'Selbst-zertifiziert' }} /></ul>)
    expect(screen.getByText('Selbst-zertifiziert')).toBeInTheDocument()
    expect(screen.queryByText('Zertifiziert')).not.toBeInTheDocument()
  })

  it('marks a hotel that only arranges halal on request', () => {
    render(<ul><HalalBusinessCard business={{ ...BASE_BUSINESS, certStatus: 'Auf Anfrage' }} /></ul>)
    expect(screen.getByText('Auf Anfrage')).toBeInTheDocument()
  })

  it('keeps a Zabihah community listing apart from a certificate', () => {
    render(<ul><HalalBusinessCard business={{ ...BASE_BUSINESS, certStatus: 'Community-gelistet' }} /></ul>)
    expect(screen.getByText('Community')).toBeInTheDocument()
    expect(screen.queryByText('Zertifiziert')).not.toBeInTheDocument()
  })

  it('renders star rating', () => {
    render(<ul><HalalBusinessCard business={BASE_BUSINESS} /></ul>)
    expect(screen.getByLabelText(/4\.3 Sterne/)).toBeInTheDocument()
  })

  it('renders distance', () => {
    render(<ul><HalalBusinessCard business={BASE_BUSINESS} /></ul>)
    expect(screen.getByText(/2\.5 km/)).toBeInTheDocument()
  })

  it('renders route button', () => {
    render(<ul><HalalBusinessCard business={BASE_BUSINESS} /></ul>)
    expect(screen.getByRole('button', { name: /route/i })).toBeInTheDocument()
  })

  it('opens google maps directions to the saved address on route button click', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ul><HalalBusinessCard business={BASE_BUSINESS} /></ul>)
    fireEvent.click(screen.getByRole('button', { name: /route/i }))
    expect(open).toHaveBeenCalledWith(
      'https://maps.google.com/maps?daddr=Testgasse%205%2C%201050%20Wien%2C%20%C3%96sterreich&travelmode=transit',
      '_blank',
      'noopener,noreferrer',
    )
    open.mockRestore()
  })

  it('calls onSelect with business id on card click', () => {
    const onSelect = vi.fn()
    render(<ul><HalalBusinessCard business={BASE_BUSINESS} onSelect={onSelect} /></ul>)
    fireEvent.click(screen.getByText('Test Grill'))
    expect(onSelect).toHaveBeenCalledWith('test-1')
  })

  it('does not navigate on card click without onSelect', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ul><HalalBusinessCard business={BASE_BUSINESS} /></ul>)
    fireEvent.click(screen.getByText('Test Grill'))
    expect(open).not.toHaveBeenCalled()
    open.mockRestore()
  })
})
