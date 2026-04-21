import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, MessageCircle, Share2, CornerUpLeft, Sparkles, Flame, Coins } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('https://toonvault.com', { path: '/socket.io' });

function Reader() {
  const { storyId = 1 } = useParams();
  const navigate = useNavigate();
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [wallet, setWallet] = useState(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const leftLabelOpacity = useTransform(x, [-150, -50], [1, 0]);
  const rightLabelOpacity = useTransform(x, [50, 150], [0, 1]);

  useEffect(() => {
    fetchStartNode();
    fetchWallet();
    
    socket.on('stat_update', ({ linkId, newStats }) => {
      setStats(prev => ({ ...prev, [linkId]: newStats }));
    });
    return () => socket.off('stat_update');
  }, [storyId]);

  const fetchWallet = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('/api/wallet/balance', { headers: { Authorization: `Bearer ${token}` } });
      setWallet(res.data);
    } catch (err) {}
  };

  const fetchStartNode = async () => {
    try {
      const res = await axios.get(`/api/nodes/start/${storyId}`);
      const nodeData = await axios.get(`/api/nodes/${res.data.id}`);
      setCurrentNode(nodeData.data);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  const handleDragEnd = (event, info) => {
    const threshold = 120;
    if (info.offset.x > threshold && currentNode.choices?.[1]) {
      handleChoice(currentNode.choices[1]);
    } else if (info.offset.x < -threshold && currentNode.choices?.[0]) {
      handleChoice(currentNode.choices[0]);
    }
  };

  const handleChoice = async (choice) => {
    try {
      await axios.post(`/api/choices/${choice.id}`);
      const res = await axios.get(`/api/nodes/${choice.target_node_id}`);
      setHistory([...history, currentNode]);
      setCurrentNode(res.data);
      x.set(0);
    } catch (err) { console.error(err); }
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentNode(prev);
    x.set(0);
  };

  if (loading) return (
    <div className="loading-screen">
      <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity }}>
        <Sparkles size={48} color="#ff8da1" />
      </motion.div>
    </div>
  );

  return (
    <div className="reader-container">
      <header className="reader-nav">
        <div className="brand" onClick={() => navigate('/')}>
          <Sparkles className="brand-icon" size={24} />
          <h1>Toonvault</h1>
        </div>
        <div className="nav-actions">
           {wallet && (
             <div className="wallet-badge glass-morphism" onClick={() => navigate('/store')}>
                <Coins size={16} />
                <span>{wallet.balance}</span>
             </div>
           )}
           <button onClick={() => navigate('/user')} className="p-2 glass-morphism rounded-full">
              <Heart size={18} />
           </button>
        </div>
      </header>

      <main className="viewer-area">
        <AnimatePresence mode="wait">
          {currentNode && (
            <div className="card-wrapper">
              <motion.div
                key={currentNode.id}
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="story-card glass-morphism"
              >
                <div className="card-media" style={{ backgroundImage: `url(${currentNode.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23'})` }}>
                  <div className="gradient-overlay"></div>
                </div>

                <div className="card-body">
                  <div className="node-marker">
                    <Flame size={14} />
                    <span>Live Choice</span>
                  </div>
                  <h2 className="scene-title">{currentNode.title}</h2>
                  <p className="scene-text">{currentNode.content}</p>
                </div>

                <div className="card-footer">
                  <div className="social-stats">
                     <div className="stat-item"><Heart size={20} /><span>2k</span></div>
                  </div>
                  {history.length > 0 && (
                    <button onClick={goBack} className="back-btn glass-morphism"><CornerUpLeft size={18} /></button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Reader;
