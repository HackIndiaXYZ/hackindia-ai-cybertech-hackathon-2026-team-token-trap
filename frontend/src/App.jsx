import { useState } from 'react'
import Dashboard from './Dashboard.jsx'
import Login from './components/Login.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)

  async function handleLogin(credentials) {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          mode: credentials.mode,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'Authentication failed. Check your credentials.',
        )
      }

      if (!data.access_token) {
        throw new Error('The backend did not return an access token.')
      }

      setSession({
        token: data.access_token,
        mode: data.mode || credentials.mode || 'real',
      })

      setAuthenticated(true)
      setError('')
    } catch (err) {
      setError(
        err.message ||
          'Unable to connect to TokenTrap. Check that the backend is running.',
      )
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    setAuthenticated(false)
    setSession(null)
    setError('')
  }

  if (!authenticated || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b10] p-4">
        <Login
          onLogin={handleLogin}
          loading={loading}
          error={error}
        />
      </div>
    )
  }

  return (
    <Dashboard
      token={session.token}
      mode={session.mode}
      onLogout={handleLogout}
    />
  )
}