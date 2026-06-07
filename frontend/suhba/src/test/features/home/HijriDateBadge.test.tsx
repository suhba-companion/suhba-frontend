import { render, screen } from '@testing-library/react'
import { HijriDateBadge } from '@features/home/HijriDateBadge'

describe('HijriDateBadge', () => {
  it('renders without crashing', () => {
    expect(() => render(<HijriDateBadge />)).not.toThrow()
  })

  it('displays text ending with "H."', () => {
    render(<HijriDateBadge />)
    expect(screen.getByText(/H\.$/)).toBeInTheDocument()
  })

  it('displays a Hijri year in the 1440s', () => {
    render(<HijriDateBadge />)
    expect(screen.getByText(/14[4-9]\d H\./)).toBeInTheDocument()
  })

  it('displays a Hijri month name', () => {
    render(<HijriDateBadge />)
    const hijriMonths = [
      'Muharram', 'Safar', 'Rabiʻ al-Awwal', 'Rabiʻ al-Thani',
      'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
      'Ramadan', 'Shawwal', 'Dhul Qiʻdah', 'Dhul Hijjah',
    ]
    const text = screen.getByText(/H\.$/).textContent ?? ''
    const hasMonth = hijriMonths.some((m) => text.includes(m))
    expect(hasMonth).toBe(true)
  })

  it('renders a paragraph element', () => {
    const { container } = render(<HijriDateBadge />)
    expect(container.querySelector('p')).toBeInTheDocument()
  })
})
