import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Mail,
  Shield,
  ShieldCheck,
  Terminal,
  UserRound,
  Zap,
} from 'lucide-react'

export default function Login({ onLogin, loading = false, error = '' }) {
  const [mode, setMode] = useState('operator')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !password) {
      return
    }

    onLogin({
      email: email.trim(),
      password,
      mode,
    })
  }

  return (
    <main className="login-page">
      <div className="login-grid" />

      <section className="login-shell">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Shield size={25} />
            <span />
          </div>

          <div>
            <div className="login-brand-name">
              TOKEN<span>TRAP</span>
            </div>
            <div className="login-brand-caption">
              DECEPTION INTELLIGENCE PLATFORM
            </div>
          </div>
        </div>

        <div className="login-content">
          <div className="login-intro">
            <div className="login-eyebrow">
              <span className="login-status-dot" />
              SECURE ACCESS PORTAL
            </div>

            <h1>
              Trust nothing.
              <br />
              <span>Verify everything.</span>
            </h1>

            <p>
              Access the security operations center to monitor
              authentication activity, honey tokens, and decoy
              environments.
            </p>
          </div>

          <div className="login-card">
            <div className="login-card-heading">
              <div>
                <h2>Welcome back</h2>
                <p>Sign in to continue to your workspace.</p>
              </div>

              <div className="login-card-icon">
                <LockKeyhole size={20} />
              </div>
            </div>

            <div className="login-mode-label">ACCESS MODE</div>

            <div className="login-mode-switch">
              <button
                type="button"
                className={mode === 'operator' ? 'selected' : ''}
                onClick={() => setMode('operator')}
              >
                <ShieldCheck size={16} />
                Security operator
              </button>

              <button
                type="button"
                className={mode === 'decoy' ? 'selected decoy-selected' : ''}
                onClick={() => setMode('decoy')}
              >
                <Fingerprint size={16} />
                Decoy access
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="login-label" htmlFor="login-email">
                Email address
              </label>

              <div className="login-input-wrap">
                <Mail size={17} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="operator@tokentrap.local"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="login-password-heading">
                <label className="login-label" htmlFor="login-password">
                  Password
                </label>

                <span className="login-encryption-label">
                  <LockKeyhole size={11} />
                  PROTECTED
                </span>
              </div>

              <div className="login-input-wrap">
                <LockKeyhole size={17} />

                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
              )}

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Authenticate'}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="login-divider">
              <span />
              <span>SECURITY PROTOCOL</span>
              <span />
            </div>

            <div className="login-protocol">
              <div className="protocol-item">
                <ShieldCheck size={15} />
                <span>Verified access</span>
              </div>

              <div className="protocol-item">
                <Activity size={15} />
                <span>Session monitoring</span>
              </div>
            </div>
          </div>

          <div className="login-bottom-note">
            <Terminal size={14} />
            <span>TOKENTRAP SECURITY OPERATIONS CENTER</span>
            <span className="login-version">BUILD 0.1.0</span>
          </div>
        </div>

        <footer className="login-footer">
          <span>© 2026 TokenTrap</span>
          <span className="login-footer-right">
            <Zap size={12} />
            DECEPTION-BASED DEFENSE
          </span>
        </footer>
      </section>
    </main>
  )
}