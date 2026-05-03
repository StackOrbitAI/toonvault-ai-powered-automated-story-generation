import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, User, Lock, Mail, Phone, MapPin, CreditCard, ShieldCheck, Check, Facebook, Linkedin, Apple, Github, Instagram, Twitter, ArrowRight, Zap, Trophy, Rocket, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

const C = {
  bg: "#050408",
  surface: "#0D0B1A",
  card: "#120F24",
  cardBorder: "rgba(255,255,255,0.06)",
  plum: "#8B5CF6",
  plumGlow: "rgba(139,92,246,0.2)",
  rose: "#F43F8E",
  roseGlow: "rgba(244,63,142,0.2)",
  gold: "#F59E0B",
  text: "#F1EEF9",
  textDim: "#6B6789",
  gradient: "linear-gradient(135deg, #8B5CF6 0%, #F43F8E 100%)",
};

export default function Login({ type = 'user' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1); 
  const [paypalEnabled, setPaypalEnabled] = useState(true);
  const [settings, setSettings] = useState({ site_name: "ToonVault" });
  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    plan: 'Free',
    phone: '',
    address: { street: '', city: '', state: '', zip: '', country: 'USA' },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined') {
      try {
        const u = JSON.parse(user);
        if (u && u.id) {
          navigate('/dashboard');
          return;
        }
      } catch (e) {}
    }

    const params = new URLSearchParams(location.search);
    const planParam = params.get('plan');
    const isRegParam = params.get('register');
    if (planParam) {
      setFormData(prev => ({ ...prev, plan: planParam }));
      setIsRegister(true);
    }
    if (isRegParam === 'true') setIsRegister(true);

    axios.get('/api/settings/public')
      .then(res => {
        setPaypalEnabled(res.data.payment_paypal_enabled === 'true');
        setSettings(prev => ({ ...prev, ...res.data }));
      })
      .catch(() => setPaypalEnabled(true));
  }, [location, navigate]);

  const isAdmin = type === 'admin';
  const title = isAdmin ? `Admin Portal` : isRegister ? `Create Your Account` : `Sign In`;

  // SYNCED WITH HOMEPAGE
  const PLANS = [
    { name: 'Free', price: '0', icon: <Zap size={20} />, features: ['Read 10 stories/mo', '5 AI Generations'] },
    { name: 'Bronze', price: '4.99', icon: <Shield size={20} />, features: ['Read 50 stories/mo', '20 AI Generations'] },
    { name: 'Silver', price: '9.99', icon: <Rocket size={20} />, features: ['Read 100 stories/mo', '50 AI Generations'] },
    { name: 'Gold', price: '19.99', icon: <Trophy size={20} />, features: ['Unlimited reading', 'Unlimited AI Generations'] }
  ];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isRegister && step < 3 && !isAdmin) {
      setStep(step + 1);
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      if (isRegister && !isAdmin) {
        const res = await axios.post('/api/auth/register', formData);
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        const res = await axios.post('/api/auth/login', {
          email: formData.email,
          password: formData.password,
        });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '16px 16px 16px 50px',
    background: '#18162A', border: `1px solid ${C.cardBorder}`,
    borderRadius: 18, color: C.text, fontSize: 14, outline: 'none',
    boxSizing: 'border-box', transition: 'all 0.3s',
  };

  const iconStyle = {
    position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: C.textDim
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: C.bg, fontFamily: "'Inter', sans-serif", color: C.text,
      position: 'relative', overflowX: 'hidden'
    }}>
      <Helmet><title>{title} — {settings.site_name}</title></Helmet>

      {/* ═══ HEADER ═══ */}
      <style>{`
        @media (max-width: 900px) {
          .login-header { padding: 16px 20px !important; }
          .login-nav { display: none !important; }
          .login-logo-text { fontSize: 20px !important; }
          .login-logo-icon { width: 34px !important; height: 34px !important; fontSize: 18px !important; }
        }
      `}</style>
      <header className="login-header" style={{ 
        padding: '24px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        background: 'rgba(5,4,8,0.8)', backdropFilter: 'blur(30px)', 
        borderBottom: `1px solid ${C.cardBorder}`, zIndex: 1000, position: 'sticky', top: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div className="login-logo-icon" style={{ width: 42, height: 42, borderRadius: 12, background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: `0 0 30px ${C.plumGlow}` }}>📖</div>
          <span className="login-logo-text" style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1.2 }}>Toon<span style={{ color: C.rose }}>Vault</span></span>
        </div>
        <div className="login-nav" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
           {['Stories', 'Genres', 'Creators', 'Plans'].map(item => <span key={item} onClick={() => navigate('/')} style={{ fontSize: 14, fontWeight: 600, color: C.textDim, cursor: 'pointer' }}>{item}</span>)}
           <button onClick={() => navigate('/')} style={{ padding: '10px 24px', borderRadius: 20, border: `1px solid ${C.plum}`, background: 'transparent', color: C.plum, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Back to Site</button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', background: '#08070F' }}>
        
        {/* Left Side: Onboarding Sidebar */}
        {isRegister && !isAdmin && (
          <div style={{ 
            width: 380, borderRight: `1px solid ${C.cardBorder}`, padding: '80px 60px',
            background: 'linear-gradient(180deg, #0A0914 0%, #050408 100%)',
            display: 'flex', flexDirection: 'column', gap: 48
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 20 }}>Onboarding</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {[
                { s: 1, title: 'Choose Plan', desc: 'Select your membership' },
                { s: 2, title: 'Identity', desc: 'Personal details & Contact' },
                { s: 3, title: 'Verify & Start', desc: 'Complete registration' }
              ].map(item => (
                <div key={item.s} style={{ display: 'flex', gap: 20, opacity: step >= item.s ? 1 : 0.3, transition: 'all 0.5s' }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 14, border: `2px solid ${step === item.s ? C.plum : C.cardBorder}`,
                    background: step > item.s ? C.plum : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800,
                    color: 'white', boxShadow: step === item.s ? `0 0 20px ${C.plumGlow}` : 'none'
                  }}>
                    {step > item.s ? <Check size={20} /> : item.s}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: step === item.s ? 'white' : C.textDim }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'auto', padding: 24, background: C.card, borderRadius: 24, border: `1px solid ${C.cardBorder}` }}>
               <Sparkles size={24} style={{ color: C.gold, marginBottom: 12 }} />
               <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>AI Advantage</div>
               <p style={{ fontSize: 12, color: C.textDim, marginTop: 6, lineHeight: 1.5 }}>Our AI helps you generate panels, scripts, and backgrounds in seconds.</p>
            </div>
          </div>
        )}

        {/* Right Side: Step-by-Step Form Content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '100%', maxWidth: 520, animation: 'fadeInUp 0.6s ease-out' }}>
            <div style={{ marginBottom: 40 }}>
               <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, marginBottom: 12 }}>
                 {isAdmin ? 'Admin Portal' : isRegister ? (step === 1 ? 'Choose Your Plan' : step === 2 ? 'Identity Details' : 'Verify & Start') : 'Welcome Back'}
               </h1>
               <p style={{ fontSize: 16, color: C.textDim }}>
                 {isRegister ? 
                   (step === 1 ? 'Select a membership to unlock ToonVault.' : step === 2 ? 'Enter your personal and contact details.' : 'Review your selection and complete signup.') 
                   : 'Enter your credentials to continue.'}
               </p>
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 16, padding: '16px', color: '#EF4444', fontSize: 14, fontWeight: 600, marginBottom: 30 }}>⚠️ {error}</div>
            )}

            <form onSubmit={handleSubmit}>
              {/* STEP 1: PLAN SELECTION */}
              {isRegister && step === 1 && !isAdmin && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {PLANS.map(p => (
                    <div key={p.name} onClick={() => setFormData({ ...formData, plan: p.name })} style={{
                      padding: '20px', borderRadius: 22, border: `2px solid ${formData.plan === p.name ? C.plum : C.cardBorder}`,
                      background: formData.plan === p.name ? 'rgba(139,92,246,0.08)' : '#12101F',
                      cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 18
                    }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: formData.plan === p.name ? C.plum : '#1B182B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{p.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 17, fontWeight: 800 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{p.features[0]} • {p.features[1]}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: formData.plan === p.name ? C.plum : 'white' }}>${p.price}</div>
                        <div style={{ fontSize: 10, color: C.textDim }}>/mo</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 2: IDENTITY & CONTACT */}
              {isRegister && step === 2 && !isAdmin && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ position: 'relative' }}>
                    <User size={20} style={iconStyle} />
                    <input type="text" placeholder="Full Name" value={formData.username} required style={inputStyle} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Mail size={20} style={iconStyle} />
                    <input type="email" placeholder="Email Address" value={formData.email} required style={inputStyle} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Phone size={20} style={iconStyle} />
                    <input type="tel" placeholder="Phone Number" value={formData.phone} required style={inputStyle} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={20} style={iconStyle} />
                    <input type="password" placeholder="Set Secure Password" value={formData.password} required style={inputStyle} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>
              )}

              {/* STEP 3: VERIFY & PAYMENT */}
              {isRegister && step === 3 && !isAdmin && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                   <div style={{ padding: '32px', background: 'rgba(255,255,255,0.03)', borderRadius: 32, border: `1px solid ${C.cardBorder}` }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: C.textDim, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Checkout Summary</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 16, color: C.textDim }}>{formData.plan} Plan</span>
                        <span style={{ fontSize: 16, fontWeight: 800 }}>${PLANS.find(p => p.name === formData.plan)?.price}/mo</span>
                      </div>
                      <div style={{ height: 1, background: C.cardBorder, margin: '18px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 18, fontWeight: 900 }}>Grand Total</span>
                        <span style={{ fontSize: 32, fontWeight: 900, color: C.rose }}>${PLANS.find(p => p.name === formData.plan)?.price}</span>
                      </div>
                   </div>
                   {formData.plan !== 'Free' ? (
                     <PayPalScriptProvider options={{ "client-id": "test" }}>
                       <PayPalButtons 
                         style={{ layout: "vertical", shape: "pill", color: "blue" }}
                         createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: PLANS.find(p => p.name === formData.plan)?.price } }] })}
                         onApprove={async (data, actions) => { await actions.order.capture(); handleSubmit(); }}
                       />
                     </PayPalScriptProvider>
                   ) : (
                     <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Check size={36} strokeWidth={3} /></div>
                        <p style={{ fontSize: 15, color: C.textDim }}>No credit card required for Free plan.</p>
                     </div>
                   )}
                </div>
              )}

              {/* LOGIN / ADMIN FORM */}
              {(!isRegister || isAdmin) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={20} style={iconStyle} />
                    <input type="email" placeholder="Email Address" value={formData.email} required style={inputStyle} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={20} style={iconStyle} />
                    <input type="password" placeholder="Password" value={formData.password} required style={inputStyle} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '18px', background: loading ? C.plumGlow : C.gradient,
                color: 'white', border: 'none', borderRadius: 20, fontSize: 16, fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', marginTop: 32,
                boxShadow: loading ? 'none' : `0 15px 35px ${C.plumGlow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
              }}>
                {loading ? 'Processing...' : isRegister ? (step === 3 ? 'Start My Journey' : 'Continue to Identity') : 'Sign In'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>

            {!isAdmin && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                 <button onClick={() => { setIsRegister(!isRegister); setStep(1); setError(''); }} style={{ background: 'none', border: 'none', color: C.textDim, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                   {isRegister ? <span>Already a member? <span style={{ color: C.plum }}>Sign In</span></span> : <span>New to ToonVault? <span style={{ color: C.rose }}>Create Account</span></span>}
                 </button>
              </div>
            )}

            {!isAdmin && (
               <div style={{ marginTop: 40 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: C.textDim, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>
                     <div style={{ flex: 1, height: 1, background: C.cardBorder }} />
                     <span>Or continue with</span>
                     <div style={{ flex: 1, height: 1, background: C.cardBorder }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${[
                       { id: 'social_google_enabled', name: 'Google', icon: <GoogleIcon />, color: '#EA4335' },
                       { id: 'social_instagram_enabled', name: 'Instagram', icon: <Instagram size={20} />, color: '#E4405F' },
                       { id: 'social_facebook_enabled', name: 'Facebook', icon: <Facebook size={20} />, color: '#1877F2' },
                       { id: 'social_linkedin_enabled', name: 'LinkedIn', icon: <Linkedin size={20} />, color: '#0A66C2' }
                     ].filter(s => settings[s.id] === 'true').length || 1}, 1fr)`, gap: 16 }}>
                     {[
                       { id: 'social_google_enabled', name: 'Google', icon: <GoogleIcon />, color: '#EA4335' },
                       { id: 'social_instagram_enabled', name: 'Instagram', icon: <Instagram size={20} />, color: '#E4405F' },
                       { id: 'social_facebook_enabled', name: 'Facebook', icon: <Facebook size={20} />, color: '#1877F2' },
                       { id: 'social_linkedin_enabled', name: 'LinkedIn', icon: <Linkedin size={20} />, color: '#0A66C2' }
                     ].filter(s => settings[s.id] === 'true').map(s => (
                       <button key={s.name} type="button" style={{ 
                         height: 50, borderRadius: 16, background: '#131121', border: `1px solid ${C.cardBorder}`,
                         display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
                       }} onMouseEnter={e => e.currentTarget.style.background = '#1B1930'} onMouseLeave={e => e.currentTarget.style.background = '#131121'}>
                         <span style={{ color: s.color }}>{s.icon}</span>
                       </button>
                     ))}
                  </div>
               </div>
            )}
          </div>
        </div>
      </main>

      <footer style={{
        background: '#050408', color: "rgba(255,255,255,0.45)",
        padding: "80px 60px 40px",
        borderTop: `1px solid ${C.cardBorder}`
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 60 }}>
            <div style={{ gridColumn: "span 1.5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer" }} onClick={() => navigate("/")}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: `0 0 30px ${C.plumGlow}` }}>📖</div>
                <span style={{ fontSize: 22, fontWeight: 900, color: "white", letterSpacing: -0.8 }}>Toon<span style={{ color: C.rose }}>Vault</span></span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.8, maxWidth: 300, color: "rgba(255,255,255,0.5)" }}>
                An AI-powered interactive storytelling platform where choices shape every story. Create, share, and monetize your imagination.
              </p>
            </div>
            {[
              { 
                title: "Discover", 
                links: [
                  { l: "Browse", t: "/browse" },
                  { l: "Originals", t: "/#daily-schedule" },
                  { l: "Categories", t: "/#categories" },
                  { l: "Rankings", t: "/#rankings" },
                  { l: "New releases", t: "/#daily-schedule" },
                  { l: "Canvas", t: "/#collections" },
                  { l: "Pricing", t: "/#pricing" }
                ] 
              },
              { 
                title: "Create", 
                links: [
                  { l: "Publish a story", t: "/dashboard?page=ai" },
                  { l: "Creators 101", t: "/#creators" },
                  { l: "Team features", t: "/#creators" },
                  { l: "Creator tools", t: "/#creators" },
                  { l: "Earnings", t: "/dashboard" }
                ] 
              },
              { 
                title: "Company", 
                links: [
                  { l: "About", t: "/#about" },
                  { l: "Help center", t: "/#help" },
                  { l: "Community", t: "/#community" },
                  { l: "Terms", t: "#" },
                  { l: "Privacy", t: "#" }
                ] 
              },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "white", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24 }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {col.links.map(link => (
                    <div key={link.l} 
                      onClick={() => {
                        if (link.t.startsWith('/#')) {
                           navigate(link.t);
                        } else if (link.t.startsWith('/')) {
                           navigate(link.t);
                        } else {
                           const el = document.querySelector(link.t);
                           if (el) el.scrollIntoView({ behavior: 'smooth' });
                           else navigate('/' + link.t);
                        }
                      }}
                      style={{ fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = C.plum}
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
                <span key={s} style={{ fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "white"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
                >{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: ${C.textDim}; opacity: 0.4; }
        input:focus { border-color: ${C.plum} !important; background: #1B1935 !important; box-shadow: 0 0 0 4px ${C.plumGlow} !important; }
      `}</style>
    </div>
  );
}
