import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  ArrowLeft, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  Bookmark, 
  ChevronRight, 
  UserPlus, 
  UserCheck, 
  Star,
  ChevronLeft,
  BookOpen,
  Maximize2,
  Clock,
  ThumbsUp,
  ExternalLink,
  Lock,
  Unlock,
  Flame,
  Globe,
  MoreHorizontal,
  Layers,
  Zap,
  Trophy,
  Activity,
  BarChart3,
  TrendingUp,
  Gamepad2
} from "lucide-react";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import Header from "./Header";
import Footer from "./Footer";
import StoryMap from "./StoryMap";

// ─── Theme Configuration ──────────────────────────────────────────
const COLORS = {
  bg: "#080710",
  bgSubtle: "#0F0D1F",
  card: "rgba(255, 255, 255, 0.02)",
  cardHover: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.06)",
  borderHover: "rgba(139, 92, 246, 0.3)",
  text: "#FFFFFF",
  textMuted: "#88849E",
  purple: "#8B5CF6",
  purpleLight: "rgba(139, 92, 246, 0.1)",
  rose: "#F43F8E",
  roseLight: "rgba(244, 63, 142, 0.1)",
  gold: "#F59E0B",
  emerald: "#10B981",
};

const DEFAULT_COVER = "/covers/fantasy_cover_1777743338844.png";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StoryImage({ src, alt, style, className, fallback = DEFAULT_COVER }) {
  const [error, setError] = useState(false);
  const finalSrc = error ? fallback : (src && src.includes("/src/assets/") ? src.replace("/src/assets/", "/covers/") : src);
  const isUrl = typeof finalSrc === 'string' && (finalSrc.startsWith("http") || finalSrc.startsWith("/"));

  if (!isUrl) {
    return <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bgSubtle }} className={className}>{finalSrc || "📖"}</div>;
  }
  return <img src={finalSrc} alt={alt} style={{ ...style, objectFit: "cover" }} className={className} onError={() => setError(true)} />;
}

function Badge({ label, color = COLORS.purple, icon: Icon }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 10, fontWeight: 800, textTransform: "uppercase",
      padding: "6px 14px", borderRadius: 12,
      background: `${color}15`, color,
      border: `1px solid ${color}25`, letterSpacing: 1,
    }}>
      {Icon && <Icon size={12} />} {label}
    </span>
  );
}

