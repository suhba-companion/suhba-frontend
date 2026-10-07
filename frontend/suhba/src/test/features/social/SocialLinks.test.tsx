import { render, screen } from '@testing-library/react'
import { SocialLinks } from '@features/social'

describe('SocialLinks', () => {
  it('links to the Instagram account in a new tab', () => {
    render(<SocialLinks />)
    const link = screen.getByRole('link', { name: /instagram/i })
    expect(link).toHaveAttribute('href', 'https://www.instagram.com/suhba.companion/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('links to the TikTok account', () => {
    render(<SocialLinks />)
    expect(screen.getByRole('link', { name: /tiktok/i })).toHaveAttribute(
      'href',
      'https://www.tiktok.com/@suhba.companion',
    )
  })
})
