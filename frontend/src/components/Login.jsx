import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Mail,
  Moon,
  Network,
  Shield,
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

  function handleSubmit(event) {
    event.preventDefault()
    onLogin({
      email: email.trim(),
      password,
      mode,
    })
  }

  return (
    <div
      className={`relative grid w-full max-w-5xl overflow-hidden rounded-2xl border shadow-2xl transition-colors duration-200 lg:grid-cols-2 ${
        isLight
          ? 'border-slate-200 bg-white text-slate-800'
          : 'border-white/[0.08] bg-[#0d121a] text-slate-200'
      }`}
    >
      {/* Top right Theme toggle */}
      {onToggleTheme && (
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className={`absolute right-4 top-4 z-20 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            isLight
              ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          {isLight ? <Moon size={14} /> : <Sun size={14} className="text-amber-400" />}
          <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      )}

      {/* Branding panel */}
      <section
        className={`relative hidden flex-col justify-between overflow-hidden border-r p-10 lg:flex ${
          isLight
            ? 'border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50/30'
            : 'border-white/[0.07] bg-gradient-to-br from-[#0c1017] to-[#070a0e]'
        }`}
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
              <Shield size={24} />
            </div>

            <div>
              <div className={`font-bold tracking-[0.14em] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                TOKEN<span className="text-emerald-500">TRAP</span>
              </div>

              <div className="mt-1 text-[9px] tracking-[0.2em] text-slate-500">
                DECEPTION INTELLIGENCE
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-[10px] text-emerald-500">
              <Activity size={13} />
              SECURITY OPERATIONS CENTER
            </div>

            <h1
              className={`mt-6 text-4xl font-semibold leading-tight tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Detect the threat.
              <br />
              <span className="text-emerald-500">Before it strikes.</span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
              Monitor suspicious access, deploy honey tokens, and investigate activity inside an
              isolated deception environment.
            </p>
          </div>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            isLight ? 'border-slate-200 bg-white/70' : 'border-white/[0.07] bg-black/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-500">
              <Fingerprint size={20} />
            </div>

            <div>
              <div className={`text-xs font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                Deception-based defense
              </div>

              <div className="mt-1 text-[10px] text-slate-500">
                Identify unauthorized interactions
              </div>
            </div>

            <ShieldCheck className="ml-auto text-emerald-500" size={19} />
          </div>
        </div>
      </section>

      {/* Login panel */}
      <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-500">
              <Shield size={22} />
            </div>

            <div>
              <div className={`font-bold tracking-[0.12em] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                TOKEN<span className="text-emerald-500">TRAP</span>
              </div>
              <div className="mt-1 text-[9px] tracking-[0.15em] text-slate-500">
                DECEPTION INTELLIGENCE
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <div className="text-[10px] font-semibold tracking-[0.2em] text-emerald-500">
              ADMINISTRATIVE ACCESS
            </div>

            <h2 className={`mt-3 text-3xl font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Welcome back
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in with genuine admin credentials to view the Security Operations Center.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Access mode selection */}
            <div>
              <label className={`mb-2 block text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Account type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('real')}
                  aria-pressed={mode === 'real'}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
                    mode === 'real'
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500 font-semibold'
                      : isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <ShieldCheck size={17} />
                  <span>
                    <span className="block text-xs">Genuine Admin</span>
                    <span className="mt-0.5 block text-[9px] opacity-70">Authorized SOC</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('decoy')}
                  aria-pressed={mode === 'decoy'}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
                    mode === 'decoy'
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-500 font-semibold'
                      : isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <Network size={17} />
                  <span>
                    <span className="block text-xs">Decoy Account</span>
                    <span className="mt-0.5 block text-[9px] opacity-70">Honey User</span>
                  </span>
                </button>
              </div>

              {mode === 'decoy' && (
                <p className="mt-2 text-[10px] leading-5 text-amber-500">
                  Notice: Decoy accounts are blocked from accessing the Security Monitoring Center and are routed to synthetic environments.
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className={`mb-2 block text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}
              >
                Account Email
              </label>

              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className={`w-full rounded-lg border px-3 py-2.5 pl-10 text-xs outline-none transition ${
                    isLight
                      ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                      : 'border-white/10 bg-black/20 text-white placeholder:text-slate-600 focus:border-emerald-400/40'
                  }`}
                />
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className={`mb-2 block text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter credentials"
                  className={`w-full rounded-lg border px-3 py-2.5 pl-10 pr-10 text-xs outline-none transition ${
                    isLight
                      ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                      : 'border-white/10 bg-black/20 text-white placeholder:text-slate-600 focus:border-emerald-400/40'
                  }`}
                />
                <LockKeyhole
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-xs font-semibold text-white shadow-lg transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}