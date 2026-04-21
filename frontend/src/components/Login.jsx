import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Mail, Lock, User } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

function Login({ type = 'user' }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await axios.post(endpoint, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const title = type === 'admin' 
    ? (isRegister ? 'Admin Registration | ToonVault' : 'Admin Login | ToonVault')
    : (isRegister ? 'Join ToonVault | User Registration' : 'User Login | ToonVault');
    
  const description = type === 'admin'
    ? 'Access the ToonVault admin dashboard to manage content and platform settings.'
    : 'Login or register to access your ToonVault user dashboard, read stories, and generate content.';

  return (
    <div className="login-container">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <div className="animated-bg">
        <div className="blob blob-1"></div>
      </div>
      
      <div className="login-card glass-morphism">
        <header className="auth-header">
           <Sparkles size={32} color="#ff8da1" />
           <h2>{isRegister ? 'Join Toonvault' : 'Welcome Back'}</h2>
           <p>{isRegister ? 'Start your creator journey' : 'Resume your adventure'}</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="input-group glass-morphism">
              <User size={20} />
              <input 
                type="text" 
                placeholder="Username" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required 
              />
            </div>
          )}
          <div className="input-group glass-morphism">
            <Mail size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          <div className="input-group glass-morphism">
            <Lock size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
          <button type="submit" className="auth-submit">
             {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <footer className="auth-footer">
           <button onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Already have an account? Sign In' : 'New here? Create an account'}
           </button>
        </footer>
      </div>
    </div>
  );
}

export default Login;
