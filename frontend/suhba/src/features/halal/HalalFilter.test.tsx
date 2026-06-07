import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HalalFilter } from './HalalFilter'
import type { HalalFilters } from './useHalal'

const DEFAULT_FILTERS: HalalFilters = { type: 'Alle', parking: false, search: '' }

describe('HalalFilter', () => {
  it('renders all category options', () => {
    render(<HalalFilter filters={DEFAULT_FILTERS} onUpdate={vi.fn()} onReset={vi.fn()} onApply={vi.fn()} />)
    expect(screen.getByText('Alle')).toBeInTheDocument()
    expect(screen.getByText('Restaurants')).toBeInTheDocument()
    expect(screen.getByText('Cafés')).toBeInTheDocument()
    expect(screen.getByText('Metzgereien')).toBeInTheDocument()
    expect(screen.getByText('Lebensmittel')).toBeInTheDocument()
  })

  it('clicking Restaurants calls onUpdate with Restaurant value', async () => {
    const onUpdate = vi.fn()
    render(<HalalFilter filters={DEFAULT_FILTERS} onUpdate={onUpdate} onReset={vi.fn()} onApply={vi.fn()} />)
    await userEvent.click(screen.getByText('Restaurants'))
    expect(onUpdate).toHaveBeenCalledWith({ type: 'Restaurant' })
  })

  it('calls onReset when reset button is clicked', async () => {
    const onReset = vi.fn()
    render(<HalalFilter filters={DEFAULT_FILTERS} onUpdate={vi.fn()} onReset={onReset} onApply={vi.fn()} />)
    await userEvent.click(screen.getByText('Zurücksetzen'))
    expect(onReset).toHaveBeenCalled()
  })

  it('calls onApply when apply button is clicked', async () => {
    const onApply = vi.fn()
    render(<HalalFilter filters={DEFAULT_FILTERS} onUpdate={vi.fn()} onReset={vi.fn()} onApply={onApply} />)
    await userEvent.click(screen.getByText('Anwenden'))
    expect(onApply).toHaveBeenCalled()
  })
})
