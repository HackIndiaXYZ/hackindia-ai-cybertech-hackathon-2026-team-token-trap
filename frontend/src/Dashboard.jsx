import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
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
  Menu,
  Network,
  Radar,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
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

const initialEvents = [
  {
    id: 'EVT-1042',
    time: '10:42:18',
    title: 'Honey credential activated',
    detail: 'Decoy administrator account',
    source: '192.0.2.41',
    severity: 'CRITICAL',
    color: 'red',
    icon: Fingerprint,
  },
  {
    id: 'EVT-1041',
    time: '10:41:53',
    title: 'Decoy document accessed',
    detail: 'backup_config.pdf',
    source: '192.0.2.41',
    severity: 'HIGH',
    color: 'orange',
    icon: FileWarning,
  },
  {
    id: 'EVT-1040',
    time: '10:41:21',
    title: 'Repeated login failures',
    detail: '8 attempts in 30 seconds',
    source: '198.51.100.24',
    severity: 'MEDIUM',
    color: 'yellow',
    icon: AlertTriangle,
  },
  {
    id: 'EVT-1039',
    time: '10:40:48',
    title: 'Decoy session created',
    detail: 'Restricted session established',
    source: '192.0.2.41',
    severity: 'HIGH',
    color: 'orange',
    icon: Network,
  },
  {
    id: 'EVT-1038',
    time: '10:39:12',
    title: 'Unauthorized API request',
    detail: 'Rejected by authorization policy',
    source: '203.0.113.17',
    severity: 'HIGH',
    color: 'orange',
    icon: ShieldAlert,
  },
]

const chartData = [
  { time: '09:00', attempts: 12, detected: 3 },
  { time: '09:10', attempts: 19, detected: 6 },
  { time: '09:20', attempts: 15, detected: 4 },
  { time: '09:30', attempts: 28, detected: 11 },
  { time: '09:40', attempts: 23, detected: 9 },
  { time: '09:50', attempts: 38, detected: 17 },
  { time: '10:00', attempts: 29, detected: 12 },
  { time: '10:10', attempts: 48, detected: 23 },
  { time: '10:20', attempts: 35, detected: 15 },
  { time: '10:30', attempts: 55, detected: 29 },
  { time: '10:40', attempts: 44, detected: 24 },
]

const navigation = [
  { label: 'OVERVIEW', items: [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Threat Intelligence', icon: Radar, badge: '4' },
    { name: 'Live Events', icon: Activity },
  ]},
  { label: 'DECEPTION LAYER', items: [
    { name: 'Honey Tokens', icon: Fingerprint },
    { name: 'Decoy Environment', icon: Network },
    { name: 'Fake Documents', icon: FileWarning },
  ]},
  { label: 'INFRASTRUCTURE', items: [
    { name: 'Database Security', icon: Database },
    { name: 'Access Control', icon: LockKeyhole },
  ]},
]

const tone = {
  red: 'text-red-400 bg-red-400/10 border-red-400/20',
  orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  green: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  blue: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 glow-green">
        <Shield size={22} strokeWidth={1.8} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0b0f15] bg-emerald-400" />
      </div>

      <div>
        <div className="text-[15px] font-bold tracking-[0.12em] text-white">
          TOKEN<span className="text-emerald-400">TRAP</span>
        </div>
        <div className="mt-0.5 text-[9px] tracking-[0.23em] text-slate-500">
          DECEPTION INTELLIGENCE
        </div>
      </div>
    </div>
  )
}

