'use client'
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer style={{ background: "#0F172A", color: "#94A3B8" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 32px" }}>

        <div style={{ display: "grid", gap: 40 }} className="footer-grid">
          <style>{`
            .footer-grid { grid-template-columns: 1fr; }
            @media (min-width: 540px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
            @media (min-width: 900px) { .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr; } }
          `}</style>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: 14 }}>
              <Logo />
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#64748B", maxWidth: 260, margin: "0 0 20px" }}>
              AI chatbot platform for startups and businesses to automate support and improve customer experience.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Twitter",  href: "https://x.com/"        },
                { label: "LinkedIn", href: "https://linkedin.com/"  },
                { label: "GitHub",   href: "https://github.com/"    },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "#64748B", textDecoration: "none", padding: "5px 10px", border: "1px solid #1E293B", borderRadius: 6, transition: "color 0.15s, border-color 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#475569"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#64748B"; e.currentTarget.style.borderColor = "#1E293B"; }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>Product</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Features",   href: "#features"      },
                { label: "How it works", href: "#how-it-works" },
                { label: "Use cases",  href: "#use-cases"     },
              ].map(l => (
                <li key={l.label}>
                  <a href={l.href} style={{ fontSize: 13, color: "#64748B", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#64748B"}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>Company</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "About",   href: "/about"   },
                { label: "Contact", href: "/contact" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} style={{ fontSize: 13, color: "#64748B", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#64748B"}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>Legal</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Privacy Policy",    href: "/privacy-policy"    },
                { label: "Terms of Service",  href: "/terms-of-service"  },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} style={{ fontSize: 13, color: "#64748B", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#64748B"}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1E293B", marginTop: 48, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>© 2026 TalkBase AI. All rights reserved.</p>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/signup" style={{ fontSize: 12, color: "#2563EB", textDecoration: "none", fontWeight: 600 }}>Get started free →</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
