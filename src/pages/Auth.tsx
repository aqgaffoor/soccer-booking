import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function Auth() {
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
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Log in to your CourtConnect account</p>

          <div className="sso-buttons">
            <button className="btn btn-sso sso-apple">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path><path d="M10 2c1 .5 2 2 2 5"></path></svg>
              Sign in with Apple
            </button>
            <button className="btn btn-sso sso-google">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M22.54 12.242A10.824 10.824 0 0 0 22.36 10H12v4.4h5.922a5.05 5.05 0 0 1-2.186 3.328v2.756h3.535c2.068-1.9 3.269-4.707 3.269-8.242Z"></path><path d="M12 23c2.96 0 5.44-1.01 7.27-2.758l-3.535-2.756c-.99.664-2.26 1.054-3.735 1.054-2.87 0-5.3-1.942-6.17-4.542H2.17v2.85A11.025 11.025 0 0 0 12 23Z"></path><path d="M5.83 14c-.22-.664-.35-1.37-.35-2.1s.13-1.436.35-2.1V6.95H2.17A11.012 11.012 0 0 0 1 11.9c0 1.765.41 3.444 1.17 4.95L5.83 14Z"></path><path d="M12 4.46c1.61 0 3.06.554 4.2 1.638l3.15-3.15C17.43 1.15 14.95 0 12 0 7.37 0 3.31 2.7 1.17 6.95l3.66 2.85C5.7 7.2 8.13 5.26 12 5.26Z"></path></svg>
              Continue with Google
            </button>
            <button className="btn btn-sso sso-facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              Log In With Facebook
            </button>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <form className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="Enter your email" />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" placeholder="Enter your password" />
            </div>

            <div className="form-actions">
              <a href="#" className="forgot-password">Forgot your password?</a>
            </div>

            <button type="submit" className="btn btn-primary w-full submit-btn">Log in</button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <a href="#">Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
