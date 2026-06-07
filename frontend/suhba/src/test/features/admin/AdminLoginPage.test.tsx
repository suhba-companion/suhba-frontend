import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminLoginPage } from '@features/admin/AdminLoginPage'

vi.mock('@services/adminService', () => ({
  adminService: { login: vi.fn() },
}))

import { adminService } from '@services/adminService'
const mockLogin = vi.mocked(adminService.login)

function fillForm(username = 'admin', password = 'secret'): void {
  const usernameInput = screen.getByRole('textbox')
  const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
  fireEvent.change(usernameInput, { target: { value: username } })
  fireEvent.change(passwordInput, { target: { value: password } })
}

function submitForm(): void {
  const form = document.querySelector('form') as HTMLFormElement
  fireEvent.submit(form)
}

describe('AdminLoginPage', () => {
  const onLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders username text input', () => {
    render(<AdminLoginPage onLogin={onLogin} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders password input', () => {
    render(<AdminLoginPage onLogin={onLogin} />)
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('renders "Sign in" button', () => {
    render(<AdminLoginPage onLogin={onLogin} />)
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('submit button is disabled when username is empty', () => {
    render(<AdminLoginPage onLogin={onLogin} />)
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
  })

  it('submit button is enabled when both fields are filled', () => {
    render(<AdminLoginPage onLogin={onLogin} />)
    fillForm()
    expect(screen.getByRole('button', { name: 'Sign in' })).not.toBeDisabled()
  })

  it('calls onLogin with username on successful login', async () => {
    mockLogin.mockResolvedValueOnce({ username: 'admin' })
    render(<AdminLoginPage onLogin={onLogin} />)
    fillForm()
    submitForm()
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith('admin'))
  })

  it('shows invalid credentials error on 401', async () => {
    mockLogin.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { status: 401 }))
    render(<AdminLoginPage onLogin={onLogin} />)
    fillForm()
    submitForm()
    await waitFor(() =>
      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument()
    )
  })

  it('shows rate limit error on 429', async () => {
    mockLogin.mockRejectedValueOnce(Object.assign(new Error('Too Many'), { status: 429 }))
    render(<AdminLoginPage onLogin={onLogin} />)
    fillForm()
    submitForm()
    await waitFor(() =>
      expect(screen.getByText('Too many failed attempts. Try again in 15 minutes.')).toBeInTheDocument()
    )
  })

  it('shows generic error for unknown failures', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'))
    render(<AdminLoginPage onLogin={onLogin} />)
    fillForm()
    submitForm()
    await waitFor(() =>
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
    )
  })

  it('shows "Signing in…" while loading', async () => {
    mockLogin.mockReturnValue(new Promise(() => {}))
    render(<AdminLoginPage onLogin={onLogin} />)
    fillForm()
    submitForm()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Signing in/ })).toBeInTheDocument()
    )
  })

  it('does not call onLogin on failed login', async () => {
    mockLogin.mockRejectedValueOnce(Object.assign(new Error('Bad'), { status: 401 }))
    render(<AdminLoginPage onLogin={onLogin} />)
    fillForm()
    submitForm()
    await waitFor(() => screen.getByText('Invalid username or password.'))
    expect(onLogin).not.toHaveBeenCalled()
  })
})
