'use client'
/**
 * src/components/ui/EmbedScript.js
 * ==================================
 * Shows the business their unique embed script to copy and paste
 * into their own website. Drop this into any page:
 *
 *   import EmbedScript from '@/components/ui/EmbedScript'
 *   <EmbedScript />
 *
 * It reads businessId automatically from localStorage.
 */

import { useState, useEffect } from 'react'

export default function EmbedScript() {
  const [businessId, setBusinessId] = useState('')
  const [copied, setCopied]         = useState(false)

  useEffect(() => {
    const id = localStorage.getItem('businessId')
    if (id) setBusinessId(id)
  }, [])

  const baseUrl = 'http://localhost:3000' // change to your live domain when deployed

  const script = `<!-- TalkBase AI Chatbot -->
<script
  src="${baseUrl}/widget.js"
  data-business-id="${businessId || 'YOUR_BUSINESS_ID'}"
  data-base-url="${baseUrl}"
  defer>
</script>`

  function copyScript() {
    navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 24,
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 28px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1E293B', margin: 0 }}>
            📋 Embed Chatbot on Your Website
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
            Copy this script and paste it before the {'</body>'} tag of your website
          </p>
        </div>
        <button
          onClick={copyScript}
          style={{
            background: copied ? '#16A34A' : '#2563EB',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 20px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'background 0.2s',
            display: 'flex', alignItems: 'center', gap: 8,
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? '✓ Copied!' : '📋 Copy Script'}
        </button>
      </div>

      {/* Code block */}
      <div style={{ padding: '20px 28px' }}>
        <pre style={{
          background: '#0F172A', color: '#E2E8F0',
          padding: '20px 24px', borderRadius: 12,
          fontSize: 13, lineHeight: 1.7, margin: 0,
          overflowX: 'auto', whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
        }}>
          {script}
        </pre>

        {/* Steps */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: 0 }}>
            How to install:
          </p>
          {[
            'Copy the script above',
            'Open your website\'s HTML file',
            'Paste it just before the </body> closing tag',
            'Save and refresh your website — the chat bubble will appear!',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: '#EFF6FF', color: '#2563EB',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 13, color: '#475569', margin: 0, paddingTop: 2 }}>{step}</p>
            </div>
          ))}
        </div>

        {/* Your business ID */}
        {businessId && (
          <div style={{
            marginTop: 16, padding: '12px 16px',
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 13, color: '#16A34A' }}>✓</span>
            <span style={{ fontSize: 13, color: '#15803D' }}>
              Your Business ID: <strong style={{ fontFamily: 'monospace' }}>{businessId}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
