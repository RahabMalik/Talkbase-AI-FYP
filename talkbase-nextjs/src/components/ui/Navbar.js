"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features",     href: "#features"      },
    { label: "How it works", href: "#how-it-works"  },
    { label: "Use cases",    href: "#use-cases"     },
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: scrolled ? "rgba(255,255,255,0.97)" : "#fff",
      borderBottom: "1px solid #E2E8F0",
      boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.06)" : "none",
      transition: "box-shadow 0.2s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>

        <Logo />

        {/* Desktop nav — hidden below md (768px) */}
        <ul style={{ display: "flex", gap: 32, listStyle: "none", margin: 0, padding: 0 }}
          className="hidden md:flex">
          {links.map(l => (
            <li key={l.label}>
              <a href={l.href} style={{ fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none" }}
                onMouseEnter={e => e.target.style.color = "#2563EB"}
                onMouseLeave={e => e.target.style.color = "#475569"}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop buttons — hidden below md */}
        <div className="hidden md:flex" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/login" style={{
            padding: "8px 18px", fontSize: 13, fontWeight: 500, color: "#374151",
            border: "1px solid #E2E8F0", borderRadius: 8, textDecoration: "none", background: "#fff",
          }}>Log in</Link>
          <Link href="/signup" style={{
            padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#fff",
            background: "#2563EB", borderRadius: 8, textDecoration: "none",
          }}>Get started free</Link>
        </div>

        {/* Mobile hamburger — only visible below md */}
        <button className="md:hidden" onClick={() => setOpen(v => !v)} aria-label="Toggle menu"
          style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}>
          <span style={{ display: "block", width: 18, height: 2, background: "#374151", marginBottom: 4, borderRadius: 2 }} />
          <span style={{ display: "block", width: 18, height: 2, background: "#374151", marginBottom: 4, borderRadius: 2 }} />
          <span style={{ display: "block", width: 18, height: 2, background: "#374151", borderRadius: 2 }} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden" style={{ borderTop: "1px solid #F1F5F9", padding: "12px 24px 20px", background: "#fff" }}>
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              style={{ display: "block", padding: "10px 0", fontSize: 15, color: "#374151", textDecoration: "none", fontWeight: 500, borderBottom: "1px solid #F8FAFC" }}>
              {l.label}
            </a>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            <Link href="/login" onClick={() => setOpen(false)}
              style={{ padding: "10px 16px", textAlign: "center", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#374151", textDecoration: "none" }}>
              Log in
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)}
              style={{ padding: "10px 16px", textAlign: "center", background: "#2563EB", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none" }}>
              Get started free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
