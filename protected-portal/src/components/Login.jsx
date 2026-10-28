import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Mail,
  Moon,
  Network,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sun,
} from 'lucide-react'

export default function Login({
  onLogin,
  loading = false,
  error = '',
  theme = 'dark',
  onToggleTheme,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('real')
  const [showPassword, setShowPassword] = useState(false)

  const isLight = theme === 'light'

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    onLogin({ email: email.trim(), password, mode })
  }

  return (
    <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto' }}>
      {/* Top Bar with Mode and Theme Toggle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.05em' }}>
              TOKEN<span style={{ color: '#10b981' }}>TRAP</span>
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              PORTAL :5174
            </div>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          type="button"
          className="btn-secondary"
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          style={{ padding: '6px 12px', fontSize: '11px' }}
        >
          {isLight ? <Moon size={13} /> : <Sun size={13} style={{ color: '#f59e0b' }} />}
          <span>{isLight ? 'Dark' : 'Light'}</span>
        </button>
      </div>

      {/* Main Login Glass Card */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              fontSize: '10px',
              fontWeight: '600',
              marginBottom: '12px',
            }}
          >
            <ShieldCheck size={12} />
            PROTECTED ACCESS PORTAL
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
            Enterprise Authentication
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Sign in with verified credentials. Unauthorized or honey-token access is routed to an isolated simulated environment.
          </p>
        </div>

        {/* Demo Notice Banner */}
        <div
          style={{
            background: isLight ? 'rgba(6, 182, 212, 0.08)' : 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <Network size={16} style={{ color: '#06b6d4', marginTop: '2px', shrink: 0 }} />
          <div style={{ fontSize: '11px', color: isLight ? '#0e7490' : '#67e8f9', lineHeight: 1.4 }}>
            <strong>Isolated Demo Environment:</strong> Decoy logins receive synthetic resources. Real administrative logins receive protected telemetry.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Mode Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              AUTHENTICATION TARGET
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setMode('real')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: mode === 'real' ? '1px solid #10b981' : '1px solid var(--border-color)',
                  background: mode === 'real' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  color: mode === 'real' ? '#10b981' : 'var(--text-secondary)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: mode === 'real' ? '600' : '400',
                }}
              >
                <ShieldCheck size={16} />
                <div>
                  <div style={{ fontSize: '12px' }}>Genuine Account</div>
                  <div style={{ fontSize: '9px', opacity: 0.7 }}>Protected Workspace</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('decoy')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: mode === 'decoy' ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                  background: mode === 'decoy' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  color: mode === 'decoy' ? '#06b6d4' : 'var(--text-secondary)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: mode === 'decoy' ? '600' : '400',
                }}
              >
                <Network size={16} />
                <div>
                  <div style={{ fontSize: '12px' }}>Decoy Account</div>
                  <div style={{ fontSize: '9px', opacity: 0.7 }}>Simulated Workspace</div>
                </div>
              </button>
            </div>
          </div>

          {/* Email input */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="email"
                required
                className="input-field"
                style={{ paddingLeft: '36px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'real' ? 'admin@gmail.com' : 'visitor@gmail.com'}
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field"
                style={{ paddingLeft: '36px', paddingRight: '36px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '11px',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Environment</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Protected Environment is monitored by TokenTrap Security Center (:5173).
        </div>
      </div>
    </div>
  )
}
