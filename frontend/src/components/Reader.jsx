import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Share2, Heart, Star, Play, List, Info, Clock, Bookmark } from 'lucide-react';
import axios from 'axios';

const COLORS = {
  bg: "#08090A",
  panel: "#121315",
  accent: "#8B5CF6",
  rose: "#F472B6",
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
  border: "rgba(255,255,255,0.1)",
};

function SeriesPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMatureWarning, setShowMatureWarning] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await axios.get(`/api/stories/${storyId}`);
        setStory(res.data);
      } catch (err) {
        // Mock data for demo if not found
        setStory({
          _id: storyId,
          title: "High Society (AI Edition)",
          description: "In a world of glittering ballrooms and whispered secrets, a young woman must navigate the treacherous waters of the elite. But when a mysterious stranger enters her life, everything she thought she knew is challenged. Will she choose duty or her heart?",
          genre: "Romance Fantasy",
          authorName: "ToonVault AI",
          views: 1250000,
          likes: 45000,
          rating: 4.9,
          status: "Live",
          panels: [
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000",
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000",
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
    window.scrollTo(0, 0);
  }, [storyId]);

  if (loading) return <div style={{ background: COLORS.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent }}>Loading...</div>;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "'Inter', sans-serif" }}>
      {/* ═══ MATURE WARNING POPUP ═══ */}
      {showMatureWarning && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.9)", backdropFilter: "blur(15px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "#1A1A1E", border: "1px solid rgba(255,255,255,0.1)",
            padding: "40px", borderRadius: 16, maxWidth: 400, textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
          }}>
            <h2 style={{ color: "white", fontSize: 24, fontWeight: 900, marginBottom: 16 }}>Notice</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>
              This series contains adult themes and situations and is recommended for mature audiences. Viewer discretion is advised.<br/><br/>Proceed to view content?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => navigate(-1)} 
                style={{ flex: 1, padding: "14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}
              >
                Go Back
              </button>
              <button 
                onClick={() => setShowMatureWarning(false)}
                style={{ flex: 1, padding: "14px", borderRadius: 8, background: COLORS.rose, color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HERO SECTION ═══ */}
      <div style={{ position: "relative", height: "65vh", overflow: "hidden" }}>
        {/* Background Blur */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${story.panels?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23'})`,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.4) blur(10px)",
          transform: "scale(1.1)"
        }} />
        {/* Crisp Center Hero Image */}
        <div style={{
          position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center"
        }}>
           <img src={story.panels?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23'} style={{ height: "100%", width: "100%", maxWidth: "600px", objectFit: "cover", opacity: 0.8 }} />
        </div>
        {/* Gradients */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, #08090A 0%, rgba(8,9,10,0.4) 50%, rgba(8,9,10,0.8) 100%)",
        }} />
        
        {/* Top Floating Nav */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "24px", display: "flex", justifyContent: "space-between", zIndex: 10 }}>
          <button onClick={() => navigate(-1)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: 12, borderRadius: "50%", cursor: "pointer", backdropFilter: "blur(10px)", transition: "all 0.2s" }}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: 12, borderRadius: "50%", cursor: "pointer", backdropFilter: "blur(10px)", transition: "all 0.2s" }}>
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Story Title & Stats Overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 60px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "inline-block", padding: "4px 12px", background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.rose})`, borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16, boxShadow: "0 4px 15px rgba(139,92,246,0.4)" }}>
            Premium Series
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 48, fontWeight: 900, marginBottom: 16, letterSpacing: -1.5, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}
          >
            {story.title}
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, fontSize: 14, color: COLORS.textMuted, fontWeight: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Star size={16} fill="#FFD700" color="#FFD700" /> <span style={{ color: "white" }}>4.9</span></div>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.border }} />
            <div>{story.genre}</div>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.border }} />
            <div style={{ color: COLORS.rose }}>UP Every Mon</div>
          </motion.div>
        </div>
      </div>

      {/* ═══ ACTIONS & INFO ═══ */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 12, marginTop: -20, position: "relative", zIndex: 20, justifyContent: "center" }}>
          <button 
            onClick={() => navigate(`/manta/${story._id}`)}
            style={{ 
              flex: 1, maxWidth: 300, padding: "18px", borderRadius: 16, 
              background: COLORS.text, color: COLORS.bg, border: "none",
              fontSize: 16, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 10px 20px rgba(0,0,0,0.3)"
            }}
          >
            <Play size={20} fill="currentColor" /> Read First Episode
          </button>
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            style={{ 
              padding: "18px", borderRadius: 16, background: "rgba(255,255,255,0.1)", 
              color: isFavorite ? COLORS.rose : "white", border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer", backdropFilter: "blur(10px)"
            }}
          >
            <Bookmark size={24} fill={isFavorite ? COLORS.rose : "none"} />
          </button>
        </div>

        {/* Synopsis */}
        <section style={{ marginTop: 70, textAlign: "center" }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: COLORS.textMuted, marginBottom: 20 }}>About the Series</h3>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.85)", maxWidth: 700, margin: "0 auto", fontWeight: 400 }}>
            {story.description}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 30, marginTop: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{(story.views / 1000000).toFixed(1)}M</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 6 }}>Views</div>
            </div>
            <div style={{ width: 1, background: COLORS.border, height: 40 }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{(story.likes / 1000).toFixed(1)}K</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 6 }}>Likes</div>
            </div>
            <div style={{ width: 1, background: COLORS.border, height: 40 }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>#1</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 6 }}>{story.genre}</div>
            </div>
          </div>
        </section>

        {/* Membership Banner */}
        <section style={{ marginTop: 40, marginBottom: 20 }}>
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.rose} 100%)`,
            borderRadius: 16, padding: "24px", position: "relative", overflow: "hidden",
            boxShadow: "0 10px 30px rgba(139,92,246,0.2)"
          }}>
            <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 6 }}>ToonVault Unlimited</h3>
                <p style={{ color: "rgba(255,255,255,0.9)", margin: 0, fontSize: 14 }}>Read this series and thousands more without limits.</p>
              </div>
              <button 
                onClick={() => navigate('/dashboard?page=plans')}
                style={{ 
                  padding: "12px 24px", background: "white", color: COLORS.accent, 
                  border: "none", borderRadius: 30, fontWeight: 800, fontSize: 14, 
                  cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                }}
              >
                Get Unlimited
              </button>
            </div>
            {/* Sparkle Decoration */}
            <Star size={80} color="rgba(255,255,255,0.1)" fill="currentColor" style={{ position: "absolute", right: -10, top: -20, transform: "rotate(15deg)" }} />
          </div>
        </section>

        {/* Episodes */}
        <section style={{ marginTop: 60, paddingBottom: 100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>Episodes</h3>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>Total 1 episode</span>
          </div>

          {/* Episode 1 (Original) */}
          <EpisodeRow 
            number={1} 
            title="Episode 1" 
            image={story.panels?.[0]} 
            date="2026.04.29" 
            onClick={() => navigate(`/manta/${story._id}?ep=1`)} 
          />

          {/* Additional Episodes */}
          {story.episodes?.map((ep, i) => (
            <EpisodeRow 
                key={ep._id || i}
                number={ep.number || i + 2}
                title={ep.title || `Episode ${ep.number || i + 2}`}
                image={ep.panels?.[0]}
                date={new Date(ep.createdAt).toLocaleDateString()}
                onClick={() => navigate(`/manta/${story._id}?ep=${ep.number || i + 2}`)}
            />
          ))}
          
          <div style={{ marginTop: 24, textAlign: "center", padding: "40px", border: `1px dashed ${COLORS.border}`, borderRadius: 16 }}>
             <Clock size={32} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
             <div style={{ fontSize: 14, color: COLORS.textMuted }}>New episodes arriving soon! Stay tuned.</div>
          </div>
        </section>
      </div>

      {/* ═══ STICKY BOTTOM BUTTON ═══ */}
      <div style={{ 
        position: "fixed", bottom: 0, left: 0, right: 0, padding: "20px 24px",
        background: "linear-gradient(to top, rgba(8,9,10,1) 0%, rgba(8,9,10,0.8) 50%, transparent 100%)",
        zIndex: 100, pointerEvents: "none"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", pointerEvents: "auto" }}>
          <div style={{ display: "flex", gap: 12, padding: "12px", background: "rgba(18,19,21,0.85)", backdropFilter: "blur(20px)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <button 
              onClick={() => navigate(`/manta/${story._id}`)}
              style={{ 
                flex: 1, padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.05)", 
                color: "white", border: "1px solid rgba(255,255,255,0.05)",
                fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              Read Free Ep. 1
            </button>
            <button 
              onClick={() => navigate('/dashboard?page=plans')}
              style={{ 
                flex: 2, padding: "16px", borderRadius: 16, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.rose})`, 
                color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 25px ${COLORS.accent}40`, transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <Star size={18} fill="currentColor" /> Unlock All Episodes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EpisodeRow({ number, title, image, date, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: "flex", gap: 16, padding: 16, borderRadius: 16, 
        background: COLORS.panel, border: "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer", transition: "all 0.2s", marginBottom: 12
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background = COLORS.panel}
    >
      <div style={{ 
        width: 120, height: 80, borderRadius: 8, overflow: "hidden", 
        backgroundImage: `url(${image})`,
        backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0
      }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 10 }}>
          <span>{number === 1 ? "Free" : "Premium"}</span>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.textMuted }} />
          <span>{date}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Play size={20} color={COLORS.textMuted} />
      </div>
    </div>
  );
}

export default SeriesPage;
