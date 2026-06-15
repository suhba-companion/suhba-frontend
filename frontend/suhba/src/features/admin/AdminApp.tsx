import { useState, useEffect } from 'react'
import { adminService } from '@services/adminService'
import { LoadingState } from '@components/LoadingState'
import { AdminLoginPage } from './AdminLoginPage'
import { AdminDashboardPage } from './AdminDashboardPage'

type AuthState = 'loading' | 'unauthenticated' | 'authenticated'

export function AdminApp(): JSX.Element {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [username, setUsername] = useState('')

  useEffect(() => {
    adminService.me()
      .then(user => {
        setUsername(user.username)
        setAuthState('authenticated')
      })
      .catch(() => setAuthState('unauthenticated'))
  }, [])

  if (authState === 'loading') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-cream-bg">
        <LoadingState label="Laden…" />
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return (
      <AdminLoginPage
        onLogin={name => {
          setUsername(name)
          setAuthState('authenticated')
        }}
      />
    )
  }

  return (
    <AdminDashboardPage
      username={username}
      onLogout={() => {
        setUsername('')
        setAuthState('unauthenticated')
      }}
    />
  )
}
