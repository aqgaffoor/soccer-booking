import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <Trophy size={24} className="logo-icon" />
            <span>CourtConnect</span>
          </Link>
        </div>
        
        <div className="auth-card">
          <h2 className="auth-title">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
          <p className="auth-subtitle">
            {isLogin ? 'Log in to your CourtConnect account' : 'Sign up to book courts and find players'}
          </p>

          {/* Social SSO buttons removed for brevity, as we are focusing on functional email/pass */}

          <form className="auth-form" onSubmit={handleAuth}>
            {error && <div className="auth-error" style={{color: '#ff4444', marginBottom: '1rem', fontSize: '0.875rem'}}>{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder={isLogin ? "Enter your password" : "Create a password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {isLogin && (
              <div className="form-actions">
                <a href="#" className="forgot-password">Forgot your password?</a>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full submit-btn" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                style={{background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500}}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
