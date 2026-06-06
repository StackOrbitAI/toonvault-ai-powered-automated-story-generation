import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ToonVaultHome from './components/ToonVaultHome';
import Reader from './components/Reader';
import StoryPage from './components/StoryPage';
import MantaReader from './components/MantaReader';
import ReelPlayer from './components/ReelPlayer';

// Mock data for StoryPage (can be replaced by API fetch inside StoryPage)
const STORIES = [
  { id: "69f7365c1cd954ae93abb532", title: "The Lemon Forest", image: "/src/assets/lemon_forest.png", tags: ['fantasy'] },
  { id: 2, title: "Shadow of the Realm", image: "/src/assets/shadow_realm.png", tags: ['thriller'] },
];

import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './components/Login';
import ToonVaultUserDashboard from './components/ToonVaultUserDashboard';
import Browse from './components/Browse';
import BecomeCreator from './components/BecomeCreator';
import InfoPage from './components/InfoPage';
import axios from 'axios';
import './App.css';

// Simple Protected Route
const ProtectedRoute = ({ children, role }) => {
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    user = (userStr && userStr !== 'undefined') ? JSON.parse(userStr) : null;
  } catch (e) {
    localStorage.removeItem('user');
  }

  if (!user) return <Navigate to="/user" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

// Dashboard Hub to handle both Admin and User dashboards on the same /dashboard URL
const DashboardHub = ({ settings, isMaintenance }) => {
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    user = (userStr && userStr !== 'undefined') ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Malformed user object in localStorage");
    localStorage.removeItem('user');
  }

  if (!user) return <Navigate to="/user" />;
  
  // If in maintenance, only allow admins
  if (isMaintenance && user.role !== 'admin') {
    return (
      <div style={{ background: "#0F0D1E", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white", textAlign: "center", padding: 20 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 10 }}>System Maintenance</h1>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>The dashboard is currently unavailable for users. Please check back later.</p>
        </div>
      </div>
    );
  }
  
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }
  return <ToonVaultUserDashboard />;
};

function App() {
  const [settings, setSettings] = React.useState({ site_name: "ToonVault", maintenance_mode: "false" });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    axios.get('/api/settings/public')
      .then(res => {
        setSettings(prev => ({ ...prev, ...res.data }));
      })
      .catch(err => console.error("Settings fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null; // Or a splash screen

  // Maintenance Page Component
  const MaintenancePage = () => (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "#0F0D1E", color: "white", zIndex: 10000,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ fontSize: 80, marginBottom: 30, filter: "drop-shadow(0 0 20px rgba(139,92,246,0.3))" }}>🏗️</div>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16, background: "linear-gradient(135deg, #8B5CF6 0%, #F43F8E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Under Maintenance
      </h1>
      <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", maxWidth: 500, lineHeight: 1.6 }}>
        {settings.site_name} is currently undergoing scheduled maintenance to bring you a better experience. We'll be back shortly!
      </p>
      <div style={{ marginTop: 40, padding: "10px 20px", borderRadius: 30, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
        Follow us on Twitter for updates
      </div>
    </div>
  );

  const isMaintenance = settings.maintenance_mode === 'true';

  return (
    <HelmetProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Maintenance wrap except for direct admin login or if already in admin mode */}
          <Route path="/" element={isMaintenance ? <MaintenancePage /> : <ToonVaultHome />} />
          <Route path="/browse" element={isMaintenance ? <MaintenancePage /> : <Browse />} />
          <Route path="/creators" element={isMaintenance ? <MaintenancePage /> : <BecomeCreator />} />
          <Route path="/info/:slug" element={isMaintenance ? <MaintenancePage /> : <InfoPage />} />
          
          <Route path="/about" element={<Navigate to="/info/about" replace />} />
          <Route path="/help" element={<Navigate to="/info/help" replace />} />
          <Route path="/terms" element={<Navigate to="/info/terms" replace />} />
          <Route path="/privacy" element={<Navigate to="/info/privacy" replace />} />
          <Route path="/community" element={<Navigate to="/info/community" replace />} />
          
          {/* Public Reader */}
          <Route path="/story/:id" element={isMaintenance ? <MaintenancePage /> : <StoryPage stories={STORIES} />} />
          <Route path="/manta/:storyId" element={isMaintenance ? <MaintenancePage /> : <MantaReader />} />
          <Route path="/reel/:storyId" element={isMaintenance ? <MaintenancePage /> : <ReelPlayer />} />
          
          {/* Auth - Allow admin portal even in maintenance for emergency fixes */}
          <Route path="/user" element={isMaintenance ? <MaintenancePage /> : <Login type="user" />} />
          <Route path="/login" element={<Navigate to="/user" replace />} />
          <Route path="/admin" element={<Login type="admin" />} />
          
          {/* Combined Dashboard - Hub handles role check */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardHub settings={settings} isMaintenance={isMaintenance} />
            </ProtectedRoute>
          } />

          {/* Redirect old dashboard URL */}
          <Route path="/user-dashboard" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;

