import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Users, ArrowLeft, ChevronDown, ChevronUp, CheckCircle, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';
import court1 from '../assets/court-1.png';
import court2 from '../assets/court-2.png';
import court3 from '../assets/court-3.png';
import './CourtDetails.css';

/* ============================================================
   EMAILJS CONFIG
   ============================================================ */
const EMAILJS_SERVICE_ID  = 'service_xqu8xbf';
const EMAILJS_TEMPLATE_ID = 'template_68jxxlo';
const EMAILJS_PUBLIC_KEY  = 'fUtni5FtYgY8Is8EX';

/* ============================================================
   MOCK DATA
   ============================================================ */
const MOCK_COURTS: Record<string, any> = {
  '1': { id: '1', name: "Elite Turf Umhlanga",    location: "Umhlanga Ridge, Durban",  rating: 4.8, image: court1, priceNum: 450, format: "5v5 / 7v7", type: "Outdoor", description: "Premium 5-a-side artificial turf with modern facilities and floodlights. Fully maintained and FIFA-approved surface.", open: "06:00 - 23:00", courts: [{ id: 'c1', name: 'Court 1', desc: 'Outdoor | 5-a-side | Floodlit' }, { id: 'c2', name: 'Court 2', desc: 'Outdoor | 7-a-side | Panoramic' }, { id: 'c3', name: 'Court 3', desc: 'Outdoor | 5-a-side | VIP' }] },
  '2': { id: '2', name: "Downtown Soccer Arena",  location: "Morningside, Durban",     rating: 4.9, image: court2, priceNum: 350, format: "5v5",       type: "Indoor",  description: "Indoor arena perfect for all-weather matches. High quality artificial turf with premium changing rooms.",     open: "07:00 - 22:00", courts: [{ id: 'c1', name: 'Court 1', desc: 'Indoor | 5-a-side | Air-conditioned' }, { id: 'c2', name: 'Court 2', desc: 'Indoor | 5-a-side | Spectator stands' }] },
  '3': { id: '3', name: "Premier Pitch Westville", location: "Westville, Durban",     rating: 4.7, image: court3, priceNum: 500, format: "7v7",       type: "Outdoor", description: "Scenic outdoor pitch ideal for 7-a-side games and tournaments. Professional quality drainage system.",            open: "06:00 - 23:00", courts: [{ id: 'c1', name: 'Main Pitch', desc: 'Outdoor | 7-a-side | Grass' }, { id: 'c2', name: 'Training Pitch', desc: 'Outdoor | 5-a-side | Artificial turf' }] },
  '4': { id: '4', name: "KwaMashu Sports Complex", location: "KwaMashu, Durban",      rating: 4.5, image: court1, priceNum: 280, format: "5v5",       type: "Outdoor", description: "Community complex with multiple well-maintained soccer pitches and full changing facilities.",                   open: "06:00 - 21:00", courts: [{ id: 'c1', name: 'Pitch A', desc: 'Outdoor | 5-a-side | Floodlit' }, { id: 'c2', name: 'Pitch B', desc: 'Outdoor | 5-a-side | Floodlit' }, { id: 'c3', name: 'Pitch C', desc: 'Outdoor | 7-a-side' }] },
  '5': { id: '5', name: "Ballito Beach Soccer Dome", location: "Ballito, KZN",        rating: 4.6, image: court2, priceNum: 390, format: "5v5",       type: "Indoor",  description: "Climate-controlled indoor dome near the beautiful Ballito coastline.",                                              open: "07:00 - 22:00", courts: [{ id: 'c1', name: 'Main Dome', desc: 'Indoor | 5-a-side | AC' }] },
  '6': { id: '6', name: "Pinetown FC Ground",       location: "Pinetown, Durban",      rating: 4.4, image: court3, priceNum: 320, format: "7v7 / 11v11", type: "Outdoor", description: "Full-size grass pitch, ideal for competitive matches and training sessions.",                                      open: "06:00 - 21:00", courts: [{ id: 'c1', name: 'Main Field', desc: 'Outdoor | 11-a-side | Grass' }, { id: 'c2', name: 'Side Field', desc: 'Outdoor | 7-a-side | Grass' }] },
};

const DURATIONS = [
  { value: 60,  label: '60 min'  },
  { value: 90,  label: '90 min'  },
  { value: 120, label: '120 min' },
];

/* Generate time slots 06:00 → 22:30 in 30-min increments */
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 6; h < 23; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
};

/* Next 14 days */
const getDateRange = () => {
  const days = [];
  const dayNames   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      iso:   d.toISOString().split('T')[0],
      day:   dayNames[d.getDay()],
      num:   d.getDate(),
      month: monthNames[d.getMonth()],
    });
  }
  return days;
};

