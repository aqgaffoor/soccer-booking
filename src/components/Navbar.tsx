import { Link } from 'react-router-dom';
import { User, ChevronDown, Trophy } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-logo">
          <Trophy size={24} className="logo-icon" />
          <span>CourtConnect</span>
        </Link>
        
        <div className="navbar-links">
          <div 
            className="dropdown-container"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="nav-link dropdown-trigger">
              For players <ChevronDown size={16} />
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/" className="dropdown-item">Book soccer courts</Link>
                <Link to="/" className="dropdown-item">Find a club</Link>
              </div>
            )}
          </div>
          
          <Link to="/pricing" className="nav-link">For clubs</Link>
        </div>

        <div className="navbar-actions">
          <Link to="/auth" className="btn btn-primary auth-btn">
            <User size={18} />
            Log In
          </Link>
        </div>
      </div>
    </nav>
  );
}
