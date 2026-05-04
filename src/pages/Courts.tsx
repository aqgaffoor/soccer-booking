import { useState, useEffect } from 'react';
import { MapPin, Star, Search, SlidersHorizontal, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import court1 from '../assets/court-1.png';
import court2 from '../assets/court-2.png';
import court3 from '../assets/court-3.png';
import './Courts.css';

const MOCK_COURTS = [
  { id: 1, name: "Elite Turf Umhlanga", location: "Umhlanga Ridge, Durban", rating: 4.8, image: court1, price: "R 450/hr", priceNum: 450, format: "5v5 / 7v7", type: "Outdoor", description: "Premium 5-a-side artificial turf with modern facilities and floodlights." },
  { id: 2, name: "Downtown Soccer Arena", location: "Morningside, Durban", rating: 4.9, image: court2, price: "R 350/hr", priceNum: 350, format: "5v5", type: "Indoor", description: "Indoor arena perfect for all-weather matches. High quality turf." },
  { id: 3, name: "Premier Pitch Westville", location: "Westville, Durban", rating: 4.7, image: court3, price: "R 500/hr", priceNum: 500, format: "7v7", type: "Outdoor", description: "Scenic outdoor pitch ideal for 7-a-side games and tournaments." },
  { id: 4, name: "KwaMashu Sports Complex", location: "KwaMashu, Durban", rating: 4.5, image: court1, price: "R 280/hr", priceNum: 280, format: "5v5", type: "Outdoor", description: "Community complex with multiple well-maintained soccer pitches." },
  { id: 5, name: "Ballito Beach Soccer Dome", location: "Ballito, KZN", rating: 4.6, image: court2, price: "R 390/hr", priceNum: 390, format: "5v5", type: "Indoor", description: "Climate-controlled indoor dome near the beautiful Ballito coastline." },
  { id: 6, name: "Pinetown FC Ground", location: "Pinetown, Durban", rating: 4.4, image: court3, price: "R 320/hr", priceNum: 320, format: "7v7 / 11v11", type: "Outdoor", description: "Full-size grass pitch, ideal for competitive matches and training." },
];

const FORMATS = ['All', '5v5', '7v7', '11v11'];
const TYPES = ['All', 'Indoor', 'Outdoor'];
const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Courts() {
  const [allCourts, setAllCourts] = useState<any[]>(MOCK_COURTS);
  const [filteredCourts, setFilteredCourts] = useState<any[]>(MOCK_COURTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('courts').select('*');
        if (!error && data && data.length > 0) {
          setAllCourts(data);
        }
      } catch {
        // use mock data
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, []);

  useEffect(() => {
    let courts = [...allCourts];

    if (search.trim()) {
      const q = search.toLowerCase();
      courts = courts.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.location_area?.toLowerCase().includes(q)
      );
    }

    if (formatFilter !== 'All') {
      courts = courts.filter(c => c.format?.includes(formatFilter));
    }

    if (typeFilter !== 'All') {
      courts = courts.filter(c => c.type === typeFilter);
    }

    if (sortBy === 'rating') {
      courts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'price_asc') {
      courts.sort((a, b) => (a.priceNum || a.hourly_rate_zar || 0) - (b.priceNum || b.hourly_rate_zar || 0));
    } else if (sortBy === 'price_desc') {
      courts.sort((a, b) => (b.priceNum || b.hourly_rate_zar || 0) - (a.priceNum || a.hourly_rate_zar || 0));
    }

    setFilteredCourts(courts);
  }, [allCourts, search, formatFilter, typeFilter, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setFormatFilter('All');
    setTypeFilter('All');
    setSortBy('rating');
  };

  const hasActiveFilters = search || formatFilter !== 'All' || typeFilter !== 'All';

  return (
    <div className="courts-page">
      {/* Page Header */}
      <div className="courts-page-header">
        <div className="container">
          <h1 className="courts-page-title">Soccer Courts</h1>
          <p className="courts-page-subtitle">
            {filteredCourts.length} court{filteredCourts.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      <div className="container courts-page-content">
        {/* Search & Filters Bar */}
        <div className="courts-controls">
          <div className="courts-search-wrap">
            <Search size={18} className="courts-search-icon" />
            <input
              id="courts-search-input"
              type="text"
              className="courts-search-input"
              placeholder="Search courts, locations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search courts"
            />
            {search && (
              <button className="courts-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>

          <button
            id="courts-filter-btn"
            className={`btn btn-secondary filter-btn ${showFilters ? 'filter-btn-active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            Filters
            {hasActiveFilters && <span className="filter-dot" />}
          </button>

          <select
            id="courts-sort"
            className="form-input courts-sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            aria-label="Sort courts"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <div className="filter-label">Format</div>
              <div className="filter-chips">
                {FORMATS.map(f => (
                  <button
                    key={f}
                    className={`filter-chip ${formatFilter === f ? 'filter-chip-active' : ''}`}
                    onClick={() => setFormatFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-label">Type</div>
              <div className="filter-chips">
                {TYPES.map(t => (
                  <button
                    key={t}
                    className={`filter-chip ${typeFilter === t ? 'filter-chip-active' : ''}`}
                    onClick={() => setTypeFilter(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm clear-filters-btn" onClick={clearFilters}>
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Courts Grid */}
        {loading ? (
          <div className="courts-list-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="court-list-card-skeleton">
                <div className="skeleton" style={{ height: '200px' }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="skeleton" style={{ height: '18px', width: '70%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '45%' }} />
                  <div className="skeleton" style={{ height: '38px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚽</div>
            <h3>No courts found</h3>
            <p>Try adjusting your filters or search term.</p>
            <button className="btn btn-outline" onClick={clearFilters}>Clear all filters</button>
          </div>
        ) : (
          <div className="courts-list-grid">
            {filteredCourts.map(court => (
              <div
                key={court.id}
                className="court-list-card"
                onClick={() => navigate(`/court/${court.id}`)}
                role="button"
                tabIndex={0}
                aria-label={`View ${court.name}`}
                onKeyDown={e => e.key === 'Enter' && navigate(`/court/${court.id}`)}
              >
                <div className="court-list-image">
                  <img src={court.image_url || court.image} alt={court.name} loading="lazy" />
                  {court.type && <span className="court-type-badge">{court.type}</span>}
                  <span className="court-price-badge">{court.price || `R ${court.hourly_rate_zar}/hr`}</span>
                </div>
                <div className="court-list-info">
                  <div className="court-list-meta">
                    <h3 className="court-name">{court.name}</h3>
                    <div className="court-rating">
                      <Star size={13} fill="currentColor" />
                      <span>{court.rating || 'New'}</span>
                    </div>
                  </div>
                  <p className="court-location">
                    <MapPin size={13} />
                    {court.location || court.location_area}
                  </p>
                  {court.format && (
                    <div className="court-format-tag">⚽ {court.format}</div>
                  )}
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
      </div>
    </div>
  );
}
