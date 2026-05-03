import { Search, MapPin, ChevronRight, Star } from 'lucide-react';
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
