-- Run this in Supabase SQL Editor to upgrade existing venues table
-- and insert the 5 real venues with GPS coordinates

-- Add missing columns (safe to run if they already exist)
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'arena';
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Remove old test venues that lack real data
DELETE FROM public.venues WHERE city IS NULL;

-- Insert 5 real venues with GPS coordinates for proximity detection
INSERT INTO public.venues (name, city, state, type, latitude, longitude, is_active) VALUES
  ('Amica Mutual Pavilion', 'Providence', 'RI', 'arena', 41.8303, -71.4153, true),
  ('Ryan Center', 'Kingston', 'RI', 'arena', 41.4862, -71.5260, true),
  ('TD Garden', 'Boston', 'MA', 'arena', 42.3662, -71.0621, true),
  ('Madison Square Garden', 'New York', 'NY', 'arena', 40.7505, -73.9934, true),
  ('Crypto.com Arena', 'Los Angeles', 'CA', 'arena', 34.0430, -118.2673, true)
ON CONFLICT DO NOTHING;
