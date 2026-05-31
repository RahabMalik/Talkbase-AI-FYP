'use client'
import Link from "next/link";

export default function Hero() {
  return (
    <section style={{
      background: "linear-gradient(160deg, #EFF6FF 0%, #F0F9FF 40%, #F8FAFC 100%)",
      padding: "72px 24px 64px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "#fff", color: "#2563EB", fontSize: 11,
            fontWeight: 700, padding: "6px 16px", borderRadius: 99,
            border: "1px solid #BFDBFE", letterSpacing: "0.06em", textTransform: "uppercase",
            boxShadow: "0 1px 4px rgba(37,99,235,0.1)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB", flexShrink: 0 }} />
            AI chatbot SaaS for business websites
          </span>
        </div>

        {/* Headline */}
        <div style={{ textAlign: "center", maxWidth: 780, margin: "0 auto 24px" }}>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 900, lineHeight: 1.08,
            color: "#0F172A", margin: "0 0 22px",
            letterSpacing: "-0.03em",
          }}>
            Launch an{" "}
            <span style={{ color: "#2563EB" }}>AI assistant</span>{" "}
            trained on your FAQs, live in seconds.
          </h1>
          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "#475569", lineHeight: 1.7, margin: 0 }}>
            A simple platform for startups and small businesses to create, deploy, and manage
            an AI customer support chatbot — no engineers needed.
          </p>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
          <Link href="/signup" style={{
            padding: "14px 32px", background: "#2563EB", color: "#fff",
            fontSize: 15, fontWeight: 700, borderRadius: 10, textDecoration: "none",
            boxShadow: "0 4px 18px rgba(37,99,235,0.38)",
          }}>Get started free →</Link>
          <Link href="/login" style={{
            padding: "14px 24px", background: "#fff", color: "#374151",
            fontSize: 15, fontWeight: 600, borderRadius: 10, textDecoration: "none",
            border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>Log in</Link>
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}>
          {["Train from FAQs", "Deploy with one embed code", "Track unanswered queries", "24/7 replies"].map(pill => (
            <span key={pill} style={{
              fontSize: 12, fontWeight: 500, color: "#64748B",
              border: "1px solid #E2E8F0", borderRadius: 99,
              padding: "5px 14px", background: "#fff",
            }}>✓ {pill}</span>
          ))}
        </div>

        {/* Feature cards */}
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .feat-card {
            opacity: 0;
            animation: fadeUp 0.55s ease forwards;
          }
          .feat-card:nth-child(1) { animation-delay: 0.05s; }
          .feat-card:nth-child(2) { animation-delay: 0.18s; }
          .feat-card:nth-child(3) { animation-delay: 0.31s; }
          .feat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(37,99,235,0.10) !important; }
          .feat-card { transition: transform 0.2s, box-shadow 0.2s; }
        `}</style>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16, marginBottom: 40,
        }}>
          {[
            {
              title: "24/7 replies",
              desc: "Answer common questions any time without adding more support hours.",
              color: "#2563EB", bg: "#EFF6FF",
              svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            },
            {
              title: "Easy setup",
              desc: "Upload FAQs, train the bot, embed on your site with one snippet.",
              color: "#7C3AED", bg: "#F5F3FF",
              svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
            },
            {
              title: "Clear analytics",
              desc: "See top questions and find where your bot needs better answers.",
              color: "#0891B2", bg: "#ECFEFF",
              svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
            },
          ].map(c => (
            <div key={c.title} className="feat-card" style={{
              background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14,
              padding: "22px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                {c.svg}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 7px" }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Platform preview */}
        <div style={{ display: "grid", gap: 16 }} className="hero-preview-grid">
          <style>{`
            .hero-preview-grid { grid-template-columns: 1fr; }
            @media (min-width: 700px) { .hero-preview-grid { grid-template-columns: 2fr 1fr; } }
          `}</style>

          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 22, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>Platform preview</h3>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 14px" }}>Knowledge, conversations, and analytics in one view</p>
            <img src="/dashboard.jpg" alt="Dashboard preview"
              style={{ width: "100%", borderRadius: 10, border: "1px solid #F1F5F9", display: "block", marginBottom: 12 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[{ t: "Embed code", d: "Add chatbot with a simple snippet." }, { t: "Missed questions", d: "Improve unanswered queries." }].map(c => (
                <div key={c.t} style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", margin: "0 0 4px" }}>{c.t}</p>
                  <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>{c.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 16, padding: 26 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#2563EB", background: "#DBEAFE", padding: "4px 12px", borderRadius: 99, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              WHAT IT DOES
            </span>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1E3A8A", margin: "14px 0 8px", lineHeight: 1.3 }}>
              Support automation for growing businesses.
            </h3>
            <p style={{ fontSize: 13, color: "#3B82F6", margin: "0 0 18px" }}>Built for startups and small teams.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Train from FAQs", "Answer visitors automatically", "Measure unanswered questions"].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#1E40AF", fontWeight: 600 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#2563EB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
