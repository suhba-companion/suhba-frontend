import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpotsFilter } from './SpotsFilter'
import type { SpotFilters } from './useSpots'

const DEFAULT_FILTERS: SpotFilters = {
  type: 'Alle',
  juma: false,
  wudu: false,
  sisters: false,
  parking: false,
  hijab: false,
  prayerClothes: false,
  openNow: false,
  search: '',
}

describe('SpotsFilter', () => {
  it('renders type options', () => {
    render(<SpotsFilter filters={DEFAULT_FILTERS} onUpdate={vi.fn()} onReset={vi.fn()} onApply={vi.fn()} />)
    expect(screen.getByText('Alle')).toBeInTheDocument()
    expect(screen.getByText('Moscheen')).toBeInTheDocument()
    expect(screen.getByText('Gebetsorte')).toBeInTheDocument()
    expect(screen.getByText('Sonstige')).toBeInTheDocument()
  })

  it('renders amenity options', () => {
    render(<SpotsFilter filters={DEFAULT_FILTERS} onUpdate={vi.fn()} onReset={vi.fn()} onApply={vi.fn()} />)
    expect(screen.getByText('Freitagsgebet')).toBeInTheDocument()
    expect(screen.getByText('Wudu')).toBeInTheDocument()
    expect(screen.getByText('Frauenbereich')).toBeInTheDocument()
    expect(screen.getByText('Parkplatz')).toBeInTheDocument()
    expect(screen.getByText('Geöffnet jetzt')).toBeInTheDocument()
  })

  it('clicking a type pill calls onUpdate with the correct SpotType value', async () => {
    const onUpdate = vi.fn()
    render(<SpotsFilter filters={DEFAULT_FILTERS} onUpdate={onUpdate} onReset={vi.fn()} onApply={vi.fn()} />)
    await userEvent.click(screen.getByText('Moscheen'))
    expect(onUpdate).toHaveBeenCalledWith({ type: 'Moschee' })
  })

  it('clicking Juma amenity toggles it', async () => {
    const onUpdate = vi.fn()
    render(<SpotsFilter filters={DEFAULT_FILTERS} onUpdate={onUpdate} onReset={vi.fn()} onApply={vi.fn()} />)
    await userEvent.click(screen.getByText('Freitagsgebet'))
    expect(onUpdate).toHaveBeenCalledWith({ juma: true })
  })

  it('calls onReset when reset button is clicked', async () => {
    const onReset = vi.fn()
    render(<SpotsFilter filters={DEFAULT_FILTERS} onUpdate={vi.fn()} onReset={onReset} onApply={vi.fn()} />)
    await userEvent.click(screen.getByText('Zurücksetzen'))
    expect(onReset).toHaveBeenCalled()
  })

  it('calls onApply when apply button is clicked', async () => {
    const onApply = vi.fn()
    render(<SpotsFilter filters={DEFAULT_FILTERS} onUpdate={vi.fn()} onReset={vi.fn()} onApply={onApply} />)
    await userEvent.click(screen.getByText('Anwenden'))
    expect(onApply).toHaveBeenCalled()
  })
})
