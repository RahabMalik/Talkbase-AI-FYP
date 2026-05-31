'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

const COLORS = [
  { name: 'Blue',   value: '#2563EB' },
  { name: 'Green',  value: '#16A34A' },
  { name: 'Purple', value: '#7C3AED' },
  { name: 'Orange', value: '#EA580C' },
  { name: 'Red',    value: '#DC2626' },
  { name: 'Black',  value: '#0F172A' },
]

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="relative flex-shrink-0 rounded-full transition-colors duration-200"
      style={{ width: 44, height: 24, padding: 0, border: 'none', cursor: 'pointer', background: checked ? 'var(--blue)' : '#CBD5E1' }}>
      <span className="absolute top-0.5 rounded-full bg-white transition-all duration-200"
        style={{ width: 20, height: 20, left: checked ? 22 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  )
}

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--border)' }}>
      <div className="px-7 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      <div className="px-7 py-6 flex flex-col gap-6">{children}</div>
    </div>
  )
}

function Field({ label, sub, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</label>
      {sub && <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      {children}
    </div>
  )
}

function LivePreview({ color, title, message }) {
  return (
    <div className="flex flex-col" style={{ minWidth: 0 }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
        Live Preview
      </p>
      <div className="rounded-2xl overflow-hidden flex flex-col"
        style={{ border: '1px solid var(--border)', background: 'var(--bg)', maxWidth: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div className="px-5 py-4" style={{ background: color }}>
          <p className="text-base font-bold text-white">{title || 'Support Team'}</p>
          <p className="text-xs text-white mt-0.5" style={{ opacity: 0.85 }}>● Online</p>
        </div>
        <div className="flex flex-col gap-3 px-4 py-4 flex-1">
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%] text-sm leading-relaxed"
              style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              {message || 'Hi there! 👋 How can we help you today?'}
            </div>
          </div>
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] text-sm leading-relaxed text-white"
              style={{ background: color }}>
              What is your refund policy?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%] text-sm leading-relaxed"
              style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              We offer a 7-day return policy. Would you like more details?
            </div>
          </div>
        </div>
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: '#fff' }}>
          <div className="rounded-full px-4 py-2.5 text-sm" style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Type a message...
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Embed Script Section ──
   FIX: now uses data-api-key instead of data-business-id.
   The widget authenticates via the Business API key (Settings → API Configuration)
   rather than exposing the internal MongoDB ObjectId publicly. */
function EmbedScript({ apiKey, color, title }) {
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('https://your-domain.com')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const displayKey = apiKey || 'YOUR_API_KEY'

  const script =
`<!-- TalkBase AI Chatbot -->
<script
  src="${origin}/widget.js"
  data-api-key="${displayKey}"
  data-color="${color}"
  data-title="${title}"
></script>`

  function copyScript() {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <Card
      title="🔗 Embed on Your Website"
      subtitle="Copy this script and paste it before the </body> tag of your website."
    >
      <div className="flex flex-col gap-3">
        {[
          { n: '1', t: 'Copy the script below' },
          { n: '2', t: 'Open your website HTML file' },
          { n: '3', t: 'Paste it just before </body>' },
          { n: '4', t: 'Save and reload — chatbot appears! 🎉' },
        ].map(s => (
          <div key={s.n} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'var(--blue)' }}>{s.n}</div>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.t}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <pre className="rounded-xl p-4 text-xs overflow-x-auto leading-relaxed"
          style={{
            background: '#0F172A', color: '#7DD3FC',
            fontFamily: 'Consolas, Monaco, monospace',
            border: '1px solid #1E293B',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}>
          <span style={{ color: '#94A3B8' }}>{`<!-- TalkBase AI Chatbot -->`}</span>{'\n'}
          <span style={{ color: '#F472B6' }}>{`<script`}</span>{'\n'}
          {'  '}<span style={{ color: '#86EFAC' }}>src</span>
          <span style={{ color: '#fff' }}>=</span>
          <span style={{ color: '#FDE68A' }}>{`"${origin}/widget.js"`}</span>{'\n'}
          {'  '}<span style={{ color: '#86EFAC' }}>data-api-key</span>
          <span style={{ color: '#fff' }}>=</span>
          <span style={{ color: '#FDE68A' }}>{`"${displayKey}"`}</span>{'\n'}
          {'  '}<span style={{ color: '#86EFAC' }}>data-color</span>
          <span style={{ color: '#fff' }}>=</span>
          <span style={{ color: '#FDE68A' }}>{`"${color}"`}</span>{'\n'}
          {'  '}<span style={{ color: '#86EFAC' }}>data-title</span>
          <span style={{ color: '#fff' }}>=</span>
          <span style={{ color: '#FDE68A' }}>{`"${title}"`}</span>{'\n'}
          <span style={{ color: '#F472B6' }}>{`></script>`}</span>
        </pre>

        <button
          onClick={copyScript}
          style={{
            position: 'absolute', top: 10, right: 10,
            background: copied ? '#16A34A' : '#1E293B',
            color: '#fff', border: '1px solid #334155',
            borderRadius: 8, padding: '6px 14px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>

      {/* FIX: show API key instead of internal businessId */}
      <div className="rounded-lg px-4 py-3 flex items-start gap-3"
        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <span style={{ fontSize: 18 }}>🔑</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1D4ED8' }}>Your API Key</p>
          <p className="text-xs mt-0.5 font-mono" style={{ color: '#2563EB' }}>{displayKey}</p>
          <p className="text-xs mt-1" style={{ color: '#3B82F6' }}>
            This key authenticates your widget. Find it in{' '}
            <a href="/settings" style={{ color: '#1D4ED8', fontWeight: 600 }}>
              Settings → API Configuration
            </a>.
            Keep it private — do not share it publicly.
          </p>
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════
   MAIN PAGE
══════════════════════ */
export default function WidgetSettingsPage() {
  const [widgetTitle, setWidgetTitle] = useState('Support Team')
  const [welcomeMsg,  setWelcomeMsg]  = useState('Hi there! 👋 How can we help you today?')
  const [themeColor,  setThemeColor]  = useState('#2563EB')
  const [saving,      setSaving]      = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [businessId,  setBusinessId]  = useState('')
  // FIX: load the API key from the business record so EmbedScript shows the right value
  const [apiKey,      setApiKey]      = useState('')
  const [toast,       setToast]       = useState({ visible: false, message: '', type: 'success' })

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000)
  }

  /* ── Load widget settings from DB on mount ── */
  useEffect(() => {
    async function loadSettings() {
      const id    = localStorage.getItem('businessId')
      const token = localStorage.getItem('token')
      if (!id || !token) { setLoading(false); return }
      setBusinessId(id)
      try {
        const res = await fetch(`/api/business/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) { setLoading(false); return }
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        if (data.widgetTitle) setWidgetTitle(data.widgetTitle)
        if (data.welcomeMsg)  setWelcomeMsg(data.welcomeMsg)
        if (data.themeColor)  setThemeColor(data.themeColor)
        // FIX: load the API key so embed script shows the correct value
        if (data.apiKey)      setApiKey(data.apiKey)
      } catch (err) {
        console.error('Widget settings load error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  /* ── Save widget settings to DB ── */
  async function handleSave() {
    const token = localStorage.getItem('token')
    if (!businessId || !token) { showToast('Not logged in', 'error'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/business/${businessId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ widgetTitle, welcomeMsg, themeColor }),
      })
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) throw new Error('Backend not reachable')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Save failed')
      showToast('Widget settings saved successfully.')
    } catch (err) {
      showToast(err.message || 'Failed to save settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  /* ── Discard: reload from DB ── */
  async function handleDiscard() {
    const id    = localStorage.getItem('businessId')
    const token = localStorage.getItem('token')
    if (!id || !token) return
    try {
      const res  = await fetch(`/api/business/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) {
        setWidgetTitle(data.widgetTitle || 'Support Team')
        setWelcomeMsg(data.welcomeMsg   || 'Hi there! 👋 How can we help you today?')
        setThemeColor(data.themeColor   || '#2563EB')
        if (data.apiKey) setApiKey(data.apiKey)
        showToast('Changes discarded.')
      }
    } catch {
      showToast('Could not reload settings.', 'error')
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--border)', borderRadius: 10,
    background: 'var(--bg)', color: 'var(--text-primary)',
    fontFamily: 'inherit', fontSize: 14, outline: 'none', transition: 'all 0.15s',
  }

  return (
    <DashboardLayout
      title="Widget Settings"
      subtitle="Customize your chatbot and get your embed script."
      actions={
        <div className="flex items-center gap-2">
          <button onClick={handleDiscard}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ border: '1px solid var(--border)', background: '#fff', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Discard Changes
          </button>
          <button onClick={handleSave} disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: saving || loading ? '#93C5FD' : 'var(--blue)', border: 'none', cursor: saving || loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving && <div className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      }
    >
      <div className="flex flex-col xl:flex-row gap-6 items-start">

        <div className="flex flex-col gap-5 w-full xl:flex-1 min-w-0">

          <Card title="Appearance">
            {loading ? (
              <div className="flex items-center gap-2 text-sm py-2" style={{ color: '#94A3B8' }}>
                <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563EB' }} />
                Loading saved settings…
              </div>
            ) : (
              <>
                <Field label="Widget Title">
                  <input value={widgetTitle} onChange={e => setWidgetTitle(e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)' }}
                    onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                  />
                </Field>

                <Field label="Welcome Message">
                  <textarea value={welcomeMsg} onChange={e => setWelcomeMsg(e.target.value)} rows={3}
                    style={{ ...inputStyle, minHeight: 80, resize: 'none' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)' }}
                    onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                  />
                </Field>

                <Field label="Theme Color">
                  <div className="flex items-center gap-3 flex-wrap">
                    {COLORS.map(c => (
                      <button key={c.value} onClick={() => setThemeColor(c.value)}
                        title={c.name}
                        className="rounded-full transition-all flex-shrink-0"
                        style={{
                          width: 36, height: 36, background: c.value, border: 'none', cursor: 'pointer',
                          boxShadow: themeColor === c.value ? `0 0 0 2px #fff, 0 0 0 4px ${c.value}` : 'none',
                          transform: themeColor === c.value ? 'scale(1.1)' : 'scale(1)',
                        }} />
                    ))}
                  </div>
                </Field>
              </>
            )}
          </Card>

          {/* FIX: pass apiKey instead of businessId */}
          <EmbedScript apiKey={apiKey} color={themeColor} title={widgetTitle} />

        </div>

        <div className="w-full xl:w-[380px] flex-shrink-0">
          <LivePreview color={themeColor} title={widgetTitle} message={welcomeMsg} />
        </div>

      </div>

      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all duration-300"
        style={{
          background: toast.type === 'success' ? '#16A34A' : 'var(--red)',
          opacity: toast.visible ? 1 : 0,
          transform: toast.visible ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}>
        {toast.type === 'success' ? '✓' : '✕'} {toast.message}
      </div>

    </DashboardLayout>
  )
}
