'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

// ── Step 1: collect email and request a reset link ──────────────────────────
function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState('')

  function validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return false
    }
    setError('')
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message || 'Something went wrong'); return }
      setSent(email)
    } catch {
      alert('Server error')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <>
        <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
        <p className="text-sm text-slate-500 mb-4">
          Reset link sent to <b>{sent}</b>
        </p>
        <button onClick={() => setSent('')} className="text-blue-600 underline text-sm">
          Try again
        </button>
      </>
    )
  }

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">
        Reset your password
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg mb-2"
        />
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <div className="mt-4 text-sm text-slate-500">
        <Link href="/login">← Back to login</Link>
      </div>
    </>
  )
}

// ── Step 2: user arrived via the email link — set a new password ─────────────
function SetNewPasswordForm({ token }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function validate() {
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return false }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return false }
    setError('')
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Link is invalid or has expired.'); return }
      setDone(true)
    } catch {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Password updated!</h1>
        <p className="text-sm text-slate-500 mb-6">You can now log in with your new password.</p>
        <Link href="/login" className="w-full block bg-blue-600 text-white py-3 rounded-lg text-center font-semibold">
          Go to login
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">
        Set new password
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Choose a strong password for your account.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg mb-3"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg mb-2"
        />
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg mt-1"
        >
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </>
  )
}

// ── Router: pick the right form based on ?token= ─────────────────────────────
function ResetPasswordRouter() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  return token ? <SetNewPasswordForm token={token} /> : <ForgotPasswordForm />
}

// ── Page shell ────────────────────────────────────────────────────────────────
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="flex items-center justify-between px-4 sm:px-7 py-4 bg-white border-b border-slate-100">
        <Logo />
        <div className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-slate-500 hover:text-slate-700">Log in</Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl px-6 sm:px-10 py-8 sm:py-11 shadow-xl shadow-slate-200/60 text-center">
          <Suspense fallback={null}>
            <ResetPasswordRouter />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
