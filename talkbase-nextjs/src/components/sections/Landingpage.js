'use client'
import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ background: "#F8FAFC" }}>

      {/* SECTION 1 — Core features */}
      <section id="features" style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "4px 14px", borderRadius: 99, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Core features
            </span>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#0F172A", margin: "16px 0 12px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Everything to build a production support chatbot
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.65, maxWidth: 520, margin: "0 auto" }}>
              Train, deploy, monitor, and improve your AI chatbot from one simple dashboard.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { tag: "Knowledge",  title: "FAQ Manager",            desc: "Add Q&As manually or let the AI capture them from real customer conversations.", bg: "#EFF6FF", border: "#BFDBFE", tagColor: "#2563EB" },
              { tag: "AI",         title: "Instant AI answers",     desc: "Powered by OpenAI embeddings and vector search. Answers come directly from your knowledge base.", bg: "#EEF2FF", border: "#C7D2FE", tagColor: "#4F46E5" },
              { tag: "Widget",     title: "Branded chat widget",    desc: "Match your brand colors and title. Changes apply instantly without re-embedding.", bg: "#ECFEFF", border: "#A5F3FC", tagColor: "#0891B2" },
              { tag: "Security",   title: "Multi-tenant isolation", desc: "Every business account is fully isolated. No data leaks between tenants.", bg: "#F0FDF4", border: "#BBF7D0", tagColor: "#16A34A" },
              { tag: "Analytics",  title: "Conversation analytics", desc: "See every question asked, track resolution rates, and find topics needing better answers.", bg: "#F0F9FF", border: "#BAE6FD", tagColor: "#0284C7" },
              { tag: "Embed",      title: "One-line embed",         desc: "Copy one script tag and paste into any website. Your AI chatbot is live in under a minute.", bg: "#FFF7ED", border: "#FED7AA", tagColor: "#EA580C" },
            ].map(f => (
              <div key={f.title} style={{
                padding: "22px 24px", border: `1px solid ${f.border}`, borderRadius: 14,
                background: f.bg, transition: "box-shadow 0.2s",
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: f.tagColor, letterSpacing: "0.05em", textTransform: "uppercase" }}>{f.tag}</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "10px 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 — How it works */}
      <section id="how-it-works" style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "4px 14px", borderRadius: 99, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              How it works
            </span>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#0F172A", margin: "16px 0 12px", letterSpacing: "-0.02em" }}>
              Live in three steps, no engineers needed
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.65, maxWidth: 480, margin: "0 auto" }}>
              From adding your first FAQ to answering real customers — the whole process takes minutes.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 40 }}>
            {[
              { n: "01", title: "Add your FAQs",     desc: "Upload your frequently asked questions. The AI indexes and learns from them automatically." },
              { n: "02", title: "Ingest into AI",    desc: "Click ingest on any FAQ to push it into the vector knowledge base. The AI can now answer it." },
              { n: "03", title: "Embed and go live", desc: "Copy one script tag into your website. The chat widget appears instantly for all visitors." },
            ].map((s, i) => (
              <div key={s.n} style={{
                padding: "24px", border: "1px solid #E2E8F0", borderRadius: 14,
                background: "#fff", position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: 20, right: 20, width: 32, height: 32,
                  borderRadius: 8, background: "#2563EB", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800,
                }}>{i + 1}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", letterSpacing: "0.06em" }}>STEP {s.n}</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "10px 0 8px" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { stat: "24/7",   label: "Always available",   desc: "Customers get instant answers any time of day or night." },
              { stat: "<1 min", label: "Time to go live",    desc: "From signup to live chatbot in under one minute." },
              { stat: "100%",   label: "Business isolation", desc: "Each business's data is completely separate and private." },
            ].map(s => (
              <div key={s.stat} style={{
                textAlign: "center", padding: "28px 20px",
                background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 14,
              }}>
                <p style={{ fontSize: 40, fontWeight: 800, color: "#2563EB", margin: "0 0 8px", lineHeight: 1 }}>{s.stat}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1E3A8A", margin: "0 0 6px" }}>{s.label}</p>
                <p style={{ fontSize: 12, color: "#3B82F6", margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Use cases */}
      <section id="use-cases" style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "4px 14px", borderRadius: 99, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Use cases
            </span>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#0F172A", margin: "16px 0 12px", letterSpacing: "-0.02em" }}>
              Built for businesses that talk to customers
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.65, maxWidth: 520, margin: "0 auto" }}>
              Whether e-commerce, SaaS, or a local business — TalkBase answers questions automatically.
            </p>
          </div>

          <div style={{ display: "grid", gap: 16 }} className="use-cases-grid">
            <style>{`
              .use-cases-grid { grid-template-columns: 1fr; }
              @media (min-width: 640px) { .use-cases-grid { grid-template-columns: 1fr 1fr; } }
            `}</style>
            {[
              {
                title: "Handle repetitive support at scale",
                desc: "Stop answering the same questions manually. The AI resolves common queries instantly, freeing your team for work that needs a human.",
                points: ["Answer FAQs automatically", "Reduce support ticket volume", "Cover after-hours queries"],
                img: "/widget.jpeg",
              },
              {
                title: "Understand what customers need",
                desc: "Every unanswered question is a signal. The analytics dashboard surfaces gaps in your knowledge base so you can keep improving.",
                points: ["Track most-asked questions", "Review unresolved queries", "Improve with new FAQ data"],
                img: "/analytics.jpeg",
              },
            ].map(c => (
              <div key={c.title} style={{
                padding: "24px", borderRadius: 16, background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                display: "flex", flexDirection: "row", gap: 20, alignItems: "flex-start",
              }}>
                {/* Left: text content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: "0 0 10px", lineHeight: 1.35 }}>{c.title}</h3>
                  <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65, margin: "0 0 14px" }}>{c.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {c.points.map(p => (
                      <li key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", fontWeight: 500 }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>+</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Right: image */}
                <div style={{ width: 160, flexShrink: 0, borderRadius: 10, overflow: "hidden", border: "1px solid #E2E8F0", background: "#fff", alignSelf: "stretch" }}>
                  <img src={c.img} alt={c.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
                    onError={e => { e.target.style.display = "none"; }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — CTA */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: "#fff", border: "2px solid #BFDBFE", borderRadius: 20, padding: "52px 40px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", padding: "4px 14px", borderRadius: 99, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Get started
            </span>
            <h3 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#0F172A", margin: "20px 0 12px", letterSpacing: "-0.02em" }}>
              Deploy your AI chatbot today
            </h3>
            <p style={{ fontSize: 15, color: "#64748B", margin: "0 auto 28px", lineHeight: 1.65, maxWidth: 360 }}>
              Free to start. No credit card required. Live in under five minutes.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" style={{
                padding: "13px 28px", background: "#2563EB", color: "#fff",
                fontSize: 15, fontWeight: 700, borderRadius: 10, textDecoration: "none",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              }}>
                Create free account
              </Link>
              <Link href="/login" style={{
                padding: "13px 22px", background: "#fff", color: "#374151",
                fontSize: 15, fontWeight: 600, borderRadius: 10, textDecoration: "none",
                border: "1px solid #E2E8F0",
              }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
