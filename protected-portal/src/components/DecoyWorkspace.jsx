import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  Code2,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Fingerprint,
  HardDrive,
  Key,
  Layers,
  Lock,
  LogOut,
  Moon,
  Network,
  Play,
  Radio,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  Sun,
  Table,
  Terminal,
  User,
  Zap,
} from 'lucide-react'
import { portalApi } from '../api.js'

export default function DecoyWorkspace({
  token,
  userEmail,
  onLogout,
  theme,
  onToggleTheme,
}) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('database') // 'database' | 'documents'

  // Documents state
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [activatingDocId, setActivatingDocId] = useState(null)
  const [activeDocPayload, setActiveDocPayload] = useState(null)
  const [activatedResources, setActivatedResources] = useState(new Set())

  // Database Sandbox state
  const [sandboxTables, setSandboxTables] = useState([])
  const [selectedTable, setSelectedTable] = useState('honey_financial_ledgers')
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM honey_financial_ledgers LIMIT 10;')
  const [queryResult, setQueryResult] = useState(null)
  const [executingQuery, setExecutingQuery] = useState(false)
  const [loadingTables, setLoadingTables] = useState(true)
  const [canaryBanner, setCanaryBanner] = useState(null)
  const [exportData, setExportData] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [copiedDump, setCopiedDump] = useState(false)
  const [error, setError] = useState('')

  const isLight = theme === 'light'

  // Load sandbox tables and documents on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingTables(true)
        const [tablesRes, docsRes] = await Promise.all([
          portalApi.getSandboxTables(token),
          portalApi.getDecoyDocuments(token).catch(() => ({ documents: [] })),
        ])

        setSandboxTables(tablesRes.tables || [])
        setDocuments(docsRes.documents || [])

        // Initial default query execution
        if (tablesRes.tables && tablesRes.tables.length > 0) {
          const firstTbl = tablesRes.tables[0].table_name
          setSelectedTable(firstTbl)
          setSqlQuery(`SELECT * FROM ${firstTbl} LIMIT 10;`)
          const recRes = await portalApi.getSandboxTableRecords(token, firstTbl)
          setQueryResult({
            status: 'success',
            target_table: firstTbl,
            columns: recRes.columns,
            rows: recRes.rows,
            row_count: recRes.row_count,
            execution_time_ms: 6.4,
            is_sql_injection: false,
          })
          setCanaryBanner({
            type: 'TABLE_ACCESS',
            message: `Decoy table '${firstTbl}' accessed. Live honey-token tripped on SOC Dashboard (:5173).`,
            severity: 'HIGH',
          })
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize sandbox environment')
      } finally {
        setLoadingTables(false)
      }
    }

    loadData()
  }, [token])

  // Handle switching table
  async function handleSelectTable(tableName) {
    setSelectedTable(tableName)
    const newQuery = `SELECT * FROM ${tableName} LIMIT 10;`
    setSqlQuery(newQuery)
    setError('')
    setExportData(null)
    setExecutingQuery(true)

    try {
      const res = await portalApi.getSandboxTableRecords(token, tableName)
      setQueryResult({
        status: 'success',
        target_table: tableName,
        columns: res.columns,
        rows: res.rows,
        row_count: res.row_count,
        execution_time_ms: 7.2,
        is_sql_injection: false,
      })
      setCanaryBanner({
        type: 'TABLE_ACCESS',
        message: `Honey-token table '${tableName}' accessed. Real-time alert dispatched to SOC Monitoring Center.`,
        severity: 'HIGH',
      })
    } catch (err) {
      setError(err.message || `Failed to fetch records for ${tableName}`)
    } finally {
      setExecutingQuery(false)
    }
  }

  // Handle running custom SQL query
  async function handleRunQuery(customQuery) {
    const q = (customQuery || sqlQuery).trim()
    if (!q) return

    setExecutingQuery(true)
    setError('')
    setExportData(null)

    try {
      const res = await portalApi.executeSandboxQuery(token, q)
      setQueryResult(res)

      if (res.is_sql_injection) {
        setCanaryBanner({
          type: 'SQLI_ATTACK',
          message: `🚨 CRITICAL ALERT: SQL injection pattern detected ('${res.sqli_pattern_detected}'). Intruder flagged in SOC!`,
          severity: 'CRITICAL',
        })
      } else {
        setCanaryBanner({
          type: 'QUERY_EXECUTED',
          message: `SQL executed on '${res.target_table}'. Canary token '${res.canary_token}' activated.`,
          severity: 'HIGH',
        })
      }
    } catch (err) {
      setError(err.message || 'SQL query execution failed')
    } finally {
      setExecutingQuery(false)
    }
  }

  // Handle exporting data dump (simulated exfiltration trap)
  async function handleExport(format) {
    if (!selectedTable) return
    setExporting(true)
    setError('')

    try {
      const res = await portalApi.exportSandboxTable(token, selectedTable, format)
      setExportData(res)
      setCanaryBanner({
        type: 'DATA_EXFILTRATION',
        message: `🚨 CRITICAL HONEY TRAP: Data exfiltration dump attempted (${format.toUpperCase()}). Honey-token signature extracted!`,
        severity: 'CRITICAL',
      })
    } catch (err) {
      setError(err.message || 'Failed to export table')
    } finally {
      setExporting(false)
    }
  }

  // Handle opening document resource
  async function handleOpenResource(resourceId) {
    setActivatingDocId(resourceId)
    setError('')
    try {
      const res = await portalApi.activateResource(token, resourceId)
      setActiveDocPayload(res)
      setActivatedResources((prev) => new Set([...prev, resourceId]))
    } catch (err) {
      setError(err.message || `Failed to access resource ${resourceId}`)
    } finally {
      setActivatingDocId(null)
    }
  }

  function handleCopyDump() {
    if (exportData?.content) {
      navigator.clipboard.writeText(exportData.content)
      setCopiedDump(true)
      setTimeout(() => setCopiedDump(false), 2000)
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4',
            }}
          >
            <Database size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>
              Deception Sandbox Environment
            </div>
            <div style={{ fontSize: '11px', color: '#06b6d4', fontWeight: '500' }}>
              PostgreSQL 16 Cluster Sandbox · Visitor Telemetry & Honey-Tokens Active
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

      {/* Workspace Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '8px',
        }}
      >
        <button
          onClick={() => setActiveTab('database')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: activeTab === 'database' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
            background: activeTab === 'database' ? (isLight ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.15)') : 'transparent',
            color: activeTab === 'database' ? '#06b6d4' : 'var(--text-secondary)',
            fontWeight: activeTab === 'database' ? '700' : '500',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Database size={16} />
          <span>PostgreSQL Database Sandbox</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.2)',
              color: '#06b6d4',
              fontWeight: '700',
            }}
          >
            4 Canary Tables
          </span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: activeTab === 'documents' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
            background: activeTab === 'documents' ? (isLight ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.15)') : 'transparent',
            color: activeTab === 'documents' ? '#06b6d4' : 'var(--text-secondary)',
            fontWeight: activeTab === 'documents' ? '700' : '500',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <FileText size={16} />
          <span>Canary Documents Vault</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-muted)',
            }}
          >
            {documents.length} Files
          </span>
        </button>
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
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: POSTGRESQL DATABASE SANDBOX */}
      {/* ============================================================== */}
      {activeTab === 'database' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Real-time Tracking & Honey-Token Tripwire Alert Banner */}
          {canaryBanner && (
            <div
              className="glass-panel"
              style={{
                padding: '16px 20px',
                borderLeft: `4px solid ${canaryBanner.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`,
                background:
                  canaryBanner.severity === 'CRITICAL'
                    ? isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.08)'
                    : isLight ? '#fffbeb' : 'rgba(245, 158, 11, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {canaryBanner.severity === 'CRITICAL' ? (
                  <ShieldAlert size={20} style={{ color: '#ef4444' }} />
                ) : (
                  <Fingerprint size={20} style={{ color: '#f59e0b' }} />
                )}
                <div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: canaryBanner.severity === 'CRITICAL' ? (isLight ? '#b91c1c' : '#f87171') : (isLight ? '#b45309' : '#fbbf24'),
                    }}
                  >
                    {canaryBanner.message}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Visitor session logged & telemetry streaming live to SOC Monitoring Center (:5173).
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: canaryBanner.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: canaryBanner.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                }}
              >
                {canaryBanner.severity} DETECTED
              </div>
            </div>
          )}

          {/* Database Cluster Status Card */}
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              border: '1px solid var(--border-color)',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="pulse-dot" style={{ background: '#10b981' }} />
                  <span style={{ fontSize: '14px', fontWeight: '700' }}>
                    Database Sandbox Node: tokentrap_sandbox (PostgreSQL 16)
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Intruder sandbox database with synthetic customer PII, SWIFT transfers, and admin credentials. All queries are trapped and logged.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleExport('sql')}
                  disabled={exporting}
                  className="btn-secondary"
                  style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={13} />
                  <span>{exporting ? 'Dumping...' : 'Export SQL Dump'}</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="btn-secondary"
                  style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table Selector Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {sandboxTables.map((t) => {
                const isSelected = selectedTable === t.table_name
                return (
                  <button
                    key={t.table_name}
                    onClick={() => handleSelectTable(t.table_name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.15)' : (isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.2)'),
                      color: isSelected ? '#06b6d4' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: isSelected ? '700' : '500',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Table size={14} />
                    <span>{t.table_name}</span>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: isSelected ? '#06b6d4' : 'var(--border-color)',
                        color: isSelected ? '#0d131d' : 'var(--text-muted)',
                        fontWeight: '700',
                      }}
                    >
                      {t.approximate_rows} rows
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interactive SQL Console */}
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              border: '1px solid var(--border-color)',
              background: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} style={{ color: '#06b6d4' }} />
                <span style={{ fontSize: '13px', fontWeight: '700' }}>
                  Interactive SQL Query Console
                </span>
              </div>

              {/* Quick Query Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginRight: '4px' }}>
                  Attack Simulation Presets:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const q = 'SELECT * FROM honey_financial_ledgers WHERE amount_usd > 1000000;'
                    setSqlQuery(q)
                    handleRunQuery(q)
                  }}
                  style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(6, 182, 212, 0.1)',
                    color: '#06b6d4',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Wire Transfers &gt; $1M
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const q = 'SELECT username, argon2_hash, api_token FROM honey_user_credentials;'
                    setSqlQuery(q)
                    handleRunQuery(q)
                  }}
                  style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    cursor: 'pointer',
                  }}
                >
                  🔑 Dump Root Hashes
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const q = "SELECT * FROM honey_user_credentials WHERE username = 'admin' OR '1'='1';"
                    setSqlQuery(q)
                    handleRunQuery(q)
                  }}
                  style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontWeight: '700',
                  }}
                >
                  🚨 Inject: ' OR 1=1--
                </button>
              </div>
            </div>

            {/* SQL Code Input */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '13px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: isLight ? '#f8fafc' : '#0a0f16',
                  color: isLight ? '#0f172a' : '#38bdf8',
                  outline: 'none',
                  resize: 'vertical',
                }}
                placeholder="Enter SQL query (e.g., SELECT * FROM honey_financial_ledgers;)"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Targeting: <code>{selectedTable}</code> · Real PostgreSQL SQL parser with SQLi tripwire traps.
              </div>

              <button
                onClick={() => handleRunQuery()}
                disabled={executingQuery}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: '#06b6d4',
                  color: '#0d131d',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
                }}
              >
                {executingQuery ? (
                  <>
                    <RefreshCw size={13} className="spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play size={13} />
                    <span>Execute SQL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Export Dump Modal / Drawer */}
          {exportData && (
            <div
              className="glass-panel"
              style={{
                padding: '20px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                background: isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} style={{ color: '#ef4444' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: isLight ? '#b91c1c' : '#f87171' }}>
                    EXFILTRATED CANARY ARCHIVE: {exportData.filename}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCopyDump}
                    className="btn-secondary"
                    style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedDump ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                    <span>{copiedDump ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={() => setExportData(null)}
                    style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <pre
                style={{
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '11px',
                  background: isLight ? '#ffffff' : '#05070a',
                  border: '1px solid var(--border-color)',
                  padding: '12px',
                  borderRadius: '6px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  color: isLight ? '#0f172a' : '#cbd5e1',
                }}
              >
                {exportData.content}
              </pre>

              <div style={{ fontSize: '11px', color: isLight ? '#b91c1c' : '#fca5a5', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Fingerprint size={13} />
                <span>
                  Honey Token Signature: <code>{exportData.canary_token}</code>. Exfiltration logged in <code>security_events</code> with severity <strong>CRITICAL</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Results Grid Table */}
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              border: '1px solid var(--border-color)',
              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} style={{ color: '#06b6d4' }} />
                <span style={{ fontSize: '14px', fontWeight: '700' }}>
                  Query Results
                </span>
                {queryResult && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginLeft: '6px',
                    }}
                  >
                    ({queryResult.row_count} rows returned in {queryResult.execution_time_ms}ms)
                  </span>
                )}
              </div>

              {queryResult?.is_sql_injection && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.15)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  SQL INJECTION DETECTED
                </span>
              )}
            </div>

            {/* Table Container */}
            <div style={{ overflowX: 'auto' }}>
              {queryResult && queryResult.rows && queryResult.rows.length > 0 ? (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                    fontFamily: 'Consolas, Monaco, monospace',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                        borderBottom: '2px solid var(--border-color)',
                        textAlign: 'left',
                      }}
                    >
                      {queryResult.columns.map((col) => (
                        <th
                          key={col}
                          style={{
                            padding: '10px 12px',
                            color: '#06b6d4',
                            fontWeight: '700',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          background:
                            idx % 2 === 0
                              ? 'transparent'
                              : isLight ? 'rgba(0, 0, 0, 0.015)' : 'rgba(255, 255, 255, 0.015)',
                          transition: 'background 0.15s',
                        }}
                      >
                        {queryResult.columns.map((col) => {
                          const val = row[col]
                          const isCanary =
                            typeof val === 'string' &&
                            (val.includes('CANARY') || val.includes('TRIPWIRE') || val.includes('$argon2id'))

                          return (
                            <td
                              key={col}
                              style={{
                                padding: '10px 12px',
                                color: isCanary
                                  ? '#f59e0b'
                                  : isLight ? '#0f172a' : '#e2e8f0',
                                fontWeight: isCanary ? '700' : '400',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {val !== null && val !== undefined ? String(val) : <em style={{ color: 'var(--text-muted)' }}>NULL</em>}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No records returned for this query.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CANARY DOCUMENTS VAULT */}
      {/* ============================================================== */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Live Activated Payload Box */}
          {activeDocPayload && (
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
                    HONEY TOKEN TRIGGERED: {activeDocPayload.name} ({activeDocPayload.resource_id})
                  </span>
                </div>
                <button
                  onClick={() => setActiveDocPayload(null)}
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
                {activeDocPayload.preview}
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
                  Synthetic Canary Files & Bait Records
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Clicking "Inspect / Open" executes POST /api/decoy/resources/&#123;id&#125;/activate and alerts the SOC
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {documents.map((doc) => {
                const isActivated = activatedResources.has(doc.id)
                const isCurrentActivating = activatingDocId === doc.id

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
                        {doc.type === 'credentials' ? <Key size={18} /> : doc.type === 'database_dump' ? <Database size={18} /> : <FileText size={18} />}
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
          </div>
        </div>
      )}
    </div>
  )
}
