import { useEffect, useState } from 'react'
import Dashboard from './Dashboard.jsx'
import Login from './components/Login.jsx'
import { api } from './api/client.js'

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('tokentrap_theme') || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('tokentrap_theme', theme)
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
      const data = await api.login({
        email: credentials.email,
        password: credentials.password,
        mode: credentials.mode,
      })

      if (!data.access_token) {
        throw new Error('The backend did not return an access token.')
      }

      setSession({
        token: data.access_token,
        mode: data.mode || credentials.mode || 'real',
        email: credentials.email,
      })

      setAuthenticated(true)
      setError('')
    } catch (err) {
      setError(
        err.message ||
          'Unable to connect to TokenTrap backend. Check that the service is running on port 8000.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    if (session?.token) {
      try {
        await api.logout(session.token)
      } catch {
        // Safe to ignore network failure during logout
      }
    }
    setAuthenticated(false)
    setSession(null)
    setError('')
  }

  if (!authenticated || !session) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center p-4 transition-colors duration-200 ${
          theme === 'light' ? 'bg-slate-100' : 'bg-[#080b10]'
        }`}
      >
        <Login
          onLogin={handleLogin}
          loading={loading}
          error={error}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>
    )
  }

  return (
    <Dashboard
      token={session.token}
      mode={session.mode}
      userEmail={session.email}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  )
}