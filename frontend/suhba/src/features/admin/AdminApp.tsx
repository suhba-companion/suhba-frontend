import { useState, useEffect } from 'react'
import { adminService } from '@services/adminService'
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
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EBE0CC',
        color: '#5E5E46',
        fontSize: '0.9rem',
      }}>
        Loading…
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
