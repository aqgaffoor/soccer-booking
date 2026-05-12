import { useState } from 'react';
import { Trophy, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (error) throw error;

        // Save to profiles table
        if (data.user) {
          await supabase.from('profiles').upsert({ id: data.user.id, full_name: fullName.trim() });
        }

        setSuccessMessage('Account created! Check your email to confirm your account, then log in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      let msg = err.message || 'An error occurred';
      if (msg.includes('Invalid login credentials')) msg = 'Incorrect email or password.';
      if (msg.includes('User already registered')) msg = 'This email is already registered. Try logging in.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg" />

      <div className="auth-container">
        {/* Back Button */}
        <Link to="/" className="auth-back-link" id="auth-back-btn">
          <ArrowLeft size={16} /> Back to home
        </Link>

        {/* Logo */}
        <div className="auth-logo" id="auth-logo">
          <div className="auth-logo-icon">
            <Trophy size={22} />
          </div>
          <span>CourtConnect</span>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Toggle */}
          <div className="auth-tab-row">
            <button
              id="auth-tab-login"
              className={`auth-tab ${isLogin ? 'auth-tab-active' : ''}`}
              onClick={() => { setIsLogin(true); setError(null); }}
            >
              Log In
            </button>
            <button
              id="auth-tab-signup"
              className={`auth-tab ${!isLogin ? 'auth-tab-active' : ''}`}
              onClick={() => { setIsLogin(false); setError(null); }}
            >
              Sign Up
            </button>
          </div>

          <h2 className="auth-title">
            {isLogin ? 'Welcome back 👋' : 'Create your account'}
          </h2>
          <p className="auth-subtitle">
            {isLogin
              ? 'Log in to book courts and manage your matches.'
              : 'Join CourtConnect and start playing today.'}
          </p>

          {successMessage && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              ✅ {successMessage}
            </div>
          )}

          <form className="auth-form" onSubmit={handleAuth}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-fullname">Full Name</label>
                <input
                  id="auth-fullname"
                  type="text"
                  className="form-input"
                  placeholder="Abdul Qaadir Gaffoor"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required={!isLogin}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">
                Password
                {isLogin && (
                  <a href="#" className="forgot-link" tabIndex={-1}>Forgot password?</a>
                )}
              </label>
              <div className="password-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              className="btn btn-primary w-full btn-lg auth-submit"
              disabled={loading}
            >
              {loading
                ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Processing...</>
                : isLogin ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-social">
            <button 
              type="button"
              className="btn btn-secondary auth-social-btn" 
              id="auth-google-btn" 
              onClick={handleGoogleLogin}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </div>

          <p className="auth-footer-text">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="auth-toggle-btn"
              id={isLogin ? 'auth-go-signup' : 'auth-go-login'}
              onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMessage(null); }}
            >
              {isLogin ? 'Sign up for free' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
