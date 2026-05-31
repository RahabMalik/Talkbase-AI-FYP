export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <a href="/" style={{ fontSize: 13, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#0C1425', margin: '0 0 16px', letterSpacing: '-0.02em' }}>About TalkBase</h1>
        <p style={{ fontSize: 17, color: '#64748B', lineHeight: 1.7, marginBottom: 48 }}>
          TalkBase is a multi-tenant AI customer support platform built for startups and small businesses.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {[
            { title: 'Our mission', body: 'We believe every small business deserves a 24/7 support assistant. TalkBase makes it possible to deploy an AI chatbot trained on your own FAQs in under five minutes, with zero engineering required.' },
            { title: 'How it works', body: 'Business owners sign up, add their frequently asked questions, ingest them into the AI knowledge base, and embed a single script tag on their website. The chatbot answers customer questions automatically, and the analytics dashboard shows what is working and what needs improvement.' },
            { title: 'Privacy and isolation', body: 'Every business account is completely isolated. Your FAQs, conversations, and analytics are scoped to your business ID and are never shared with or visible to other businesses on the platform.' },
          ].map(s => (
            <div key={s.title} style={{ borderLeft: '3px solid #2563EB', paddingLeft: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0C1425', margin: '0 0 10px' }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