function Avatar({ initials, size = 40, color = COLORS.purple }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 16,
      background: `linear-gradient(135deg, ${color}, ${color}99)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 900, color: "#FFF",
      flexShrink: 0, boxShadow: "0 12px 24px rgba(0,0,0,0.4)",
      border: `1px solid rgba(255,255,255,0.1)`
    }}>{initials}</div>
  );
}

function RatingBreakdown() {
  const categories = [
    { label: "Visuals", score: 4.9, color: COLORS.purple },
    { label: "Plot", score: 4.7, color: COLORS.rose },
    { label: "Pace", score: 4.5, color: COLORS.gold },
    { label: "Vibe", score: 4.8, color: COLORS.emerald },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      {categories.map(c => (
        <div key={c.label} style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: 20, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 8 }}>{c.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#FFF" }}>{c.score}</div>
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${(c.score / 5) * 100}%`, height: "100%", background: c.color }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommunityMilestones() {
  const milestones = [
    { label: "10k Souls bound", progress: 85, icon: Heart, color: COLORS.rose },
    { label: "Quest Map: Chapter 2", progress: 40, icon: Gamepad2, color: COLORS.purple },
    { label: "Global Reach", progress: 65, icon: Globe, color: COLORS.emerald },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {milestones.map(m => (
        <div key={m.label}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <m.icon size={16} color={m.color} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{m.label}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 900, color: m.color }}>{m.progress}%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
             <motion.div initial={{ width: 0 }} whileInView={{ width: `${m.progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }} style={{ height: "100%", background: m.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AgeGateModal({ rating, onConsent, onDecline }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5, 4, 10, 0.9)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: COLORS.bgSubtle, border: `1px solid ${COLORS.border}`, borderRadius: 30, padding: "40px", maxWidth: 420, width: "90%", textAlign: "center", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: `${COLORS.rose}20`, border: `2px solid ${COLORS.rose}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 24, fontWeight: 900, color: COLORS.rose }}>{rating}</div>
        <h2 style={{ color: "#FFF", fontSize: 24, fontWeight: 900, marginBottom: 15 }}>Restricted Content</h2>
        <p style={{ color: COLORS.textMuted, fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>This storyline contains mature themes. Please confirm that you are at least {rating.replace("+", "")} years old.</p>
        <div style={{ display: "flex", gap: 15 }}>
          <button onClick={onDecline} style={{ flex: 1, padding: "14px", borderRadius: 15, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textMuted, cursor: "pointer", fontWeight: 700 }}>Go Back</button>
          <button onClick={onConsent} style={{ flex: 1, padding: "14px", borderRadius: 15, background: COLORS.rose, border: "none", color: "#FFF", cursor: "pointer", fontWeight: 800, boxShadow: `0 10px 20px ${COLORS.rose}30` }}>I Agree</button>
        </div>
      </motion.div>
    </div>
  );
}

function WriteModal({ onClose, onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(5, 4, 10, 0.9)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: COLORS.bgSubtle, border: `1px solid ${COLORS.border}`, borderRadius: 30, padding: "34px", maxWidth: 550, width: "92%", boxShadow: "0 30px 70px rgba(0,0,0,0.7)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 25 }}>
          <div>
            <h2 style={{ color: "#FFF", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Write Your Twist ✦</h2>
            <p style={{ color: COLORS.textMuted, fontSize: 14 }}>Become the architect of this scene. Describe the next move.</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#FFF", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}>✕</button>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Elara reached out, her fingers trembling as she whispered the forbidden incantation..." style={{ width: "100%", minHeight: 180, background: "rgba(0,0,0,0.3)", border: `1px solid ${COLORS.border}`, borderRadius: 18, color: "#FFF", padding: "18px", fontSize: 15, lineHeight: 1.6, resize: "none", outline: "none", transition: "border-color 0.3s" }} onFocus={e => e.target.style.borderColor = COLORS.purple} />
        <button onClick={() => { if (text.trim()) onSubmit(text); }} style={{ marginTop: 20, width: "100%", padding: "16px", background: COLORS.purple, border: "none", borderRadius: 16, color: "#FFF", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: `0 15px 30px ${COLORS.purple}40` }}>Submit to Creator Hub</button>
      </motion.div>
    </div>
  );
}

function VaultPanel({ onNavigate, bookmarks = [] }) {
  return (
    <div style={{ 
      background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)", 
      border: `1px solid ${COLORS.border}`, 
      borderRadius: 28, 
      padding: "28px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Bookmark size={20} color={COLORS.purple} fill={COLORS.purple} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#FFF" }}>Personal Vault</h3>
        </div>
        <Badge label={`${bookmarks.length}`} color={COLORS.purple} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {bookmarks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: COLORS.textMuted, fontSize: 13 }}>Your vault is empty.</div>
        ) : (
          bookmarks.slice(0, 3).map((s, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ x: 5, background: "rgba(255,255,255,0.05)" }}
              style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px", background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`, borderRadius: 18, cursor: "pointer" }} 
              onClick={() => onNavigate(s)}
            >
               <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📖</div>
               <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>Story #{idx + 1}</div>
                  <div style={{ fontSize: 11, color: COLORS.purple, fontWeight: 700 }}>Continue Reading</div>
               </div>
               <ChevronRight size={18} color={COLORS.textMuted} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Basic States
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [activeScene, setActiveScene] = useState(null);
  const [viewMode, setViewMode] = useState("dashboard"); 
  const [activeTab, setActiveTab] = useState("episodes"); 
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Feature States
  const [toast, setToast] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [pendingChoice, setPendingChoice] = useState(null);
  const [chosenLabel, setChosenLabel] = useState(null);
  const [totalVotes, setTotalVotes] = useState(15420);
  
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "LunaDreams", text: "The art style is incredible! Love the character development.", likes: 42, avatar: "LD" },
    { id: 2, user: "ChronoMage", text: "Wait, the choice in Episode 1 really changed the dialogue in Episode 2? That's insane!", likes: 28, avatar: "CM" }
  ]);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => setUserData(res.data))
        .catch(err => console.error("Error fetching user profile:", err));
    }
  }, []);

  const handleToggleBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      const res = await axios.post(`/api/users/bookmarks/${id}`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
      setUserData(prev => ({
        ...prev,
        bookmarks: res.data.bookmarked 
          ? [...(prev?.bookmarks || []), id]
          : (prev?.bookmarks || []).filter(b => b !== id)
      }));
      triggerToast(res.data.message);
    } catch (err) {
      triggerToast("Error updating bookmark");
    }
  };

  const handleToggleRead = async (nodeId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      
      const isRead = userData?.readNodes?.some(n => n.nodeId === nodeId);
      if (isRead) {
        await axios.delete(`/api/users/read-nodes/${id}/${nodeId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        setUserData(prev => ({
          ...prev,
          readNodes: (prev?.readNodes || []).filter(n => n.nodeId !== nodeId)
        }));
        triggerToast("Marked as unread");
      } else {
        await axios.post(`/api/users/read-nodes/${id}/${nodeId}`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
        setUserData(prev => ({
          ...prev,
          readNodes: [...(prev?.readNodes || []), { storyId: id, nodeId }]
        }));
        triggerToast("Marked as read");
      }
    } catch (err) {
      triggerToast("Error updating read status");
    }
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/stories/${id}`)
      .then(res => {
        setStory(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching story:", err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (viewMode !== "reader") return;
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress((window.scrollY / docHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [viewMode]);

  if (loading) return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 40, height: 40, border: `3px solid ${COLORS.purple}20`, borderTopColor: COLORS.purple, borderRadius: "50%" }} />
       <p style={{ marginTop: 16, color: COLORS.textMuted, fontSize: 14, fontWeight: 600 }}>Summoning your adventure...</p>
    </div>
  );

  if (!story) return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
      <AlertTriangle size={48} color={COLORS.rose} style={{ marginBottom: 20 }} />
      <h2 style={{ color: "#FFF", marginBottom: 10 }}>This Story is Lost in the Vault</h2>
      <button onClick={() => navigate("/")} style={{ background: COLORS.purple, color: "#FFF", padding: "12px 30px", borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer" }}>Return to Library</button>
    </div>
  );

  const handleSelectEpisode = (ep) => {
    setActiveEpisode(ep);
    setActiveScene(ep.scenes && ep.scenes.length > 0 ? ep.scenes[0] : null);
    setViewMode("reader");
    setShowUnlock(false);
    setChosenLabel(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleChoice = (choice) => {
    if (choice.ageRestricted) {
      setPendingChoice(choice);
      setShowAgeGate(true);
      return;
    }
    executeChoice(choice);
  };

  const executeChoice = (choice) => {
    setChosenLabel(choice.label);
    setShowUnlock(true);
    
    if (choice.targetScene && activeEpisode) {
      const next = activeEpisode.scenes.find(s => s.number === choice.targetScene);
      if (next) {
        setActiveScene(next);
        window.scrollTo({ top: 0, behavior: "smooth" });
        triggerToast(`Pathway Unlocked: ${next.title}`);
      }
    }
  };

  const seoTitle = `${story.title} — Interactive AI Webtoon | ToonVault`;
  const seoDesc = story.description || `Read ${story.title} on ToonVault. An immersive interactive AI manhwa where your choices matter.`;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: "hidden" }}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={story.panels?.[0] || DEFAULT_COVER} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      {/* Dynamic Modals */}
      <AnimatePresence>
        {showAgeGate && <AgeGateModal rating="18+" onConsent={() => { setShowAgeGate(false); if(pendingChoice) executeChoice(pendingChoice); }} onDecline={() => setShowAgeGate(false)} />}
        {showWriteModal && <WriteModal onClose={() => setShowWriteModal(false)} onSubmit={(txt) => { setShowWriteModal(false); triggerToast("Plot twist submitted!"); }} />}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: "fixed", bottom: isMobile ? 100 : 30, right: isMobile ? 20 : 30, zIndex: 3000,
              background: "rgba(139, 92, 246, 0.95)", backdropFilter: "blur(20px)",
              color: "#FFF", padding: "16px 24px", borderRadius: 20,
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 12,
              border: "1px solid rgba(255,255,255,0.1)", fontWeight: 800
            }}
          >
            <Sparkles size={18} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {viewMode === "reader" ? (
          
          /* ─── PROFESSIONAL READER VIEW ─── */
          <motion.div key="reader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: "#05040A", minHeight: "100vh" }}>
            <div style={{ position: "sticky", top: 0, zIndex: 1000, background: "rgba(8,7,16,0.85)", backdropFilter: "blur(30px)", borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px" }}>
              <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button onClick={() => setViewMode("dashboard")} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.border}`, color: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 14, fontWeight: 800, transition: "all 0.2s" }}>
                  <ArrowLeft size={18} /> <span className="desktop-only">Back to Deck</span>
                </button>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: COLORS.purple, textTransform: "uppercase", letterSpacing: 1.5 }}>{story.title}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, marginTop: 4 }}>{activeEpisode?.title} {activeScene ? `✦ ${activeScene.title}` : ""}</div>
                </div>
                <div style={{ width: 100, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: COLORS.purple }}>{Math.round(scrollProgress)}%</span>
                  <div style={{ width: 44, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                     <div style={{ height: "100%", width: `${scrollProgress}%`, background: COLORS.purple }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 140px" }}>
              {(activeScene?.panels || story.panels || []).map((url, i) => {
                const meta = activeScene?.content ? JSON.parse(activeScene.content)[i] : null;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-150px" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 60, borderRadius: 32, overflow: "hidden", border: `1px solid ${COLORS.border}`, position: "relative", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
                    <StoryImage src={url} style={{ width: "100%", height: "auto", display: "block" }} alt={`Panel ${i+1}`} />
                    {meta && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)", padding: "60px 32px 32px" }}>
                        <div style={{ background: "rgba(15, 13, 31, 0.7)", backdropFilter: "blur(20px)", padding: "24px 28px", borderRadius: 24, border: `1px solid ${COLORS.purple}40`, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                           <p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, fontWeight: 500, color: "#E5E7EB", letterSpacing: 0.2 }}>{meta.text}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {activeScene?.choicePrompts?.length > 0 && (
                <div style={{ padding: "60px 0 40px", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 15, justifyContent: "center", marginBottom: 30 }}>
                    <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, transparent, ${COLORS.purple})` }} />
                    <h3 style={{ margin: 0, color: "#FFF", fontSize: 18, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>Decide the Fate</h3>
                    <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, transparent, ${COLORS.purple})` }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {activeScene.choicePrompts.map((c, idx) => (
                      <motion.button key={idx} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleChoice(c)} style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))", border: `1px solid ${COLORS.border}`, color: "#FFF", padding: "24px", borderRadius: 24, cursor: "pointer", fontWeight: 800, fontSize: 16, textAlign: "left", display: "flex", alignItems: "center", gap: 18, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>
                        <span style={{ width: 36, height: 36, borderRadius: 12, background: COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}>{c.label}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#FFF" }}>{c.title}</div>
                          {c.desc && <div style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500, marginTop: 4 }}>{c.desc}</div>}
                        </div>
                        <ChevronRight size={20} color={COLORS.textMuted} />
                      </motion.button>
                    ))}
                    <button onClick={() => setShowWriteModal(true)} style={{ background: "rgba(139, 92, 246, 0.08)", border: `1px dashed ${COLORS.purple}50`, color: COLORS.purple, padding: "20px", borderRadius: 24, cursor: "pointer", fontWeight: 900, marginTop: 12, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <Sparkles size={18} /> Write Your Own Twist
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 80, padding: "50px", textAlign: "center", background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)", borderRadius: 40, border: `1px solid ${COLORS.border}` }}>
                <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Episode {activeEpisode?.number} Concluded</h3>
                <p style={{ color: COLORS.textMuted, fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>Your decisions have been woven into the tapestry of the Labyrinth. What will you discover next?</p>
                <button onClick={() => setViewMode("dashboard")} style={{ background: COLORS.purple, color: "#FFF", padding: "16px 40px", borderRadius: 18, border: "none", fontWeight: 900, cursor: "pointer", fontSize: 16, boxShadow: `0 15px 30px ${COLORS.purple}40` }}>Return to Labyrinth Hub</button>
              </div>
            </div>
          </motion.div>
        ) : (
          
          /* ─── PROFESSIONAL DASHBOARD VIEW ─── */
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Header />
            
            {/* ENHANCED HERO SECTION */}
            <div style={{ position: "relative", width: "100%", height: isMobile ? "auto" : "680px", background: COLORS.bg, overflow: "hidden" }}>
               <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 1, 0] }} 
                    transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <StoryImage src={story.panels?.[0]} style={{ width: "100%", height: "100%", filter: "blur(40px) opacity(0.25)", transform: "scale(1.15)" }} />
                  </motion.div>
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(8, 7, 16, 0.5) 0%, ${COLORS.bg} 98%)` }} />
               </div>
               
               <div style={{ position: "relative", maxWidth: 1300, margin: "0 auto", height: "100%", display: "flex", alignItems: isMobile ? "flex-start" : "flex-end", padding: isMobile ? "100px 24px 60px" : "0 60px 100px" }}>
                  <div style={{ display: "flex", gap: isMobile ? 32 : 60, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "flex-end", width: "100%" }}>
                     <motion.div 
                       initial={{ y: 80, opacity: 0, scale: 0.95 }} 
                       animate={{ y: 0, opacity: 1, scale: 1 }} 
                       transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                       style={{ width: isMobile ? 220 : 360, flexShrink: 0, borderRadius: 44, overflow: "hidden", boxShadow: "0 60px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.12)", aspectRatio: "3/4.4", position: "relative" }}
                     >
                        <StoryImage src={story.panels?.[0]} style={{ width: "100%", height: "100%" }} />
                        <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", padding: "8px 16px", borderRadius: 14, color: "#FFF", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                           <Activity size={14} color={COLORS.emerald} /> LIVE
                        </div>
                     </motion.div>
                     
                     <div style={{ flex: 1, textAlign: isMobile ? "center" : "left", paddingBottom: isMobile ? 0 : 20 }}>
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }} 
                          animate={{ x: 0, opacity: 1 }} 
                          transition={{ delay: 0.3, duration: 0.6 }}
                          style={{ display: "flex", gap: 10, justifyContent: isMobile ? "center" : "flex-start", marginBottom: 28 }}
                        >
                           <Badge label={story.genre} icon={Sparkles} />
                           <Badge label="Interactive AI" color={COLORS.rose} icon={Zap} />
                           {story.isAgeRestricted && <Badge label="18+" color={COLORS.rose} />}
                        </motion.div>
                        
                        <motion.h1 
                          initial={{ y: 20, opacity: 0 }} 
                          animate={{ y: 0, opacity: 1 }} 
                          transition={{ delay: 0.4, duration: 0.6 }}
                          style={{ fontSize: isMobile ? 48 : 84, margin: "0 0 28px", fontWeight: 900, letterSpacing: -3.5, lineHeight: 0.9, color: "#FFF" }}
                        >
                          {story.title}
                        </motion.h1>
                        
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }} 
                          animate={{ y: 0, opacity: 1 }} 
                          transition={{ delay: 0.5, duration: 0.6 }}
                          style={{ display: "flex", gap: 40, justifyContent: isMobile ? "center" : "flex-start", color: "rgba(255,255,255,0.5)", fontSize: 17, fontWeight: 700, marginBottom: 44 }}
                        >
                           <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Star size={22} color={COLORS.gold} fill={COLORS.gold} /> <span style={{ color: "#FFF" }}>{story.rating || "4.9"}</span></div>
                           <div style={{ display: "flex", alignItems: "center", gap: 10 }}><BookOpen size={22} /> <span style={{ color: "#FFF" }}>{story.episodes?.length || 0} Chapters</span></div>
                           <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Heart size={22} /> <span style={{ color: "#FFF" }}>{story.likes || 0} Bound Souls</span></div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }} 
                          animate={{ y: 0, opacity: 1 }} 
                          transition={{ delay: 0.6, duration: 0.6 }}
                          style={{ display: "flex", gap: 20, justifyContent: isMobile ? "center" : "flex-start" }}
                        >
                           <button 
                             onClick={() => story.episodes?.length > 0 && handleSelectEpisode(story.episodes[0])} 
                             style={{ 
                               background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.rose})`, 
                               color: "#FFF", padding: "22px 64px", borderRadius: 28, border: "none", 
                               fontWeight: 900, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", 
                               gap: 16, boxShadow: `0 30px 60px rgba(139, 92, 246, 0.45)`, transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                             }} 
                             onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'} 
                             onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                           >
                             <Sparkles size={26} /> Start Your Journey
                           </button>
                           
                           {!isMobile && (
                             <button 
                               onClick={() => { setIsLiked(!isLiked); triggerToast(isLiked ? "Soul untethered" : "Soul bound to this story!"); }} 
                               style={{ 
                                 width: 74, height: 74, borderRadius: 28, background: "rgba(255,255,255,0.06)", 
                                 border: `1.5px solid ${COLORS.border}`, display: "flex", alignItems: "center", 
                                 justifyContent: "center", cursor: "pointer", color: isLiked ? COLORS.rose : "#FFF", 
                                 transition: 'all 0.3s' 
                               }}
                               onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "rotate(10deg)"; }}
                               onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "rotate(0deg)"; }}
                             >
                               <Heart size={32} fill={isLiked ? COLORS.rose : "none"} />
                             </button>
                           )}
                        </motion.div>
                     </div>
                  </div>
               </div>
            </div>

            <div style={{ maxWidth: 1300, margin: "0 auto", padding: isMobile ? "40px 24px 120px" : "80px 60px 140px" }}>
              
              {/* TABBED NAVIGATION SYSTEM */}
              <div style={{ display: "flex", gap: 40, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 60, paddingBottom: 4, overflowX: "auto", scrollbarWidth: "none" }}>
                {[
                  { id: "episodes", label: "Chronicles", icon: BookOpen },
                  { id: "map", label: "Quest Map", icon: Gamepad2 },
                  { id: "reviews", label: "Reviews", icon: MessageSquare },
                  { id: "gallery", label: "Vault Gallery", icon: Maximize2 },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ 
                      background: "none", border: "none", padding: "12px 0 20px", 
                      color: activeTab === tab.id ? COLORS.purple : COLORS.textMuted, 
                      fontSize: 16, fontWeight: 800, cursor: "pointer", position: "relative",
                      display: "flex", alignItems: "center", gap: 10, transition: "color 0.3s",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="activeTab" style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 4, background: COLORS.purple, borderRadius: 2 }} />
                    )}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 420px", gap: 80, alignItems: "start" }}>
                
                {/* MAIN CONTENT AREA (DYNAMIC TABS) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
                  
                  <AnimatePresence mode="wait">
                    {activeTab === "episodes" && (
                      <motion.div key="episodes" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
                          <section>
                            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
                               <div style={{ width: 6, height: 40, background: COLORS.purple, borderRadius: 3 }} />
                               <h3 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>The Chronicles</h3>
                            </div>
                            <p style={{ color: "#E2E8F0", lineHeight: 1.9, fontSize: 20, fontWeight: 500, letterSpacing: 0.2 }}>{story.description || "In a realm where light and shadow are at war, your choices determine the survival of entire civilizations. Will you be the savior, or the architect of ruin?"}</p>
                          </section>

                          <section>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
                               <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                  <div style={{ width: 6, height: 40, background: COLORS.rose, borderRadius: 3 }} />
                                  <h3 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>Episodes</h3>
                               </div>
                               <Badge label={`${story.episodes?.length || 0} Chronicles`} color={COLORS.rose} icon={TrendingUp} />
                            </div>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                              {(story.episodes || []).map((ep, idx) => (
                                <motion.div 
                                  key={ep._id} 
                                  whileHover={{ x: 12, background: "rgba(255,255,255,0.06)", borderColor: "rgba(139, 92, 246, 0.4)" }} 
                                  onClick={() => handleSelectEpisode(ep)} 
                                  style={{ 
                                    background: "rgba(255,255,255,0.02)", 
                                    border: `1px solid ${COLORS.border}`, 
                                    borderRadius: 32, 
                                    padding: "24px", 
                                    cursor: "pointer", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: 24, 
                                    transition: "all 0.4s cubic-bezier(0.2, 1, 0.3, 1)" 
                                  }}
                                >
                                  <div style={{ width: 120, height: 84, borderRadius: 20, overflow: "hidden", background: "rgba(255,255,255,0.05)", flexShrink: 0, position: "relative" }}>
                                     <StoryImage src={ep.panels?.[0] || story.panels?.[0]} style={{ width: "100%", height: "100%" }} />
                                     <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", opacity: 0, transition: "opacity 0.3s" }} className="ep-hover">
                                        <Maximize2 size={24} color="#FFF" />
                                     </div>
                                     <div style={{ position: "absolute", top: 10, left: 10, background: idx === 0 ? COLORS.purple : "rgba(0,0,0,0.7)", padding: "4px 12px", borderRadius: 10, fontSize: 12, fontWeight: 900, color: "#FFF", border: "1px solid rgba(255,255,255,0.1)" }}>{ep.number}</div>
                                  </div>
                                  
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: 22, color: "#FFF", marginBottom: 8 }}>{ep.title}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14, color: COLORS.textMuted, fontWeight: 600 }}>
                                       <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Layers size={16} /> {ep.scenes?.length || 0} Scenes</div>
                                       <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={16} /> 8 min read</div>
                                       <div style={{ display: "flex", alignItems: "center", gap: 6 }}><ThumbsUp size={16} /> {(story.views / 10).toFixed(0)} Likes</div>
                                    </div>
                                  </div>
                                  
                                  <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                                    <ChevronRight size={24} color={COLORS.textMuted} />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </section>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "map" && (
                      <motion.div key="map" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                         <StoryMap 
                            storyId={id}
                            storyNodes={story.nodes || []}
                            currentNodeId={activeScene?.id}
                            userReadNodes={userData?.readNodes || []}
                            isBookmarked={userData?.bookmarks?.includes(id)}
                            userId={userData?._id}
                            onSelectNode={(node) => {
                              if (node.type === 'scene') {
                                setActiveScene(node);
                                setViewMode("reader");
                              }
                            }}
                            onToggleBookmark={handleToggleBookmark}
                            onToggleRead={handleToggleRead}
                          />
                      </motion.div>
                    )}

                    {activeTab === "reviews" && (
                      <motion.div key="reviews" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                          <section>
                            <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 32, color: "#FFF" }}>Expert Analysis</h3>
                            <RatingBreakdown />
                          </section>
                          <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`, borderRadius: 40, padding: "40px", boxShadow: "0 30px 60px rgba(0,0,0,0.3)" }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#FFF" }}>The Void Speaks</h3>
                              <Badge label={`${comments.length} Reviewers`} color={COLORS.purple} icon={MessageSquare} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                              {comments.map(c => (
                                <div key={c.id} style={{ display: "flex", gap: 24 }}>
                                  <Avatar initials={c.avatar} size={50} color={COLORS.purple} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                      <div style={{ fontSize: 16, fontWeight: 900, color: '#FFF' }}>{c.user}</div>
                                      <div style={{ display: "flex", gap: 4 }}><Star size={14} color={COLORS.gold} fill={COLORS.gold} /><Star size={14} color={COLORS.gold} fill={COLORS.gold} /><Star size={14} color={COLORS.gold} fill={COLORS.gold} /><Star size={14} color={COLORS.gold} fill={COLORS.gold} /><Star size={14} color={COLORS.gold} fill={COLORS.gold} /></div>
                                    </div>
                                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", margin: "0 0 16px", lineHeight: 1.7 }}>{c.text}</p>
                                    <div style={{ display: "flex", gap: 24, fontSize: 13, fontWeight: 800, color: COLORS.textMuted }}><span style={{ display: "flex", alignItems: "center", gap: 8, cursor: 'pointer', transition: 'color 0.2s' }}><ThumbsUp size={16} /> {c.likes}</span><span style={{ cursor: 'pointer' }}>Reply</span></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "gallery" && (
                      <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}>
                          {(story.panels || []).map((p, i) => (
                            <motion.div key={i} whileHover={{ scale: 1.05, y: -10 }} style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${COLORS.border}`, aspectRatio: "1", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
                              <StoryImage src={p} style={{ width: "100%", height: "100%" }} />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Recommendations Section */}
                  <section style={{ marginTop: 80 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
                       <div style={{ width: 6, height: 40, background: COLORS.emerald, borderRadius: 3 }} />
                       <h3 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>Seekers Also Read</h3>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 24 }}>
                      {[1, 2, 3].map(i => (
                        <motion.div key={i} whileHover={{ y: -12 }} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${COLORS.border}`, borderRadius: 32, padding: "20px", cursor: "pointer" }}>
                           <div style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "3/4", marginBottom: 20 }}>
                              <StoryImage src={DEFAULT_COVER} style={{ width: "100%", height: "100%" }} />
                           </div>
                           <div style={{ fontWeight: 800, fontSize: 18, color: "#FFF", marginBottom: 8 }}>Ethereal Bound</div>
                           <div style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 700 }}>Fantasy • Action</div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* SIDEBAR AREA */}
                <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                  
                  {/* Story Stats Panel */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: `1.5px solid ${COLORS.border}`, borderRadius: 40, padding: "32px", boxShadow: "0 30px 60px rgba(0,0,0,0.3)" }}>
                    <h4 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 900, color: "#FFF", display: "flex", alignItems: "center", gap: 10 }}><BarChart3 size={20} color={COLORS.purple} /> Story Analytics</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      {[
                        { l: "Choice Complexity", v: "High", c: COLORS.rose },
                        { l: "Branch Count", v: "32 Paths", c: COLORS.purple },
                        { l: "Avg completion", v: "92%", c: COLORS.emerald },
                        { l: "Reader Mood", v: "Intense", c: COLORS.gold },
                      ].map(s => (
                        <div key={s.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMuted }}>{s.l}</span>
                          <span style={{ fontSize: 14, fontWeight: 900, color: s.c }}>{s.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Community Goals */}
                  <div style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)", border: `1.5px solid ${COLORS.border}`, borderRadius: 40, padding: "32px", boxShadow: "0 30px 60px rgba(0,0,0,0.3)" }}>
                    <h4 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 900, color: "#FFF", display: "flex", alignItems: "center", gap: 10 }}><Trophy size={20} color={COLORS.gold} /> Community Goals</h4>
                    <CommunityMilestones />
                  </div>

                  <VaultPanel bookmarks={userData?.bookmarks || []} onNavigate={(sid) => navigate(`/story/${sid}`)} />
                  
                  {/* ENHANCED CREATOR SECTION */}
                  <div style={{ 
                    background: "linear-gradient(135deg, rgba(244,63,142,0.08) 0%, rgba(139, 92, 246, 0.04) 100%)", 
                    border: `1.5px solid ${COLORS.border}`, 
                    borderRadius: 40, 
                    padding: "40px", 
                    boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: `${COLORS.rose}15`, filter: "blur(40px)", borderRadius: "50%" }} />
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
                      <div style={{ position: "relative" }}>
                        <Avatar initials={story.authorName?.[0] || "A"} size={72} color={COLORS.rose} />
                        <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: COLORS.emerald, border: `3px solid #0F0D1E`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={14} color="#FFF" />
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, fontSize: 22, color: "#FFF", letterSpacing: -0.5 }}>{story.authorName}</div>
                        <div style={{ fontSize: 14, color: COLORS.rose, fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: 1.5 }}>Master Architect</div>
                      </div>
                    </div>
                    
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>Creating immersive worlds where your decisions define the future. Join the community of seekers.</p>
                    
                    <div style={{ display: "flex", gap: 12 }}>
                      <button 
                        onClick={() => { setIsFollowing(!isFollowing); triggerToast(isFollowing ? "No longer following" : "Following architect!"); }} 
                        style={{ flex: 1, padding: "18px", borderRadius: 20, background: isFollowing ? "rgba(255,255,255,0.06)" : COLORS.purple, border: `1.5px solid ${isFollowing ? COLORS.border : COLORS.purple}`, color: "#FFF", fontWeight: 900, cursor: "pointer", fontSize: 16, transition: 'all 0.3s', boxShadow: isFollowing ? 'none' : `0 10px 20px ${COLORS.purple}30` }}
                      >
                        {isFollowing ? "Bonded" : "Follow Architect"}
                      </button>
                      <button style={{ width: 56, height: 56, borderRadius: 20, background: "rgba(255,255,255,0.06)", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", cursor: "pointer" }}>
                         <Share2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* MOBILE QUICK ACTION BAR */}
            {isMobile && (
              <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 80, background: "rgba(8,7,16,0.9)", backdropFilter: "blur(30px)", borderTop: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", zIndex: 1000 }}>
                 <button 
                   onClick={() => { setIsLiked(!isLiked); triggerToast(isLiked ? "Soul untethered" : "Soul bound!"); }}
                   style={{ background: "none", border: "none", color: isLiked ? COLORS.rose : "#FFF", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
                 >
                   <Heart size={24} fill={isLiked ? COLORS.rose : "none"} />
                   <span style={{ fontSize: 10, fontWeight: 800 }}>LIKE</span>
                 </button>
                 
                 <button 
                   onClick={() => story.episodes?.length > 0 && handleSelectEpisode(story.episodes[0])}
                   style={{ background: COLORS.purple, color: "#FFF", padding: "12px 32px", borderRadius: 16, border: "none", fontWeight: 900, fontSize: 14, boxShadow: `0 10px 20px ${COLORS.purple}40` }}
                 >
                   ENTER REALM
                 </button>
                 
                 <button 
                   onClick={handleToggleBookmark}
                   style={{ background: "none", border: "none", color: userData?.bookmarks?.includes(id) ? COLORS.gold : "#FFF", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
                 >
                   <Bookmark size={24} fill={userData?.bookmarks?.includes(id) ? COLORS.gold : "none"} />
                   <span style={{ fontSize: 10, fontWeight: 800 }}>VAULT</span>
                 </button>
              </div>
            )}
            
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .desktop-only { display: inline-flex; }
        @media (max-width: 899px) { .desktop-only { display: none; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .ep-hover { opacity: 0; }
        div:hover > .ep-hover { opacity: 1; }
      `}</style>
    </div>
  );
}
