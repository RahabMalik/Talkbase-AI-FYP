'use client'
/**
 * src/components/ui/ChatWidget.js
 * ================================
 * Embeddable chat widget that calls POST /api/ai/chat on the Node.js backend.
 * Drop this into any page:
 *
 *   import ChatWidget from '@/components/ui/ChatWidget'
 *   <ChatWidget businessId="abc123" />
 *
 * The widget is also used by the public embed script (widget.js).
 */

import { useState, useRef, useEffect } from 'react'

const COLORS = {
  primary:   '#2563EB',
  primaryDk: '#1D4ED8',
  bg:        '#F8FAFC',
  white:     '#FFFFFF',
  border:    '#E2E8F0',
  text:      '#1E293B',
  muted:     '#94A3B8',
  userBubble:'#2563EB',
  botBubble: '#F1F5F9',
}

export default function ChatWidget({ businessId }) {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! How can I help you today?' }
  ])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function sendMessage() {
    const q = input.trim()
    if (!q || loading) return

    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('token')
        : null

      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/ai/chat', {
        method:  'POST',
        headers,
        body: JSON.stringify({
          question:   q,
          businessId: businessId,   // for public widget calls without JWT
        }),
      })

      const data = await res.json()

      const botText = data.answer ||
        'I am not fully sure about this. Please contact our support team directly.'

      setMessages(prev => [...prev, {
        role:       'bot',
        text:       botText,
        confidence: data.confidence,
        resolved:   data.resolved,
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Sorry, I could not connect to the server. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Floating button ──────────────────────────────────────────────────────
  const FloatBtn = () => (
    <button
      onClick={() => setOpen(true)}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        width: 56, height: 56, borderRadius: '50%',
        background: COLORS.primary, color: '#fff',
        border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      title="Chat with us"
    >
      💬
    </button>
  )

  if (!open) return <FloatBtn />

  // ── Chat window ──────────────────────────────────────────────────────────
  return (
    <>
      <FloatBtn />
      <div style={{
        position: 'fixed', bottom: 90, right: 24, zIndex: 9999,
        width: 360, height: 520,
        background: COLORS.white,
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', border: `1px solid ${COLORS.border}`,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>

        {/* Header */}
        <div style={{
          background: COLORS.primary, color: '#fff',
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>TalkBase AI</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>● Online</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none', border: 'none', color: '#fff',
              fontSize: 20, cursor: 'pointer', opacity: 0.8,
              lineHeight: 1,
            }}
          >✕</button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 14px',
          display: 'flex', flexDirection: 'column', gap: 12,
          background: COLORS.bg,
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {msg.role === 'bot' && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: COLORS.primary, flexShrink: 0,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 14,
                  marginRight: 8, alignSelf: 'flex-end',
                }}>🤖</div>
              )}
              <div style={{ maxWidth: '75%' }}>
                <div style={{
                  background: msg.role === 'user' ? COLORS.userBubble : COLORS.botBubble,
                  color:      msg.role === 'user' ? '#fff' : COLORS.text,
                  padding:    '10px 14px',
                  borderRadius: msg.role === 'user'
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  fontSize: 14, lineHeight: 1.5,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  {msg.text}
                </div>
                {/* Confidence badge for bot messages */}
                {msg.role === 'bot' && msg.confidence !== undefined && (
                  <div style={{
                    fontSize: 11, marginTop: 4, paddingLeft: 4,
                    color: msg.resolved ? '#16A34A' : '#D97706',
                  }}>
                    {msg.resolved
                      ? `✓ Confidence: ${Math.round(msg.confidence * 100)}%`
                      : '⚠ Low confidence — routed to support'}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: COLORS.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}>🤖</div>
              <div style={{
                background: COLORS.botBubble, padding: '10px 14px',
                borderRadius: '16px 16px 16px 4px',
              }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 14px',
          borderTop: `1px solid ${COLORS.border}`,
          background: COLORS.white,
          display: 'flex', gap: 8, alignItems: 'flex-end',
        }}>
          <textarea
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your question…"
            disabled={loading}
            style={{
              flex: 1, resize: 'none', border: `1px solid ${COLORS.border}`,
              borderRadius: 10, padding: '9px 12px',
              fontSize: 14, fontFamily: 'inherit', outline: 'none',
              background: COLORS.bg, color: COLORS.text,
              lineHeight: 1.4, maxHeight: 80, overflowY: 'auto',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              background:    input.trim() && !loading ? COLORS.primary : COLORS.border,
              color:         input.trim() && !loading ? '#fff' : COLORS.muted,
              border:        'none', borderRadius: 10,
              width: 40, height: 40, cursor: input.trim() && !loading ? 'pointer' : 'default',
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.2s',
            }}
          >
            ➤
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', padding: '6px 0 8px',
          fontSize: 11, color: COLORS.muted,
          borderTop: `1px solid ${COLORS.border}`,
        }}>
          Powered by <strong>TalkBase AI</strong>
        </div>
      </div>
    </>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 16 }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#94A3B8',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
