'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'

function Field({ label, id, type = 'text', placeholder, value, onChange, icon, children }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium mb-1.5 text-slate-900">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 pointer-events-none text-slate-400">{icon}</span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg text-sm outline-none transition-all border border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
          style={{ padding: icon ? '12px 40px 12px 40px' : '12px 14px' }}
        />
        {children}
      </div>
    </div>
  )
}

function getStrength(val) {
  let s = 0
  if (val.length >= 8) s++
  if (/[A-Z]/.test(val)) s++
  if (/[0-9]/.test(val)) s++
  if (/[^A-Za-z0-9]/.test(val)) s++
  return s
}

function StrengthBar({ password }) {
  const score = password ? getStrength(password) : 0
  const color = score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-amber-400' : 'bg-emerald-500'
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong'
  return (
    <div className="mt-2 mb-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? color : 'bg-slate-200'}`} />
        ))}
      </div>
      {password && <p className="text-xs mt-1 text-slate-500">{label} password</p>}
    </div>
  )
}

function EyeIcon({ show }) {
  return show ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  // FIX: inline server error banner instead of alert()
  const [serverError, setServerError] = useState('')

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  function validate() {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Enter your full name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (getStrength(form.password) < 2) e.password = 'Password too weak'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')

    if (!validate()) return

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // FIX: was alert(data.message) — now shown inline like the login page
        setServerError(data.message || 'Signup failed. Please try again.')
        setLoading(false)
        return
      }

      router.push('/login')
    } catch (err) {
      // FIX: was alert(error.message)
      setServerError('Cannot connect to server. Make sure the backend is running.')
    }

    setLoading(false)
  }

  const pwMatch = form.confirm
    ? form.password === form.confirm ? 'match' : 'no'
    : null

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100">

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-7 py-4">
        <Logo />
        <p className="text-sm text-slate-500">
          Have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Log in
          </Link>
        </p>
      </nav>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl px-6 sm:px-9 py-8 sm:py-10 shadow-xl shadow-slate-200/60">

          <h1 className="text-2xl sm:text-3xl font-semibold text-center text-slate-900 mb-2">
            Create your account
          </h1>
          <p className="text-sm text-center text-slate-500 mb-7">
            Join TalkBase AI and deploy your AI assistant in minutes.
          </p>

          {/* FIX: inline error banner — matches login page style, replaces alert() */}
          {serverError && (
            <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-lg text-sm"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <Field label="Full Name" id="name" placeholder="Alex Johnson"
              value={form.name} onChange={set('name')}
              icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
            />
            {errors.name && <p className="text-xs -mt-3 mb-3 text-red-500">{errors.name}</p>}

            <Field label="Work Email" id="email" type="email" placeholder="alex@company.com"
              value={form.email} onChange={set('email')}
              icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></svg>}
            />
            {errors.email && <p className="text-xs -mt-3 mb-3 text-red-500">{errors.email}</p>}

            <Field label="Password" id="password" type={showPw ? 'text' : 'password'}
              placeholder="Create a secure password"
              value={form.password} onChange={set('password')}
              icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>}>
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 bg-transparent border-none p-0 cursor-pointer">
                <EyeIcon show={showPw} />
              </button>
            </Field>
            <StrengthBar password={form.password} />
            {errors.password && <p className="text-xs mt-1 mb-3 text-red-500">{errors.password}</p>}

            <div className="mt-4">
              <Field label="Confirm Password" id="confirm" type={showCf ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirm} onChange={set('confirm')}
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}>
                <button type="button" onClick={() => setShowCf(v => !v)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 bg-transparent border-none p-0 cursor-pointer">
                  <EyeIcon show={showCf} />
                </button>
              </Field>
              {pwMatch && (
                <p className={`text-xs -mt-2 ${pwMatch === 'match' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {pwMatch === 'match' ? '✓ Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-6 py-3.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors cursor-pointer">
              {loading ? 'Creating account...' : 'Sign Up for Free'}
            </button>

          </form>

          {/* Bottom links */}
          <div className="mt-5 flex flex-col items-center gap-3">
            <p className="text-xs text-slate-400">
              By signing up, you agree to our{' '}
              <Link href="#" className="text-blue-600 hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
            <p className="text-sm text-slate-500">
              Forgot your password?{' '}
              <Link href="/reset-password" className="font-semibold text-blue-600 hover:text-blue-700">
                Reset it
              </Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}
