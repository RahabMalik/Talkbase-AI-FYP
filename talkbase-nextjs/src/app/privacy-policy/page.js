export default function PrivacyPolicyPage() {
  const sections = [
    { title: '1. Information we collect', body: 'We collect information you provide when creating an account (name, email, password), business details (company name, domain, support email), and FAQ content you upload. We also collect usage data such as questions asked through your chatbot widget.' },
    { title: '2. How we use your information', body: 'We use your information to provide and improve the TalkBase platform, process your FAQs into AI knowledge bases, generate analytics for your dashboard, and send password reset emails when requested.' },
    { title: '3. Data isolation', body: 'Each business account is completely isolated. Your FAQs, conversations, analytics, and widget settings are scoped to your business ID and are never accessible to other businesses on the platform.' },
    { title: '4. Third-party services', body: 'TalkBase uses OpenAI for AI answer generation, Pinecone for vector storage, and MongoDB Atlas for database storage. Your data is processed by these services solely to provide TalkBase functionality.' },
    { title: '5. Security', body: 'Passwords are hashed using bcrypt. API communications use JWT authentication. All endpoints are rate-limited. We use HTTPS for all data in transit.' },
    { title: '6. Contact', body: 'For privacy questions, contact us at privacy@talkbase.ai' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 48 }}><a href="/" style={{ fontSize: 13, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a></div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#0C1425', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
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
