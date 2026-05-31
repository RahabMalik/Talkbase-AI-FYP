'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'

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

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function validate() {
    const e = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (form.password.length < 6) e.password = 'Enter your password'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.message || 'Login failed. Please try again.' });
        setLoading(false);
        return;
      }

      // save token and businessId
      localStorage.setItem("token", data.token);
      localStorage.setItem('businessId', data.businessId)
      if (data.businessId) localStorage.setItem("businessId", data.businessId);
      // Save token as cookie so Next.js middleware can protect routes
      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`;

      // redirect — no alert needed
      router.push("/dashboard");

    } catch (error) {
      console.log(error);
      setErrors({ general: 'Cannot connect to server. Make sure the backend is running.' });
    }

    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 10, background: 'var(--bg)',
    color: 'var(--text-primary)', fontFamily: 'inherit',
    fontSize: 14, outline: 'none', transition: 'all 0.15s',
  }

  const focusStyle = { borderColor: 'var(--blue)', background: '#fff', boxShadow: '0 0 0 3px rgba(37,99,235,0.08)' }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, var(--blue-mid) 0%, #F1F5F9 50%, var(--border) 100%)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 sm:px-7 py-4">
        <Logo href="/" />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          No account?{' '}
          <Link href="/signup" className="font-semibold" style={{ color: 'var(--blue)' }}>Sign up free</Link>
        </p>
      </nav>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-[20px] px-7 sm:px-9 py-9"
          style={{ background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 40px -8px rgba(0,0,0,0.08)' }}>

          <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome back
          </h1>
          <p className="text-sm text-center mb-7" style={{ color: 'var(--text-secondary)' }}>
            Log in to your TalkBase AI account.
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* General error banner (rate limit, server error, wrong password) */}
            {errors.general && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                fontSize: 13, color: '#DC2626', lineHeight: 1.5,
              }}>
                {errors.general}
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Work Email</label>
              <input id="email" type="email" placeholder="alex@company.com"
                value={form.email} onChange={set('email')} style={inputStyle}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg)'; e.target.style.boxShadow = 'none' }}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Password</label>
                <Link href="/reset-password" className="text-xs font-medium" style={{ color: 'var(--blue)' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <input id="password" type={showPw ? 'text' : 'password'} placeholder="Your password"
                  value={form.password} onChange={set('password')}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg)'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 p-1 bg-transparent border-none cursor-pointer"
                  style={{ color: 'var(--text-muted)', display: 'flex' }}>
                  <EyeIcon show={showPw} />
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-5 mb-5 py-3.5 rounded-[10px] text-sm font-semibold text-white"
              style={{ background: loading ? '#93C5FD' : 'var(--blue)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>

          </form>

          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold" style={{ color: 'var(--blue)' }}>Sign up free</Link>
          </p>

        </div>
      </main>
    </div>
  )
}