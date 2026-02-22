-- RowRunner Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. VENUES
-- =============================================
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'arena',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. RESTAURANTS (per venue)
-- =============================================
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  eta_minutes INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurants_venue ON public.restaurants(venue_id);

-- =============================================
-- 3. MENU ITEMS
-- =============================================
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  section TEXT,  -- appetizers, mains, drinks, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_restaurant ON public.menu_items(restaurant_id);

-- =============================================
-- 4. USER ROLES (extends auth.users)
-- =============================================
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'runner', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. ORDERS
-- =============================================
CREATE TYPE order_status AS ENUM ('pending', 'claimed', 'confirmed', 'delivered', 'cancelled');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES public.venues(id),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  customer_id UUID REFERENCES auth.users(id),
  runner_id UUID REFERENCES auth.users(id),
  status order_status NOT NULL DEFAULT 'pending',
  section TEXT NOT NULL,
  row TEXT NOT NULL,
  seat TEXT NOT NULL,
  notes TEXT,
  allergy_notes TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  service_fee DECIMAL(10,2) NOT NULL DEFAULT 2.50,
  tip_percent INT,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_intent_id TEXT UNIQUE,
  timing_type TEXT DEFAULT 'asap' CHECK (timing_type IN ('asap', 'scheduled')),
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_venue ON public.orders(venue_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_venue_status ON public.orders(venue_id, status);
CREATE INDEX idx_orders_runner ON public.orders(runner_id);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);

-- =============================================
-- 6. ORDER ITEMS (line items)
-- =============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- =============================================
-- 7. RUNNER VENUE SESSIONS (optional - tracks who's checked in where)
-- =============================================
CREATE TABLE public.runner_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  runner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(runner_id)
);

-- =============================================
-- Updated_at trigger
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
