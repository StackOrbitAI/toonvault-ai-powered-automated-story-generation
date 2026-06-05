import React, { useState, useEffect } from 'react';
import { Check, Circle, Star, Lock, Unlock, Bookmark, Info, User, UserCheck, Flame, ShieldAlert, ZoomIn, ZoomOut, RotateCcw, Compass, Map as MapIcon, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const C = {
  plum: "#8B5CF6",
  plumGlow: "rgba(139, 92, 246, 0.4)",
  rose: "#F43F8E",
  amber: "#F59E0B",
  emerald: "#10B981",
  bg: "#0D0B1F",
  surface: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.08)",
  textDim: "rgba(255,255,255,0.4)",
};

export default function StoryMap({ 
  storyId, 
  storyNodes = [], 
  currentNodeId, 
  userReadNodes = [], 
  isBookmarked = false,
  onSelectNode,
  onToggleBookmark,
  onToggleRead,
  userId
}) {
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState('map');

  const isRead = (nodeId) => userReadNodes.some(n => n.nodeId === nodeId);

  return (
    <div style={{ 
      background: "linear-gradient(180deg, rgba(20,18,40,0.6) 0%, rgba(10,8,20,0.8) 100%)", 
      borderRadius: 32, 
      padding: "2px",
      backgroundClip: 'padding-box',
      border: "1px solid rgba(255,255,255,0.08)",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{ padding: 32 }}>
        {/* Decorative Glow */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: C.plumGlow, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
               <MapIcon size={16} color={C.plum} />
               <span style={{ fontSize: 11, fontWeight: 800, color: C.plum, textTransform: 'uppercase', letterSpacing: 1.5 }}>Interactive Storyline</span>
            </div>
            <h3 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "white", letterSpacing: -0.5 }}>Quest Map</h3>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: C.textDim, fontWeight: 500 }}>Uncover the branches of your destiny.</p>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={onToggleBookmark}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 10,
                padding: "10px 20px", borderRadius: 16, 
                background: isBookmarked ? `${C.amber}15` : "rgba(255,255,255,0.05)", 
                border: `1px solid ${isBookmarked ? C.amber : 'rgba(255,255,255,0.1)'}`, 
                color: isBookmarked ? C.amber : "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Bookmark size={16} fill={isBookmarked ? C.amber : 'none'} />
              {isBookmarked ? 'In Vault' : 'Vault'}
            </button>
          </div>
        </div>

        {/* Map Stage */}
        <div style={{ 
          position: "relative", 
          height: 440, 
          border: "1px solid rgba(255,255,255,0.05)", 
          borderRadius: 24,
          background: "rgba(0,0,0,0.4)",
          boxShadow: "inset 0 20px 40px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden"
        }}>
          {/* Grid Pattern Background */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.5 }} />

          <motion.div style={{ 
            position: "relative", 
            width: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: 'center',
            gap: 60,
            scale: zoom,
            transition: { type: "spring", stiffness: 200, damping: 25 }
          }}>
             {storyNodes.length === 0 ? (
               <div style={{ textAlign: 'center' }}>
                 <Compass size={48} color={C.textDim} style={{ marginBottom: 16, opacity: 0.2 }} />
                 <div style={{ color: C.textDim, fontSize: 15, fontWeight: 600 }}>No story paths mapped yet.</div>
               </div>
             ) : (
               <div style={{ display: 'flex', alignItems: 'center', gap: 40, padding: '0 100px' }}>
                  {storyNodes.map((node, idx) => {
                    const active = currentNodeId === node.id;
                    const read = isRead(node.id);
                    const isMine = node.authorId === userId;
                    
                    return (
                      <React.Fragment key={node.id}>
                        {idx > 0 && (
                          <div style={{ position: 'relative', width: 60 }}>
                            <div style={{ width: '100%', height: 3, background: read ? `linear-gradient(90deg, ${C.plum}, ${C.rose})` : "rgba(255,255,255,0.05)", borderRadius: 4 }} />
                            {read && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 14, height: 14, borderRadius: '50%', background: C.plum, border: '3px solid #000' }} />}
                          </div>
                        )}
                        <motion.div 
                          whileHover={{ y: -8, scale: 1.02 }}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          style={{ position: "relative" }}
                        >
                          {active && (
                            <motion.div 
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              style={{ 
                                position: "absolute", top: -45, left: "50%", transform: "translateX(-50%)",
                                background: C.plum, color: "white", fontSize: 10, fontWeight: 900,
                                padding: "6px 14px", borderRadius: 10, textTransform: "uppercase", whiteSpace: "nowrap",
                                boxShadow: `0 10px 20px ${C.plum}44`
                              }}
                            >
                              Current Scene
                            </motion.div>
                          )}
                          
                          <div 
                            onClick={() => node.status !== 'locked' && onSelectNode(node)}
                            style={{ 
                              padding: "24px", borderRadius: 24, 
                              border: `2px solid ${active ? C.plum : (read ? `${C.plum}33` : 'rgba(255,255,255,0.08)')}`, 
                              background: active ? "rgba(139, 92, 246, 0.12)" : "rgba(255,255,255,0.02)", 
                              backdropFilter: 'blur(10px)',
                              color: "white",
                              cursor: node.status === 'locked' ? 'not-allowed' : 'pointer',
                              boxShadow: active ? `0 0 50px ${C.plum}22` : 'none',
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              display: 'flex', flexDirection: 'column', gap: 12,
                              minWidth: 190,
                              position: 'relative',
                              zIndex: 1
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: active ? C.plum : C.textDim, textTransform: 'uppercase' }}>{node.label || `Scene ${idx + 1}`}</span>
                              <div style={{ display: 'flex', gap: 6 }}>
                                {node.isAgeRestricted && <div title="Mature Content" style={{ padding: 4, borderRadius: 6, background: `${C.rose}15` }}><ShieldAlert size={12} color={C.rose} /></div>}
                                {node.isPopular && <div title="Trending" style={{ padding: 4, borderRadius: 6, background: `${C.amber}15` }}><Flame size={12} color={C.amber} /></div>}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                               <div style={{ fontSize: 15, fontWeight: 800, filter: node.status === 'locked' ? 'blur(4px)' : 'none', flex: 1 }}>{node.title || 'Unknown Path'}</div>
                               {node.status === 'locked' ? <Lock size={16} color={C.textDim} /> : (read ? <Check size={16} color={C.emerald} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${C.textDim}` }} />)}
                            </div>

                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {isMine ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${C.plum}15`, padding: '4px 8px', borderRadius: 8 }}>
                                      <User size={10} color={C.plum} />
                                      <span style={{ fontSize: 9, fontWeight: 700, color: C.plum }}>MINE</span>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 8 }}>
                                      <UserCheck size={10} color={C.textDim} />
                                      <span style={{ fontSize: 9, fontWeight: 700, color: C.textDim }}>CREATOR</span>
                                    </div>
                                  )}
                               </div>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); onToggleRead(node.id); }}
                                 style={{ 
                                   background: read ? `${C.emerald}15` : 'rgba(255,255,255,0.05)', 
                                   border: 'none', borderRadius: 10, padding: '6px 10px',
                                   color: read ? C.emerald : C.textDim,
                                   fontSize: 10, fontWeight: 800,
                                   cursor: 'pointer', transition: 'all 0.2s'
                                 }}
                               >
                                 {read ? 'READ' : 'MARK READ'}
                               </button>
                            </div>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
               </div>
             )}
          </motion.div>
        </div>

        {/* Footer: Legend & Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
          {/* Legend Chips */}
          <div style={{ display: "flex", gap: 12, flexWrap: 'wrap', maxWidth: '70%' }}>
             {[
               { icon: <Check size={12} />, color: C.emerald, label: "Read" },
               { icon: <Bookmark size={12} />, color: C.amber, label: "Vaulted" },
               { icon: <ShieldAlert size={12} />, color: C.rose, label: "18+" },
               { icon: <Flame size={12} />, color: C.amber, label: "Popular" },
               { icon: <User size={12} />, color: C.plum, label: "My Choice" },
             ].map((l, i) => (
               <div key={i} style={{ 
                 display: "flex", alignItems: "center", gap: 8, 
                 fontSize: 11, color: "white", fontWeight: 700, 
                 background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: 10,
                 border: '1px solid rgba(255,255,255,0.05)'
               }}>
                  <span style={{ color: l.color }}>{l.icon}</span> <span>{l.label}</span>
               </div>
             ))}
          </div>

          {/* Zoom Control Group */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.3)", padding: "4px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
             <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} style={{ padding: 10, background: "none", border: "none", color: "white", cursor: "pointer", borderRadius: 12 }}><ZoomOut size={16} /></button>
             <div style={{ fontSize: 12, fontWeight: 800, color: "white", width: 40, textAlign: "center" }}>{Math.round(zoom * 100)}%</div>
             <button onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))} style={{ padding: 10, background: "none", border: "none", color: "white", cursor: "pointer", borderRadius: 12 }}><ZoomIn size={16} /></button>
             <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
             <button onClick={() => setZoom(1)} style={{ padding: 10, background: "none", border: "none", color: "white", cursor: "pointer", borderRadius: 12 }}><RotateCcw size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
