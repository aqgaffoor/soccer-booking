import './Footer.css';
import { Trophy } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <Trophy size={24} className="logo-icon" />
            <span>CourtConnect</span>
          </div>
          <p className="footer-desc">
            The world's leading app for soccer players and clubs. Find courts, connect with others, and focus on enjoying your game.
          </p>
          <div className="social-links">
            <a href="#" className="social-link">Twitter</a>
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">Facebook</a>
          </div>
        </div>

        <div className="footer-links">
          <div className="link-column">
            <h3>For Players</h3>
            <ul>
              <li><a href="#">Book Courts</a></li>
              <li><a href="#">Find a Club</a></li>
              <li><a href="#">Community</a></li>
            </ul>
          </div>
          <div className="link-column">
            <h3>For Clubs</h3>
            <ul>
              <li><a href="/pricing">Pricing Plans</a></li>
              <li><a href="#">Club Manager</a></li>
              <li><a href="#">Academy</a></li>
            </ul>
          </div>
          <div className="link-column">
            <h3>Support</h3>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Terms & Privacy</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CourtConnect. All rights reserved.</p>
      </div>
    </footer>
  );
}
