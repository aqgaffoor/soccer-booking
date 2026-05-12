import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, ChevronRight, Star, ArrowRight, Users, Calendar, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import heroBg from '../assets/hero-bg.png';
import court1 from '../assets/court-1.png';
import court2 from '../assets/court-2.png';
import court3 from '../assets/court-3.png';
import './Home.css';

const MOCK_COURTS = [
  { id: 1, name: "Elite Turf Umhlanga",    location: "Umhlanga Ridge, Durban", rating: 4.8, image: court1, price: "R 450/hr", description: "Premium 5-a-side artificial turf with modern facilities and floodlights." },
  { id: 2, name: "Downtown Soccer Arena",  location: "Morningside, Durban",    rating: 4.9, image: court2, price: "R 350/hr", description: "Indoor arena perfect for all-weather matches. High quality turf." },
  { id: 3, name: "Premier Pitch Westville",location: "Westville, Durban",      rating: 4.7, image: court3, price: "R 500/hr", description: "Scenic outdoor pitch ideal for 7-a-side games and tournaments." },
];

const getCourtImage = (court: any) => {
  if (court.image_url === 'court-1.png') return court1;
  if (court.image_url === 'court-2.png') return court2;
  if (court.image_url === 'court-3.png') return court3;
  if (court.image_url?.startsWith('http')) return court.image_url;
  return court.image || court1;
};

