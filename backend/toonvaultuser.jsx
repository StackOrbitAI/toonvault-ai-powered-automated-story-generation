import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  cardTint: "#F6F0E8",
  ink: "#1F2430",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
  plum: "#6D4AE8",
  plumLight: "#EDE8FD",
  plumDark: "#4C2DB5",
  rose: "#E86A8A",
  roseLight: "#FDEEF3",
  gold: "#D79A2B",
  goldLight: "#FEF3DC",
  border: "#EDE8DF",
  success: "#2E8B6E",
  successLight: "#E8F5F0",
  warning: "#F59E0B",
  warningLight: "#FEF3DC",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
};

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const USER = {
  name: "Aanya Sharma",
  handle: "@aanya_reads",
  avatar: "🌸",
  plan: "Silver",
  planColor: COLORS.plum,
  joinDate: "Jan 2025",
  country: "India",
  coins: 340,
  streak: 12,
};

const PLAN_LIMITS = {
  Free:   { articles: 5,   ai_panels: 0,   price: 0,    color: "#C08030" },
  Silver: { articles: 50,  ai_panels: 20,  price: 5,    color: COLORS.plum },
  Gold:   { articles: 200, ai_panels: 100, price: 24,   color: COLORS.gold },
};

const USAGE = {
  articlesGenerated: 31,
  articlesLimit: 50,
  aiPanelsUsed: 11,
  aiPanelsLimit: 20,
  storiesRead: 87,
  dailyReadingGoal: 5,
  dailyReadToday: 3,
};

const STORIES_CREATED = [
  { id: 1, title: "Echoes of Tomorrow", genre: "Sci-Fi", cover: "🛸", views: "12.4K", likes: 890, status: "published", ranking: 24, bg: "#E8F5FD", updatedAt: "2 days ago" },
  { id: 2, title: "When Cherry Blossoms Fall", genre: "Romance", cover: "🌸", views: "4.1K", likes: 312, status: "published", ranking: 87, bg: "#FDE8F0", updatedAt: "5 days ago" },
  { id: 3, title: "The Iron Witch", genre: "Fantasy", cover: "🧙‍♀️", views: "—", likes: 0, status: "draft", ranking: null, bg: "#EDE8FA", updatedAt: "Today" },
];

const READING_HISTORY = [
  { id: 1, title: "Crimson Throne", genre: "Romance Fantasy", cover: "💖", bg: "#FDE8F0", progress: 78, lastRead: "Today", ep: "Ep 34" },
  { id: 2, title: "The Shadow Pact", genre: "Fantasy", cover: "🌙", bg: "#EDE8FA", progress: 45, lastRead: "Yesterday", ep: "Ep 15" },
  { id: 3, title: "Villain's Beloved", genre: "Dark Romance", cover: "🌹", bg: "#FDE8F0", progress: 100, lastRead: "3 days ago", ep: "Completed" },
  { id: 4, title: "Stray Signal", genre: "Sci-Fi", cover: "🛸", bg: "#E8F5FD", progress: 20, lastRead: "1 week ago", ep: "Ep 6" },
  { id: 5, title: "Iron Saint", genre: "Superhero", cover: "⚡", bg: "#FDF3E0", progress: 60, lastRead: "2 weeks ago", ep: "Ep 22" },
];

const PAYMENT_HISTORY = [
  { id: "TXN-2024-1182", date: "Apr 1, 2026", amount: "₹420", plan: "Silver Plan", status: "success", method: "UPI" },
  { id: "TXN-2025-0831", date: "Mar 1, 2026", amount: "₹420", plan: "Silver Plan", status: "success", method: "UPI" },
  { id: "TXN-2025-0124", date: "Feb 1, 2026", amount: "₹420", plan: "Silver Plan", status: "failed", method: "Card" },
  { id: "TXN-2025-0124", date: "Jan 1, 2026", amount: "₹0", plan: "Free Plan", status: "success", method: "—" },
];

const GENERATED_ARTICLES = [
  { id: 1, title: "The Rise of Isekai: Why We Love Portal Fantasy", genre: "Editorial", words: 1200, createdAt: "Apr 20, 2026", reads: 540, rank: 12 },
  { id: 2, title: "Top 10 Webtoon Romance Tropes Explained", genre: "Listicle", words: 800, createdAt: "Apr 18, 2026", reads: 1240, rank: 5 },
  { id: 3, title: "How Villain Redemption Arcs Work in Comics", genre: "Analysis", words: 1500, createdAt: "Apr 15, 2026", reads: 320, rank: 31 },
  { id: 4, title: "A Guide to BL Manga: Beginner's Edition", genre: "Guide", words: 950, createdAt: "Apr 10, 2026", reads: 780, rank: 18 },
  { id: 5, title: "Fantasy World-Building: Tools & Tips", genre: "Tutorial", words: 1100, createdAt: "Apr 5, 2026", reads: 290, rank: 44 },
];

