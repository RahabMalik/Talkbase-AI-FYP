'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({ error, reset }) {
  const router = useRouter()

  useEffect(() => {
    console.error('[App Error]', error)
    // If JWT expired, clear everything and redirect to login
    if (error?.message?.includes('401') || error?.message?.includes('expired')) {
      localStorage.removeItem('token')
      localStorage.removeItem('businessId')
      document.cookie = 'token=; path=/; max-age=0; SameSite=Strict'
      router.push('/login')
    }
  }, [error])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif', background: '#F8FAFC',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0F172A', margin: '0 0 8px' }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24, lineHeight: 1.6 }}>
          An unexpected error occurred. Try refreshing the page.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset}
            style={{
              padding: '9px 20px', background: '#2563EB', color: '#fff',
              border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>
            Try again
          </button>
          <button onClick={() => { window.location.href = '/dashboard' }}
            style={{
              padding: '9px 20px', background: '#fff', color: '#374151',
              border: '1px solid #E2E8F0', borderRadius: 9, fontSize: 14, cursor: 'pointer',
            }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
