import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, Heart, Share2, Play, Users, Star, ChevronRight, AlertTriangle, Info, Clock, BookOpen, Map as MapIcon, Check
} from 'lucide-react';
import StoryMap from './StoryMap';
import axios from 'axios';

/* 
  NOTE: For Runware.ai integration, you can use their SDK or REST API.
  Example usage with a real API key:
  const fetchRunwareImage = async (prompt) => {
    // Call Runware API to generate image
  }
*/

const CHARACTERS = [
  { name: 'Seraphine', role: 'Protagonist', emoji: '👸', bio: 'A voiceless princess with iron will. Commands armies through written words alone.' },
  { name: 'Kaizen', role: 'Love interest', emoji: '🗡️', bio: 'A shadow spy who sold his loyalty to the highest bidder — until now.' },
  { name: 'Empress Vael', role: 'Antagonist', emoji: '👑', bio: 'Rules through beautiful deception. Never makes a move without three backup plans.' },
  { name: 'Lyra', role: 'Ally', emoji: '🌿', bio: 'Seraphine\'s only true friend. An herbalist who knows more than she lets on.' },
];

const RELATIONSHIPS = [
  { a: 'Seraphine', b: 'Kaizen', type: 'love', label: 'Slow burn tension' },
  { a: 'Seraphine', b: 'Lyra', type: 'friends', label: 'Best friends' },
  { a: 'Seraphine', b: 'Empress Vael', type: 'enemies', label: 'Sworn enemies' },
  { a: 'Kaizen', b: 'Empress Vael', type: 'rivals', label: 'Complicated history' },
];

const REL_COLORS = {
  love: 'rel-love',
  friends: 'rel-friends',
  enemies: 'rel-enemies',
  rivals: 'rel-rivals',
};