const DAILY_READS = [
  { day: "Mon", count: 4 }, { day: "Tue", count: 6 }, { day: "Wed", count: 3 },
  { day: "Thu", count: 7 }, { day: "Fri", count: 5 }, { day: "Sat", count: 2 }, { day: "Sun", count: 3 },
];

const NOTIFICATIONS = [
  { id: 1, text: "Crimson Throne posted Ep 35!", type: "update", time: "2h ago" },
  { id: 2, text: "Your story got 100 new likes 🎉", type: "milestone", time: "5h ago" },
  { id: 3, text: "AI article generation limit: 9 remaining", type: "warning", time: "1d ago" },
  { id: 4, text: "New collection added: 'Slow Burn Royalty'", type: "info", time: "2d ago" },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = COLORS.plum, bg }) {
  return (
    <div style={{
      background: bg || COLORS.card,
      borderRadius: 16, border: `1px solid ${COLORS.border}`,
      padding: "18px 20px",
      display: "flex", alignItems: "flex-start", gap: 14,
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(109,74,232,0.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: COLORS.mutedLight, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function UsageBar({ label, used, total, color = COLORS.plum, icon }) {
  const pct = Math.min((used / total) * 100, 100);
  const danger = pct > 85;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink, display: "flex", alignItems: "center", gap: 6 }}>
          {icon} {label}
        </span>
        <span style={{ fontSize: 12, color: danger ? COLORS.danger : COLORS.muted, fontWeight: 600 }}>
          {used} / {total}
        </span>
      </div>
      <div style={{ height: 8, background: COLORS.border, borderRadius: 8, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 8,
          background: danger ? `linear-gradient(90deg, ${COLORS.warning}, ${COLORS.danger})` : `linear-gradient(90deg, ${color}, ${color}99)`,
          transition: "width 0.6s ease",
        }} />
      </div>
      {danger && <div style={{ fontSize: 11, color: COLORS.danger, marginTop: 4 }}>⚠️ Almost at limit — consider upgrading</div>}
    </div>
  );
}

function MiniChart({ data }) {
  const max = Math.max(...data.map(d => d.count));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", borderRadius: "4px 4px 0 0",
            height: `${(d.count / max) * 48}px`,
            background: `linear-gradient(180deg, ${COLORS.plum}, ${COLORS.rose})`,
            transition: "height 0.4s ease",
            minHeight: 4,
          }} />
          <span style={{ fontSize: 10, color: COLORS.mutedLight }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function Badge({ plan, size = "normal" }) {
  const colors = { Free: "#C08030", Silver: COLORS.plum, Gold: COLORS.gold };
  const c = colors[plan] || COLORS.plum;
  return (
    <span style={{
      background: c + "18", color: c, border: `1px solid ${c}40`,
      borderRadius: 8, padding: size === "small" ? "2px 8px" : "4px 12px",
      fontSize: size === "small" ? 10 : 12, fontWeight: 700, letterSpacing: 0.5,
    }}>{plan === "Gold" ? "💎" : plan === "Silver" ? "⭐" : "🥉"} {plan}</span>
  );
}

function Tab({ label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 18px", border: "none",
      background: active ? COLORS.plum : "transparent",
      color: active ? "white" : COLORS.muted,
      fontSize: 13, fontWeight: 600, cursor: "pointer",
      borderRadius: 10, transition: "all 0.18s",
      display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
    }}>
      {label}
      {badge !== undefined && (
        <span style={{
          background: active ? "rgba(255,255,255,0.3)" : COLORS.rose,
          color: "white", fontSize: 10, fontWeight: 700,
          padding: "1px 6px", borderRadius: 8, minWidth: 18, textAlign: "center",
        }}>{badge}</span>
      )}
    </button>
  );
}

// ─── AI ARTICLE GENERATOR ────────────────────────────────────────────────────

