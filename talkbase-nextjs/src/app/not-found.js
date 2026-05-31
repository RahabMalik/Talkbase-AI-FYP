'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif', background: '#F8FAFC',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: '#E2E8F0', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0F172A', margin: '16px 0 8px' }}>
          Page not found
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 28, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/dashboard" style={{
          display: 'inline-block', padding: '10px 24px',
          background: '#2563EB', color: '#fff', borderRadius: 9,
          textDecoration: 'none', fontSize: 14, fontWeight: 500,
        }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
