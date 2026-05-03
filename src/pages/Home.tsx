import { Search, MapPin, ChevronRight, Star } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';
import './Home.css';

const MOCK_COURTS = [
  {
    id: 1,
    name: "Elite Turf London",
    location: "141 NE 13th Terrace",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1518605368461-1ee7e53f1917?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    price: "$120/hr"
  },
  {
    id: 2,
    name: "Downtown Soccer Arena",
    location: "340 Rue des Pyrénées",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    price: "$95/hr"
  },
  {
    id: 3,
    name: "Premier Pitch Zurich",
    location: "Brandstrasse 12",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1551280857-2b9ebf240217?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    price: "$150/hr"
  }
];

export default function Home() {
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

          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Address, club, city..." 
              className="search-input"
            />
            <button className="btn btn-primary search-btn">Search</button>
          </div>
        </div>
      </section>

      {/* Courts Section */}
      <section className="container courts-section">
        <div className="section-header">
          <h2 className="section-title">Top searched courts worldwide</h2>
          <button className="view-all">View all <ChevronRight size={16} /></button>
        </div>

        <div className="courts-grid">
          {MOCK_COURTS.map(court => (
            <div key={court.id} className="court-card">
              <div className="court-image">
                <img src={court.image} alt={court.name} />
                <div className="court-price">{court.price}</div>
              </div>
              <div className="court-info">
                <div className="court-header">
                  <h3 className="court-name">{court.name}</h3>
                  <div className="court-rating">
                    <Star size={14} className="star-icon" fill="currentColor" />
                    <span>{court.rating}</span>
                  </div>
                </div>
                <p className="court-location">
                  <MapPin size={14} />
                  {court.location}
                </p>
                <button className="btn btn-primary w-full mt-4">Book now</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
