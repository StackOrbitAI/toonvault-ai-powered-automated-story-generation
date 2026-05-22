import React, { useState } from 'react';
import { Check, Circle, Star, Lock, Unlock, Bookmark, Info, User, UserCheck, Flame, ShieldAlert, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const C = {
  plum: "#7C3AED",
  plumLight: "#A78BFA",
  rose: "#F43F8E",
  amber: "#F59E0B",
  emerald: "#10B981",
  textDim: "rgba(255,255,255,0.4)",
};

export default function StoryMap({ storyNodes = [], currentNodeId = 's4', onSelectNode }) {
  const [zoom, setZoom] = useState(1);
  
  return (
    <div style={{ 
      background: "rgba(255,255,255,0.02)", 
      borderRadius: 24, 
      padding: 32, 
      border: "1px solid rgba(255,255,255,0.05)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "white" }}>Story Map</h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textDim }}>Hearts of Ash • Chapter 7: After the Fire</p>
        </div>
        <button style={{ 
          padding: "8px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", 
          border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer"
        }}>How it works</button>
      </div>

      {/* Map Content Wrapper */}
      <div style={{ 
        position: "relative", 
        height: 400, 
        border: "1px solid rgba(255,255,255,0.03)", 
        borderRadius: 20,
        background: "rgba(0,0,0,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden"
      }}>
        <motion.div style={{ 
          position: "relative", 
          width: "100%", 
          maxWidth: 900, 
          display: "flex", 
          alignItems: "center", 
          gap: 40,
          scale: zoom,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}>
           {/* Flowchart Scenes */}
           {['Scene 1', 'Scene 2', 'Scene 3'].map((s, i) => (
             <React.Fragment key={i}>
                <div style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", fontSize: 12, color: C.textDim }}>{s}</div>
                <div style={{ width: 30, height: 1, background: "rgba(255,255,255,0.1)" }} />
             </React.Fragment>
           ))}

           {/* Current Node (The Split Point) */}
           <div style={{ position: "relative" }}>
              <div style={{ 
                position: "absolute", top: -32, left: "50%", transform: "translateX(-50%)",
                background: C.plum, color: "white", fontSize: 9, fontWeight: 900,
                padding: "4px 10px", borderRadius: 6, textTransform: "uppercase", whiteSpace: "nowrap"
              }}>You are here</div>
              <div style={{ 
                padding: "16px 24px", borderRadius: 16, border: `2px solid ${C.plum}`, 
                background: "rgba(124, 58, 237, 0.15)", fontSize: 14, fontWeight: 800, color: "white",
                boxShadow: `0 0 30px rgba(124, 58, 237, 0.3)`
              }}>Scene 4</div>
              
              {/* Branching SVG Lines */}
              <svg style={{ position: "absolute", left: "100%", top: "50%", width: 100, height: 260, transform: "translateY(-50%)", overflow: "visible", pointerEvents: "none" }}>
                 <path d="M 0 130 C 40 130, 60 40, 100 40" stroke={`${C.plum}44`} strokeWidth="2" strokeDasharray="6 4" fill="none" />
                 <path d="M 0 130 C 40 130, 60 100, 100 100" stroke={`${C.plum}44`} strokeWidth="2" strokeDasharray="6 4" fill="none" />
                 <path d="M 0 130 C 40 130, 60 160, 100 160" stroke={`${C.plum}44`} strokeWidth="2" strokeDasharray="6 4" fill="none" />
                 <path d="M 0 130 C 40 130, 60 220, 100 220" stroke={`${C.plum}44`} strokeWidth="2" strokeDasharray="6 4" fill="none" />
              </svg>

              {/* Branching Options */}
              <div style={{ position: "absolute", left: 140, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 16 }}>
                 {[
                   { id: 'A', title: 'Protect the Secret', popular: true, read: true, bookmark: true },
                   { id: 'B', title: 'Follow Your Heart', userCreated: true, unread: true },
                   { id: 'C', title: 'Chase the Truth', ageRestricted: true, locked: true },
                   { id: 'D', title: 'Write Your Own Story', dashed: true, unlocked: true },
                 ].map((c, i) => (
                   <div key={i} style={{ 
                     padding: "12px 18px", borderRadius: 14, 
                     border: c.dashed ? "1px dashed rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.08)",
                     background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 8, minWidth: 280,
                     cursor: "pointer", transition: "all 0.2s"
                   }}>
                     <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "white" }}>{c.id}</div>
                     <span style={{ fontSize: 13, fontWeight: 700, flex: 1, color: "white", filter: c.locked ? 'blur(2px)' : 'none' }}>{c.title}</span>
                     {c.ageRestricted && <ShieldAlert size={14} color={C.rose} title="Age Restricted" />}
                     {c.userCreated && <User size={14} color={C.plum} title="Created by you" />}
                     {c.popular && <span style={{ fontSize: 9, fontWeight: 900, color: C.rose, textTransform: "uppercase" }}>Popular</span>}
                     {c.bookmark && <Bookmark size={14} color={C.amber} title="Bookmarked" />}
                     {c.locked ? <Lock size={14} color="rgba(255,255,255,0.1)" title="Locked" /> : (c.unlocked ? <Unlock size={14} color={C.textDim} title="Unlocked" /> : null)}
                     {/* "Mark as Read/Unread" placeholder interaction */}
                     <div title={c.read ? "Mark as unread" : "Mark as read"} style={{ cursor: 'pointer' }}>
                       {c.read ? <Check size={14} color={C.emerald} /> : (c.unread ? <Circle size={14} color={C.textDim} /> : null)}
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </motion.div>
      </div>

      {/* Footer: Legend & Zoom */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40 }}>
        {/* Legend */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 32px" }}>
           {[
             { icon: <Check size={14} color={C.emerald} />, label: "Read" },
             { icon: <Circle size={14} color={C.textDim} />, label: "Unread" },
             { icon: <Bookmark size={14} color={C.amber} />, label: "Bookmarked" },
             { icon: <Unlock size={14} color={C.textDim} />, label: "Unlocked" },
             { icon: <Lock size={14} color="rgba(255,255,255,0.1)" />, label: "Locked" },
             { icon: <ShieldAlert size={14} color={C.rose} />, label: "Age restricted" },
             { icon: <Flame size={14} color={C.rose} />, label: "Popular" },
             { icon: <User size={14} color={C.plum} />, label: "Created by you" },
             { icon: <UserCheck size={14} color={C.plumLight} />, label: "By another user" },
           ].map((l, i) => (
             <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: C.textDim, fontWeight: 600 }}>
                {l.icon} <span>{l.label}</span>
             </div>
           ))}
        </div>

        {/* Zoom Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
           <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} style={{ padding: 8, background: "none", border: "none", color: "white", cursor: "pointer" }}><ZoomOut size={18} /></button>
           <div style={{ fontSize: 11, fontWeight: 900, color: C.textDim, width: 44, textAlign: "center" }}>{Math.round(zoom * 100)}%</div>
           <button onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))} style={{ padding: 8, background: "none", border: "none", color: "white", cursor: "pointer" }}><ZoomIn size={18} /></button>
           <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
           <button onClick={() => setZoom(1)} style={{ padding: 8, background: "none", border: "none", color: "white", cursor: "pointer" }}><RotateCcw size={18} /></button>
        </div>
      </div>
    </div>
  );
}
