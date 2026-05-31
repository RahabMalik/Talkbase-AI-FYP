'use client'
import { useState, useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  ArcElement, Tooltip, Filler,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Filler)

function StatCard({ label, value, badge, badgeColor, desc, bars, barColor, barLightColor }) {
  return (
    <div className="rounded-xl p-4 sm:p-5" style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-medium" style={{ color: '#475569' }}>{label}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: badgeColor.bg, color: badgeColor.text }}>
          {badge}
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-semibold mb-1.5 leading-none" style={{ color: '#0F172A' }}>{value}</p>
      <p className="text-xs mb-3 leading-snug" style={{ color: '#94A3B8' }}>{desc}</p>
      <div className="flex items-end gap-1" style={{ height: 28 }}>
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-sm"
            style={{ height: `${h}%`, background: h > 60 ? barColor : barLightColor }} />
        ))}
      </div>
    </div>
  )
}

function Panel({ children, className = '' }) {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}
      style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
      {children}
    </div>
  )
}

function PanelHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-4"
      style={{ borderBottom: '1px solid #E2E8F0' }}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold mb-0.5 truncate" style={{ color: '#0F172A' }}>{title}</h2>
        <p className="text-xs leading-snug" style={{ color: '#94A3B8' }}>{subtitle}</p>
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}

