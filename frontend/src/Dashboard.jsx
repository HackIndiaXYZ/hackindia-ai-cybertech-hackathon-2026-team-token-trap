import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Command,
  Database,
  FileWarning,
  Fingerprint,
  Globe,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  Network,
  Radar,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sun,
  UserCheck,
  Zap,
} from 'lucide-react'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { api } from './api/client.js'

const navigation = [
  {
    label: 'OVERVIEW',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard },
      { name: 'Live Events', icon: Activity },
      { name: 'Threat Intelligence', icon: Radar },
    ],
  },
  {
    label: 'DECEPTION LAYER',
    items: [
      { name: 'Honey Tokens', icon: Fingerprint },
      { name: 'Decoy Environment', icon: Network },
      { name: 'Fake Documents', icon: FileWarning },
    ],
  },
  {
    label: 'INFRASTRUCTURE',
    items: [
      { name: 'Database Security', icon: Database },
      { name: 'Access Control', icon: LockKeyhole },
    ],
  },
]

const tone = {
  red: 'text-red-400 bg-red-400/10 border-red-400/20',
  orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  green: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  blue: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
}

const lightTone = {
  red: 'text-red-600 bg-red-50 border-red-200',
  orange: 'text-orange-600 bg-orange-50 border-orange-200',
  yellow: 'text-amber-600 bg-amber-50 border-amber-200',
  green: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  blue: 'text-cyan-700 bg-cyan-50 border-cyan-200',
}

function Brand({ isLight }) {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 glow-green">
        <Shield size={22} strokeWidth={1.8} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0b0f15] bg-emerald-400" />
      </div>

      <div>
        <div className={`text-[15px] font-bold tracking-[0.12em] ${isLight ? 'text-slate-900' : 'text-white'}`}>
          TOKEN<span className="text-emerald-500">TRAP</span>
        </div>
        <div className="mt-0.5 text-[9px] tracking-[0.23em] text-slate-500">
          DECEPTION INTELLIGENCE
        </div>
      </div>
    </div>
  )
}