const STATS = [
  { value: '2,400+', label: 'Courts available' },
  { value: '180K+',  label: 'Active players'   },
  { value: '45+',    label: 'Cities covered'   },
  { value: '98%',    label: 'Satisfaction rate' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🔍', title: 'Search',  desc: 'Find soccer courts near you by location, date, or price.' },
  { step: '02', icon: '📅', title: 'Book',    desc: 'Select your date, time slot, and court in seconds.'       },
  { step: '03', icon: '⚽', title: 'Play',    desc: "Show up and enjoy the game. It's that simple."             },
];

/* Hook: runs once and triggers scroll-reveal via IntersectionObserver */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('revealed'); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

export default function Home() {
  const [searchQuery,   setSearchQuery]   = useState('');
  const [allCourts,     setAllCourts]     = useState<any[]>(MOCK_COURTS);
  const [displayCourts, setDisplayCourts] = useState<any[]>(MOCK_COURTS);
  const [loading,       setLoading]       = useState(true);
  const [statsVisible,  setStatsVisible]  = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useScrollReveal();

  useEffect(() => {
    fetchCourts();
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.25 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const fetchCourts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('courts').select('*');
      if (!error && data && data.length > 0) {
        setAllCourts(data);
        setDisplayCourts(data);
      } else {
        setAllCourts(MOCK_COURTS);
        setDisplayCourts(MOCK_COURTS);
      }
    } catch {
      setAllCourts(MOCK_COURTS);
      setDisplayCourts(MOCK_COURTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) { setDisplayCourts(allCourts); return; }
    const q = searchQuery.toLowerCase();
    const filtered = allCourts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.location_area?.toLowerCase().includes(q)
    );
    setDisplayCourts(filtered);
    document.getElementById('courts-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [searchQuery, allCourts]);

  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <img src={heroBg} alt="Soccer Field" />
          <div className="hero-overlay" />
          <div className="hero-gradient-orb" />
        </div>

        <div className="container hero-content">
          <div className="hero-badge reveal">🏆 #1 Soccer Court Booking Platform in South Africa</div>
          <h1 className="hero-title reveal delay-1">
            Find <span className="text-accent">courts</span> &amp;{' '}
            <span className="text-accent">players</span> near you
          </h1>
          <p className="hero-subtitle reveal delay-2">
            Book premium soccer courts instantly. Connect with players. Play more football.
          </p>

          <form className="search-bar reveal delay-3" onSubmit={handleSearch} id="home-search-form">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by location, court name or city..."
              className="search-input"
              id="home-search-input"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (!e.target.value) setDisplayCourts(allCourts); }}
              aria-label="Search courts"
            />
            <button type="submit" className="btn btn-primary search-btn" id="home-search-btn">
              Search
            </button>
          </form>

          <div className="hero-tags reveal delay-4">
            {['Umhlanga', 'Durban CBD', 'Westville', 'Ballito'].map(tag => (
              <button key={tag} className="hero-tag" onClick={() => { setSearchQuery(tag); handleSearch(); }}>
                📍 {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="stats-section" ref={statsRef}>
        <div className="container stats-grid">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className={`stat-item ${statsVisible ? 'stat-visible' : ''}`}
              style={{ animationDelay: `${i * 0.1}s`, transitionDelay: `${i * 0.1}s` }}
            >
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Courts Section ───────────────────────────────── */}
      <section className="container courts-section" id="courts-section">
        <div className="section-header reveal">
          <div>
            <h2 className="section-title">
              {searchQuery ? `Results for "${searchQuery}"` : 'Top courts near you'}
            </h2>
            {!searchQuery && <p className="section-subtitle">Handpicked premium soccer facilities across Durban</p>}
          </div>
          <button
            id="view-all-courts-btn"
            className="view-all-btn"
            onClick={() => navigate('/courts')}
          >
            View all <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="courts-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="court-card-skeleton">
                <div className="skeleton" style={{ height: '220px' }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="skeleton" style={{ height: '20px', width: '70%' }} />
                  <div className="skeleton" style={{ height: '16px', width: '50%' }} />
                  <div className="skeleton" style={{ height: '40px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : displayCourts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚽</div>
            <h3>No courts found</h3>
            <p>Try searching for a different location or court name.</p>
            <button className="btn btn-outline" onClick={() => { setSearchQuery(''); setDisplayCourts(allCourts); }}>
              Clear search
            </button>
          </div>
        ) : (
          <div className="courts-grid">
            {displayCourts.slice(0, 6).map((court, idx) => (
              <div
                key={court.id}
                className="court-card reveal"
                style={{ transitionDelay: `${idx * 0.08}s` }}
                onClick={() => navigate(`/court/${court.id}`)}
                role="button"
                tabIndex={0}
                aria-label={`Book ${court.name}`}
                onKeyDown={e => e.key === 'Enter' && navigate(`/court/${court.id}`)}
              >
                <div className="court-image">
                  <img src={getCourtImage(court)} alt={court.name} loading="lazy" />
                  <div className="court-price-badge">{court.price || `R ${court.hourly_rate_zar}/hr`}</div>
                </div>
                <div className="court-info">
                  <div className="court-meta">
                    <h3 className="court-name">{court.name}</h3>
                    <div className="court-rating">
                      <Star size={13} fill="currentColor" />
                      <span>{court.rating || '4.8'}</span>
                    </div>
                  </div>
                  <p className="court-location">
                    <MapPin size={13} />
                    {court.location || court.location_area}
                  </p>
                  {court.description && <p className="court-desc">{court.description}</p>}
                  <button
                    className="btn btn-primary court-book-btn"
                    id={`book-court-${court.id}`}
                    onClick={e => { e.stopPropagation(); navigate(`/court/${court.id}`); }}
                  >
                    Book Now <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="how-section">
        <div className="container">
          <div className="how-header text-center reveal">
            <h2 className="section-title">How it works</h2>
            <p className="section-subtitle">Book a soccer court in 3 simple steps</p>
          </div>
          <div className="how-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className={`how-card reveal delay-${i + 1}`}>
                <div className="how-step-num">{step.step}</div>
                <div className="how-icon">{step.icon}</div>
                <h3 className="how-title">{step.title}</h3>
                <p className="how-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="features-section">
        <div className="container features-grid">
          <div className="features-text reveal reveal-left">
            <h2 className="section-title">Why choose <span className="text-accent">CourtConnect</span>?</h2>
            <p className="section-subtitle">Everything you need to play more football, in one place.</p>
            <ul className="features-list">
              {[
                { icon: <Calendar size={20} />, title: 'Instant booking',   desc: 'Reserve your court in seconds, any time of day.'    },
                { icon: <Shield size={20} />,   title: 'Secure payments',   desc: 'Safe, encrypted transactions every time.'           },
                { icon: <Users size={20} />,    title: 'Find teammates',    desc: 'Connect with players of all skill levels near you.' },
              ].map((f, i) => (
                <li key={i} className={`feature-item reveal delay-${i + 1}`}>
                  <div className="feature-icon">{f.icon}</div>
                  <div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary btn-lg" id="cta-browse-courts" onClick={() => navigate('/courts')}>
              Browse All Courts <ArrowRight size={18} />
            </button>
          </div>
          <div className="features-visual reveal reveal-right">
            <div className="features-img-wrap">
              <img src={court2} alt="Soccer Court" />
              <div className="features-img-badge">
                <Star size={14} fill="currentColor" />
                <span>4.9 rated courts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="cta-section reveal">
        <div className="container cta-inner">
          <div className="cta-text">
            <h2>Ready to play?</h2>
            <p>Join 180,000+ players already booking on CourtConnect</p>
          </div>
          <div className="cta-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/courts')}>
              Find a Court ⚽
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/auth')}>
              Create Free Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
