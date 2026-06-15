import { render, screen } from '@testing-library/react'
import { TopBar } from './TopBar'

describe('TopBar', () => {
  it('does not render title text without backAction', () => {
    render(<TopBar />)
    expect(screen.queryByText('Suhba')).not.toBeInTheDocument()
  })

  it('renders title when backAction is provided', () => {
    render(<TopBar title="Orte" backAction={vi.fn()} />)
    expect(screen.getByText('Orte')).toBeInTheDocument()
  })

  it('renders rightAction when provided', () => {
    render(<TopBar rightAction={<button>Filter</button>} />)
    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument()
  })

  it('does not render logo', () => {
    render(<TopBar />)
    expect(screen.queryByRole('img', { name: 'Suhba logo' })).not.toBeInTheDocument()
  })

  it('renders back button when backAction is provided', () => {
    render(<TopBar backAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Zurück' })).toBeInTheDocument()
  })

  it('back button calls backAction', async () => {
    const onBack = vi.fn()
    const user = (await import('@testing-library/user-event')).default
    render(<TopBar backAction={onBack} />)
    await user.click(screen.getByRole('button', { name: 'Zurück' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('does not render logo when backAction is provided', () => {
    render(<TopBar backAction={vi.fn()} />)
    expect(screen.queryByRole('img', { name: 'Suhba logo' })).not.toBeInTheDocument()
  })
})
