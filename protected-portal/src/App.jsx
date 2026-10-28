import { useEffect, useState } from 'react'
import Login from './components/Login.jsx'
import GenuineWorkspace from './components/GenuineWorkspace.jsx'
import DecoyWorkspace from './components/DecoyWorkspace.jsx'
import { portalApi } from './api.js'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('tokentrap_portal_theme') || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('tokentrap_portal_theme', theme)
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme')
    } else {
      document.documentElement.classList.remove('light-theme')
    }
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  async function handleLogin(credentials) {
    setLoading(true)
    setError('')

    try {
      const data = await portalApi.login(
        credentials.email,
        credentials.password,
        credentials.mode,
      )

      if (!data.access_token) {
        throw new Error('Backend did not return an access token')
      }

      setSession({
        token: data.access_token,
        mode: data.mode || credentials.mode,
        email: credentials.email,
      })
      setError('')
    } catch (err) {
      setError(
        err.message ||
          'Unable to reach TokenTrap backend on port 8000. Ensure the backend server is running.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    if (session?.token) {
      try {
        await portalApi.logout(session.token)
      } catch {
        // Safe to ignore network failure during logout
      }
    }
    setSession(null)
    setError('')
  }

  return (
    <div
      className="grid-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
      }}
    >
      {!session ? (
        <Login
          onLogin={handleLogin}
          loading={loading}
          error={error}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : session.mode === 'real' ? (
        <GenuineWorkspace
          token={session.token}
          userEmail={session.email}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <DecoyWorkspace
          token={session.token}
          userEmail={session.email}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  )
}