function Sidebar({ active, onNavigate, open, onClose, isLight }) {
  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${
          isLight
            ? 'border-slate-200 bg-white text-slate-700'
            : 'border-white/[0.07] bg-[#0b0f15] text-slate-300'
        }`}
      >
        <Brand isLight={isLight} />

        <div
          className={`mx-4 mt-3 flex items-center gap-2 rounded-lg border px-3 py-2.5 ${
            isLight
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300'
          }`}
        >
          <span className="status-dot h-2 w-2 rounded-full bg-emerald-500 text-emerald-500" />
          <span className="text-[11px] font-medium">Defense engine online</span>
          <ShieldCheck className="ml-auto text-emerald-500" size={15} />
        </div>

        <nav className="mt-6 flex-1 space-y-6 overflow-y-auto px-3">
          {navigation.map((group) => (
            <div key={group.label}>
              <div className="mb-2 px-3 text-[9px] font-semibold tracking-[0.2em] text-slate-400">
                {group.label}
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const selected = active === item.name

                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        onNavigate(item.name)
                        onClose()
                      }}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium transition ${
                        selected
                          ? isLight
                            ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                            : 'border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300'
                          : isLight
                          ? 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          : 'border border-transparent text-slate-400 hover:bg-white/[0.035] hover:text-slate-200'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.8} />
                      <span className="flex-1">{item.name}</span>
                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div
          className={`m-3 rounded-xl border p-4 ${
            isLight
              ? 'border-slate-200 bg-slate-50'
              : 'border-white/[0.07] bg-[#10151d]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-500">
              <Command size={15} />
            </div>
            <div>
              <div className={`text-[11px] font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                TokenTrap SOC
              </div>
              <div className="mt-0.5 text-[9px] text-slate-500">FastAPI backend · Port 8000</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Access role</span>
            <span className="font-semibold text-emerald-500">Genuine Admin</span>
          </div>
        </div>
      </aside>
    </>
  )
}

function Header({
  active,
  onMenu,
  search,
  setSearch,
  onLogout,
  theme,
  onToggleTheme,
  onRefresh,
  loading,
  userEmail,
}) {
  const isLight = theme === 'light'
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header
      className={`sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b px-4 backdrop-blur-xl sm:px-7 transition-colors duration-200 ${
        isLight
          ? 'border-slate-200 bg-white/90 text-slate-800'
          : 'border-white/[0.07] bg-[#0a0e14]/90 text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-lg border border-slate-300 dark:border-white/10 p-2 text-slate-500 hover:text-slate-800 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <div>
          <div className={`text-[15px] font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {active}
          </div>
          <div className="hidden text-[10px] text-slate-500 sm:block">
            Security Operations Center <span className="mx-1 text-slate-400">/</span> {active}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div
          className={`hidden h-9 items-center gap-2 rounded-lg border px-3 md:flex ${
            isLight
              ? 'border-slate-200 bg-slate-50 text-slate-800'
              : 'border-white/[0.08] bg-white/[0.025] text-slate-200'
          }`}
        >
          <Search size={14} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, IP, IDs..."
            className="w-36 bg-transparent text-[11px] outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh monitoring data"
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            isLight
              ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-emerald-500' : ''} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Theme Toggle Button (Requested feature) */}
        <button
          onClick={onToggleTheme}
          aria-label="Switch between dark and light mode"
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            isLight
              ? 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
          }`}
        >
          {isLight ? (
            <>
              <Moon size={14} className="text-slate-700" />
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            aria-label="Notifications"
            onClick={() => setNotifOpen(!notifOpen)}
            className={`relative rounded-lg border p-2 transition ${
              isLight
                ? 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                : 'border-white/[0.08] bg-white/[0.025] text-slate-400 hover:text-white'
            }`}
          >
            <Bell size={16} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
          </button>

          {notifOpen && (
            <div
              className={`absolute right-0 top-12 w-72 rounded-xl border p-4 shadow-2xl z-50 ${
                isLight ? 'border-slate-200 bg-white text-slate-800' : 'border-white/10 bg-[#111720] text-slate-200'
              }`}
            >
              <div className="text-xs font-semibold">Active Honey-Token Traps</div>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Connected to live backend. All decoy interactions and suspicious authentications are recorded in real time.
              </p>
            </div>
          )}
        </div>

        <div className="hidden h-6 w-px bg-slate-300 dark:bg-white/10 sm:block" />

        {/* User identifier badge */}
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <UserCheck size={14} />
          </div>
          <div className="text-left">
            <div className={`text-[11px] font-medium leading-none ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {userEmail || 'admin@gmail.com'}
            </div>
            <div className="text-[9px] text-emerald-500">Security Admin</div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          title="Sign out"
          className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/20 transition"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}

function MetricCard({ title, value, change, positive, icon: Icon, color, note, isLight }) {
  const toneMap = isLight ? lightTone : tone
  const colorClass = toneMap[color] || toneMap.blue

  return (
    <div
      className={`glass group relative overflow-hidden rounded-xl p-5 transition hover:translate-y-[-2px] duration-200 ${
        isLight ? 'border-slate-200 bg-white shadow-xs' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorClass}`}>
          <Icon size={20} />
        </div>

        {change && (
          <div
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
              positive
                ? 'text-emerald-500 bg-emerald-500/10'
                : 'text-amber-500 bg-amber-500/10'
            }`}
          >
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{change}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-[11px] font-medium text-slate-400">{title}</div>
        <div
          className={`mt-1 text-2xl font-bold tracking-tight sm:text-3xl ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          {value}
        </div>
        {note && <div className="mt-1 text-[10px] text-slate-500">{note}</div>}
      </div>
    </div>
  )
}

function SeverityBadge({ severity, isLight }) {
  const sev = String(severity).toUpperCase()
  let color = 'blue'
  if (sev === 'CRITICAL') color = 'red'
  else if (sev === 'HIGH') color = 'orange'
  else if (sev === 'MEDIUM') color = 'yellow'
  else if (sev === 'LOW') color = 'green'

  const toneMap = isLight ? lightTone : tone

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-semibold tracking-wide ${
        toneMap[color]
      }`}
    >
      {sev}
    </span>
  )
}

function ChartPanel({ timeline = [], isLight }) {
  const chartData = useMemo(() => {
    if (timeline && timeline.length > 0) {
      return timeline
    }
    return [
      { time: '10:00', attempts: 0, detected: 0 },
      { time: '10:10', attempts: 0, detected: 0 },
      { time: '10:20', attempts: 0, detected: 0 },
      { time: '10:30', attempts: 0, detected: 0 },
      { time: '10:40', attempts: 0, detected: 0 },
      { time: '10:50', attempts: 0, detected: 0 },
    ]
  }, [timeline])

  return (
    <section className={`glass rounded-xl p-5 sm:p-6 ${isLight ? 'border-slate-200 bg-white' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="status-dot h-2 w-2 rounded-full bg-emerald-500 text-emerald-500" />
            <h2 className={`text-[13px] font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Authentication & Threat Activity Over Time
            </h2>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            Real-time metric telemetry derived from backend security events
          </p>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-xs bg-emerald-500" />
            Auth Attempts
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-xs bg-cyan-500" />
            Detected Incidents
          </span>
        </div>
      </div>

      <div className="mt-6 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="attemptGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="detectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={isLight ? '#e2e8f0' : '#ffffff0a'} vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: isLight ? '#64748b' : '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fill: isLight ? '#64748b' : '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={25}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: isLight ? '#ffffff' : '#111720',
                border: isLight ? '1px solid #cbd5e1' : '1px solid #263241',
                borderRadius: 8,
                fontSize: 11,
                color: isLight ? '#0f172a' : '#e2e8f0',
              }}
            />
            <Area
              type="monotone"
              dataKey="attempts"
              name="Auth attempts"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#attemptGradient)"
              activeDot={{ r: 4, fill: '#10b981' }}
            />
            <Area
              type="monotone"
              dataKey="detected"
              name="Detected threats"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#detectedGradient)"
              activeDot={{ r: 4, fill: '#06b6d4' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function EventPanel({ events = [], onRefresh, search = '', loading, isLight }) {
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [envFilter, setEnvFilter] = useState('ALL')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return events.filter((e) => {
      const matchSev =
        severityFilter === 'ALL' ||
        String(e.severity).toUpperCase() === severityFilter

      const matchEnv =
        envFilter === 'ALL' ||
        String(e.environment).toUpperCase() === envFilter

      const matchQ =
        !q ||
        [e.id, e.event_type, e.message, e.environment, e.source, e.severity]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))

      return matchSev && matchEnv && matchQ
    })
  }, [events, severityFilter, envFilter, search])

  return (
    <section className={`glass overflow-hidden rounded-xl ${isLight ? 'border-slate-200 bg-white' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.06] p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="status-dot h-2 w-2 rounded-full bg-emerald-500 text-emerald-500" />
            <h2 className={`text-[13px] font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Security Event Stream
            </h2>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            Real backend audit events with automated honey-token detection
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-medium transition ${
            isLight
              ? 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
              : 'border-white/[0.08] bg-white/[0.02] text-slate-300 hover:text-emerald-300'
          }`}
        >
          <RefreshCw size={11} className={loading ? 'animate-spin text-emerald-500' : ''} />
          Refresh Feed
        </button>
      </div>

      {/* Filter bars */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <span className="mr-2 text-[9px] font-semibold text-slate-400">SEVERITY:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((item) => (
            <button
              key={item}
              onClick={() => setSeverityFilter(item)}
              className={`rounded-md px-2.5 py-1 text-[9px] font-medium transition ${
                severityFilter === item
                  ? isLight
                    ? 'bg-slate-900 text-white'
                    : 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 py-1">
          <span className="mr-2 text-[9px] font-semibold text-slate-400">ENV:</span>
          {['ALL', 'GENUINE', 'DECOY', 'SECURITY'].map((item) => (
            <button
              key={item}
              onClick={() => setEnvFilter(item)}
              className={`rounded-md px-2 py-1 text-[9px] font-medium transition ${
                envFilter === item
                  ? 'bg-emerald-500/20 text-emerald-500 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
        {filtered.map((e) => {
          const isDecoy = e.environment === 'decoy'
          const isHoney =
            e.event_type.includes('decoy') || e.event_type.includes('honey')

          const Icon = isHoney
            ? Fingerprint
            : e.severity === 'critical'
            ? AlertTriangle
            : e.severity === 'high'
            ? ShieldAlert
            : ShieldCheck

          return (
            <div
              key={e.id}
              className={`group flex items-start gap-3 p-4 transition ${
                isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                  isHoney
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                    : e.severity === 'critical'
                    ? 'border-red-500/30 bg-red-500/10 text-red-500'
                    : isLight
                    ? 'border-slate-200 bg-slate-100 text-slate-700'
                    : 'border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[12px] font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {e.event_type}
                  </span>

                  <SeverityBadge severity={e.severity} isLight={isLight} />

                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-medium ${
                      isDecoy
                        ? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                        : 'border border-slate-300 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                    }`}
                  >
                    {e.environment.toUpperCase()}
                  </span>
                </div>

                <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {e.message}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] font-mono text-slate-400">
                  <span>{e.id}</span>
                  {e.source && (
                    <span className="flex items-center gap-1">
                      <Globe size={10} />
                      {e.source}
                    </span>
                  )}
                  {e.session_id && (
                    <span className="flex items-center gap-1">
                      <LockKeyhole size={10} />
                      sid: {e.session_id.slice(0, 8)}...
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-[10px] font-mono text-slate-400">
                {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ''}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Activity className="mx-auto text-slate-400 mb-2" size={24} />
            <div className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              No events found matching your filter criteria.
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Trigger actions from the Protected Portal (port 5174) to generate live telemetry.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/[0.06] px-5 py-3 text-[10px] text-slate-500">
        <span>Showing {filtered.length} of {events.length} security events</span>
        <span>Bounded query limit: 50</span>
      </div>
    </section>
  )
}

function DecoySummaryPanel({ metrics, onNavigate, isLight }) {
  return (
    <section className={`glass rounded-xl p-5 sm:p-6 ${isLight ? 'border-slate-200 bg-white' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Network size={16} className="text-cyan-500" />
            <h2 className={`text-[13px] font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Deception Infrastructure
            </h2>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            Isolated environment with synthetic canary resources
          </p>
        </div>

        <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-medium text-cyan-500">
          SIMULATED
        </span>
      </div>

      <div
        className={`mt-5 rounded-xl border p-4 ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.07] bg-[#0b1017]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
            <Database size={18} />
          </div>
          <div>
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Decoy PostgreSQL & Canaries
            </div>
            <div className="text-[9px] text-slate-500">Zero access to genuine customer DB</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className={`rounded-lg border p-3 ${isLight ? 'border-slate-200 bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <div className="text-[9px] text-slate-400">Honey Activations</div>
            <div className="mt-1 text-xl font-bold text-amber-500">
              {metrics?.honey_token_activations ?? 0}
            </div>
          </div>

          <div className={`rounded-lg border p-3 ${isLight ? 'border-slate-200 bg-white' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <div className="text-[9px] text-slate-400">Active Decoy Sessions</div>
            <div className="mt-1 text-xl font-bold text-cyan-500">
              {metrics?.active_decoy_sessions ?? 0}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('Decoy Environment')}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 py-2.5 text-[11px] font-medium text-cyan-500 hover:bg-cyan-500/20 transition"
        >
          Inspect Canary Documents <ChevronRight size={13} />
        </button>
      </div>
    </section>
  )
}

function SecondaryPage({ active, onNavigate, isLight }) {
  const pageData = {
    'Live Events': {
      icon: Activity,
      title: 'Live Security Events Stream',
      subtitle: 'Complete chronological record of authentication and decoy triggers.',
      items: [
        'Authentication verification & failures',
        'Decoy session establishment (decoy_session_started)',
        'Honey-token resource activations (decoy_token_activation)',
        'Access rejections for invalid token types',
      ],
    },
    'Threat Intelligence': {
      icon: Radar,
      title: 'Threat Intelligence Overview',
      subtitle: 'Heuristic analysis of credential spraying and canary token triggers.',
      items: [
        'Repeated failure detection (sliding rate-limiting window)',
        'Decoy document trap metrics',
        'Canary database dump access tracking',
      ],
    },
    'Honey Tokens': {
      icon: Fingerprint,
      title: 'Honey Token Registry',
      subtitle: 'Synthetic credentials and tokens deployed to catch attackers.',
      items: [
        'DECOY-001: Confidential_Strategy_DRAFT.pdf',
        'DECOY-002: Internal_Credentials_Archive.txt',
        'DECOY-003: Synthetic_Database_Backup.sql',
        'HONEY-CRED-01: Decoy Service Account Key',
      ],
    },
    'Decoy Environment': {
      icon: Network,
      title: 'Simulated Decoy Workspace',
      subtitle: 'Isolated environment presented to decoy credentials on Protected Portal.',
      items: [
        'Synthetic user profiles & mock databases',
        'Interactive canary activation triggers',
        'Automated real-time event logging to SOC',
      ],
    },
    'Fake Documents': {
      icon: FileWarning,
      title: 'Fake Documents Registry',
      subtitle: 'Track interactions with simulated confidential files.',
      items: [
        'Confidential_Strategy_DRAFT.pdf',
        'Internal_Credentials_Archive.txt',
        'Synthetic_Database_Backup.sql',
      ],
    },
    'Database Security': {
      icon: Database,
      title: 'Database Boundaries',
      subtitle: 'Strict separation between Genuine and Decoy database records.',
      items: [
        'Genuine Admin cluster isolation',
        'Decoy synthetic catalog isolation',
        'Cryptographically distinct signing keys',
      ],
    },
    'Access Control': {
      icon: LockKeyhole,
      title: 'Access Control & Token Separation',
      subtitle: 'Dual-key JWT signature validation ensuring zero privilege escalation.',
      items: [
        'Genuine JWT Key (HS256 with genuine_jwt_secret)',
        'Decoy JWT Key (HS256 with decoy_jwt_secret)',
        'Cross-environment token rejection enforced by backend',
      ],
    },
  }

  const data = pageData[active] || pageData['Threat Intelligence']
  const Icon = data.icon

  return (
    <div className="animate-fade-up space-y-6">
      <section className={`glass rounded-xl p-7 sm:p-10 ${isLight ? 'border-slate-200 bg-white' : ''}`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
          <Icon size={24} />
        </div>

        <div className={`mt-6 text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {data.title}
        </div>
        <p className="mt-2 max-w-lg text-sm text-slate-500">{data.subtitle}</p>
      </section>

      <section className={`glass rounded-xl p-5 sm:p-6 ${isLight ? 'border-slate-200 bg-white' : ''}`}>
        <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Configured Components & Rules
        </h2>

        <div className="mt-4 space-y-2">
          {data.items.map((item, index) => (
            <div
              key={item}
              className={`flex items-center gap-3 rounded-lg border p-4 ${
                isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-white/[0.06] bg-white/[0.02] text-slate-300'
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-[10px] font-bold text-emerald-500">
                0{index + 1}
              </span>
              <span className="flex-1 text-xs">{item}</span>
              <CheckCircle2 size={15} className="text-emerald-500" />
            </div>
          ))}
        </div>

        <button
          onClick={() => onNavigate('Dashboard')}
          className={`mt-5 rounded-lg border px-4 py-2 text-xs font-medium transition ${
            isLight
              ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'border-white/10 text-slate-300 hover:bg-white/5'
          }`}
        >
          Return to Dashboard
        </button>
      </section>
    </div>
  )
}

export default function Dashboard({
  token,
  mode,
  userEmail,
  onLogout,
  theme = 'dark',
  onToggleTheme,
}) {
  const [active, setActive] = useState('Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState('')

  const isLight = theme === 'light'

  const fetchData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const [sumData, eventsData] = await Promise.all([
        api.summary(token),
        api.events(token, { limit: 50 }),
      ])
      setSummary(sumData)
      setEvents(eventsData?.events || [])
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err.message || 'Failed to sync monitoring data from backend')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
    // Poll every 5 seconds for live update
    const timer = setInterval(fetchData, 5000)
    return () => clearInterval(timer)
  }, [fetchData])

  const isDashboard = active === 'Dashboard'

  const metrics = summary?.metrics || {
    authentication_attempts: 0,
    honey_token_activations: 0,
    active_decoy_sessions: 0,
    blocked_api_requests: 0,
    successful_logins: 0,
    failed_logins: 0,
    high_severity_events: 0,
    total_events: 0,
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#080b10] text-slate-200'
      }`}
    >
      <div className="grid-background pointer-events-none fixed inset-0 opacity-40" />

      <Sidebar
        active={active}
        onNavigate={setActive}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isLight={isLight}
      />

      <div className="relative min-h-screen lg:pl-[260px]">
        <Header
          active={active}
          onMenu={() => setMenuOpen(true)}
          search={search}
          setSearch={setSearch}
          onLogout={onLogout}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onRefresh={fetchData}
          loading={loading}
          userEmail={userEmail}
        />

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-7 sm:py-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              Backend sync alert: {error}
            </div>
          )}

          {isDashboard ? (
            <div className="animate-fade-up space-y-6">
              {/* Hero Banner */}
              <section
                className={`relative overflow-hidden rounded-2xl border p-5 sm:p-7 ${
                  isLight
                    ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white'
                    : 'border-emerald-400/15 bg-gradient-to-r from-[#101e20] via-[#101820] to-[#10131b]'
                }`}
              >
                <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-semibold tracking-[0.12em] text-emerald-500">
                        <Zap size={11} /> DECEPTION INTELLIGENCE
                      </span>
                      <span className="text-[10px] text-slate-500">REAL BACKEND TELEMETRY</span>
                    </div>

                    <h1
                      className={`mt-4 text-2xl font-bold tracking-tight sm:text-[30px] ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      Threats don't know they're being watched<span className="text-emerald-500">.</span>
                    </h1>

                    <p className="mt-2 max-w-xl text-xs text-slate-500 leading-relaxed">
                      Detect unauthorized access using isolated honey tokens. When decoys are touched, the TokenTrap Deception Engine traces sessions and alerts the Security Monitoring Center.
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border p-4 sm:min-w-[210px] ${
                      isLight ? 'border-slate-200 bg-white/80' : 'border-white/[0.08] bg-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                      <ShieldCheck size={13} className="text-emerald-500" />
                      SYSTEM STATUS
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="status-dot h-2 w-2 rounded-full bg-emerald-500 text-emerald-500" />
                      <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Live Monitoring
                      </span>
                    </div>
                    <div className="mt-1 text-[9px] text-slate-400">
                      Sync: {lastUpdated || 'Connecting...'}
                    </div>
                  </div>
                </div>
              </section>

              {/* Metric Cards */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="Authentication Attempts"
                  value={metrics.authentication_attempts}
                  change={metrics.authentication_attempts > 0 ? `${metrics.successful_logins} ok` : null}
                  positive={true}
                  icon={Activity}
                  color="blue"
                  note="Live login attempts (genuine + decoy)"
                  isLight={isLight}
                />
                <MetricCard
                  title="Honey-Token Activations"
                  value={metrics.honey_token_activations}
                  change={metrics.honey_token_activations > 0 ? 'ALERT' : 'Normal'}
                  positive={metrics.honey_token_activations === 0}
                  icon={Fingerprint}
                  color="red"
                  note="Interactions with canary documents"
                  isLight={isLight}
                />
                <MetricCard
                  title="Active Decoy Sessions"
                  value={metrics.active_decoy_sessions}
                  change="Live"
                  positive={true}
                  icon={Network}
                  color="green"
                  note="Isolated simulator sessions"
                  isLight={isLight}
                />
                <MetricCard
                  title="Blocked API Requests"
                  value={metrics.blocked_api_requests}
                  change={metrics.blocked_api_requests > 0 ? '+ Denials' : '0 Denied'}
                  positive={false}
                  icon={ShieldAlert}
                  color="orange"
                  note="Unauthorized or rate-limited requests"
                  isLight={isLight}
                />
              </section>

              {/* Charts & Decoy summary */}
              <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_1fr]">
                <ChartPanel timeline={summary?.timeline || []} isLight={isLight} />
                <DecoySummaryPanel
                  metrics={metrics}
                  onNavigate={setActive}
                  isLight={isLight}
                />
              </section>

              {/* Security Event Stream */}
              <section>
                <EventPanel
                  events={events}
                  search={search}
                  onRefresh={fetchData}
                  loading={loading}
                  isLight={isLight}
                />
              </section>

              {/* Footer */}
              <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 dark:border-white/[0.06] pt-5 text-[10px] text-slate-500 sm:flex-row">
                <div className="flex items-center gap-2">
                  <Shield size={12} className="text-emerald-500" />
                  <span>TOKENTRAP SECURITY MONITORING CENTER</span>
                  <span>·</span>
                  <span>HACKINDIA 2026</span>
                </div>
                <div>Live sync · Last updated: {lastUpdated}</div>
              </footer>
            </div>
          ) : (
            <SecondaryPage active={active} onNavigate={setActive} isLight={isLight} />
          )}
        </main>
      </div>
    </div>
  )
}