function AIArticleGenerator({ onGenerate }) {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("Editorial");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const GENRES_AI = ["Editorial", "Listicle", "Analysis", "Guide", "Tutorial", "Review"];

  const remaining = USAGE.articlesLimit - USAGE.articlesGenerated;
  const canGenerate = USER.plan !== "Free" && remaining > 0;

  const handleGenerate = async () => {
    if (!prompt.trim()) return setError("Please enter a topic or prompt.");
    if (!canGenerate) return;
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a professional webtoon/manga editorial writer for ToonVault, a comic/story platform. Write a ${genre} article about: "${prompt}". 

Format response as JSON only (no markdown):
{
  "title": "compelling article title",
  "genre": "${genre}",
  "wordCount": estimated word count as number,
  "excerpt": "2-3 sentence teaser/intro",
  "sections": [
    {"heading": "section title", "content": "2-3 sentences of content"}
  ],
  "tags": ["tag1", "tag2", "tag3"]
}
Return only valid JSON, nothing else.`
          }]
        })
      });
      const data = await resp.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      onGenerate && onGenerate(parsed);
    } catch (e) {
      setError("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header info */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.plumLight}, ${COLORS.roseLight})`,
        borderRadius: 16, padding: "18px 22px", marginBottom: 24,
        border: `1px solid ${COLORS.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, marginBottom: 3 }}>✨ AI Article Generator</div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>Create editorial content for the ToonVault community</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ textAlign: "center", background: COLORS.card, borderRadius: 10, padding: "8px 16px" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.plum }}>{remaining}</div>
            <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600 }}>REMAINING</div>
          </div>
          <div style={{ textAlign: "center", background: COLORS.card, borderRadius: 10, padding: "8px 16px" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.rose }}>{USAGE.articlesGenerated}</div>
            <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600 }}>USED</div>
          </div>
        </div>
      </div>

      {USER.plan === "Free" && (
        <div style={{
          background: COLORS.goldLight, border: `1px solid ${COLORS.gold}40`,
          borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Upgrade to Silver or Gold to generate articles</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>Free plan users can read articles but cannot generate them.</div>
          </div>
          <button style={{ marginLeft: "auto", padding: "8px 18px", background: COLORS.gold, color: "white", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Upgrade Now</button>
        </div>
      )}

      {/* Input area */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={!canGenerate}
          placeholder="e.g. Why redemption arcs make better villains..."
          style={{
            flex: 1, minWidth: 240, padding: "12px 16px",
            border: `1.5px solid ${error ? COLORS.danger : COLORS.border}`,
            borderRadius: 12, fontSize: 14, color: COLORS.ink,
            background: canGenerate ? COLORS.card : COLORS.cardTint,
            outline: "none", fontFamily: "inherit",
          }}
          onKeyDown={e => e.key === "Enter" && handleGenerate()}
        />
        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
          disabled={!canGenerate}
          style={{
            padding: "12px 16px", border: `1.5px solid ${COLORS.border}`,
            borderRadius: 12, fontSize: 13, color: COLORS.ink,
            background: COLORS.card, cursor: "pointer", outline: "none",
          }}
        >
          {GENRES_AI.map(g => <option key={g}>{g}</option>)}
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading || !canGenerate || !prompt.trim()}
          style={{
            padding: "12px 24px",
            background: loading || !canGenerate ? COLORS.border : `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.plumDark})`,
            color: loading || !canGenerate ? COLORS.muted : "white",
            border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700,
            cursor: loading || !canGenerate ? "not-allowed" : "pointer",
            transition: "all 0.2s", whiteSpace: "nowrap",
            boxShadow: !loading && canGenerate ? "0 2px 10px rgba(109,74,232,0.3)" : "none",
          }}
        >
          {loading ? "✨ Generating..." : "✨ Generate"}
        </button>
      </div>
      {error && <div style={{ fontSize: 12, color: COLORS.danger, marginBottom: 12 }}>{error}</div>}

      {/* Result */}
      {loading && (
        <div style={{
          background: COLORS.plumLight, borderRadius: 16, padding: "32px",
          textAlign: "center", border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
          <div style={{ fontSize: 14, color: COLORS.plum, fontWeight: 600 }}>AI is crafting your article...</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>This usually takes 5–10 seconds</div>
        </div>
      )}

      {result && !loading && (
        <div style={{
          background: COLORS.card, borderRadius: 16, border: `1.5px solid ${COLORS.plum}40`,
          overflow: "hidden",
        }}>
          {/* Article header */}
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.plumDark})`,
            padding: "22px 26px",
          }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8 }}>{result.genre}</span>
              {result.tags?.map(t => (
                <span key={t} style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", fontSize: 11, padding: "3px 10px", borderRadius: 8 }}>#{t}</span>
              ))}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: "0 0 8px", lineHeight: 1.3 }}>{result.title}</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: "0 0 10px", lineHeight: 1.6 }}>{result.excerpt}</p>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>~{result.wordCount} words</span>
          </div>
          {/* Sections */}
          <div style={{ padding: "20px 26px" }}>
            {result.sections?.map((s, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.plum, marginBottom: 5 }}>{s.heading}</div>
                <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.7 }}>{s.content}</div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 18, borderTop: `1px solid ${COLORS.border}` }}>
              <button style={{
                flex: 1, padding: "10px", background: COLORS.plum, color: "white",
                border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>📤 Publish Article</button>
              <button style={{
                padding: "10px 18px", background: COLORS.cardTint, color: COLORS.ink,
                border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, cursor: "pointer",
              }}>📋 Copy</button>
              <button onClick={() => { setResult(null); setPrompt(""); }} style={{
                padding: "10px 18px", background: COLORS.roseLight, color: COLORS.rose,
                border: `1px solid ${COLORS.rose}30`, borderRadius: 10, fontSize: 13, cursor: "pointer",
              }}>🗑 Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

export default function ToonVaultUserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(USAGE.articlesGenerated);

  const TABS = [
    { id: "overview",   label: "Overview",          icon: "🏠" },
    { id: "stories",    label: "My Stories",         icon: "📖" },
    { id: "reading",    label: "Reading History",    icon: "👁" },
    { id: "articles",   label: "Articles",           icon: "✍️" },
    { id: "generate",   label: "AI Generator",       icon: "✨" },
    { id: "usage",      label: "Usage & Plan",       icon: "📊" },
    { id: "payments",   label: "Payments",           icon: "💳" },
    { id: "settings",   label: "Settings",           icon: "⚙️" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.ink }}>

      {/* ═══ TOP NAV ═══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(250,247,242,0.97)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", gap: 16 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginRight: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📖</div>
            <span style={{ fontSize: 19, fontWeight: 800, color: COLORS.plum, letterSpacing: -0.5 }}>Toon<span style={{ color: COLORS.rose }}>Vault</span></span>
          </div>

          <div style={{ fontSize: 13, color: COLORS.mutedLight }}>›</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>My Dashboard</div>

          <div style={{ flex: 1 }} />

          {/* Coins */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
            background: COLORS.goldLight, borderRadius: 20, border: `1px solid ${COLORS.gold}40`,
          }}>
            <span style={{ fontSize: 14 }}>🪙</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.gold }}>{USER.coins}</span>
          </div>

          {/* Streak */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
            background: COLORS.roseLight, borderRadius: 20, border: `1px solid ${COLORS.rose}30`,
          }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.rose }}>{USER.streak}d</span>
          </div>

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} style={{
              width: 38, height: 38, borderRadius: 10, background: COLORS.card,
              border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 16, cursor: "pointer", position: "relative",
            }}>
              🔔
              <span style={{
                position: "absolute", top: -4, right: -4, width: 16, height: 16,
                background: COLORS.rose, borderRadius: "50%", border: "2px solid white",
                fontSize: 9, color: "white", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>3</span>
            </button>
            {notifOpen && (
              <div style={{
                position: "absolute", right: 0, top: 46, width: 300,
                background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`,
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)", zIndex: 500, overflow: "hidden",
              }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 14, fontWeight: 700, color: COLORS.ink }}>Notifications</div>
                {NOTIFICATIONS.map(n => (
                  <div key={n.id} style={{
                    padding: "12px 18px", borderBottom: `1px solid ${COLORS.border}`,
                    display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.cardTint}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 16 }}>{n.type === "update" ? "📬" : n.type === "milestone" ? "🎉" : n.type === "warning" ? "⚠️" : "ℹ️"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: COLORS.ink, lineHeight: 1.4 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: COLORS.mutedLight, marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "10px 18px", textAlign: "center" }}>
                  <button style={{ fontSize: 12, color: COLORS.plum, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>See all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 8px",
              background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 24,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.rose})`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
              }}>{USER.avatar}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink }}>{USER.name.split(" ")[0]}</span>
              <Badge plan={USER.plan} size="small" />
            </button>
            {profileOpen && (
              <div style={{
                position: "absolute", right: 0, top: 48, width: 220,
                background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`,
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)", zIndex: 500, overflow: "hidden",
              }}>
                <div style={{ padding: "16px 18px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.plumLight }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{USER.avatar}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink }}>{USER.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{USER.handle}</div>
                  <div style={{ marginTop: 6 }}><Badge plan={USER.plan} /></div>
                </div>
                {["Profile Settings", "Billing", "Security", "Notifications", "Help Center"].map(item => (
                  <div key={item} style={{
                    padding: "11px 18px", fontSize: 13, color: COLORS.ink, cursor: "pointer",
                    borderBottom: `1px solid ${COLORS.border}`, transition: "background 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.cardTint}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >{item}</div>
                ))}
                <div style={{ padding: "11px 18px", fontSize: 13, color: COLORS.danger, cursor: "pointer" }}>Log out</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 48px", display: "flex", gap: 24 }}>

        {/* ═══ SIDEBAR ═══ */}
        <aside style={{
          width: 220, flexShrink: 0, position: "sticky", top: 86, height: "fit-content",
        }}>
          {/* User card */}
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.plumDark})`,
            borderRadius: 18, padding: "22px 18px", marginBottom: 16, textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 10px",
              background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 26, border: "3px solid rgba(255,255,255,0.3)",
            }}>{USER.avatar}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 2 }}>{USER.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>{USER.handle}</div>
            <Badge plan={USER.plan} />
            <div style={{ display: "flex", gap: 12, marginTop: 14, justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>{STORIES_CREATED.filter(s => s.status === "published").length}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>Stories</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>{USER.streak}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>Day Streak</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>{USAGE.storiesRead}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>Read</div>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                width: "100%", padding: "12px 16px",
                background: activeTab === tab.id ? COLORS.plumLight : "transparent",
                border: "none", borderBottom: `1px solid ${COLORS.border}`,
                display: "flex", alignItems: "center", gap: 10,
                fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? COLORS.plum : COLORS.muted,
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}
                onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = COLORS.cardTint; }}
                onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && <span style={{ marginLeft: "auto", color: COLORS.plum }}>›</span>}
              </button>
            ))}
          </div>

          {/* Upgrade CTA */}
          {USER.plan === "Silver" && (
            <div style={{
              background: `linear-gradient(135deg, ${COLORS.goldLight}, #FDE8C8)`,
              border: `1px solid ${COLORS.gold}40`, borderRadius: 16, padding: "16px 16px",
              marginTop: 14, textAlign: "center",
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>💎</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>Upgrade to Gold</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10 }}>200 articles, teams, analytics</div>
              <button style={{
                width: "100%", padding: "8px", background: COLORS.gold, color: "white",
                border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Upgrade · $24/yr</button>
            </div>
          )}
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              {/* Welcome */}
              <div style={{
                background: `linear-gradient(135deg, #3D1A5C, ${COLORS.plum})`,
                borderRadius: 20, padding: "28px 32px", marginBottom: 24,
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Welcome back 👋</div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: "0 0 6px" }}>Hi, {USER.name.split(" ")[0]}!</h1>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0 }}>You've read <strong style={{ color: "white" }}>{USAGE.dailyReadToday}</strong> episodes today. Goal: <strong style={{ color: "white" }}>{USAGE.dailyReadingGoal}</strong></p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setActiveTab("generate")} style={{
                    padding: "11px 22px", background: "white", color: COLORS.plum,
                    border: "none", borderRadius: 22, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}>✨ Generate Article</button>
                  <button onClick={() => setActiveTab("stories")} style={{
                    padding: "11px 22px", background: "rgba(255,255,255,0.18)", color: "white",
                    border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 22, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>📖 My Stories</button>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
                <StatCard icon="📖" label="Stories Created" value={STORIES_CREATED.length} sub="2 published" color={COLORS.plum} />
                <StatCard icon="👁" label="Total Views" value="16.5K" sub="Across all stories" color={COLORS.rose} />
                <StatCard icon="✍️" label="Articles Generated" value={generatedCount} sub={`of ${USAGE.articlesLimit} this month`} color={COLORS.gold} />
                <StatCard icon="🔥" label="Read Streak" value={`${USER.streak}d`} sub="Keep it going!" color={COLORS.rose} />
                <StatCard icon="🪙" label="Coins Balance" value={USER.coins} sub="Earn more by reading" color={COLORS.gold} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24 }}>
                {/* Reading activity */}
                <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "20px 22px" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>📈 Weekly Reading Activity</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14 }}>Episodes read per day</div>
                  <MiniChart data={DAILY_READS} />
                </div>
                {/* Plan usage */}
                <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink }}>📊 Plan Usage</div>
                    <Badge plan={USER.plan} size="small" />
                  </div>
                  <UsageBar label="Article Generation" used={generatedCount} total={USAGE.articlesLimit} icon="✍️" />
                  <UsageBar label="AI Panels" used={USAGE.aiPanelsUsed} total={USAGE.aiPanelsLimit} icon="🎨" color={COLORS.rose} />
                </div>
              </div>

              {/* Recent activity */}
              <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "20px 22px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, marginBottom: 14 }}>🕐 Continue Reading</div>
                <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
                  {READING_HISTORY.slice(0, 4).map(s => (
                    <div key={s.id} style={{
                      flexShrink: 0, width: 130, cursor: "pointer",
                      background: COLORS.cardTint, borderRadius: 14, overflow: "hidden",
                      border: `1px solid ${COLORS.border}`, transition: "transform 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <div style={{ height: 90, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{s.cover}</div>
                      <div style={{ padding: "8px 10px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.ink, marginBottom: 4, lineHeight: 1.3 }}>{s.title}</div>
                        <div style={{ height: 4, background: COLORS.border, borderRadius: 4, marginBottom: 4 }}>
                          <div style={{ height: "100%", width: `${s.progress}%`, borderRadius: 4, background: s.progress === 100 ? COLORS.success : COLORS.plum }} />
                        </div>
                        <div style={{ fontSize: 10, color: COLORS.mutedLight }}>{s.ep}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MY STORIES */}
          {activeTab === "stories" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, margin: "0 0 4px" }}>📖 My Stories</h2>
                  <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>Manage your published and draft stories</p>
                </div>
                <button style={{
                  padding: "10px 22px", background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.plumDark})`,
                  color: "white", border: "none", borderRadius: 24, fontSize: 13, fontWeight: 700,
                  cursor: "pointer", boxShadow: "0 2px 10px rgba(109,74,232,0.3)",
                }}>✏️ New Story</button>
              </div>

              {STORIES_CREATED.map(story => (
                <div key={story.id} style={{
                  background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`,
                  padding: "18px 20px", marginBottom: 14, display: "flex", gap: 16, alignItems: "center",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.plum + "60"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(109,74,232,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{
                    width: 60, height: 76, borderRadius: 10, background: story.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0,
                  }}>{story.cover}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink }}>{story.title}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                        background: story.status === "published" ? COLORS.successLight : COLORS.goldLight,
                        color: story.status === "published" ? COLORS.success : COLORS.gold,
                      }}>{story.status === "published" ? "✅ PUBLISHED" : "📝 DRAFT"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.rose, fontWeight: 600, marginBottom: 6 }}>{story.genre}</div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: COLORS.muted }}>
                      <span>👁 {story.views} views</span>
                      <span>❤️ {story.likes} likes</span>
                      {story.ranking && <span>🏆 #{story.ranking} ranking</span>}
                      <span>🕐 Updated {story.updatedAt}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button style={{ padding: "8px 16px", background: COLORS.plumLight, color: COLORS.plum, border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>✏️ Edit</button>
                    <button style={{ padding: "8px 16px", background: COLORS.cardTint, color: COLORS.ink, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 12, cursor: "pointer" }}>📊 Stats</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* READING HISTORY */}
          {activeTab === "reading" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, margin: "0 0 6px" }}>👁 Reading History</h2>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 20px" }}>{USAGE.storiesRead} total stories read</p>

              <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "20px 22px", marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginBottom: 14 }}>📈 This Week</div>
                <MiniChart data={DAILY_READS} />
              </div>

              {READING_HISTORY.map(s => (
                <div key={s.id} style={{
                  background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`,
                  padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14,
                  cursor: "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.plum + "40"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; }}
                >
                  <div style={{ width: 46, height: 58, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.cover}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: COLORS.rose, fontWeight: 600, marginBottom: 6 }}>{s.genre}</div>
                    <div style={{ height: 5, background: COLORS.border, borderRadius: 4, marginBottom: 4, maxWidth: 200 }}>
                      <div style={{ height: "100%", width: `${s.progress}%`, borderRadius: 4, background: s.progress === 100 ? COLORS.success : `linear-gradient(90deg, ${COLORS.plum}, ${COLORS.rose})` }} />
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.mutedLight }}>{s.progress}% • {s.ep}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: COLORS.mutedLight, marginBottom: 6 }}>{s.lastRead}</div>
                    <button style={{
                      padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      background: s.progress === 100 ? COLORS.successLight : COLORS.plumLight,
                      color: s.progress === 100 ? COLORS.success : COLORS.plum,
                      border: "none", borderRadius: 8,
                    }}>{s.progress === 100 ? "✓ Completed" : "▶ Continue"}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ARTICLES */}
          {activeTab === "articles" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, margin: "0 0 4px" }}>✍️ My Articles</h2>
                  <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>Track performance of your generated content</p>
                </div>
                <button onClick={() => setActiveTab("generate")} style={{
                  padding: "10px 20px", background: `linear-gradient(135deg, ${COLORS.plum}, ${COLORS.plumDark})`,
                  color: "white", border: "none", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>✨ Generate New</button>
              </div>

              {/* Summary row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                <StatCard icon="✍️" label="Total Articles" value={GENERATED_ARTICLES.length} color={COLORS.plum} />
                <StatCard icon="👁" label="Total Reads" value="3,170" color={COLORS.rose} />
                <StatCard icon="🏆" label="Best Rank" value="#5" sub="Top 10 Webtoon..." color={COLORS.gold} />
              </div>

              {GENERATED_ARTICLES.map(a => (
                <div key={a.id} style={{
                  background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`,
                  padding: "16px 20px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.plum + "40"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(109,74,232,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: COLORS.plumLight,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                  }}>📄</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: COLORS.muted }}>
                      <span style={{ background: COLORS.plumLight, color: COLORS.plum, padding: "1px 8px", borderRadius: 6, fontWeight: 600 }}>{a.genre}</span>
                      <span>~{a.words} words</span>
                      <span>👁 {a.reads} reads</span>
                      <span>🏆 #{a.rank}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: COLORS.mutedLight, marginBottom: 6 }}>{a.createdAt}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ padding: "5px 12px", background: COLORS.plumLight, color: COLORS.plum, border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>View</button>
                      <button style={{ padding: "5px 10px", background: COLORS.dangerLight, color: COLORS.danger, border: "none", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI GENERATOR */}
          {activeTab === "generate" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, margin: "0 0 6px" }}>✨ AI Article Generator</h2>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 22px" }}>Powered by Claude AI — create editorial content for ToonVault readers</p>
              <AIArticleGenerator onGenerate={() => setGeneratedCount(c => c + 1)} />
            </div>
          )}

          {/* USAGE & PLAN */}
          {activeTab === "usage" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, margin: "0 0 6px" }}>📊 Usage & Plan</h2>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 22px" }}>Monitor your monthly usage and subscription details</p>

              {/* Current plan */}
              <div style={{
                background: `linear-gradient(135deg, ${COLORS.plum}18, ${COLORS.rose}10)`,
                border: `2px solid ${COLORS.plum}30`, borderRadius: 18, padding: "22px 24px", marginBottom: 24,
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>Current Plan</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: COLORS.plum }}>Silver</span>
                    <Badge plan="Silver" />
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.muted }}>$5/year · Renews <strong style={{ color: COLORS.ink }}>Jan 2027</strong></div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ padding: "10px 20px", background: COLORS.goldLight, color: COLORS.gold, border: `1px solid ${COLORS.gold}40`, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>💎 Upgrade to Gold</button>
                  <button style={{ padding: "10px 16px", background: COLORS.card, color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 12, fontSize: 13, cursor: "pointer" }}>Manage</button>
                </div>
              </div>

              {/* Usage stats */}
              <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "22px 24px", marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, marginBottom: 18 }}>Monthly Usage (April 2026)</div>
                <UsageBar label="Article Generation" used={generatedCount} total={USAGE.articlesLimit} icon="✍️" />
                <UsageBar label="AI Panel Generation" used={USAGE.aiPanelsUsed} total={USAGE.aiPanelsLimit} icon="🎨" color={COLORS.rose} />
                <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                  <div style={{ flex: 1, background: COLORS.successLight, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.success }}>{USAGE.storiesRead}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Stories Read</div>
                  </div>
                  <div style={{ flex: 1, background: COLORS.roseLight, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.rose }}>{USER.streak}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Day Streak</div>
                  </div>
                  <div style={{ flex: 1, background: COLORS.goldLight, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.gold }}>{USER.coins}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Coins Earned</div>
                  </div>
                </div>
              </div>

              {/* Plan comparison */}
              <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "22px 24px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, marginBottom: 18 }}>💎 Compare Plans</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { name: "Free", price: "₹0", color: "#C08030", bg: "#FEF3E2", articles: 5, panels: 0, teams: false },
                    { name: "Silver", price: "₹420/yr", color: COLORS.plum, bg: COLORS.plumLight, articles: 50, panels: 20, teams: false, current: true },
                    { name: "Gold", price: "₹2000/yr", color: COLORS.gold, bg: COLORS.goldLight, articles: 200, panels: 100, teams: true },
                  ].map(p => (
                    <div key={p.name} style={{
                      background: p.bg, borderRadius: 14, padding: "16px",
                      border: `2px solid ${p.current ? p.color : COLORS.border}`,
                      position: "relative",
                    }}>
                      {p.current && (
                        <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: p.color, color: "white", fontSize: 9, fontWeight: 700, padding: "2px 10px", borderRadius: 8 }}>CURRENT</span>
                      )}
                      <div style={{ fontSize: 16, fontWeight: 800, color: p.color }}>{p.name}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, margin: "4px 0 12px" }}>{p.price}</div>
                      {[
                        [`✍️ ${p.articles} articles/mo`, true],
                        [`🎨 ${p.panels} AI panels`, true],
                        ["👥 Team features", p.teams],
                        ["📊 Analytics", p.name !== "Free"],
                      ].map(([feat, ok]) => (
                        <div key={feat} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: ok ? COLORS.ink : COLORS.mutedLight, marginBottom: 6 }}>
                          <span style={{ color: ok ? COLORS.success : COLORS.mutedLight, fontWeight: 700 }}>{ok ? "✓" : "✗"}</span> {feat}
                        </div>
                      ))}
                      {!p.current && (
                        <button style={{
                          width: "100%", marginTop: 10, padding: "8px", background: p.color, color: "white",
                          border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                        }}>{p.name === "Free" ? "Downgrade" : `Upgrade → ${p.name}`}</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {activeTab === "payments" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, margin: "0 0 6px" }}>💳 Payment History</h2>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 22px" }}>All your transactions and billing records</p>

              {/* Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
                <StatCard icon="💳" label="Active Plan" value="Silver" sub="$5/year" color={COLORS.plum} />
                <StatCard icon="📅" label="Next Renewal" value="Jan 2027" sub="Auto-renew ON" color={COLORS.gold} />
                <StatCard icon="✅" label="Total Paid" value="₹840" sub="Since Jan 2026" color={COLORS.success} />
              </div>

              {/* Table */}
              <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 0.8fr",
                  padding: "12px 20px", background: COLORS.cardTint,
                  borderBottom: `1px solid ${COLORS.border}`,
                  fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, textTransform: "uppercase",
                }}>
                  <span>Transaction ID</span><span>Date</span><span>Plan</span><span>Amount</span><span>Method</span><span>Status</span>
                </div>
                {PAYMENT_HISTORY.map((p, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 0.8fr",
                    padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`,
                    fontSize: 13, color: COLORS.ink, alignItems: "center", transition: "background 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.cardTint}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.muted }}>{p.id}</span>
                    <span>{p.date}</span>
                    <span style={{ fontWeight: 600 }}>{p.plan}</span>
                    <span style={{ fontWeight: 700, color: COLORS.ink }}>{p.amount}</span>
                    <span>{p.method}</span>
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 8,
                      fontSize: 11, fontWeight: 700,
                      background: p.status === "success" ? COLORS.successLight : COLORS.dangerLight,
                      color: p.status === "success" ? COLORS.success : COLORS.danger,
                    }}>{p.status === "success" ? "✓ Paid" : "✗ Failed"}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button style={{ padding: "10px 20px", background: COLORS.plumLight, color: COLORS.plum, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>📥 Download Invoice</button>
                <button style={{ padding: "10px 20px", background: COLORS.card, color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, cursor: "pointer" }}>💳 Update Payment Method</button>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, margin: "0 0 22px" }}>⚙️ Account Settings</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Profile */}
                <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "22px 24px" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, marginBottom: 16 }}>👤 Profile</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[["Display Name", USER.name], ["Handle", USER.handle], ["Email", "aanya@example.com"], ["Country", USER.country]].map(([label, val]) => (
                      <div key={label}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 5 }}>{label}</label>
                        <input defaultValue={val} style={{
                          width: "100%", padding: "10px 14px", border: `1.5px solid ${COLORS.border}`,
                          borderRadius: 10, fontSize: 13, color: COLORS.ink, background: COLORS.bg,
                          outline: "none", boxSizing: "border-box",
                        }} />
                      </div>
                    ))}
                  </div>
                  <button style={{ marginTop: 16, padding: "10px 24px", background: COLORS.plum, color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save Changes</button>
                </div>
                {/* Notifications */}
                <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "22px 24px" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, marginBottom: 16 }}>🔔 Notification Preferences</div>
                  {["New episodes from followed stories", "Likes and comments on my stories", "AI generation limit warnings", "Platform announcements", "Weekly reading digest"].map(item => (
                    <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                      <span style={{ fontSize: 13, color: COLORS.ink }}>{item}</span>
                      <div style={{ width: 40, height: 22, borderRadius: 11, background: COLORS.plum, cursor: "pointer", display: "flex", alignItems: "center", padding: "0 3px", justifyContent: "flex-end" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white" }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Danger zone */}
                <div style={{ background: COLORS.dangerLight, borderRadius: 16, border: `1px solid ${COLORS.danger}30`, padding: "20px 24px" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.danger, marginBottom: 8 }}>⚠️ Danger Zone</div>
                  <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 14 }}>These actions are irreversible. Please be certain before proceeding.</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ padding: "9px 18px", background: "white", color: COLORS.danger, border: `1px solid ${COLORS.danger}40`, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel Subscription</button>
                    <button style={{ padding: "9px 18px", background: COLORS.danger, color: "white", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
