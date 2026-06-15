import { render, screen } from '@testing-library/react'
import { Logo } from './Logo'

describe('Logo', () => {
  it('renders an accessible image', () => {
    render(<Logo />)
    expect(screen.getByRole('img', { name: 'Suhba logo' })).toBeInTheDocument()
  })

  it('applies custom size', () => {
    render(<Logo size={48} />)
    const img = screen.getByRole('img', { name: 'Suhba logo' })
    expect(img).toHaveAttribute('height', '48')
  })
})
