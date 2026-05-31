'use client'
import { useState } from 'react'
export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  function handleSubmit(e) { e.preventDefault(); setSubmitted(true) }
  const input = { width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#0C1425', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 48 }}><a href="/" style={{ fontSize: 13, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a></div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#0C1425', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Contact us</h1>
        <p style={{ fontSize: 16, color: '#64748B', marginBottom: 40 }}>Have a question? We would love to hear from you.</p>
        {submitted ? (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#15803D', margin: 0 }}>Message sent!</p>
            <p style={{ fontSize: 14, color: '#16A34A', margin: '8px 0 0' }}>We will get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[{ label: 'Full name', key: 'name', type: 'text', ph: 'Alex Johnson' }, { label: 'Email address', key: 'email', type: 'email', ph: 'you@company.com' }].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required style={input}
                  onFocus={e => e.target.style.borderColor='#2563EB'} onBlur={e => e.target.style.borderColor='#E2E8F0'} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message</label>
              <textarea placeholder="How can we help you?" value={form.message} rows={5} required onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                style={{ ...input, resize: 'none' }} onFocus={e => e.target.style.borderColor='#2563EB'} onBlur={e => e.target.style.borderColor='#E2E8F0'} />
            </div>
            <button type="submit" style={{ padding: '12px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Send message
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
