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
  Network,
} from 'lucide-react'

export default function Login({
  onLogin,
  loading = false,
  error = '',
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('real')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()

    onLogin({
      email: email.trim(),
      password,
      mode,
    })
  }

  return (
    <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d121a] shadow-2xl lg:grid-cols-2">
      {/* Branding panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.07] p-10 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
              <Shield size={24} />
            </div>

            <div>
              <div className="font-bold tracking-[0.14em] text-white">
                TOKEN<span className="text-emerald-400">TRAP</span>
              </div>

              <div className="mt-1 text-[9px] tracking-[0.2em] text-slate-500">
                DECEPTION INTELLIGENCE
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-[10px] text-emerald-300">
              <Activity size={13} />
              SECURITY OPERATIONS CENTER
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white">
              Detect the threat.
              <br />
              <span className="text-emerald-400">
                Before it strikes.
              </span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Monitor suspicious access, deploy honey tokens, and investigate
              activity inside an isolated deception environment.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-black/20 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
              <Fingerprint size={20} />
            </div>

            <div>
              <div className="text-xs font-medium text-slate-200">
                Deception-based defense
              </div>

              <div className="mt-1 text-[10px] text-slate-500">
                Identify unauthorized interactions
              </div>
            </div>

            <ShieldCheck
              className="ml-auto text-emerald-400"
              size={19}
            />
          </div>
        </div>
      </section>

      {/* Login panel */}
      <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
              <Shield size={22} />
            </div>

            <div>
              <div className="font-bold tracking-[0.12em] text-white">
                TOKEN<span className="text-emerald-400">TRAP</span>
              </div>
              <div className="mt-1 text-[9px] tracking-[0.15em] text-slate-500">
                DECEPTION INTELLIGENCE
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <div className="text-[10px] font-semibold tracking-[0.2em] text-emerald-400">
              SECURE ACCESS
            </div>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Welcome back
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Sign in to access the TokenTrap security operations dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Access mode */}
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">
                Access environment
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('real')}
                  aria-pressed={mode === 'real'}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
                    mode === 'real'
                      ? 'border-emerald-400/40 bg-emerald-400/[0.08] text-emerald-300'
                      : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <ShieldCheck size={17} />

                  <span>
                    <span className="block text-xs font-medium">
                      Real Access
                    </span>
                    <span className="mt-1 block text-[9px] opacity-70">
                      Authorized users
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('decoy')}
                  aria-pressed={mode === 'decoy'}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
                    mode === 'decoy'
                      ? 'border-cyan-400/40 bg-cyan-400/[0.08] text-cyan-300'
                      : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <Network size={17} />

                  <span>
                    <span className="block text-xs font-medium">
                      Decoy Access
                    </span>
                    <span className="mt-1 block text-[9px] opacity-70">
                      Isolated environment
                    </span>
                  </span>
                </button>
              </div>

              {mode === 'decoy' && (
                <p className="mt-2 text-[10px] leading-5 text-cyan-300/80">
                  Decoy mode should use separate credentials and must never
                  grant access to genuine administrative data.
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium text-slate-300"
              >
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-3.5 transition focus-within:border-emerald-400/50">
                <Mail size={16} className="text-slate-500" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="operator@example.com"
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium text-slate-300"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-3.5 transition focus-within:border-emerald-400/50">
                <LockKeyhole size={16} className="text-slate-500" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />

                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-3 py-3 text-xs leading-5 text-red-300"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in securely'}

              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Security notice */}
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <ShieldCheck
              size={15}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <p className="text-[10px] leading-5 text-slate-500">
              Access is subject to server-side authentication and authorization.
              The selected mode does not bypass backend security controls.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-600">
            <Terminal size={12} />
            TOKENTRAP SECURITY PLATFORM · HACK INDIA
          </div>
        </div>
      </section>
    </div>
  )
}