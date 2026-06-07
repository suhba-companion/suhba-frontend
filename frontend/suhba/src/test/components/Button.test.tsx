import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@components/Button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('has type="button" by default', () => {
    render(<Button>OK</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('calls onClick when clicked', () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onClick when disabled', () => {
    const handler = vi.fn()
    render(<Button disabled onClick={handler}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handler).not.toHaveBeenCalled()
  })

  it('applies additional className', () => {
    render(<Button className="extra-class">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('extra-class')
  })

  it('renders with primary variant classes by default', () => {
    render(<Button>Click</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-tip-gradient')
  })

  it('renders with ghost variant classes', () => {
    render(<Button variant="ghost">Click</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-btn-ghost')
  })

  it('renders with sm size classes', () => {
    render(<Button size="sm">Click</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('px-3')
  })

  it('renders with lg size classes', () => {
    render(<Button size="lg">Click</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('w-full')
  })
})
