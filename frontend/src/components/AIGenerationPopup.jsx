import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Image as ImageIcon, Book, Zap, Rocket, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api';

const C = {
  bg: "#0D0B1A",
  card: "#120F24",
  plum: "#8B5CF6",
  rose: "#F43F8E",
  text: "#F1EEF9",
  textDim: "#6B6789",
  gradient: "linear-gradient(135deg, #8B5CF6 0%, #F43F8E 100%)",
  border: "rgba(255,255,255,0.08)",
};

export default function AIGenerationPopup({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    type: 'comic',
    genre: 'Fantasy',
    prompt: '',
    panels: 4,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      // Mocking step delay for professional feel
      setStep(4); 
      const res = await api.generateStory({
        topic: formData.title,
        prompt: formData.prompt,
        images: formData.panels,
        category: formData.genre,
        type: formData.type,
        status: "Draft"
      });
      setResult(res.data.story);
      setStep(5);
      if (onComplete) onComplete(res.data.story);
    } catch (e) {
      setError(e.response?.data?.error || "AI Generation failed. Please check your API keys in Settings.");
      setStep(2); // Go back to prompt
    } finally {
      setLoading(false);
    }
  };

  const GENRES = ["Fantasy", "Romance", "Action", "Drama", "Horror", "Sci-Fi", "Comedy"];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(5,4,12,0.9)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: C.card, width: "100%", maxWidth: 650, borderRadius: 32,
        overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: "0 30px 100px rgba(0,0,0,0.6)",
        position: "relative"
      }}>
        {/* Progress Bar */}
        {step < 5 && (
          <div style={{ height: 4, background: "rgba(255,255,255,0.05)", width: "100%" }}>
            <div style={{ height: "100%", background: C.plum, width: `${(step / 4) * 100}%`, transition: "width 0.5s ease" }} />
          </div>
        )}

        {/* Close Button */}
        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: 20, width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)", border: "none", color: "white", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>×</button>

        <div style={{ padding: 40 }}>
          {step === 1 && (
            <div className="animate-in">
              <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(139,92,246,0.15)", color: C.plum, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <Rocket size={32} />
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Choose Story Type</h2>
              <p style={{ color: C.textDim, marginBottom: 32 }}>Select how you want to present your masterpiece.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div onClick={() => { setFormData({...formData, type: 'comic'}); nextStep(); }} style={{
                  padding: 24, borderRadius: 24, background: formData.type === 'comic' ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
                  border: `2px solid ${formData.type === 'comic' ? C.plum : "transparent"}`, cursor: "pointer", transition: "all 0.2s"
                }}>
                  <ImageIcon size={32} color={C.plum} style={{ marginBottom: 16 }} />
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Visual Comic</div>
                  <div style={{ fontSize: 12, color: C.textDim }}>AI-generated panels and dialogues.</div>
                </div>
                <div onClick={() => { setFormData({...formData, type: 'novel'}); nextStep(); }} style={{
                  padding: 24, borderRadius: 24, background: formData.type === 'novel' ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
                  border: `2px solid ${formData.type === 'novel' ? C.plum : "transparent"}`, cursor: "pointer", transition: "all 0.2s"
                }}>
                  <Book size={32} color={C.rose} style={{ marginBottom: 16 }} />
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Interactive Novel</div>
                  <div style={{ fontSize: 12, color: C.textDim }}>Text-heavy with cinematic AI covers.</div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in">
              <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Story Concept</h2>
              <p style={{ color: C.textDim, marginBottom: 32 }}>What is the core idea of your story?</p>
              
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase" }}>Story Title</label>
                <input 
                  autoFocus
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. The Chrono Knight"
                  style={{ width: "100%", padding: "16px 20px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: "white", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase" }}>AI Prompt / Plot</label>
                <textarea 
                  value={formData.prompt}
                  onChange={e => setFormData({...formData, prompt: e.target.value})}
                  placeholder="A warrior from the future travels back to medieval England..."
                  style={{ width: "100%", height: 120, padding: "16px 20px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, color: "white", outline: "none", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={prevStep} style={{ padding: "14px 24px", borderRadius: 16, background: "none", color: C.textDim, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={nextStep} disabled={!formData.title || !formData.prompt} style={{
                  padding: "14px 32px", borderRadius: 16, background: C.plum, color: "white", border: "none", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: (formData.title && formData.prompt) ? 1 : 0.5
                }}>
                  Next <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in">
              <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Genre & Style</h2>
              <p style={{ color: C.textDim, marginBottom: 32 }}>Fine-tune the vibe of your generated story.</p>
              
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 12, textTransform: "uppercase" }}>Genre</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {GENRES.map(g => (
                    <button key={g} onClick={() => setFormData({...formData, genre: g})} style={{
                      padding: "10px 20px", borderRadius: 12, background: formData.genre === g ? C.plum : "rgba(255,255,255,0.05)",
                      color: "white", border: "none", cursor: "pointer", transition: "all 0.2s", fontWeight: 600
                    }}>{g}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 40 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 12, textTransform: "uppercase" }}>Panel Count (AI Generations)</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[3, 4, 5, 8].map(n => (
                    <button key={n} onClick={() => setFormData({...formData, panels: n})} style={{
                      flex: 1, padding: "14px", borderRadius: 12, background: formData.panels === n ? C.rose : "rgba(255,255,255,0.05)",
                      color: "white", border: "none", cursor: "pointer", transition: "all 0.2s", fontWeight: 700
                    }}>{n} Panels</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={prevStep} style={{ padding: "14px 24px", borderRadius: 16, background: "none", color: C.textDim, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={handleGenerate} style={{
                  padding: "14px 40px", borderRadius: 16, background: C.gradient, color: "white", border: "none", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, boxShadow: `0 10px 30px rgba(139,92,246,0.4)`
                }}>
                  ✨ Generate Story
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 32px" }}>
                <div className="loader-ring" style={{ position: "absolute", inset: 0, border: `4px solid ${C.plum}20`, borderRadius: "50%" }} />
                <div className="loader-spin" style={{ position: "absolute", inset: 0, border: `4px solid transparent`, borderTopColor: C.plum, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={40} color={C.plum} className="pulse" />
                </div>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Generating Your Masterpiece...</h2>
              <p style={{ color: C.textDim, marginBottom: 40, maxWidth: 300, margin: "0 auto" }}>
                Our AI (Runware Flux) is crafting the plot, generating high-fidelity panels, and composing the narrative.
              </p>
              
              <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
                <div className="progress-fill" style={{ height: "100%", background: C.gradient, width: "60%", animation: "progress 10s ease-out forwards" }} />
              </div>
              <div style={{ fontSize: 12, color: C.plum, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Analyzing Plot Structures...</div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in" style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.15)", color: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <CheckCircle size={48} />
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Story Generated!</h2>
              <p style={{ color: C.textDim, marginBottom: 40 }}>Your AI-crafted story "{result?.title}" is ready for its debut.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
                <button onClick={() => window.open(`/manta/${result?._id}`, '_blank')} style={{
                  padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.05)", color: "white", border: "none", fontWeight: 700, cursor: "pointer"
                }}>👁 Preview Story</button>
                <button onClick={onClose} style={{
                  padding: "16px", borderRadius: 16, background: C.plum, color: "white", border: "none", fontWeight: 700, cursor: "pointer"
                }}>📊 Go to Dashboard</button>
              </div>
              
              <div style={{ fontSize: 13, color: C.textDim }}>
                Your story has been saved to your <span style={{ color: C.plum, fontWeight: 700 }}>Drafts</span>.
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 24, padding: "16px 20px", borderRadius: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        .animate-in { animation: fadeUp 0.5s ease-out forwards; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
