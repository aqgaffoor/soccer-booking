import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Users, ArrowLeft, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import court1 from '../assets/court-1.png';
import court2 from '../assets/court-2.png';
import court3 from '../assets/court-3.png';

const MOCK_COURTS = [
  { id: 1, name: "Elite Turf Umhlanga", location: "Umhlanga Ridge, Durban", rating: 4.8, image: court1, price: "R 450/hr", description: "Premium 5-a-side artificial turf with modern facilities and floodlights." },
  { id: 2, name: "Downtown Soccer Arena", location: "Morningside, Durban", rating: 4.9, image: court2, price: "R 350/hr", description: "Indoor arena perfect for all-weather matches. High quality turf." },
  { id: 3, name: "Premier Pitch Westville", location: "Westville, Durban", rating: 4.7, image: court3, price: "R 500/hr", description: "Scenic outdoor pitch ideal for 7-a-side games and tournaments." }
];

export default function CourtDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourtDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('courts').select('*').eq('id', id).single();
        if (error || !data) {
          throw new Error('Not found in DB');
        }
        setCourt(data);
      } catch (err) {
        // Fallback to mock
        const mockCourt = MOCK_COURTS.find(c => c.id.toString() === id);
        if (mockCourt) {
          setCourt(mockCourt);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourtDetails();
  }, [id]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  if (!court) return <div style={{ padding: '4rem', textAlign: 'center' }}>Court not found</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-outline"
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        <div>
          <img 
            src={court.image_url || court.image} 
            alt={court.name} 
            style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', height: '400px' }} 
          />
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{court.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <Star size={20} fill="var(--primary-color)" color="var(--primary-color)" />
              <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{court.rating || '4.8'}</span>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', marginBottom: '2rem' }}>
            <MapPin size={20} />
            {court.location || court.location_area}
          </p>

          <p style={{ fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            {court.description || "Experience top-tier soccer facilities. Our pitches are meticulously maintained to provide the perfect playing surface for teams of all skill levels. Book now to secure your spot."}
          </p>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--surface-color)', padding: '1rem', borderRadius: '12px' }}>
                <Clock size={24} color="var(--primary-color)" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Open</div>
                <div style={{ fontWeight: 'bold' }}>06:00 - 23:00</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--surface-color)', padding: '1rem', borderRadius: '12px' }}>
                <Users size={24} color="var(--primary-color)" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Format</div>
                <div style={{ fontWeight: 'bold' }}>5v5 / 7v7</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Price</span>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{court.price || `R ${court.hourly_rate_zar}/hr`}</span>
            </div>
            
            <button className="btn btn-primary w-full" style={{ padding: '1rem', fontSize: '1.125rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <Calendar size={20} /> Confirm Booking
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              No credit card required for booking request
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
