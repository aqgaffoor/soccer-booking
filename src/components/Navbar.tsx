import { Link, useNavigate } from 'react-router-dom';
import { User, ChevronDown, Trophy, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Navbar.css';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
                <Link to="/courts" className="dropdown-item">Book soccer courts</Link>
                <Link to="/courts" className="dropdown-item">Find a club</Link>
              </div>
            )}
          </div>
          
          <Link to="/pricing" className="nav-link">For clubs</Link>
        </div>

        <div className="navbar-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {user.email}
              </span>
              <button onClick={handleSignOut} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary auth-btn">
              <User size={18} />
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
