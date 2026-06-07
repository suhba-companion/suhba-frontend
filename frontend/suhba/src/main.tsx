import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const isAdmin = window.location.pathname.startsWith('/admin')

if (isAdmin) {
  import('@features/admin/AdminApp').then(({ AdminApp }) => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <AdminApp />
      </StrictMode>,
    )
  })
} else {
  import('./i18n').then(() =>
    import('./App.tsx').then(({ default: App }) => {
      createRoot(document.getElementById('root')!).render(
        <StrictMode>
          <App />
        </StrictMode>,
      )
    })
  )
}
