import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RegistrationLink } from './RegistrationLink'

const URL = 'https://example.com/anmeldung'

describe('RegistrationLink', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true, writable: true,
    })
  })

  it('shows the link itself rather than a label', () => {
    render(<RegistrationLink url={URL} />)
    expect(screen.getByRole('link', { name: URL })).toBeInTheDocument()
    expect(screen.queryByText('Zur Anmeldung')).not.toBeInTheDocument()
  })

  it('opens the link in a new tab without leaking the opener', () => {
    render(<RegistrationLink url={URL} />)
    const link = screen.getByRole('link', { name: URL })
    expect(link).toHaveAttribute('href', URL)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('labels the copy button for screen readers and as a tooltip', () => {
    render(<RegistrationLink url={URL} />)
    const button = screen.getByRole('button', { name: 'Link kopieren' })
    expect(button).toHaveAttribute('title', 'Link kopieren')
  })

  it('copies the url when the button is pressed', async () => {
    render(<RegistrationLink url={URL} />)
    fireEvent.click(screen.getByRole('button', { name: 'Link kopieren' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(URL)
    // The confirmation lands a tick later; waiting for it keeps the state update
    // inside the test instead of firing after it has finished.
    await screen.findByRole('button', { name: 'Link kopiert' })
  })

  it('confirms the copy on the button itself', async () => {
    render(<RegistrationLink url={URL} />)
    fireEvent.click(screen.getByRole('button', { name: 'Link kopieren' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Link kopiert' })).toBeInTheDocument())
  })
})