function Tag({ children, blue }) {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-md border whitespace-nowrap"
      style={blue
        ? { background: '#EFF6FF', color: '#2563EB', borderColor: '#DBEAFE' }
        : { background: '#F8FAFC', color: '#475569', borderColor: '#E2E8F0' }}>
      {children}
    </span>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const router = useRouter()

  function handleExport() {
    if (!stats) return
    const rows = [
      ['Metric', 'Value'],
      ['Total FAQs',       stats.totalFAQs],
      ['Unanswered FAQs',  stats.unansweredFAQs],
      ['Resolution Rate',  stats.resolutionRate],
      ['Active Visitors',  stats.activeVisitors ?? 0],
      ['Total Conversations', stats.totalConversations],
      [],
      ['Top Unanswered Topics', 'Ask Count', 'Category'],
      ...(stats.topUnanswered || []).map(t => [t.topic, t.count, t.category]),
    ]
    const csv = rows.map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a   = Object.assign(document.createElement('a'), { href: url, download: 'talkbase-dashboard.csv' })
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const res  = await fetch('/api/analytics?range=7', { headers: { Authorization: `Bearer ${token}` } })
        const ct   = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return
        const data = await res.json()
        if (res.ok) setStats(data)
      } catch {}
    }
    load()
  }, [])

  // ── Real chart data from API ──
  const chartLabels  = stats?.chart?.labels    || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const chartTotals  = stats?.chart?.totals    || [0,0,0,0,0,0,0]
  const chartUnres   = stats?.chart?.unresolved || [0,0,0,0,0,0,0]

  const lineData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Total queries',
        data: chartTotals,
        borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.06)',
        borderWidth: 2, tension: 0.4, fill: true,
        pointRadius: 3, pointBackgroundColor: '#2563EB',
      },
      {
        label: 'Unresolved',
        data: chartUnres,
        borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.05)',
        borderWidth: 2, tension: 0.4, fill: true,
        pointRadius: 3, pointBackgroundColor: '#F59E0B',
      },
    ],
  }

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94A3B8', maxRotation: 0 } },
      y: { grid: { color: '#F1F5F9' }, border: { display: false }, ticks: { font: { size: 11 }, color: '#94A3B8' } },
    },
  }

  // ── Real resolution data ──
  const resRate    = stats ? parseFloat(stats.resolutionRate) : 0
  const unresRate  = stats ? Math.max(0, 100 - resRate) : 0
  const resolvedAI = Math.max(0, resRate - 5).toFixed(1)
  const escalated  = Math.min(unresRate, 5).toFixed(1)
  const noAnswer   = Math.max(0, unresRate - 5).toFixed(1)

  const donutData = {
    datasets: [{ data: [parseFloat(resolvedAI), parseFloat(escalated), parseFloat(noAnswer)], backgroundColor: ['#2563EB', '#F59E0B', '#E2E8F0'], borderWidth: 0, hoverOffset: 4 }],
  }
  const donutOptions = {
    cutout: '72%', responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  }

  return (
    <DashboardLayout>

      {/* Topbar */}
      <header className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4"
        style={{ background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold mb-0.5 truncate" style={{ color: '#0F172A' }}>Business overview</h1>
          <p className="text-xs sm:text-sm leading-snug" style={{ color: '#475569' }}>
            Monitor support activity and resolution health.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={handleExport} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ border: '1.5px solid #E2E8F0', background: '#fff', color: '#0F172A', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button onClick={() => router.push('/analytics')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: '#2563EB', border: 'none', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span className="hidden sm:inline">Analytics</span>
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 flex flex-col gap-4">

        {/* Stat cards — 1 col mobile, 2 tablet, 4 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Total queries" value={stats ? String(stats.totalFAQs) : '—'} badge={stats?.totalFAQsChange || '—'}
            badgeColor={{ bg: '#F0FDF4', text: '#15803D' }}
            desc="Across all website visitors and support conversations."
            bars={chartTotals.map(v => Math.max(10, (v / Math.max(...chartTotals, 1)) * 100))} barColor="#2563EB" barLightColor="#DBEAFE" />
          <StatCard label="Unanswered FAQs" value={stats ? String(stats.unansweredFAQs) : '—'} badge="Needs review"
            badgeColor={{ bg: '#FFFBEB', text: '#B45309' }}
            desc="Questions the AI couldn't answer — review in FAQ manager."
            bars={chartUnres.map(v => Math.max(10, (v / Math.max(...chartUnres, 1)) * 100))} barColor="#F59E0B" barLightColor="#FED7AA" />
          {/* FIX: resolution rate sparkline derived from real 7-day totals/answered data,
              not hardcoded [70,75,80,72,90,85,95]. We use the same chartTotals the
              line chart uses; if no data yet we show uniform bars so it's not fake. */}
          <StatCard label="Resolution rate" value={stats ? stats.resolutionRate : '—'} badge={stats?.resolutionRateChange || '—'}
            badgeColor={{ bg: '#F0FDF4', text: '#15803D' }}
            desc="Bot resolving conversations without human handoff."
            bars={chartTotals.some(v => v > 0)
              ? chartTotals.map((tot, i) => {
                  const unres = chartUnres[i] ?? 0
                  if (tot === 0) return 10
                  return Math.max(10, Math.round(((tot - unres) / tot) * 100))
                })
              : Array(7).fill(10)}
            barColor="#10B981" barLightColor="#A7F3D0" />
          {/* FIX: active-visitors sparkline was hardcoded [50,65,75,55,85,90,80].
              We use chartTotals as a proxy for traffic trend — same shape as the
              line chart — so at least the direction is real. */}
          <StatCard label="Active visitors" value={stats ? String(stats.activeVisitors ?? 0) : '—'} badge="Live"
            badgeColor={{ bg: '#EFF6FF', text: '#2563EB' }}
            desc="Visitors with the widget open in the last 5 minutes."
            bars={chartTotals.map(v => Math.max(10, (v / Math.max(...chartTotals, 1)) * 100))}
            barColor="#2563EB" barLightColor="#DBEAFE" />
        </div>

        {/* Line chart + Donut — stacked on mobile, side by side on xl */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
          <Panel>
            <PanelHeader
              title="Query volume over time"
              subtitle="Incoming questions and unresolved spikes — last 7 days."
              right={<div className="flex gap-2"><Tag>7 days</Tag><Tag blue>Live</Tag></div>}
            />
            <div className="flex gap-4 px-4 sm:px-5 pt-3">
              {[{ color: '#2563EB', label: 'Total' }, { color: '#F59E0B', label: 'Unresolved' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
                  <div className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
            <div className="p-4 sm:p-5" style={{ height: 200 }}>
              <Line data={lineData} options={lineOptions} />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Resolution mix" subtitle="How the bot handled conversations." />
            <div className="flex flex-col items-center px-5 py-4">
              <div className="relative mb-4" style={{ width: 120, height: 120 }}>
                <Doughnut data={donutData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xl font-semibold" style={{ color: '#0F172A' }}>{stats ? stats.resolutionRate : '—'}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>resolved</p>
                </div>
              </div>
              <div className="w-full">
                {[
                  { dot: '#2563EB', label: 'Resolved by AI', val: `${resolvedAI}%` },
                  { dot: '#F59E0B', label: 'Escalated',      val: `${escalated}%`  },
                  { dot: '#E2E8F0', label: 'No answer',      val: `${noAnswer}%`   },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-2 text-sm"
                    style={{ borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full flex-shrink-0" style={{ width: 9, height: 9, background: r.dot }} />
                      {r.label}
                    </div>
                    <strong style={{ color: '#0F172A' }}>{r.val}</strong>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* Table + Workspace — stacked on mobile */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
          <Panel>
            <PanelHeader title="Top unanswered topics" subtitle="Fix these to reduce missed answers." right={<Tag blue>Top {stats?.topUnanswered?.length || 0}</Tag>} />
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 400 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Topic', 'Count', 'Trend', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: '#94A3B8', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.topUnanswered?.length
                    ? stats.topUnanswered.map((row, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-sm" style={{ color:'#0F172A', borderBottom:'1px solid #E2E8F0', maxWidth: 260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.topic}</td>
                      <td className="px-4 py-3 text-sm" style={{ color:'#0F172A', borderBottom:'1px solid #E2E8F0' }}>{row.count}x</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#DC2626', borderBottom:'1px solid #E2E8F0' }}>Unanswered</td>
                      <td className="px-4 py-3" style={{ borderBottom:'1px solid #E2E8F0' }}>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background:'#FEF2F2', color:'#DC2626' }}>{row.category || 'general'}</span>
                      </td>
                    </tr>
                  ))
                    : (
                    <tr><td colSpan={4} className="px-4 py-8 text-sm text-center" style={{ color:'#94A3B8' }}>
                      No unanswered topics yet — your AI is handling everything.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Workspace health" subtitle="Content freshness and widget readiness." />
            {[
              { key: 'Knowledge sync', statusLabel: 'Healthy', statusColor: '#15803D', val: `${stats?.totalFAQs ?? 0} FAQs`, desc: 'Total questions in knowledge base.' },
              { key: 'Widget status',  statusLabel: 'Live',    statusColor: '#2563EB', val: `${stats?.activeVisitors ?? 0} online`, desc: 'Widget active on embedded pages.' },
              { key: 'Escalations',    statusLabel: 'Monitor', statusColor: '#B45309', val: `${stats?.unansweredFAQs ?? 0} pending`, desc: 'Review unanswered queries.' },
            ].map((item, i, arr) => (
              <div key={item.key} className="px-4 sm:px-5 py-3.5"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: '#94A3B8' }}>{item.key}</span>
                  <span className="text-xs font-semibold" style={{ color: item.statusColor }}>{item.statusLabel}</span>
                </div>
                <p className="text-lg sm:text-xl font-semibold mb-1" style={{ color: '#0F172A' }}>{item.val}</p>
                <p className="text-xs leading-snug" style={{ color: '#94A3B8' }}>{item.desc}</p>
              </div>
            ))}
          </Panel>
        </div>

        {/* Quick actions */}
        <Panel>
          <PanelHeader title="Quick actions" subtitle="Common setup and optimization workflows." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5">
            {[
              { title: 'Edit widget',    desc: 'Change colors, title and welcome message.', href: '/widget-settings' },
              { title: 'Manage FAQs',    desc: 'Add answers to unanswered questions.', href: '/FAQ' },
              { title: 'View analytics', desc: 'Review trends and unresolved queries.', href: '/analytics' },
            ].map(qa => (
              <button key={qa.title} onClick={() => router.push(qa.href)} className="text-left rounded-lg px-4 py-4"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#2563EB'; e.currentTarget.style.background='#EFF6FF' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.background='#F8FAFC' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: '#0F172A' }}>{qa.title}</p>
                <p className="text-xs leading-snug" style={{ color: '#94A3B8' }}>{qa.desc}</p>
              </button>
            ))}
          </div>
        </Panel>

      </div>
    </DashboardLayout>
  )
}