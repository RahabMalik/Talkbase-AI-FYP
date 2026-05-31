'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Logo from '@/components/ui/Logo'

export default function DashboardLayout({ children, title, subtitle, actions }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>

      {/*
        FIX: single Sidebar instance — always rendered, visibility controlled by
        isOpen + CSS transform (see Sidebar.js).
        On lg+ screens, isOpen is always true (sidebar always visible).
        On mobile, isOpen toggles via the hamburger button.
        Previously two separate Sidebar instances were rendered which caused
        stale state issues, and the transform was never applied so the mobile
        sidebar permanently overlapped content.
      */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="lg:ml-[220px] flex flex-col min-h-screen">

        {/* Mobile top bar — logo + hamburger */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
          style={{ background: '#fff', borderBottom: '1px solid #E2E8F0' }}
        >
          <Logo />
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col gap-1 p-2 rounded-lg border"
            style={{ borderColor: '#E2E8F0' }}
            aria-label="Open menu"
          >
            <span className="block w-5 h-0.5 rounded" style={{ background: '#0F172A' }} />
            <span className="block w-5 h-0.5 rounded" style={{ background: '#0F172A' }} />
            <span className="block w-5 h-0.5 rounded" style={{ background: '#0F172A' }} />
          </button>
        </div>

        {/* Optional page header (title + actions) */}
        {(title || actions) && (
          <div
            className="flex items-start justify-between gap-4 px-6 py-4"
            style={{ background: '#fff', borderBottom: '1px solid #E2E8F0' }}
          >
            {title && (
              <div>
                <h1 className="text-lg font-semibold" style={{ color: '#0F172A' }}>{title}</h1>
                {subtitle && <p className="text-sm mt-0.5" style={{ color: '#475569' }}>{subtitle}</p>}
              </div>
            )}
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 flex flex-col gap-5 p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
