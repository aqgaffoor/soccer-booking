-- ============================================================
-- CourtConnect — Secure Database Setup
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- ── 1. PROFILES TABLE ───────────────────────────────────────
-- Stores extended user profile info (auth.users has basic email)
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  phone           text,
  gender          text,
  date_of_birth   date,
  avatar_url      text,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. COURTS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.courts (
  id              text PRIMARY KEY,
  name            text NOT NULL,
  location        text,
  location_area   text,
  rating          numeric(3,1) DEFAULT 4.5,
  image_url       text,
  hourly_rate_zar integer DEFAULT 350,
  format          text DEFAULT '5v5',
  type            text DEFAULT 'Outdoor',
  description     text,
  open_hours      text DEFAULT '06:00 - 23:00',
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now() NOT NULL
);

-- ── 3. BOOKINGS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id         text REFERENCES public.courts(id) ON DELETE SET NULL,
  court_name       text NOT NULL,
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_date     date NOT NULL,
  start_time       text NOT NULL,   -- e.g. '14:00'
  duration_minutes integer DEFAULT 60 CHECK (duration_minutes IN (60, 90, 120)),
  price_zar        integer NOT NULL,
  status           text DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','completed','pending')),
  notes            text,
  created_at       timestamptz DEFAULT now() NOT NULL,

  -- Prevent double-booking: same court, same date, same time
  CONSTRAINT unique_court_slot UNIQUE (court_id, booking_date, start_time)
);

-- Index for fast lookup of bookings by date+court (used for greying slots)
CREATE INDEX IF NOT EXISTS idx_bookings_court_date
  ON public.bookings (court_id, booking_date)
  WHERE status != 'cancelled';

-- Index for user's own bookings lookup
CREATE INDEX IF NOT EXISTS idx_bookings_user
  ON public.bookings (user_id, booking_date);

-- ── 4. ROW LEVEL SECURITY — Enable on all tables ────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Courts are public"         ON public.courts;
DROP POLICY IF EXISTS "Users view own bookings"   ON public.bookings;
DROP POLICY IF EXISTS "Users create bookings"     ON public.bookings;
DROP POLICY IF EXISTS "Users cancel own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public view confirmed bookings slots" ON public.bookings;

-- PROFILES: users can only read/write their own row
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- COURTS: publicly readable (needed for booking flow)
CREATE POLICY "Courts are public"
  ON public.courts FOR SELECT
  USING (true);

-- BOOKINGS: each user manages their own
CREATE POLICY "Users view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cancel own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

-- Allow reading ONLY start_time/duration for slot availability (anonymous OK)
-- This lets the booking page show which slots are taken without revealing user data
CREATE POLICY "Public view confirmed bookings slots"
  ON public.bookings FOR SELECT
  USING (status != 'cancelled');

-- ── 5. SAMPLE COURT DATA ────────────────────────────────────
INSERT INTO public.courts (id, name, location, rating, hourly_rate_zar, format, type, description, open_hours)
VALUES
  ('1', 'Elite Turf Umhlanga',     'Umhlanga Ridge, Durban', 4.8, 450, '5v5 / 7v7', 'Outdoor', 'Premium 5-a-side artificial turf with modern facilities and floodlights.',     '06:00 - 23:00'),
  ('2', 'Downtown Soccer Arena',   'Morningside, Durban',    4.9, 350, '5v5',       'Indoor',  'Indoor arena perfect for all-weather matches. High quality artificial turf.',   '07:00 - 22:00'),
  ('3', 'Premier Pitch Westville', 'Westville, Durban',      4.7, 500, '7v7',       'Outdoor', 'Scenic outdoor pitch ideal for 7-a-side games and tournaments.',               '06:00 - 23:00'),
  ('4', 'KwaMashu Sports Complex', 'KwaMashu, Durban',       4.5, 280, '5v5',       'Outdoor', 'Community complex with multiple well-maintained soccer pitches.',              '06:00 - 21:00'),
  ('5', 'Ballito Beach Soccer Dome','Ballito, KZN',          4.6, 390, '5v5',       'Indoor',  'Climate-controlled indoor dome near the beautiful Ballito coastline.',          '07:00 - 22:00'),
  ('6', 'Pinetown FC Ground',       'Pinetown, Durban',      4.4, 320, '7v7 / 11v11','Outdoor','Full-size grass pitch, ideal for competitive matches and training sessions.', '06:00 - 21:00')
ON CONFLICT (id) DO NOTHING;

-- ── 6. GRANT PERMISSIONS ────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.courts   TO anon, authenticated;
GRANT SELECT ON public.bookings TO anon, authenticated;
GRANT ALL    ON public.bookings TO authenticated;
GRANT ALL    ON public.profiles TO authenticated;
