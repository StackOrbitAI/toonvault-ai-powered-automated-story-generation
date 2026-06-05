import React from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  ink: "#1F2430",
  plumLight: "#EDE8FD",
};

export default function Footer() {
  const navigate = useNavigate();
  const handleNav = (item) => {
    if (item.target.startsWith('/')) {
      navigate(item.target);
    }
  };

  return (
    <footer style={{ background: "#0F0D1E", padding: "80px 24px 40px", marginTop: 40, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "60px", justifyContent: "space-between", marginBottom: 60 }}>
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(135deg, #6D4AE8, #E86A8A)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📖</div>
              <span style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: -0.5 }}>Toon<span style={{ color: "#E86A8A" }}>Vault</span></span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.6 }}>
              Where every tap reveals a new world. Dive into endless AI-crafted stories, or become a creator yourself.
            </div>
          </div>

          {[
            { 
              title: "Discover", 
              links: [
                { l: "Originals", t: "/browse" },
                { l: "New Releases", t: "/browse" },
                { l: "Trending", t: "/browse" },
                { l: "Completed", t: "/browse" }
              ] 
            },
            { 
              title: "For Creators", 
              links: [
                { l: "Publish with AI", t: "/creators" },
                { l: "Monetization", t: "/creators" },
                { l: "Creator Guidelines", t: "/info/guidelines" }
              ] 
            },
            { 
              title: "ToonVault", 
              links: [
                { l: "About Us", t: "/about" },
                { l: "Help & Support", t: "/help" },
                { l: "Terms of Service", t: "/terms" },
                { l: "Privacy", t: "/privacy" }
              ] 
            },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "white", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24 }}>{col.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {col.links.map(link => (
                  <div key={link.l} 
                    onClick={() => handleNav({ target: link.t })}
                    style={{ fontSize: 14, cursor: "pointer", transition: "all 0.2s", color: "rgba(255,255,255,0.45)" }}
                    onMouseEnter={e => e.currentTarget.style.color = COLORS.plumLight}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
                  >{link.l}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>© 2026 ToonVault. All rights reserved.</div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Discord", "Instagram", "Twitter", "YouTube"].map(s => (
              <span key={s} style={{ fontSize: 14, cursor: "pointer", transition: "all 0.2s", color: "rgba(255,255,255,0.45)" }}
                onMouseEnter={e => e.currentTarget.style.color = "white"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
              >{s}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