export default function StoryPage({ stories = [], user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedChar, setSelectedChar] = useState(null);
  const [followed, setFollowed] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('episodes'); // episodes | about | characters | map
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoryDetails = async () => {
      try {
        const res = await axios.get(`/api/stories/${id}`);
        const s = res.data;
        // Map backend schema to what StoryPage expects
        const mappedStory = {
          id: s._id,
          title: s.title,
          logline: s.description || "No description available.",
          image: s.panels && s.panels.length > 0 ? s.panels[0] : (s.coverIcon || "📖"),
          tags: s.genre ? [s.genre] : ['Fantasy'],
          tagTypes: ['tag-genre'],
          rating: s.genre?.toLowerCase() === 'mature' ? 'R' : 'PG',
          genre: s.genre || 'Fantasy',
          episodes: s.episodes && s.episodes.length > 0 ? s.episodes.length + 1 : 1,
          completion: s.status === 'Live' ? 100 : 50,
          readers: s.views > 1000 ? (s.views / 1000).toFixed(1) + 'K' : s.views || '1.2K',
          score: s.rating || 4.9,
          nodes: s.nodes || [],
          currentNodeId: s.nodes && s.nodes.length > 0 ? s.nodes[s.nodes.length - 1].id : 's4',
          dbEpisodes: s.episodes || []
        };
        setStory(mappedStory);
      } catch (err) {
        console.warn("Could not fetch story from backend. Falling back to local data.", err.message);
        // Fallback to local search in stories prop
        const localStory = stories.find(s => String(s.id) === id);
        if (localStory) {
          setStory({
            id: localStory.id,
            title: localStory.title,
            logline: localStory.description || "A mystical story in ToonVault.",
            image: localStory.image || "/src/assets/lemon_forest.png",
            tags: localStory.tags || ['Fantasy'],
            tagTypes: ['tag-genre'],
            rating: 'PG',
            genre: localStory.genre || 'Fantasy',
            episodes: localStory.episodes || 1,
            completion: 45,
            readers: '12.5K',
            score: localStory.score || 4.9,
            nodes: localStory.nodes || [],
            currentNodeId: 's4'
          });
        } else {
          // Absolute fallback
          setStory({
            id: id,
            title: id === '69f7365c1cd954ae93abb532' ? "The Lemon Forest" : "The Silent Crown",
            logline: id === '69f7365c1cd954ae93abb532' 
              ? "A mystical journey through a forest where lemons glow with ancient magic and secrets are hidden in the peel."
              : "A voiceless princess must reclaim her throne with nothing but courage—and the spy she should never trust.",
            image: id === '69f7365c1cd954ae93abb532' 
              ? "/src/assets/lemon_forest.png"
              : "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80",
            tags: ['Fantasy', 'Adventure', 'Magic'], 
            tagTypes: ['tag-genre', 'tag-teal', 'tag-mood'],
            rating: 'PG', 
            genre: 'Fantasy', 
            episodes: 15, 
            completion: 45,
            readers: '12.5K',
            score: 4.9,
            nodes: [],
            currentNodeId: 's4'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStoryDetails();
  }, [id, stories]);

  if (loading) {
    return (
      <div style={{ background: "#0f111a", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#7C3AED", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ border: "4px solid rgba(124, 58, 237, 0.1)", borderTop: "4px solid #7C3AED", borderRadius: "50%", width: 50, height: 50, animation: "spin 1s linear infinite", marginBottom: 16 }}></div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Loading story...</div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  const localUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u && u !== 'undefined' ? JSON.parse(u) : null;
    } catch(e) { return null; }
  })();

  const activeUser = user || localUser;
  const isMatureGated = story.rating === 'R' &&
    localStorage.getItem('age_consent') !== 'true' &&
    localStorage.getItem('tv_mature_consent') !== 'true' &&
    (!activeUser || activeUser.age < 18);

  return (
    <div className="story-page-container fade-in">
      {/* Background Blur Hero */}
      <div className="story-hero-bg" style={{ backgroundImage: `url(${story.image})` }}></div>
      
      <div className="story-content-wrapper">
        {/* Top Navigation */}
        <div className="story-top-nav">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20}/>
          </button>
          <div className="story-nav-actions">
            <button className={`nav-icon-btn ${bookmarked ? 'active' : ''}`} onClick={() => setBookmarked(!bookmarked)}>
              <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'}/>
            </button>
            <button className="nav-icon-btn">
              <Share2 size={20}/>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="story-hero-main">
          <div className="story-cover-wrapper">
            <img 
              src={story.image} 
              alt={story.title} 
              className="story-main-cover" 
              style={{ filter: isMatureGated ? 'blur(20px)' : 'none', transition: 'filter 0.5s' }}
            />
            <div className="cover-badge">{story.rating}</div>
            {isMatureGated && (
               <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", color: "white", padding: 16, textAlign: "center", zIndex: 10 }}>
                  <div>
                    <AlertTriangle size={24} color="#F43F8E" style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 12, fontWeight: 800 }}>Mature Content</div>
                  </div>
               </div>
            )}
          </div>

          <div className="story-primary-info">
            <div className="story-tags">
              {story.tags?.map((tag, i) => (
                <span key={tag} className={`premium-tag ${story.tagTypes?.[i] || 'tag-genre'}`}>{tag}</span>
              ))}
            </div>
            <h1 className="premium-title">{story.title}</h1>
            <div className="story-stats-row">
              <div className="stat-item">
                <Star size={16} fill="var(--amber)" color="var(--amber)"/>
                <span>{story.score || 4.8}</span>
              </div>
              <div className="stat-item">
                <Users size={16}/>
                <span>{story.readers || '3.2K'}</span>
              </div>
              <div className="stat-item">
                <Clock size={16}/>
                <span>Updated Mon</span>
              </div>
            </div>
            
            <p className="story-description">
              {story.logline}
            </p>

            <div className="story-main-actions">
              <button className="read-now-btn" onClick={() => navigate(`/manta/${story.id}?ep=1`)}>
                <Play size={18} fill="currentColor"/>
                <span>Read First Episode</span>
              </button>
              <button 
                className={`follow-btn ${followed ? 'followed' : ''}`} 
                onClick={() => setFollowed(!followed)}
              >
                <Heart size={18} fill={followed ? 'currentColor' : 'none'}/>
                <span>{followed ? 'Following' : 'Follow'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="story-tabs-container">
          <div className="story-tabs">
            <button className={`tab-btn ${activeTab === 'episodes' ? 'active' : ''}`} onClick={() => setActiveTab('episodes')}>
              Episodes <span>{story.episodes}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
              About
            </button>
            <button className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
              Story Map
            </button>
            <button className={`tab-btn ${activeTab === 'characters' ? 'active' : ''}`} onClick={() => setActiveTab('characters')}>
              Characters
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'episodes' && (
              <div className="episodes-list">
                {/* Dynamic Pilot Episode */}
                <div className="episode-card" onClick={() => navigate(`/manta/${story.id}?ep=1`)}>
                  <div className="ep-thumbnail" style={{ backgroundImage: `url(${story.image})`, filter: isMatureGated ? 'blur(10px)' : 'none' }}>
                    <div className="ep-overlay"><Play size={16} fill="white"/></div>
                  </div>
                  <div className="ep-info">
                    <div className="ep-title">Episode 1: The Beginning</div>
                    <div className="ep-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>May 22, 2026</span>
                      <span style={{ color: 'var(--primary)' }}>#1</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="ep-arrow"/>
                </div>

                {/* Additional dynamic database episodes if present */}
                {story.dbEpisodes && story.dbEpisodes.length > 0 ? (
                  story.dbEpisodes.map((ep) => (
                    <div key={ep.number} className="episode-card" onClick={() => navigate(`/manta/${story.id}?ep=${ep.number}`)}>
                      <div className="ep-thumbnail" style={{ backgroundImage: `url(${ep.panels && ep.panels.length > 0 ? ep.panels[0] : story.image})`, filter: isMatureGated ? 'blur(10px)' : 'none' }}>
                        <div className="ep-overlay"><Play size={16} fill="white"/></div>
                      </div>
                      <div className="ep-info">
                        <div className="ep-title">{ep.title || `Episode ${ep.number}`}</div>
                        <div className="ep-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>May 22, 2026</span>
                          <span style={{ color: 'var(--primary)' }}>#{ep.number}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="ep-arrow"/>
                    </div>
                  ))
                ) : (
                  // Hardcoded fallback episodes if no DB episodes
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="episode-card" onClick={() => navigate(`/manta/${story.id}?ep=${i + 2}`)}>
                      <div className="ep-thumbnail" style={{ backgroundImage: `url(${story.image})`, filter: isMatureGated ? 'blur(10px)' : 'none' }}>
                        <div className="ep-overlay"><Play size={16} fill="white"/></div>
                      </div>
                      <div className="ep-info">
                        <div className="ep-title">Episode {i + 2}: {i === 0 ? "Golden Secrets" : i === 1 ? "Hidden Paths" : i === 2 ? "Silent Alliance" : "The Climax"}</div>
                        <div className="ep-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>May 22, 2026</span>
                          <span style={{ color: 'var(--primary)' }}>#{i + 2}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="ep-arrow"/>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="about-content">
                <div className="about-card">
                  <h3>Story Summary</h3>
                  <p>{story.logline}</p>
                  <div className="story-details-grid">
                    <div className="detail-item">
                      <BookOpen size={16}/>
                      <span>Genre: {story.genre}</span>
                    </div>
                    <div className="detail-item">
                      <Info size={16}/>
                      <span>Rating: {story.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relationship-section">
                  <h3>Relationship Map</h3>
                  <div className="rel-map-premium">
                    {RELATIONSHIPS.map((r, i) => (
                      <div key={i} className="rel-card-premium">
                        <span className={`rel-badge ${REL_COLORS[r.type]}`}>{r.type}</span>
                        <div className="rel-entities">
                          <span>{r.a}</span>
                          <span className="rel-arrow">↔</span>
                          <span>{r.b}</span>
                        </div>
                        <div className="rel-label">{r.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="story-map-tab-content fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
                <div className="story-map-main">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div style={{ padding: "16px 24px", background: "rgba(124, 58, 237, 0.05)", borderRadius: 20, border: "1px solid rgba(124, 58, 237, 0.1)", flex: 1 }}>
                       <div style={{ fontSize: 13, color: "#A78BFA", fontWeight: 900, marginBottom: 8, letterSpacing: 1 }}>CURRENT STORYLINE</div>
                       <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Hearts of Ash: Scene 4</h2>
                       <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>"If we tell them the truth, everything burns."</p>
                    </div>
                  </div>

                  <StoryMap 
                    storyNodes={story.nodes || []} 
                    currentNodeId={story.currentNodeId || 's4'}
                    onSelectNode={(id, action) => console.log('Action:', action, 'Node:', id)}
                  />
                  
                  {/* Community Choice (What Happens Next Preview) */}
                  <div style={{ marginTop: 32, padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                       <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>My Vault</h3>
                       <div style={{ display: "flex", gap: 16 }}>
                          {['Continue', 'Unlocked', 'Favorites'].map(tab => (
                            <span key={tab} style={{ fontSize: 11, fontWeight: 700, color: tab === 'Continue' ? "#A78BFA" : "rgba(255,255,255,0.4)", cursor: "pointer", borderBottom: tab === 'Continue' ? "2px solid #A78BFA" : "none", paddingBottom: 4 }}>{tab}</span>
                          ))}
                       </div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                       {[
                         { title: 'Hearts of Ash', desc: 'You chose: Protect the Secret', ep: 'Chapter 7, Scene 4', image: story.image },
                         { title: 'Shadow School', desc: 'You chose: Join the Rebels', ep: 'Chapter 5, Scene 2', image: "https://images.unsplash.com/photo-1534447677768-be436bb09401" },
                       ].map((v, i) => (
                         <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.02)" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundImage: `url(${v.image})`, backgroundSize: "cover" }} />
                            <div style={{ flex: 1 }}>
                               <div style={{ fontSize: 13, fontWeight: 800 }}>{v.title}</div>
                               <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{v.desc}</div>
                            </div>
                            <button style={{ padding: "6px 12px", borderRadius: 8, background: "#7C3AED", color: "white", fontSize: 10, fontWeight: 900, border: "none" }}>Continue</button>
                         </div>
                       ))}
                    </div>
                    <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#A78BFA", fontWeight: 700, cursor: "pointer" }}>View all in your Vault →</div>
                  </div>
                </div>

                <div className="story-dashboard-sidebar" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {/* Fan Vote */}
                  <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 24, padding: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Fan Vote</h3>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>28.3K total</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { id: 'A', label: 'Protect Secret', pct: 48, color: '#7C3AED' },
                        { id: 'B', label: 'Follow Heart', pct: 23, color: '#F43F8E' },
                        { id: 'C', label: 'Chase Truth', pct: 16, color: '#10B981' },
                        { id: 'D', label: 'Write Own Turn', pct: 13, color: '#F59E0B' },
                      ].map(v => (
                        <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: v.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>{v.id}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 700 }}>{v.label}</span>
                              <span style={{ fontSize: 11, fontWeight: 900 }}>{v.pct}%</span>
                            </div>
                            <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: `${v.pct}%`, height: "100%", background: v.color }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Comment */}
                  <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 24, padding: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 900 }}>Top Comment</h3>
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                       <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F43F8E" }} />
                       <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                             <span style={{ fontSize: 12, fontWeight: 800 }}>LunaDreams</span>
                             <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>5m ago</span>
                          </div>
                          <p style={{ fontSize: 12, lineHeight: 1.5, margin: "4px 0 8px", color: "rgba(255,255,255,0.7)" }}>A is safer, but B is the one that hurts in the best way. My heart is split!</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                             <Heart size={12} fill="#F43F8E" color="#F43F8E" />
                             <span style={{ fontSize: 10, fontWeight: 700 }}>128</span>
                             <span style={{ fontSize: 10, color: "#A78BFA", marginLeft: 12, fontWeight: 700 }}>Reply</span>
                          </div>
                       </div>
                    </div>
                    <div style={{ textAlign: "center", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 11, color: "#A78BFA", fontWeight: 700, cursor: "pointer" }}>View all comments (36)</div>
                  </div>

                  {/* About Creator */}
                  <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 24, padding: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 900 }}>About the Creator</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                       <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #F43F8E)" }} />
                       <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                             <span style={{ fontWeight: 800, fontSize: 14 }}>Starryink</span>
                             <Check size={12} color="#10B981" />
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>12.4K Followers</div>
                       </div>
                       <button style={{ padding: "6px 14px", borderRadius: 10, background: "rgba(124, 58, 237, 0.1)", border: "1px solid #7C3AED", color: "white", fontSize: 11, fontWeight: 700 }}>Follow</button>
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>
                       I write stories about love, choices, and the magic in between.
                    </p>
                    <div style={{ marginTop: 16, fontSize: 11, color: "#A78BFA", fontWeight: 700, textAlign: "center", cursor: "pointer" }}>View Creator Profile</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'characters' && (
              <div className="characters-grid">
                {CHARACTERS.map(c => (
                  <div key={c.name} className={`char-card-premium ${selectedChar?.name === c.name ? 'selected' : ''}`} onClick={() => setSelectedChar(selectedChar?.name === c.name ? null : c)}>
                    <div className="char-avatar">{c.emoji}</div>
                    <div className="char-info">
                      <div className="char-name">{c.name}</div>
                      <div className="char-role">{c.role}</div>
                    </div>
                    {selectedChar?.name === c.name && (
                      <div className="char-bio-overlay">
                        <p>{c.bio}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .story-page-container {
          position: relative;
          min-height: 100vh;
          background: #0f111a;
          color: white;
          overflow-x: hidden;
        }

        .story-hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 600px;
          background-size: cover;
          background-position: center;
          filter: blur(80px) brightness(0.4);
          opacity: 0.6;
          z-index: 0;
          mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
        }

        .story-content-wrapper {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px;
        }

        .story-top-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .back-btn, .nav-icon-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }

        .nav-icon-btn.active {
          background: var(--primary);
          border-color: var(--primary);
        }

        .story-hero-main {
          display: flex;
          gap: 48px;
          margin-bottom: 60px;
          align-items: flex-start;
        }

        .story-cover-wrapper {
          position: relative;
          flex-shrink: 0;
          width: 320px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          border-radius: 20px;
          overflow: hidden;
        }

        .story-main-cover {
          width: 100%;
          aspect-ratio: 2/3;
          object-fit: cover;
          display: block;
        }

        .cover-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(5px);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
        }

        .premium-tag {
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          margin-right: 8px;
          background: rgba(108, 62, 244, 0.2);
          color: #a78bfa;
          border: 1px solid rgba(167, 139, 250, 0.3);
        }

        .premium-title {
          font-size: 48px;
          font-weight: 900;
          margin: 16px 0;
          line-height: 1.1;
          letter-spacing: -1.5px;
          background: linear-gradient(to right, #fff, #ccc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .story-stats-row {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          color: rgba(255,255,255,0.6);
          font-size: 14px;
          font-weight: 600;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .story-description {
          font-size: 17px;
          line-height: 1.6;
          color: rgba(255,255,255,0.7);
          margin-bottom: 32px;
          max-width: 600px;
        }

        .story-main-actions {
          display: flex;
          gap: 16px;
        }

        .read-now-btn {
          background: white;
          color: black;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.2s;
        }

        .follow-btn {
          background: rgba(255,255,255,0.1);
          color: white;
          padding: 14px 24px;
          border-radius: 14px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .follow-btn.followed {
          background: rgba(240, 80, 122, 0.15);
          color: #f0507a;
          border-color: rgba(240, 80, 122, 0.3);
        }

        .story-tabs {
          display: flex;
          gap: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 32px;
        }

        .tab-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          padding: 16px 0;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          position: relative;
        }

        .tab-btn span {
          font-size: 12px;
          opacity: 0.5;
          margin-left: 4px;
        }

        .tab-btn.active {
          color: white;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary);
          border-radius: 3px;
        }

        .episode-card {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: background 0.2s;
        }

        .episode-card:hover {
          background: rgba(255,255,255,0.05);
        }

        .ep-num {
          width: 40px;
          font-size: 18px;
          font-weight: 900;
          opacity: 0.3;
        }

        .ep-thumbnail {
          width: 80px;
          aspect-ratio: 1;
          border-radius: 8px;
          background-size: cover;
          background-position: top;
          position: relative;
          margin-right: 16px;
        }

        .ep-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .episode-card:hover .ep-overlay {
          opacity: 1;
        }

        .ep-info {
          flex: 1;
        }

        .ep-title {
          font-weight: 700;
          margin-bottom: 4px;
        }

        .ep-meta {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
        }

        .characters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }

        .char-card-premium {
          background: rgba(255,255,255,0.03);
          padding: 20px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .char-avatar {
          font-size: 32px;
        }

        .char-name {
          font-weight: 800;
          font-size: 15px;
        }

        .char-role {
          font-size: 12px;
          color: var(--primary);
          font-weight: 700;
        }

        .char-bio-overlay {
          position: absolute;
          inset: 0;
          background: var(--primary);
          padding: 15px;
          font-size: 12px;
          display: flex;
          align-items: center;
          animation: fadeIn 0.2s ease;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .story-hero-main {
            flex-direction: column;
            gap: 30px;
            align-items: center;
            text-align: center;
          }
          .story-cover-wrapper {
            width: 240px;
          }
          .premium-title {
            font-size: 36px;
          }
          .story-stats-row {
            justify-content: center;
          }
          .story-description {
            margin: 0 auto 32px;
          }
          .story-main-actions {
            justify-content: center;
          }
        }

        @media (max-width: 600px) {
          .ep-thumbnail {
            width: 80px;
          }
          .ep-num {
            width: 20px;
            font-size: 14px;
          }
          .story-main-actions {
            flex-direction: column;
          }
          .premium-title {
            font-size: 28px;
          }
        }
      `}} />
    </div>
  );
}
