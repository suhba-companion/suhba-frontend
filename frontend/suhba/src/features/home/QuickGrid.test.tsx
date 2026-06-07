import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickGrid } from './QuickGrid'

describe('QuickGrid', () => {
  it('renders 3 tiles', () => {
    render(<QuickGrid onNavigate={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('clicking Gebetsorte tile calls onNavigate with orte', async () => {
    const onNavigate = vi.fn()
    render(<QuickGrid onNavigate={onNavigate} />)
    await userEvent.click(screen.getByText('Gebetsorte'))
    expect(onNavigate).toHaveBeenCalledWith('orte')
  })

  it('clicking Halal tile calls onNavigate with halal', async () => {
    const onNavigate = vi.fn()
    render(<QuickGrid onNavigate={onNavigate} />)
    await userEvent.click(screen.getByText('Halal Spots'))
    expect(onNavigate).toHaveBeenCalledWith('halal')
  })

  it('clicking Events tile calls onNavigate with events', async () => {
    const onNavigate = vi.fn()
    render(<QuickGrid onNavigate={onNavigate} />)
    await userEvent.click(screen.getByText('Events'))
    expect(onNavigate).toHaveBeenCalledWith('events')
  })
})