function Sidebar({ active, onNavigate, open, onClose }) {
  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[255px] flex-col border-r border-white/[0.07] bg-[#0b0f15] transition-transform duration-300 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Brand />

        <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-2.5">
          <span className="status-dot h-2 w-2 rounded-full bg-emerald-400 text-emerald-400" />
          <span className="text-[11px] font-medium text-emerald-300">Defense systems active</span>
          <ShieldCheck className="ml-auto text-emerald-400" size={15} />
        </div>

        <nav className="mt-7 flex-1 space-y-7 overflow-y-auto px-3">
          {navigation.map((group) => (
            <div key={group.label}>
              <div className="mb-3 px-3 text-[9px] font-semibold tracking-[0.2em] text-slate-600">
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
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] transition ${
                        selected
                          ? 'border border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300'
                          : 'border border-transparent text-slate-400 hover:bg-white/[0.035] hover:text-slate-200'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.7} />
                      <span className="flex-1">{item.name}</span>

                      {item.badge && (
                        <span className="rounded-md bg-red-400/10 px-1.5 py-0.5 text-[10px] text-red-400">
                          {item.badge}
                        </span>
                      )}

                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="m-3 rounded-xl border border-white/[0.07] bg-[#10151d] p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
              <Command size={15} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-200">TokenTrap SOC</div>
              <div className="mt-0.5 text-[9px] text-slate-500">Hackathon build · v0.1</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Engine status</span>
            <span className="text-emerald-400">Demo mode</span>
          </div>
        </div>
      </aside>
    </>
  )
}

function Header({ active, onMenu, search, setSearch, onLogout }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-white/[0.07] bg-[#0a0e14]/90 px-4 backdrop-blur-xl sm:px-7">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-lg border border-white/10 p-2 text-slate-300 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <button
        onClick={onLogout}
        className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
        Logout
        </button>
        <div>
          <div className="text-[14px] font-semibold text-white">{active}</div>
          <div className="mt-1 hidden text-[10px] text-slate-500 sm:block">
            Security Operations Center <span className="mx-1.5 text-slate-700">/</span> {active}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 md:flex">
          <Search size={14} className="text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-32 bg-transparent text-[11px] text-slate-200 outline-none placeholder:text-slate-600"
          />
          <span className="rounded border border-white/10 px-1 py-0.5 text-[9px] text-slate-500">⌘ K</span>
        </div>

        <div className="relative">
          <button
            aria-label="Notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-lg border border-white/[0.08] bg-white/[0.025] p-2.5 text-slate-400 transition hover:text-white"
          >
            <Bell size={16} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-400" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-64 rounded-xl border border-white/10 bg-[#111720] p-4 shadow-2xl">
              <div className="text-xs font-semibold text-white">Security notifications</div>
              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                Demo alert: a honey credential was activated. Live backend alerts will appear here when connected.
              </p>
            </div>
          )}
        </div>

        <div className="hidden h-8 w-px bg-white/10 sm:block" />

        <button className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-white/[0.04]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <ShieldCheck size={16} />
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-[11px] font-medium text-slate-200">Security Operator</div>
            <div className="mt-0.5 text-[9px] text-slate-500">Restricted access</div>
          </div>
          <ChevronDown size={13} className="hidden text-slate-500 sm:block" />
        </button>
      </div>
    </header>
  )
}

function MetricCard({ title, value, change, positive, icon: Icon, color, note }) {
  return (
    <div className="glass group rounded-xl p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 sm:p-5">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tone[color]}`}>
          <Icon size={19} strokeWidth={1.7} />
        </div>

        <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium ${
          positive ? 'bg-emerald-400/[0.08] text-emerald-400' : 'bg-red-400/[0.08] text-red-400'
        }`}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      </div>

      <div className="mt-5 text-[10px] font-medium tracking-[0.08em] text-slate-500">
        {title.toUpperCase()}
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[27px] font-semibold tracking-tight text-white">{value}</span>
      </div>

      <div className="mt-2 text-[10px] text-slate-500">{note}</div>
    </div>
  )
}

