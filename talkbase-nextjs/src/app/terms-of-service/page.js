export default function TermsPage() {
  const sections = [
    { title: '1. Acceptance of terms', body: 'By creating an account on TalkBase, you agree to these Terms of Service. If you do not agree, please do not use the platform.' },
    { title: '2. Use of the service', body: 'TalkBase provides an AI-powered customer support chatbot platform. You may use TalkBase to create, deploy, and manage AI chatbots for your business. You are responsible for the content you upload and the accuracy of your FAQs.' },
    { title: '3. Account responsibilities', body: 'You are responsible for maintaining the security of your account credentials. You must not share your API key or allow unauthorized access to your account.' },
    { title: '4. Prohibited uses', body: 'You may not use TalkBase to upload illegal content, harass or mislead customers, violate any applicable laws, or attempt to access other tenants data.' },
    { title: '5. Data ownership', body: 'You retain ownership of all content you upload to TalkBase. By uploading content, you grant TalkBase a license to process it solely for providing the service.' },
    { title: '6. Termination', body: 'You may delete your account at any time. We may suspend accounts that violate these terms. Upon termination, your data will be deleted within 30 days.' },
    { title: '7. Contact', body: 'For questions about these terms, contact us at legal@talkbase.ai' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 48 }}><a href="/" style={{ fontSize: 13, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a></div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#0C1425', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 48 }}>Last updated: May 2026</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {sections.map(s => (
            <div key={s.title} style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 32 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0C1425', margin: '0 0 12px' }}>{s.title}</h2>
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.75, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
