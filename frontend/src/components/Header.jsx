import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  ink: "#1F2430",
  muted: "#6B7280",
  plum: "#6D4AE8",
  plumLight: "#EDE8FD",
  rose: "#E86A8A",
  border: "#EDE8DF",
};

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn] = useState(!!localStorage.getItem("token"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (target) => {
    navigate(target);
  };

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: COLORS.bg,
        borderBottom: `1px solid ${COLORS.border}`,
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 12px rgba(109,74,232,0.2)" }}>📖</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, letterSpacing: -0.5 }}>
                Toon<span style={{ color: COLORS.rose }}>Vault</span>
              </span>
            </div>
          </div>

          <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[
              { label: "Originals", target: "/browse" },
              { label: "Rankings", target: "/browse" },
              { label: "Canvas", target: "/browse" },
              { label: "Browse", target: "/browse" },
              { label: "Pricing", target: "/info/pricing" },
            ].map(item => (
              <button key={item.label} onClick={() => handleNav(item.target)} style={{
                padding: "8px 13px", border: "none", background: "none",
                fontSize: 14, fontWeight: 600, color: COLORS.ink, cursor: "pointer",
                borderRadius: 8, transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = COLORS.plumLight; e.currentTarget.style.color = COLORS.plum; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = COLORS.ink; }}
              >{item.label}</button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="desktop-only" onClick={() => navigate('/browse')} style={{
              padding: "8px 14px", border: `1px solid ${COLORS.border}`, background: COLORS.card,
              borderRadius: 20, fontSize: 13, color: COLORS.muted, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              🔍 <span style={{ fontWeight: 500 }}>Search...</span>
            </button>

            <button className="desktop-only" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/user')} style={{
              padding: "9px 18px", border: `1.5px solid ${COLORS.plum}`,
              background: isLoggedIn ? COLORS.plum : "transparent", borderRadius: 22, fontSize: 13,
              fontWeight: 600, color: isLoggedIn ? "white" : COLORS.plum, cursor: "pointer", whiteSpace: "nowrap"
            }}>{isLoggedIn ? "Dashboard" : "Log in"}</button>

            <div className="mobile-only" style={{ display: "none" }}>
              <button onClick={() => setMobileMenuOpen(true)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.ink }}>☰</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Global styles for utility classes used in header */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
        }
        @media (min-width: 901px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </>
  );
}
