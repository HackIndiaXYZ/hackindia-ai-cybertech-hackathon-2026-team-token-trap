import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Fingerprint,
  Key,
  Lock,
  LogOut,
  Moon,
  Network,
  Radio,
  Shield,
  ShieldAlert,
  Sun,
  User,
} from 'lucide-react'
import { portalApi } from '../api.js'

export default function DecoyWorkspace({
  token,
  userEmail,
  onLogout,
  theme,
  onToggleTheme,
}) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activatingId, setActivatingId] = useState(null)
  const [activePayload, setActivePayload] = useState(null)
  const [activatedResources, setActivatedResources] = useState(new Set())
  const [error, setError] = useState('')

  const isLight = theme === 'light'

  useEffect(() => {
    async function loadDecoyData() {
      try {
        setLoading(true)
        const res = await portalApi.getDecoyDocuments(token)
        setDocuments(res.documents || [])
      } catch (err) {
        setError(err.message || 'Failed to fetch simulated workspace resources')
      } finally {
        setLoading(false)
      }
    }
    loadDecoyData()
  }, [token])

  async function handleOpenResource(resourceId) {
    setActivatingId(resourceId)
    setError('')
    try {
      // Call live backend activation endpoint!
      const res = await portalApi.activateResource(token, resourceId)
      setActivePayload(res)
      setActivatedResources((prev) => new Set([...prev, resourceId]))
    } catch (err) {
      setError(err.message || `Failed to access resource ${resourceId}`)
    } finally {
      setActivatingId(null)
    }
  }

  function getIcon(type) {
    if (type === 'credentials' || type === 'service_token') return Key
    if (type === 'database_dump') return Database
    return FileText
  }

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
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4',
            }}
          >
            <Network size={20} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700' }}>
              Simulated Decoy Workspace
            </div>
            <div style={{ fontSize: '11px', color: '#06b6d4', fontWeight: '500' }}>
              Isolated Sandbox · Canary Environment
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

          {/* User info badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              color: '#06b6d4',
              fontSize: '11px',
              fontWeight: '600',
            }}
          >
            <User size={13} />
            <span>{userEmail || 'visitor@gmail.com'}</span>
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

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Isolated Environment Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderLeft: '4px solid #06b6d4',
            background: isLight ? 'rgba(6, 182, 212, 0.04)' : 'rgba(6, 182, 212, 0.06)',
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
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#06b6d4',
                  fontSize: '11px',
                  fontWeight: '700',
                  marginBottom: '10px',
                }}
              >
                <div className="pulse-dot" style={{ background: '#06b6d4' }} />
                ISOLATED SIMULATED WORKSPACE
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>
                Synthetic Corporate File Store
              </h2>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.5 }}>
                You have authenticated using a configured decoy account. The files shown below are <strong>synthetic honey-tokens</strong>. Any interaction with these files notifies the backend and creates real-time security alerts on the Security Monitoring Center (:5173).
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
                minWidth: '190px',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DECEPTION STATUS</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={15} /> Decoy Session Active
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                Activated Tokens: {activatedResources.size} of {documents.length}
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '12px',
            }}
          >
            {error}
          </div>
        )}

        {/* Live Activated Payload Modal / Detail Box */}
        {activePayload && (
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              background: isLight ? '#fffbeb' : 'rgba(245, 158, 11, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '14px', fontWeight: '700', color: isLight ? '#b45309' : '#fbbf24' }}>
                  HONEY TOKEN TRIGGERED: {activePayload.name} ({activePayload.resource_id})
                </span>
              </div>
              <button
                onClick={() => setActivePayload(null)}
                style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                Dismiss
              </button>
            </div>

            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                padding: '12px',
                borderRadius: '8px',
                color: isLight ? '#0f172a' : '#f8fafc',
                whiteSpace: 'pre-wrap',
                marginBottom: '10px',
              }}
            >
              {activePayload.preview}
            </div>

            <div style={{ fontSize: '11px', color: isLight ? '#b45309' : '#fcd34d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Fingerprint size={14} />
              <span>
                Backend response: <code>decoy_token_activation</code> event recorded with severity CRITICAL. Check Security Monitoring Center (:5173).
              </span>
            </div>
          </div>
        )}

        {/* Synthetic Documents List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700' }}>
                Synthetic Resources & Canary Documents
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Clicking "Inspect / Open" executes a genuine POST to /api/decoy/resources/&#123;id&#125;/activate
              </p>
            </div>
            <span
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
              }}
            >
              SIMULATED DATA
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              Loading synthetic documents from /api/decoy/documents...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {documents.map((doc) => {
                const Icon = getIcon(doc.type)
                const isActivated = activatedResources.has(doc.id)
                const isCurrentActivating = activatingId === doc.id

                return (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '10px',
                      border: isActivated ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                      background: isActivated
                        ? isLight ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.04)'
                        : isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: isActivated ? 'rgba(245, 158, 11, 0.15)' : 'rgba(6, 182, 212, 0.1)',
                          color: isActivated ? '#f59e0b' : '#06b6d4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={18} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>
                            {doc.name}
                          </span>
                          <span
                            style={{
                              fontSize: '9px',
                              fontFamily: 'monospace',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(0, 0, 0, 0.15)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {doc.id}
                          </span>
                          {isActivated && (
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: '700',
                                color: '#f59e0b',
                                background: 'rgba(245, 158, 11, 0.15)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              ACTIVATED
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                          Classification: {doc.classification}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenResource(doc.id)}
                      disabled={isCurrentActivating}
                      className="btn-secondary"
                      style={{
                        padding: '8px 14px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: isActivated ? '#f59e0b' : '#06b6d4',
                        borderColor: isActivated ? 'rgba(245, 158, 11, 0.3)' : 'rgba(6, 182, 212, 0.3)',
                      }}
                    >
                      {isCurrentActivating ? (
                        <span>Activating...</span>
                      ) : (
                        <>
                          <Eye size={13} />
                          <span>Inspect / Open</span>
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
