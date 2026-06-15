import { useState, type FormEvent } from 'react'
import { adminService } from '@services/adminService'

interface AdminLoginPageProps {
  onLogin: (username: string) => void
}

export function AdminLoginPage({ onLogin }: AdminLoginPageProps): JSX.Element {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await adminService.login(username, password)
      onLogin(user.username)
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 429) {
        setError('Too many failed attempts. Try again in 15 minutes.')
      } else if (status === 401) {
        setError('Invalid username or password.')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-cream-bg p-4">
      <div className="bg-cream-card border border-divider rounded-card w-full max-w-sm p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-text-dark font-bold text-xl tracking-tight">Suhba admin</h1>
          <p className="text-text-muted text-sm mt-1">Admin-only access</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
              disabled={loading}
              className="w-full px-3 py-2.5 border border-divider rounded-lg bg-white text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
              className="w-full px-3 py-2.5 border border-divider rounded-lg bg-white text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            />
          </div>

          {error !== null && (
            <p className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || username.trim() === '' || password === ''}
            className="mt-1 w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
