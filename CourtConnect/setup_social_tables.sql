-- SQL Setup Script for CourtConnect Social Features

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  level NUMERIC DEFAULT 1.0,
  rating NUMERIC DEFAULT 5.0,
  matches_played INTEGER DEFAULT 0,
  preferred_position TEXT DEFAULT 'Any',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Followers Table
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) NOT NULL,
  following_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS for followers
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Followers viewable by everyone" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.followers FOR DELETE USING (auth.uid() = follower_id);

-- 3. Competitions Table
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  prize TEXT,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for competitions
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Competitions viewable by everyone" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Users can create competitions" ON public.competitions FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update competitions" ON public.competitions FOR UPDATE USING (auth.uid() = creator_id);

-- 4. Payments/Cards Table (Mock for UI purposes)
CREATE TABLE IF NOT EXISTS public.saved_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  card_last4 TEXT NOT NULL,
  card_brand TEXT NOT NULL,
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for saved cards
ALTER TABLE public.saved_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own cards" ON public.saved_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cards" ON public.saved_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cards" ON public.saved_cards FOR DELETE USING (auth.uid() = user_id);

-- 5. Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to prevent errors on multiple runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