function ChartPanel() {
  const [period, setPeriod] = useState('1H')

  return (
    <section className="glass rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            <h2 className="text-[13px] font-semibold text-white">Threat activity</h2>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500">
            Authentication traffic and detected events
          </p>
        </div>

        <div className="flex gap-1 rounded-lg border border-white/[0.06] bg-black/20 p-1">
          {['1H', '6H', '24H'].map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`rounded-md px-3 py-1.5 text-[10px] transition ${
                period === item
                  ? 'bg-emerald-400/10 text-emerald-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-5 text-[10px]">
        <span className="flex items-center gap-2 text-slate-400">
          <span className="h-2 w-2 rounded-sm bg-emerald-400" />
          Authentication attempts
        </span>
        <span className="flex items-center gap-2 text-slate-400">
          <span className="h-2 w-2 rounded-sm bg-cyan-400" />
          Detected events
        </span>
      </div>

      <div className="mt-5 h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="attemptGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f5a0" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00f5a0" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="detectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#ffffff0a" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: '#111720',
                border: '1px solid #263241',
                borderRadius: 8,
                fontSize: 11,
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#94a3b8', marginBottom: 6 }}
            />
            <Area
              type="monotone"
              dataKey="attempts"
              name="Authentication attempts"
              stroke="#00f5a0"
              strokeWidth={2}
              fill="url(#attemptGradient)"
              activeDot={{ r: 4, fill: '#00f5a0', stroke: '#0b0f15', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="detected"
              name="Detected events"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#detectedGradient)"
              activeDot={{ r: 4, fill: '#22d3ee', stroke: '#0b0f15', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 border-t border-white/[0.06] pt-4 text-[10px] text-slate-500">
        {period === '1H' ? 'Last hour' : period === '6H' ? 'Last 6 hours' : 'Last 24 hours'}
        {' · '}Illustrative demo data
      </div>
    </section>
  )
}

function SeverityBadge({ severity, color }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-[9px] font-semibold tracking-wide ${tone[color]}`}>
      {severity}
    </span>
  )
}

