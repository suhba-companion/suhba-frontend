import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Content</p></Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('merges extra className', () => {
    render(<Card className="p-4"><p>Content</p></Card>)
    const wrapper = screen.getByText('Content').parentElement
    expect(wrapper?.className).toContain('p-4')
    expect(wrapper?.className).toContain('bg-cream-card')
  })
})
