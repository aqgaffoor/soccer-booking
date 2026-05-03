import { useState, useEffect } from 'react';
import { Search, MapPin, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import heroBg from '../assets/hero-bg.png';
import './Home.css';

import court1 from '../assets/court-1.png';
import court2 from '../assets/court-2.png';
import court3 from '../assets/court-3.png';

const MOCK_COURTS = [
  {
    id: 1,
    name: "Elite Turf Umhlanga",
    location: "Umhlanga Ridge, Durban",
    rating: 4.8,
    image: court1,
    price: "R 450/hr"
  },
  {
    id: 2,
    name: "Downtown Soccer Arena",
    location: "Morningside, Durban",
    rating: 4.9,
    image: court2,
    price: "R 350/hr"
  },
  {
    id: 3,
    name: "Premier Pitch Westville",
    location: "Westville, Durban",
    rating: 4.7,
    image: court3,
    price: "R 500/hr"
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courts, setCourts] = useState<any[]>(MOCK_COURTS);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('courts').select('*');
      if (error) {
        console.warn('Could not fetch from Supabase, using local data. Did you create the table?', error.message);
        setCourts(MOCK_COURTS);
      } else if (data && data.length > 0) {
        setCourts(data);
      } else {
        setCourts(MOCK_COURTS);
      }
    } catch (err) {
      setCourts(MOCK_COURTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      fetchCourts();
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = courts.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.location.toLowerCase().includes(query)
    );
    setCourts(filtered);
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <img src={heroBg} alt="Soccer Field" />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="container hero-content">
          <h1 className="hero-title">
            Find <span className="text-accent">courts</span> and <span className="text-accent">players</span> near you
          </h1>
          <p className="hero-subtitle">
            Find matches and soccer courts worldwide. Connect anytime, anywhere.
          </p>

          <form className="search-bar" onSubmit={handleSearch}>
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Address, club, city..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === '') {
                  fetchCourts(); // reset when cleared
                }
              }}
            />
            <button type="submit" className="btn btn-primary search-btn">Search</button>
          </form>
        </div>
      </section>

      {/* Courts Section */}
      <section className="container courts-section" id="courts-section">
        <div className="section-header">
          <h2 className="section-title">
            {searchQuery ? `Search results for "${searchQuery}"` : "Top searched courts worldwide"}
          </h2>
          <button className="view-all" onClick={() => navigate('/courts')}>
            View all <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading courts...</div>
        ) : (
          <div className="courts-grid">
            {courts.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)' }}>No courts found matching your search.</div>
            ) : (
              courts.map(court => (
                <div 
                  key={court.id} 
                  className="court-card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/court/${court.id}`)}
                >
                  <div className="court-image">
                    <img src={court.image_url || court.image} alt={court.name} />
                    <div className="court-price">{court.price || `R ${court.hourly_rate_zar}/hr`}</div>
                  </div>
                  <div className="court-info">
                    <div className="court-header">
                      <h3 className="court-name">{court.name}</h3>
                      <div className="court-rating">
                        <Star size={14} className="star-icon" fill="currentColor" />
                        <span>{court.rating || 'New'}</span>
                      </div>
                    </div>
                    <p className="court-location">
                      <MapPin size={14} />
                      {court.location || court.location_area}
                    </p>
                    <button 
                      className="btn btn-primary w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/court/${court.id}`);
                      }}
                    >
                      Book now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
