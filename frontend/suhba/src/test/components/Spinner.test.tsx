import { render, screen } from '@testing-library/react'
import { Spinner } from '@components/Spinner'

describe('Spinner', () => {
  it('renders an SVG with role="status"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has accessible aria-label', () => {
    render(<Spinner />)
    expect(screen.getByLabelText('Laden…')).toBeInTheDocument()
  })

  it('defaults to size 32', () => {
    render(<Spinner />)
    const svg = screen.getByRole('status')
    expect(svg).toHaveAttribute('width', '32')
    expect(svg).toHaveAttribute('height', '32')
  })

  it('applies a custom size', () => {
    render(<Spinner size={48} />)
    const svg = screen.getByRole('status')
    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '48')
  })

  it('renders size 16 correctly', () => {
    render(<Spinner size={16} />)
    const svg = screen.getByRole('status')
    expect(svg).toHaveAttribute('width', '16')
    expect(svg).toHaveAttribute('height', '16')
  })
})
