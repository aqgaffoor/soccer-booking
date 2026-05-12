import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, ChevronDown, Trophy, LogOut, Menu, X, Calendar, Settings, BookOpen } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import './Navbar.css';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const getUserInitials = () => {
    const meta = user?.user_metadata;
    if (meta?.full_name) {
      return meta.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() ?? 'U';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo" id="nav-logo">
            <div className="logo-icon-wrap">
              <Trophy size={20} />
            </div>
            <span>CourtConnect</span>
          </Link>

          {/* Desktop Links */}
          <div className="navbar-links hide-mobile">
            <div
              className="dropdown-container"
              ref={dropdownRef}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div
                id="nav-for-players"
                className={`nav-link dropdown-trigger ${isActive('/courts') ? 'nav-link-active' : ''}`}
                onClick={() => {
                  navigate('/courts');
                  setIsDropdownOpen(false);
                }}
                style={{ cursor: 'pointer' }}
              >
                For players <ChevronDown size={15} className={`chevron ${isDropdownOpen ? 'chevron-open' : ''}`} />
              </div>

              <div className={`dropdown-menu ${isDropdownOpen ? 'dropdown-visible' : ''}`}>
                <div className="dropdown-bridge" />
                <Link to="/courts" id="nav-book-courts" className="dropdown-item">
                  <span className="dropdown-icon">⚽</span>
                  <div>
                    <div className="dropdown-item-title">Book Soccer Courts</div>
                    <div className="dropdown-item-sub">Find and reserve your pitch</div>
                  </div>
                </Link>
                <Link to="/pricing" id="nav-find-club" className="dropdown-item">
                  <span className="dropdown-icon">🏆</span>
                  <div>
                    <div className="dropdown-item-title">Club Plans</div>
                    <div className="dropdown-item-sub">Manage your club online</div>
                  </div>
                </Link>
              </div>
            </div>

            <Link to="/pricing" id="nav-for-clubs" className={`nav-link ${isActive('/pricing') ? 'nav-link-active' : ''}`}>
              For clubs
            </Link>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {user ? (
              <div className="user-menu-container" ref={userMenuRef}>
                <button
                  id="nav-user-menu"
                  className="user-avatar-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="User menu"
                >
                  <div className="user-avatar">{getUserInitials()}</div>
                  <ChevronDown size={14} className={`chevron ${isUserMenuOpen ? 'chevron-open' : ''}`} />
                </button>

                <div className={`user-dropdown ${isUserMenuOpen ? 'dropdown-visible' : ''}`}>
                  <div className="user-dropdown-header">
                    <div className="user-avatar user-avatar-lg">{getUserInitials()}</div>
                    <div>
                      <div className="user-name">{user.user_metadata?.full_name || 'Player'}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <Link to="/account" id="nav-profile" className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <User size={16} /> My Profile
                  </Link>
                  <Link to="/account?tab=upcoming" id="nav-bookings" className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <Calendar size={16} /> My Bookings
                  </Link>
                  <Link to="/account?tab=past" id="nav-history" className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <BookOpen size={16} /> Booking History
                  </Link>
                  <div className="user-dropdown-divider" />
                  <button id="nav-signout" className="user-dropdown-item user-dropdown-signout" onClick={handleSignOut}>
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" id="nav-login" className="btn btn-primary auth-btn hide-mobile">
                <User size={16} /> Log In
              </Link>
            )}

            {/* Hamburger */}
            <button
              id="nav-hamburger"
              className="hamburger show-mobile"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div className={`mobile-overlay ${isMobileMenuOpen ? 'mobile-overlay-open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-header">
          {user ? (
            <div className="mobile-user-info">
              <div className="user-avatar user-avatar-lg">{getUserInitials()}</div>
              <div>
                <div className="user-name">{user.user_metadata?.full_name || 'Player'}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary w-full" onClick={() => setIsMobileMenuOpen(false)}>
              <User size={16} /> Log In / Sign Up
            </Link>
          )}
        </div>

        <nav className="mobile-nav">
          <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'mobile-nav-active' : ''}`}>Home</Link>
          <Link to="/courts" className={`mobile-nav-link ${isActive('/courts') ? 'mobile-nav-active' : ''}`}>
            ⚽ Book Soccer Courts
          </Link>
          <Link to="/pricing" className={`mobile-nav-link ${isActive('/pricing') ? 'mobile-nav-active' : ''}`}>For Clubs</Link>

          {user && (
            <>
              <div className="mobile-nav-divider" />
              <Link to="/account" className="mobile-nav-link"><User size={16} /> My Profile</Link>
              <Link to="/account?tab=upcoming" className="mobile-nav-link"><Calendar size={16} /> My Bookings</Link>
              <Link to="/account?tab=past" className="mobile-nav-link"><BookOpen size={16} /> Booking History</Link>
              <Link to="/account?tab=settings" className="mobile-nav-link"><Settings size={16} /> Settings</Link>
              <div className="mobile-nav-divider" />
              <button className="mobile-nav-link mobile-nav-signout" onClick={handleSignOut}>
                <LogOut size={16} /> Sign Out
              </button>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
