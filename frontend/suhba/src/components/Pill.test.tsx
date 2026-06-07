import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pill } from './Pill'

describe('Pill', () => {
  it('renders its label', () => {
    render(<Pill label="Moscheen" />)
    expect(screen.getByText('Moscheen')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Pill label="Alle" onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: 'Alle' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies active styles when active prop is true', () => {
    render(<Pill label="Aktiv" active />)
    const btn = screen.getByRole('button', { name: 'Aktiv' })
    expect(btn.className).toContain('bg-moss')
  })
})
