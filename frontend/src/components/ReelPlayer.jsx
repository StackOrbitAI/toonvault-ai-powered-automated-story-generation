import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Share2, Heart } from 'lucide-react';
import axios from 'axios';

const COLORS = {
  bg: "#000000",
  accent: "#7C3AED",
  rose: "#F43F8E",
  text: "#FFFFFF",
  textDim: "rgba(255,255,255,0.7)",
};

const PANEL_DURATION = 5000; // 5 seconds per panel

export default function ReelPlayer() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const epNum = parseInt(queryParams.get('ep')) || 1;

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [panels, setPanels] = useState([]);
  const [parsedContent, setParsedContent] = useState([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const requestRef = useRef();
  const previousTimeRef = useRef();
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await axios.get(`/api/stories/${storyId}`);
        const s = res.data;
        
        let targetPanels = s.panels || [];
        let targetContent = s.content || "[]";
        
        if (epNum > 1 && s.episodes) {
          const ep = s.episodes.find(e => e.number === epNum);
          if (ep) {
            targetPanels = ep.panels;
            targetContent = ep.content;
          }
        } else if (s.episodes && s.episodes[0]) {
            targetPanels = s.episodes[0].panels || s.panels;
            targetContent = s.episodes[0].content || s.content;
        }

        let pContent = [];
        try {
          pContent = JSON.parse(targetContent);
        } catch(e) {}

        setStory(s);
        setPanels(targetPanels);
        setParsedContent(pContent);
      } catch (err) {
        console.error("Failed to fetch story for reel", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [storyId, epNum]);

  // Animation Loop for Progress Bar
  const animate = time => {
    if (previousTimeRef.current != undefined && isPlaying) {
      const deltaTime = time - previousTimeRef.current;
      setProgress(prev => {
        const newProgress = prev + (deltaTime / PANEL_DURATION) * 100;
        if (newProgress >= 100) {
          // Move to next panel
          if (currentIndex < panels.length - 1) {
            setCurrentIndex(idx => idx + 1);
            return 0; // Reset progress
          } else {
            // End of reel
            setIsPlaying(false);
            return 100;
          }
        }
        return newProgress;
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!loading && panels.length > 0) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [loading, panels.length, currentIndex, isPlaying]);

  // Handle TTS
  useEffect(() => {
    if (loading || isMuted || !parsedContent[currentIndex]) return;
    
    const text = parsedContent[currentIndex].text;
    const speaker = parsedContent[currentIndex].speaker;
    
    if (text && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Basic voice tuning based on speaker
      if (!speaker || speaker.toLowerCase() === 'narration') {
        utterance.rate = 0.85;
        utterance.pitch = 0.9;
      } else {
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
      }
      
      window.speechSynthesis.speak(utterance);
    }
    
    return () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [currentIndex, loading, isMuted, parsedContent]);

  useEffect(() => {
    if (audioRef.current) {
        if (isPlaying && !isMuted) {
            audioRef.current.play().catch(e => console.log("Audio autoplay prevented"));
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, isMuted]);

  const handleNext = () => {
    if (currentIndex < panels.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
        setProgress(0);
    }
  };

  const handleTouch = (e) => {
    const { clientX } = e.touches ? e.touches[0] : e;
    const width = window.innerWidth;
    if (clientX > width / 2) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: COLORS.accent, fontSize: 24, fontWeight: 'bold' }}>Loading Reel...</div>
      </div>
    );
  }

  if (!panels || panels.length === 0) {
    return (
      <div style={{ background: COLORS.bg, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        No panels found for this episode.
        <button onClick={() => navigate(-1)} style={{ marginLeft: 20, padding: 10, background: COLORS.rose, border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  const currentPanel = panels[currentIndex];
  const currentData = parsedContent[currentIndex] || {};
  const isNarration = !currentData.speaker || currentData.speaker === 'Narration' || currentData.speaker === 'narration';

  return (
    <div 
      style={{ 
        position: 'fixed', inset: 0, background: COLORS.bg, zIndex: 99999,
        display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
      }}
    >
      {/* Background Music */}
      <audio 
        ref={audioRef} 
        src="https://cdn.pixabay.com/audio/2022/10/25/audio_248e89fce1.mp3" 
        loop 
        volume={0.3} 
      />

      {/* Container (Mobile Aspect Ratio) */}
      <div 
        style={{ 
          position: 'relative', width: '100%', maxWidth: 450, height: '100%', 
          maxHeight: 900, background: '#111', overflow: 'hidden', boxShadow: '0 0 50px rgba(0,0,0,0.5)'
        }}
      >
        {/* Progress Bars */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: 4, zIndex: 10 }}>
          {panels.map((_, idx) => (
            <div key={idx} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', background: 'white', 
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
              }} />
            </div>
          ))}
        </div>

        {/* Top Controls */}
        <div style={{ position: 'absolute', top: 24, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900 }}>
              {story?.title?.charAt(0) || 'T'}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{story?.title}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Episode {epNum}</div>
            </div>
          </div>
          <button onClick={() => navigate(`/manta/${storyId}?ep=${epNum}`)} style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Image Viewer with Ken Burns Effect */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1.15, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              scale: { duration: PANEL_DURATION / 1000, ease: "linear" },
              opacity: { duration: 0.4 }
            }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <img 
              src={currentPanel} 
              alt="Panel" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlay for Text */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 30%, transparent 50%, rgba(0,0,0,0.3) 100%)', pointerEvents: 'none', zIndex: 1 }} />

        {/* Touch Navigation Zones */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 5 }}>
          <div style={{ flex: 1 }} onClick={handlePrev} />
          <div style={{ flex: 1 }} onClick={() => setIsPlaying(!isPlaying)} />
          <div style={{ flex: 1 }} onClick={handleNext} />
        </div>

        {/* Bottom Dialogue */}
        <div style={{ position: 'absolute', bottom: 40, left: 20, right: 60, zIndex: 10, pointerEvents: 'none' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {!isNarration && currentData.speaker && (
                <div style={{ fontSize: 13, fontWeight: 900, color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {currentData.speaker}
                </div>
              )}
              {currentData.text && (
                <div style={{ 
                  fontSize: isNarration ? 18 : 20, 
                  fontWeight: 600, 
                  color: 'white', 
                  lineHeight: 1.4,
                  fontStyle: isNarration ? 'italic' : 'normal',
                  fontFamily: isNarration ? "'Georgia', serif" : "'Inter', sans-serif",
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)'
                }}>
                  {currentData.text}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Action Bar */}
        <div style={{ position: 'absolute', bottom: 40, right: 12, display: 'flex', flexDirection: 'column', gap: 20, zIndex: 10 }}>
          <button onClick={() => setLiked(!liked)} style={{ background: 'none', border: 'none', color: liked ? COLORS.rose : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={22} fill={liked ? COLORS.rose : "none"} />
            </div>
          </button>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Share2 size={22} />
            </div>
          </button>
          <button onClick={() => setIsMuted(!isMuted)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </div>
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
