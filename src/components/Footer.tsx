import { Link } from 'react-router-dom';
import { Trophy, Share2, Globe, AtSign, Mail } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <Trophy size={18} />
              </div>
              <span>CourtConnect</span>
            </Link>
            <p className="footer-desc">
              The leading platform for soccer players and clubs across South Africa. Find courts, connect with players, and focus on the beautiful game.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Twitter"><Globe size={18} /></a>
              <a href="#" className="social-link" aria-label="Instagram"><AtSign size={18} /></a>
              <a href="#" className="social-link" aria-label="Share"><Share2 size={18} /></a>
              <a href="#" className="social-link" aria-label="Email"><Mail size={18} /></a>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links-grid">
            <div className="footer-col">
              <h3 className="footer-col-title">For Players</h3>
              <ul className="footer-links">
                <li><Link to="/courts">Book Courts</Link></li>
                <li><Link to="/account?tab=bookings">My Bookings</Link></li>
                <li><Link to="/account">My Profile</Link></li>
                <li><a href="#">Find Teammates</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3 className="footer-col-title">For Clubs</h3>
              <ul className="footer-links">
                <li><Link to="/pricing">Pricing Plans</Link></li>
                <li><a href="#">Club Manager</a></li>
                <li><a href="#">Analytics</a></li>
                <li><a href="#">Academy</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3 className="footer-col-title">Support</h3>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} CourtConnect. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