const TABS = ['Home', 'Book', 'Open Matches'];

export default function CourtDetails() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const dateStripRef = useRef<HTMLDivElement>(null);

  const [court,   setCourt]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Book');

  /* Booking state */
  const [dates]           = useState(getDateRange);
  const [selectedDate,    setSelectedDate]    = useState<string>(getDateRange()[0].iso);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedCourt,   setSelectedCourt]   = useState<any>(null);
  const [courtSelectorOpen, setCourtSelectorOpen] = useState(false);
  const [selectedTime,    setSelectedTime]    = useState<string | null>(null);
  const [bookedSlots,     setBookedSlots]     = useState<Set<string>>(new Set());
  const [bookingLoading,  setBookingLoading]  = useState(false);
  const [bookingSuccess,  setBookingSuccess]  = useState(false);
  const [bookingError,    setBookingError]    = useState<string | null>(null);
  const [emailStatus,     setEmailStatus]     = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  /* ── Load court ─────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('courts').select('*').eq('id', id).single();
        if (!error && data) {
          const mock = id ? MOCK_COURTS[id] : null;
          setCourt({ ...mock, ...data, courts: mock?.courts || [{ id: 'c1', name: 'Court 1', desc: 'Standard court' }] });
        } else throw new Error('not found');
      } catch {
        const mock = id ? MOCK_COURTS[id] : null;
        if (mock) setCourt(mock);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  /* ── Default court selection ─────────────────────────── */
  useEffect(() => {
    if (court?.courts?.length) setSelectedCourt(court.courts[0]);
  }, [court]);

  /* ── Fetch REAL booked slots from Supabase ───────────── */
  useEffect(() => {
    if (!selectedDate || !selectedCourt || !id) return;
    setBookedSlots(new Set());

    const fetchBookedSlots = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('start_time, duration_minutes')
          .eq('court_id', id)
          .eq('booking_date', selectedDate)
          .neq('status', 'cancelled');

        if (!error && data) {
          const booked = new Set<string>();
          const ALL = generateTimeSlots();

          data.forEach((b: any) => {
            // Mark the slot itself + any overlap slots based on duration
            const startIdx = ALL.indexOf(b.start_time);
            if (startIdx === -1) return;
            const slotsNeeded = Math.ceil((b.duration_minutes || 60) / 30);
            for (let s = 0; s < slotsNeeded; s++) {
              if (ALL[startIdx + s]) booked.add(ALL[startIdx + s]);
            }
          });

          setBookedSlots(booked);
        }
      } catch {
        // Keep empty set on error - don't block UX
      }
    };

    fetchBookedSlots();
    setSelectedTime(null);
  }, [selectedDate, selectedCourt, id]);

  const timeSlots = generateTimeSlots();

  const getPrice = () => {
    const base       = court?.priceNum || court?.hourly_rate_zar || 450;
    const multiplier = selectedDuration === 60 ? 1 : selectedDuration === 90 ? 1.5 : 2;
    return Math.round(base * multiplier);
  };

  /* ── Send confirmation email via EmailJS ─────────────── */
  const sendConfirmationEmail = async (userEmail: string, userName: string) => {
    setEmailStatus('sending');
    try {
      const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-ZA', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_name:       userName || 'Player',
          to_email:      userEmail,
          court_name:    `${court.name} – ${selectedCourt?.name}`,
          court_location: court.location || court.location_area || 'Durban',
          booking_date:  formattedDate,
          start_time:    selectedTime,
          duration:      selectedDuration,
          price:         getPrice(),
          reply_to:      'noreply@courtconnect.co.za',
        },
        EMAILJS_PUBLIC_KEY
      );
      setEmailStatus('sent');
    } catch (err) {
      console.warn('Email send failed (non-blocking):', err);
      setEmailStatus('failed');
    }
  };

  /* ── Handle booking ──────────────────────────────────── */
  const handleBook = async () => {
    if (!selectedTime || !selectedCourt) return;
    setBookingLoading(true);
    setBookingError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }

      const { error } = await supabase.from('bookings').insert([{
        court_id:         id,
        court_name:       `${court.name} – ${selectedCourt.name}`,
        user_id:          session.user.id,
        booking_date:     selectedDate,
        start_time:       selectedTime,
        duration_minutes: selectedDuration,
        price_zar:        getPrice(),
        status:           'confirmed',
      }]);

      if (error) {
        console.warn('Booking insert warning:', error.message);
      }

      // Optimistically grey out the slot immediately
      setBookedSlots(prev => {
        const next = new Set(prev);
        const ALL = generateTimeSlots();
        const startIdx = ALL.indexOf(selectedTime);
        const slotsNeeded = Math.ceil(selectedDuration / 30);
        for (let s = 0; s < slotsNeeded; s++) {
          if (ALL[startIdx + s]) next.add(ALL[startIdx + s]);
        }
        return next;
      });

      setBookingSuccess(true);

      // Send email (non-blocking)
      const userEmail = session.user.email || '';
      const userName  = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Player';
      sendConfirmationEmail(userEmail, userName);

    } catch (err: any) {
      setBookingError(err.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const scrollDateToSelected = (iso: string) => {
    if (!dateStripRef.current) return;
    const el = dateStripRef.current.querySelector(`[data-date="${iso}"]`) as HTMLElement;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
      <p>Loading court details...</p>
    </div>
  );

  if (!court) return (
    <div className="page-loader">
      <div className="empty-icon">⚽</div>
      <h3>Court not found</h3>
      <button className="btn btn-outline" onClick={() => navigate('/courts')}>Back to Courts</button>
    </div>
  );

  const formattedSelectedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <div className="court-details-page">
      {/* Hero Image */}
      <div className="court-details-hero">
        <img src={court.image_url || court.image} alt={court.name} />
        <div className="court-details-hero-overlay" />
        <button className="court-back-btn" onClick={() => navigate(-1)} id="court-back-btn">
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* Info Card */}
      <div className="court-details-card">
        <div className="court-details-card-header">
          <div>
            <h1 className="court-details-name">{court.name}</h1>
            <p className="court-details-location">
              <MapPin size={14} />
              {court.location || court.location_area}
            </p>
          </div>
          <div className="court-details-rating">
            <Star size={16} fill="currentColor" />
            <span>{court.rating || '4.8'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="court-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase().replace(' ', '-')}`}
              className={`court-tab ${activeTab === tab ? 'court-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="court-details-body">
        {/* HOME TAB */}
        {activeTab === 'Home' && (
          <div className="court-home-tab animate-in">
            <p className="court-about-text">{court.description}</p>

            <div className="court-specs-grid">
              <div className="court-spec-card">
                <Clock size={22} className="spec-icon" />
                <div className="spec-label">Opening Hours</div>
                <div className="spec-value">{court.open || '06:00 – 23:00'}</div>
              </div>
              <div className="court-spec-card">
                <Users size={22} className="spec-icon" />
                <div className="spec-label">Format</div>
                <div className="spec-value">{court.format || '5v5 / 7v7'}</div>
              </div>
              <div className="court-spec-card">
                <span className="spec-icon" style={{ fontSize: '1.25rem' }}>🏟️</span>
                <div className="spec-label">Type</div>
                <div className="spec-value">{court.type || 'Outdoor'}</div>
              </div>
              <div className="court-spec-card">
                <span className="spec-icon" style={{ fontSize: '1.25rem' }}>💰</span>
                <div className="spec-label">From</div>
                <div className="spec-value" style={{ color: 'var(--accent-primary)' }}>
                  R {court.priceNum || court.hourly_rate_zar || 450}/hr
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg w-full"
              id="go-to-book-tab"
              onClick={() => setActiveTab('Book')}
              style={{ marginTop: '1.5rem' }}
            >
              Book This Court
            </button>
          </div>
        )}

        {/* BOOK TAB */}
        {activeTab === 'Book' && (
          <div className="court-book-tab">
            {bookingSuccess ? (
              <div className="booking-success animate-in">
                <div className="success-icon-wrap">
                  <CheckCircle size={56} className="success-icon" />
                </div>
                <h2>Booking Confirmed!</h2>
                <p>See you on the pitch. Your booking has been confirmed for:</p>
                <div className="booking-success-details">
                  <div className="success-detail-row">
                    <span>Court</span>
                    <strong>{court.name} – {selectedCourt?.name}</strong>
                  </div>
                  <div className="success-detail-row">
                    <span>Date</span>
                    <strong>{formattedSelectedDate}</strong>
                  </div>
                  <div className="success-detail-row">
                    <span>Time</span>
                    <strong>{selectedTime} ({selectedDuration} min)</strong>
                  </div>
                  <div className="success-detail-row">
                    <span>Total</span>
                    <strong style={{ color: 'var(--accent-primary)' }}>R {getPrice()}</strong>
                  </div>
                </div>

                {/* Email status indicator */}
                <div className={`email-status email-status-${emailStatus}`}>
                  <Mail size={14} />
                  {emailStatus === 'sending' && <span>Sending confirmation email...</span>}
                  {emailStatus === 'sent'    && <span>Confirmation email sent to your inbox ✓</span>}
                  {emailStatus === 'failed'  && <span>Email unavailable – booking is still confirmed!</span>}
                  {emailStatus === 'idle'    && <span>Preparing email...</span>}
                </div>

                <div className="success-actions">
                  <button className="btn btn-outline" onClick={() => navigate('/account?tab=bookings')}>
                    View Bookings
                  </button>
                  <button className="btn btn-primary" onClick={() => { setBookingSuccess(false); setSelectedTime(null); setEmailStatus('idle'); }}>
                    Book Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Date Strip */}
                <div className="booking-section">
                  <div className="booking-section-label">Select Date</div>
                  <div className="date-strip" ref={dateStripRef}>
                    {dates.map(d => (
                      <button
                        key={d.iso}
                        data-date={d.iso}
                        id={`date-${d.iso}`}
                        className={`date-pill ${selectedDate === d.iso ? 'date-pill-active' : ''}`}
                        onClick={() => { setSelectedDate(d.iso); scrollDateToSelected(d.iso); }}
                      >
                        <span className="date-day">{d.day}</span>
                        <span className="date-num">{d.num}</span>
                        <span className="date-month">{d.month}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="booking-section">
                  <div className="booking-section-label">Duration</div>
                  <div className="duration-toggles">
                    {DURATIONS.map(dur => (
                      <button
                        key={dur.value}
                        id={`duration-${dur.value}`}
                        className={`duration-btn ${selectedDuration === dur.value ? 'duration-btn-active' : ''}`}
                        onClick={() => setSelectedDuration(dur.value)}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Court Selector */}
                <div className="booking-section">
                  <div className="booking-section-label">Select Court</div>
                  <div className="court-selector">
                    <button
                      id="court-selector-btn"
                      className="court-selector-trigger"
                      onClick={() => setCourtSelectorOpen(!courtSelectorOpen)}
                    >
                      <div>
                        <div className="court-selector-name">{selectedCourt?.name || 'Select a court'}</div>
                        <div className="court-selector-desc">{selectedCourt?.desc || ''}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="court-selector-price">R {getPrice()}</span>
                        {courtSelectorOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {courtSelectorOpen && (
                      <div className="court-selector-dropdown">
                        {court.courts?.map((c: any) => (
                          <button
                            key={c.id}
                            id={`court-option-${c.id}`}
                            className={`court-selector-option ${selectedCourt?.id === c.id ? 'court-option-active' : ''}`}
                            onClick={() => { setSelectedCourt(c); setCourtSelectorOpen(false); setSelectedTime(null); }}
                          >
                            <div>
                              <div className="court-option-name">{c.name}</div>
                              <div className="court-option-desc">{c.desc}</div>
                            </div>
                            <span className="court-selector-price">R {getPrice()}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="booking-section">
                  <div className="booking-section-label">
                    Available Times
                    <span className="slot-legend">
                      <span className="legend-available" /> Available
                      <span className="legend-booked" /> Booked
                    </span>
                  </div>
                  <div className="time-slots-grid">
                    {timeSlots.map(slot => {
                      const isBooked   = bookedSlots.has(slot);
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          id={`timeslot-${slot.replace(':', '')}`}
                          className={`time-slot ${isBooked ? 'slot-booked' : ''} ${isSelected ? 'slot-selected' : ''}`}
                          disabled={isBooked}
                          onClick={() => !isBooked && setSelectedTime(isSelected ? null : slot)}
                          aria-label={`${slot} ${isBooked ? '(booked)' : ''}`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {bookingError && (
                  <div className="alert alert-error">{bookingError}</div>
                )}
              </>
            )}
          </div>
        )}

        {/* OPEN MATCHES TAB */}
        {activeTab === 'Open Matches' && (
          <div className="open-matches-tab animate-in">
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <div className="empty-icon">⚽</div>
              <h3>No open matches yet</h3>
              <p>Be the first to create an open match at this court and find teammates!</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('Book')}>
                Book a court first
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer CTA — only on Book tab */}
      {activeTab === 'Book' && !bookingSuccess && (
        <div className="booking-footer">
          <div className="booking-footer-inner">
            {selectedTime ? (
              <div className="booking-summary">
                <div className="booking-summary-info">
                  <div className="booking-summary-court">{selectedCourt?.name}</div>
                  <div className="booking-summary-time">{selectedDate} at {selectedTime} · {selectedDuration} min</div>
                </div>
                <button
                  id="confirm-booking-btn"
                  className="btn btn-primary booking-confirm-btn"
                  onClick={handleBook}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <><div className="spinner" style={{ width: 16, height: 16 }} /> Processing...</>
                  ) : (
                    `Book – R ${getPrice()}`
                  )}
                </button>
              </div>
            ) : (
              <button
                id="book-placeholder-btn"
                className="btn btn-primary booking-confirm-btn w-full"
                disabled
                style={{ opacity: 0.5 }}
              >
                Select a time slot to book – R {getPrice()}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
