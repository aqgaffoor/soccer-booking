import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User, Calendar, Settings, ChevronRight,
  Activity, Wallet, HelpCircle, Shield, LogOut, ArrowLeft,
  CheckCircle, Clock, XCircle, Edit3, Phone, Mail, MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Account.css';

type TabId = 'overview' | 'bookings' | 'past' | 'profile' | 'settings';

interface Booking {
  id: string;
  court_name: string;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  price_zar: number;
  status: string;
}

export default function Account() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawParam = searchParams.get('tab');
  // Alias mapping: 'upcoming' → 'bookings', 'history' → 'past'
  const TAB_ALIAS: Record<string, TabId> = { upcoming: 'bookings', history: 'past' };
  const paramTab = (TAB_ALIAS[rawParam ?? ''] || rawParam) as TabId | null;

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ full_name: '', phone: '', gender: '', date_of_birth: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>((paramTab && ['overview','bookings','past','profile','settings'].includes(paramTab)) ? paramTab : 'overview');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);
      setProfile(prev => ({
        ...prev,
        full_name: session.user.user_metadata?.full_name || '',
        phone: session.user.user_metadata?.phone || '',
        gender: session.user.user_metadata?.gender || '',
        date_of_birth: session.user.user_metadata?.date_of_birth || '',
      }));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate('/auth');
      else {
        setUser(session.user);
        setProfile(prev => ({
          ...prev,
          full_name: session.user.user_metadata?.full_name || prev.full_name,
          phone: session.user.user_metadata?.phone || prev.phone,
          gender: session.user.user_metadata?.gender || prev.gender,
          date_of_birth: session.user.user_metadata?.date_of_birth || prev.date_of_birth,
        }));
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Sync URL param → tab
  useEffect(() => {
    if (paramTab) setActiveTab(paramTab);
  }, [paramTab]);

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    setSearchParams(tab === 'overview' ? {} : { tab });
  };

  // Fetch bookings
  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      setBookingsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      try {
        const { data: upcoming } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .gte('booking_date', today)
          .order('booking_date', { ascending: true });

        const { data: past } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .lt('booking_date', today)
          .order('booking_date', { ascending: false });

        setUpcomingBookings((upcoming as Booking[]) || []);
        setPastBookings((past as Booking[]) || []);
      } catch {
        // tables may not exist yet
      } finally {
        setBookingsLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const getUserInitials = () => {
    const name = profile.full_name || user?.user_metadata?.full_name;
    if (name) return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    return user?.email?.substring(0, 2).toUpperCase() ?? 'U';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone: profile.phone,
          gender: profile.gender,
          date_of_birth: profile.date_of_birth,
        }
      });
      if (error) throw error;

      // Upsert profile table
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
      });

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to save profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
      setUpcomingBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch {
      // handle gracefully
    } finally {
      setCancellingId(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-ZA', {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch { return dateStr; }
  };

  const ACCOUNT_MENU = [
    { id: 'profile' as TabId, icon: User, label: 'Edit profile', sub: 'Name, email, phone, gender, DOB' },
    { id: 'bookings' as TabId, icon: Calendar, label: 'My bookings', sub: `${upcomingBookings.length} upcoming` },
    { id: 'past' as TabId, icon: Activity, label: 'Your activity', sub: 'Past matches and bookings' },
    { id: 'settings' as TabId, icon: Settings, label: 'Settings', sub: 'Privacy, notifications, security' },
  ];

  if (!user) return (
    <div className="page-loader">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="account-page">
      <div className="account-container">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="account-overview">
            {/* Profile Header */}
            <div className="account-profile-header">
              <div className="account-avatar">{getUserInitials()}</div>
              <div className="account-header-info">
                <h1 className="account-name">{profile.full_name || user.email?.split('@')[0] || 'Player'}</h1>
                <p className="account-plan">Standard account</p>
              </div>
            </div>

            <div className="account-header-actions">
              <button className="btn btn-primary account-premium-btn" id="account-go-premium">
                ⭐ Go Premium
              </button>
              <button className="btn btn-outline account-share-btn" id="account-share">
                Share profile
              </button>
            </div>

            {/* Your Account Section */}
            <div className="account-section">
              <h2 className="account-section-title">Your account</h2>
              <div className="account-menu-card">
                {ACCOUNT_MENU.map(item => (
                  <button
                    key={item.id}
                    id={`account-menu-${item.id}`}
                    className="account-menu-item"
                    onClick={() => changeTab(item.id)}
                  >
                    <div className="account-menu-icon">
                      <item.icon size={20} />
                    </div>
                    <div className="account-menu-text">
                      <div className="account-menu-label">{item.label}</div>
                      <div className="account-menu-sub">{item.sub}</div>
                    </div>
                    <ChevronRight size={18} className="account-menu-arrow" />
                  </button>
                ))}
              </div>
            </div>

            {/* Support Section */}
            <div className="account-section">
              <h2 className="account-section-title">Support</h2>
              <div className="account-menu-card">
                <button className="account-menu-item" id="account-help">
                  <div className="account-menu-icon"><HelpCircle size={20} /></div>
                  <div className="account-menu-text">
                    <div className="account-menu-label">Help</div>
                  </div>
                  <ChevronRight size={18} className="account-menu-arrow" />
                </button>
                <button className="account-menu-item" id="account-how-it-works">
                  <div className="account-menu-icon"><Wallet size={20} /></div>
                  <div className="account-menu-text">
                    <div className="account-menu-label">How CourtConnect works</div>
                  </div>
                  <ChevronRight size={18} className="account-menu-arrow" />
                </button>
              </div>
            </div>

            {/* Legal */}
            <div className="account-section">
              <h2 className="account-section-title">Legal information</h2>
              <div className="account-menu-card">
                <button className="account-menu-item" id="account-privacy">
                  <div className="account-menu-icon"><Shield size={20} /></div>
                  <div className="account-menu-text">
                    <div className="account-menu-label">Privacy policy</div>
                  </div>
                  <ChevronRight size={18} className="account-menu-arrow" />
                </button>
              </div>
            </div>

            {/* Sign Out */}
            <button className="btn btn-danger w-full signout-btn" id="account-signout" onClick={handleSignOut}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        )}

        {/* EDIT PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="account-subpage">
            <div className="subpage-header">
              <button className="subpage-back-btn" id="profile-back-btn" onClick={() => changeTab('overview')}>
                <ArrowLeft size={18} />
              </button>
              <h2 className="subpage-title">Edit profile</h2>
            </div>

            <div className="profile-avatar-section">
              <div className="account-avatar account-avatar-xl">{getUserInitials()}</div>
              <button className="profile-avatar-change" id="profile-avatar-change-btn">Change profile picture</button>
            </div>

            <form className="profile-form" onSubmit={handleSaveProfile}>
              <div className="profile-form-section">
                <h3 className="profile-form-title">Personal information</h3>

                <div className="profile-field">
                  <label className="profile-field-label">Name and Surname</label>
                  <input
                    id="profile-full-name"
                    type="text"
                    className="profile-field-input"
                    value={profile.full_name}
                    onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-field-label">Email</label>
                  <input
                    id="profile-email"
                    type="email"
                    className="profile-field-input"
                    value={user.email || ''}
                    disabled
                  />
                </div>

                <div className="profile-field-row">
                  <div className="profile-field profile-field-sm">
                    <label className="profile-field-label">Country code</label>
                    <select
                      id="profile-country-code"
                      className="profile-field-input"
                    >
                      <option value="+27">ZA (+27)</option>
                      <option value="+1">US (+1)</option>
                      <option value="+44">UK (+44)</option>
                    </select>
                  </div>
                  <div className="profile-field" style={{ flex: 1 }}>
                    <label className="profile-field-label">Phone</label>
                    <input
                      id="profile-phone"
                      type="tel"
                      className="profile-field-input"
                      value={profile.phone}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      placeholder="0812665777"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label className="profile-field-label">Gender</label>
                  <select
                    id="profile-gender"
                    className="profile-field-input"
                    value={profile.gender}
                    onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="profile-field">
                  <label className="profile-field-label">Date of birth</label>
                  <input
                    id="profile-dob"
                    type="date"
                    className="profile-field-input"
                    value={profile.date_of_birth}
                    onChange={e => setProfile(p => ({ ...p, date_of_birth: e.target.value }))}
                  />
                </div>
              </div>

              {profileError && <div className="alert alert-error">{profileError}</div>}
              {profileSaved && <div className="alert alert-success"><CheckCircle size={16} /> Profile saved successfully!</div>}

              <button
                type="submit"
                id="profile-save-btn"
                className="btn btn-primary w-full btn-lg"
                disabled={profileLoading}
              >
                {profileLoading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Saving...</> : <><Edit3 size={16} /> Save Changes</>}
              </button>
            </form>
          </div>
        )}

        {/* UPCOMING BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="account-subpage">
            <div className="subpage-header">
              <button className="subpage-back-btn" id="bookings-back-btn" onClick={() => changeTab('overview')}>
                <ArrowLeft size={18} />
              </button>
              <h2 className="subpage-title">My Bookings</h2>
            </div>

            {bookingsLoading ? (
              <div className="page-loader" style={{ minHeight: 300 }}>
                <div className="spinner" />
                <p>Loading your bookings...</p>
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>No upcoming bookings</h3>
                <p>You haven't booked any courts yet. Find a court and get playing!</p>
                <Link to="/courts" className="btn btn-primary">Browse Courts</Link>
              </div>
            ) : (
              <div className="bookings-list">
                {upcomingBookings.map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-card-header">
                      <div className="booking-status-badge badge badge-success">
                        <CheckCircle size={12} /> Confirmed
                      </div>
                      <div className="booking-price">R {booking.price_zar}</div>
                    </div>
                    <h3 className="booking-court-name">{booking.court_name}</h3>
                    <div className="booking-details">
                      <div className="booking-detail">
                        <Calendar size={14} />
                        {formatDate(booking.booking_date)}
                      </div>
                      <div className="booking-detail">
                        <Clock size={14} />
                        {booking.start_time} · {booking.duration_minutes} min
                      </div>
                    </div>
                    <div className="booking-actions">
                      <Link to={`/court/${booking.court_name?.split(' ')[0]}`} className="btn btn-outline btn-sm">
                        View Court
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        id={`cancel-booking-${booking.id}`}
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : <><XCircle size={14} /> Cancel</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAST BOOKINGS / ACTIVITY TAB */}
        {activeTab === 'past' && (
          <div className="account-subpage">
            <div className="subpage-header">
              <button className="subpage-back-btn" id="past-back-btn" onClick={() => changeTab('overview')}>
                <ArrowLeft size={18} />
              </button>
              <h2 className="subpage-title">Your Activity</h2>
            </div>

            {/* Activity Menu */}
            <div className="activity-menu">
              {[
                { icon: '⚽', label: 'Matches', sub: `${pastBookings.length} completed` },
                { icon: '🏆', label: 'Competitions', sub: 'Tournaments joined' },
                { icon: '👥', label: 'Groups', sub: 'Teams and groups' },
                { icon: '❤️', label: 'Favourite clubs', sub: 'Saved courts' },
              ].map((item, i) => (
                <button key={i} className="activity-menu-item" id={`activity-${item.label.toLowerCase()}`}>
                  <span className="activity-icon">{item.icon}</span>
                  <div className="activity-text">
                    <div className="activity-label">{item.label}</div>
                    <div className="activity-sub">{item.sub}</div>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 className="account-section-title">Past bookings</h3>
                <div className="bookings-list">
                  {pastBookings.map(booking => (
                    <div key={booking.id} className="booking-card booking-card-past">
                      <div className="booking-card-header">
                        <div className="booking-status-badge badge badge-warning">
                          <CheckCircle size={12} /> Completed
                        </div>
                        <div className="booking-price">R {booking.price_zar}</div>
                      </div>
                      <h3 className="booking-court-name">{booking.court_name}</h3>
                      <div className="booking-details">
                        <div className="booking-detail">
                          <Calendar size={14} />
                          {formatDate(booking.booking_date)}
                        </div>
                        <div className="booking-detail">
                          <Clock size={14} />
                          {booking.start_time} · {booking.duration_minutes} min
                        </div>
                      </div>
                      <div className="booking-actions">
                        <Link to="/courts" className="btn btn-primary btn-sm">
                          Book Again
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length === 0 && (
              <div className="empty-state" style={{ marginTop: '1.5rem' }}>
                <div className="empty-icon">🎮</div>
                <h3>No activity yet</h3>
                <p>Your match history and completed bookings will appear here.</p>
                <Link to="/courts" className="btn btn-primary">Find a Court</Link>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="account-subpage">
            <div className="subpage-header">
              <button className="subpage-back-btn" id="settings-back-btn" onClick={() => changeTab('overview')}>
                <ArrowLeft size={18} />
              </button>
              <h2 className="subpage-title">Settings</h2>
            </div>

            <div className="account-section">
              <h2 className="account-section-title">Account</h2>
              <div className="account-menu-card">
                {[
                  { icon: Mail, label: 'Email notifications', sub: 'Booking confirmations, reminders' },
                  { icon: Phone, label: 'SMS notifications', sub: 'Match alerts and updates' },
                  { icon: MapPin, label: 'Location services', sub: 'Find courts near you' },
                  { icon: Shield, label: 'Privacy & Security', sub: 'Password, data settings' },
                ].map((item, i) => (
                  <button key={i} className="account-menu-item" id={`settings-${item.label.toLowerCase().replace(' ', '-')}`}>
                    <div className="account-menu-icon"><item.icon size={20} /></div>
                    <div className="account-menu-text">
                      <div className="account-menu-label">{item.label}</div>
                      <div className="account-menu-sub">{item.sub}</div>
                    </div>
                    <ChevronRight size={18} className="account-menu-arrow" />
                  </button>
                ))}
              </div>
            </div>

            <div className="danger-zone">
              <h2 className="account-section-title" style={{ color: 'var(--error)' }}>Danger zone</h2>
              <button className="btn btn-danger w-full" id="settings-delete-account">
                Delete Account
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