function EventPanel({ events, onRefresh, search = '' }) {
  const [filter, setFilter] = useState('ALL')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return events.filter((event) => {
      const matchesSeverity =
        filter === 'ALL' || event.severity === filter

      const matchesSearch =
        !query ||
        [
          event.id,
          event.title,
          event.detail,
          event.source,
          event.severity,
        ].some((value) =>
          String(value ?? '').toLowerCase().includes(query)
        )

      return matchesSeverity && matchesSearch
    })
  }, [events, filter, search])

  return (
    <section className="glass overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="status-dot h-2 w-2 rounded-full bg-emerald-400 text-emerald-400" />
            <h2 className="text-[13px] font-semibold text-white">
              Security event stream
            </h2>
          </div>

          <p className="mt-1.5 text-[10px] text-slate-500">
            Observed and simulated security events
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-[10px] text-slate-400 transition hover:border-emerald-400/20 hover:text-emerald-300"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-4 py-3">
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[9px] font-medium transition ${
              filter === item
                ? 'bg-white/[0.08] text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div>
        {filtered.map((event) => {
          const Icon = event.icon

          return (
            <div
              key={event.id}
              className="group flex items-start gap-3 border-b border-white/[0.045] px-4 py-4 transition hover:bg-white/[0.02] sm:items-center sm:px-5"
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tone[event.color]}`}
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-200">
                    {event.title}
                  </span>

                  <SeverityBadge
                    severity={event.severity}
                    color={event.color}
                  />
                </div>

                <div className="mt-1 text-[10px] text-slate-500">
                  {event.detail}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] text-slate-600">
                  <span className="font-mono">{event.id}</span>

                  <span className="flex items-center gap-1">
                    <Globe size={10} />
                    {event.source}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-[9px] font-mono text-slate-500">
                {event.time}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="p-10 text-center text-xs text-slate-500">
            No events match this filter.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-[10px] text-slate-500">
          {filtered.length} displayed events
        </span>

        <button className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300">
          View event explorer
          <ChevronRight size={12} />
        </button>
      </div>
    </section>
  )
}

function DecoyPanel({ onNavigate }) {
  return (
    <section className="glass relative overflow-hidden rounded-xl p-5 sm:p-6">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/[0.06] blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Network size={16} className="text-emerald-400" />
            <h2 className="text-[13px] font-semibold text-white">Deception environment</h2>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500">Isolated decoy infrastructure</p>
        </div>

        <span className="rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-1 text-[9px] text-emerald-300">
          SIMULATED
        </span>
      </div>

      <div className="relative mt-6 rounded-xl border border-white/[0.07] bg-[#0b1017] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300">
            <Database size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-slate-200">Decoy PostgreSQL</div>
            <div className="mt-1 text-[9px] text-slate-500">Synthetic records only</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="text-[9px] text-slate-500">Honey resources</div>
            <div className="mt-1 text-xl font-semibold text-white">24</div>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="text-[9px] text-slate-500">Active sessions</div>
            <div className="mt-1 text-xl font-semibold text-cyan-300">03</div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('Decoy Environment')}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] py-3 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-400/[0.12]"
        >
          Inspect decoy environment <ChevronRight size={14} />
        </button>
      </div>
    </section>
  )
}

function IntegrityPanel() {
  const checks = [
    { name: 'Real / decoy token separation', state: 'DEMO' },
    { name: 'Database permission isolation', state: 'DEMO' },
    { name: 'JWT audience validation', state: 'DEMO' },
    { name: 'Decoy event logging', state: 'DEMO' },
  ]

  return (
    <section className="glass rounded-xl p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-400" />
        <h2 className="text-[13px] font-semibold text-white">Security controls</h2>
      </div>

      <p className="mt-1.5 text-[10px] text-slate-500">
        Control status will be verified by backend tests.
      </p>

      <div className="mt-5 space-y-4">
        {checks.map((check) => (
          <div key={check.name} className="flex items-center gap-3">
            <CircleDot size={14} className="shrink-0 text-slate-500" />
            <span className="flex-1 text-[10px] text-slate-300">{check.name}</span>
            <span className="rounded border border-yellow-400/20 bg-yellow-400/[0.06] px-1.5 py-1 text-[8px] text-yellow-300">
              {check.state}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-yellow-400/15 bg-yellow-400/[0.04] p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-yellow-300" />
          <p className="text-[10px] leading-5 text-slate-400">
            This initial dashboard uses sample data. Security controls must not be considered operational until the backend is connected and tests pass.
          </p>
        </div>
      </div>
    </section>
  )
}

function SecondaryPage({ active, onNavigate }) {
  const pageData = {
    'Threat Intelligence': {
      icon: Radar,
      title: 'Threat intelligence',
      subtitle: 'Investigate security signals and prioritize suspicious activity.',
      items: ['Honey credential activations', 'Repeated authentication failures', 'Suspicious decoy interactions'],
    },
    'Live Events': {
      icon: Activity,
      title: 'Live security events',
      subtitle: 'Inspect authentication and deception events as they occur.',
      items: ['Authentication activity', 'Decoy session events', 'Authorization decisions'],
    },
    'Honey Tokens': {
      icon: Fingerprint,
      title: 'Honey token registry',
      subtitle: 'Manage decoy credentials and track their activation.',
      items: ['Decoy administrator account', 'Synthetic API key', 'Canary document'],
    },
    'Decoy Environment': {
      icon: Network,
      title: 'Decoy environment',
      subtitle: 'Explore the isolated deception environment and its synthetic resources.',
      items: ['Synthetic user directory', 'Decoy documents', 'Simulated API configuration'],
    },
    'Fake Documents': {
      icon: FileWarning,
      title: 'Fake documents',
      subtitle: 'Review synthetic documents used to detect unauthorized access.',
      items: ['backup_config.pdf', 'admin_directory.csv', 'service_inventory.json'],
    },
    'Database Security': {
      icon: Database,
      title: 'Database security',
      subtitle: 'Review the planned real/decoy database trust boundaries.',
      items: ['Real PostgreSQL connection', 'Decoy PostgreSQL connection', 'Database role permissions'],
    },
    'Access Control': {
      icon: LockKeyhole,
      title: 'Access control',
      subtitle: 'Inspect authentication roles and authorization policies.',
      items: ['Real administrator', 'Decoy session', 'Security operator'],
    },
  }

  const data = pageData[active] || pageData['Threat Intelligence']
  const Icon = data.icon

  return (
    <div className="animate-fade-up space-y-6">
      <section className="glass rounded-xl p-7 sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <Icon size={23} />
        </div>

        <div className="mt-6 text-2xl font-semibold tracking-tight text-white">{data.title}</div>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">{data.subtitle}</p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-yellow-400/20 bg-yellow-400/[0.06] px-3 py-2 text-[10px] text-yellow-300">
          <Activity size={13} />
          Interface preview · Backend integration pending
        </div>
      </section>

      <section className="glass rounded-xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-white">Available resources</h2>

        <div className="mt-4 space-y-2">
          {data.items.map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/[0.08] text-[10px] text-emerald-300">
                0{index + 1}
              </span>
              <span className="flex-1 text-xs text-slate-300">{item}</span>
              <ChevronRight size={15} className="text-slate-600" />
            </div>
          ))}
        </div>

        <button
          onClick={() => onNavigate('Dashboard')}
          className="mt-5 rounded-lg border border-white/10 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/[0.04]"
        >
          Return to dashboard
        </button>
      </section>
    </div>
  )
}

export default function Dashboard({ onLogout }) {
  const [active, setActive] = useState('Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState(initialEvents)
  const [lastUpdated, setLastUpdated] = useState('10:42:18')



  function refreshEvents() {
    setEvents((current) => [...current])
    setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour12: false }))
  }

  const isDashboard = active === 'Dashboard'

  return (
    <div className="min-h-screen bg-[#080b10] text-slate-200">
      <div className="grid-background pointer-events-none fixed inset-0 opacity-40" />

      <Sidebar
        active={active}
        onNavigate={setActive}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="relative min-h-screen lg:pl-[255px]">
        <Header
        active={active}
        onMenu={() => setMenuOpen(true)}
        search={search}
        setSearch={setSearch}
        onLogout={onLogout}
        />

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-7 sm:py-8">
          {isDashboard ? (
            <div className="animate-fade-up space-y-6">
              <section className="relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-gradient-to-r from-[#101e20] via-[#101820] to-[#10131b] p-5 sm:p-7">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -right-10 -top-28 h-72 w-72 rounded-full bg-emerald-400/[0.07] blur-3xl" />
                  <div className="absolute right-[25%] top-0 h-full w-px bg-gradient-to-b from-transparent via-emerald-400/[0.08] to-transparent" />
                </div>

                <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/[0.07] px-2 py-1 text-[9px] font-semibold tracking-[0.12em] text-emerald-300">
                        <Zap size={11} /> DECEPTION INTELLIGENCE
                      </span>
                      <span className="text-[9px] text-slate-500">BUILD 0.1.0</span>
                    </div>

                    <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-[30px]">
                      Threats don't know
                      <br className="hidden sm:block" /> they're being watched<span className="text-emerald-400">.</span>
                    </h1>

                    <p className="mt-3 max-w-xl text-[11px] leading-6 text-slate-400 sm:text-xs">
                      Detect unauthorized access with honey credentials, isolate suspicious sessions, and observe interactions inside a controlled deception environment.
                    </p>
                  </div>

                  <div className="relative min-w-[190px] rounded-xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <ShieldCheck size={13} className="text-emerald-400" />
                      MONITORING STATUS
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="status-dot h-2 w-2 rounded-full bg-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-white">Demo mode</span>
                    </div>
                    <div className="mt-2 text-[9px] leading-4 text-slate-500">
                      Backend protection has not yet been verified.
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="Authentication attempts"
                  value="1,284"
                  change="+12.8%"
                  positive={true}
                  icon={Activity}
                  color="blue"
                  note="Illustrative · compared with prior period"
                />
                <MetricCard
                  title="Honey activations"
                  value="24"
                  change="+8"
                  positive={false}
                  icon={Fingerprint}
                  color="red"
                  note="Illustrative · decoy triggers"
                />
                <MetricCard
                  title="Active decoy sessions"
                  value="03"
                  change="Live demo"
                  positive={true}
                  icon={Network}
                  color="green"
                  note="Illustrative · session count"
                />
                <MetricCard
                  title="Blocked API requests"
                  value="67"
                  change="+14.2%"
                  positive={false}
                  icon={ShieldAlert}
                  color="orange"
                  note="Illustrative · authorization denials"
                />
              </section>

              <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_1fr]">
                <ChartPanel />
                <DecoyPanel onNavigate={setActive} />
              </section>

              <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_1fr]">
                <EventPanel
                    events={events}
                    search={search}
                    onRefresh={refreshEvents}
                />
                <IntegrityPanel />
              </section>

              <footer className="flex flex-col justify-between gap-2 border-t border-white/[0.06] pt-5 text-[9px] text-slate-600 sm:flex-row">
                <div className="flex items-center gap-2">
                  <Shield size={12} className="text-emerald-400" />
                  <span>TOKENTRAP SECURITY PLATFORM</span>
                  <span>·</span>
                  <span>HACK INDIA</span>
                </div>

                <div>
                  Sample data · Last UI refresh {lastUpdated}
                </div>
              </footer>
            </div>
          ) : (
            <SecondaryPage active={active} onNavigate={setActive} />
          )}
        </main>
      </div>
    </div>
  )
}
