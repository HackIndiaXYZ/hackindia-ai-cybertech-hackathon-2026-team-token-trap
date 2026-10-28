import { useEffect, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Database,
  Lock,
  LogOut,
  Moon,
  Server,
  Shield,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react'
import { portalApi } from '../api.js'

export default function GenuineWorkspace({
  token,
  userEmail,
  onLogout,
  theme,
  onToggleTheme,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isLight = theme === 'light'

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const res = await portalApi.getAdminOverview(token)
        setData(res)
      } catch (err) {
        setError(err.message || 'Failed to fetch genuine protected overview')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [token])

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700' }}>
              Protected Workspace
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              TokenTrap Genuine Production Node
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            type="button"
            className="btn-secondary"
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          >
            {isLight ? <Moon size={14} /> : <Sun size={14} style={{ color: '#f59e0b' }} />}
            <span>{isLight ? 'Dark' : 'Light'}</span>
          </button>

          {/* User info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              fontSize: '11px',
              fontWeight: '600',
            }}
          >
            <User size={13} />
            <span>{userEmail || 'admin@gmail.com'}</span>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            type="button"
            className="btn-secondary"
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Environment Status Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderLeft: '4px solid #10b981',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontSize: '11px',
                  fontWeight: '700',
                  marginBottom: '10px',
                }}
              >
                <div className="pulse-dot" style={{ background: '#10b981' }} />
                GENUINE ENVIRONMENT VERIFIED
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>
                Welcome to Authorized Management
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.5 }}>
                Your session is authenticated with genuine cryptographic JWT credentials signed by the backend authority. All actions are logged to the Security Monitoring Center (:5173).
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.15)',
                border: '1px solid var(--border-color)',
                minWidth: '180px',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SESSION STATUS</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} /> Validated (900s)
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                Role: Genuine Administrator
              </div>
            </div>
          </div>
        </div>

        {/* Backend Fetched Telemetry */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} style={{ color: '#10b981' }} />
            Verified Infrastructure Overview (Backend API)
          </h3>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              Fetching verified telemetry from /api/admin/overview...
            </div>
          ) : error ? (
            <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '12px' }}>
              {error}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SYSTEM STATUS</div>
                <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '6px', color: '#10b981' }}>
                  {data?.data?.system_status?.toUpperCase() || 'OPERATIONAL'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Cluster: {data?.data?.soc_cluster || 'node-01'}
                </div>
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DETECTION ENGINE</div>
                <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '6px', color: '#06b6d4' }}>
                  {data?.data?.threat_detection_engine?.toUpperCase() || 'ACTIVE'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Active monitors: {data?.data?.active_monitors || 8}
                </div>
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ENVIRONMENT NOTE</div>
                <div style={{ fontSize: '11px', marginTop: '6px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {data?.data?.note || 'Safe administrative data; no real personal records exposed.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Shield size={16} style={{ color: '#10b981', shrink: 0 }} />
          <span>
            You are viewing the genuine administrative environment. Honey-token decoy sessions cannot reach this endpoint; any attempt triggers a <code>genuine_access_rejected</code> event in the SOC dashboard.
          </span>
        </div>
      </div>
    </div>
  )
}
