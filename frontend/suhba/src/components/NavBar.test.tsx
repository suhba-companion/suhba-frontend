import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavBar } from './NavBar'
import type { NavTab } from './NavBar'

describe('NavBar', () => {
  it('renders all four tabs', () => {
    render(<NavBar activeTab="start" onTabChange={() => {}} />)
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('Gebetsorte')).toBeInTheDocument()
    expect(screen.getByText('Halal Spots')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
  })

  it('marks the active tab with aria-current="page"', () => {
    render(<NavBar activeTab="halal" onTabChange={() => {}} />)
    expect(screen.getByText('Halal Spots').closest('button')).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByText('Start').closest('button')).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('calls onTabChange with the clicked tab id', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn<(tab: NavTab) => void>()
    render(<NavBar activeTab="start" onTabChange={onTabChange} />)
    await user.click(screen.getByText('Gebetsorte'))
    expect(onTabChange).toHaveBeenCalledWith('orte')
  })
})
