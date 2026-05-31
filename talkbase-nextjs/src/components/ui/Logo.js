'use client'
import Link from 'next/link'

export default function Logo({ href = '/', size = 'md' }) {
  const s = size === 'sm' ? 0.78 : size === 'lg' ? 1.3 : 1

  const iconW = Math.round(38 * s)
  const iconH = Math.round(34 * s)

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: Math.round(9 * s) }}>

      {/* ── Speech bubble icon ── */}
      <div style={{
        width: iconW, height: iconH,
        flexShrink: 0, position: 'relative',
      }}>
        <svg
          width={iconW} height={iconH}
          viewBox="0 0 38 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bubble body */}
          <rect x="1.5" y="1.5" width="35" height="26" rx="7" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2"/>
          {/* Tail */}
          <path d="M8 27.5 L5 34 L18 27.5" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round"/>
          {/* Three lines — chat content */}
          <rect x="9" y="10" width="20" height="2.5" rx="1.25" fill="#2563EB"/>
          <rect x="9" y="15" width="14" height="2.5" rx="1.25" fill="#2563EB" opacity="0.45"/>
          <rect x="9" y="20" width="17" height="2.5" rx="1.25" fill="#2563EB" opacity="0.25"/>
        </svg>
      </div>

      {/* ── Wordmark + tagline ── */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: Math.round(20 * s),
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#0F172A',
          lineHeight: 1,
        }}>
          TalkBase
        </span>
        <span style={{
          fontSize: Math.round(8.5 * s),
          fontWeight: 800,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#2563EB',
          marginTop: Math.round(3 * s),
          fontFamily: 'system-ui, sans-serif',
        }}>
          Powered by AI
        </span>
      </div>

    </Link>
  )
}
