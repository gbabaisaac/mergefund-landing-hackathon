-- RowRunner RLS Policies
-- Run after 001_initial_schema.sql

-- Enable RLS on all tables
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runner_sessions ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- VENUES: anyone can read
-- =============================================
CREATE POLICY "Venues are viewable by everyone"
  ON public.venues FOR SELECT
  USING (true);

-- =============================================
-- RESTAURANTS: anyone can read
-- =============================================
CREATE POLICY "Restaurants are viewable by everyone"
  ON public.restaurants FOR SELECT
  USING (true);

-- =============================================
-- MENU ITEMS: anyone can read
-- =============================================
CREATE POLICY "Menu items are viewable by everyone"
  ON public.menu_items FOR SELECT
  USING (true);

-- =============================================
-- USER ROLES: users can read own role
-- =============================================
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage roles
CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (public.get_user_role() = 'admin');

-- =============================================
-- ORDERS
-- =============================================
-- Customers can insert own orders
CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    OR customer_id IS NULL  -- guest checkout
  );

-- Customers can view own orders
CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = customer_id);

-- Runners can view orders for their venue
CREATE POLICY "Runners can view orders at their venue"
  ON public.orders FOR SELECT
  USING (
    public.get_user_role() = 'runner'
    AND venue_id IN (
      SELECT venue_id FROM public.runner_sessions WHERE runner_id = auth.uid()
    )
  );

-- Runners can update orders (claim, mark picked up, delivered)
CREATE POLICY "Runners can update orders"
  ON public.orders FOR UPDATE
  USING (
    public.get_user_role() = 'runner'
    AND venue_id IN (
      SELECT venue_id FROM public.runner_sessions WHERE runner_id = auth.uid()
    )
  );

-- Admins can do anything with orders
CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  USING (public.get_user_role() = 'admin');

-- Service role / anon for inserts from app (guest) - handled by WITH CHECK

-- =============================================
-- ORDER ITEMS
-- =============================================
CREATE POLICY "Order items viewable with order"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (
        o.customer_id = auth.uid()
        OR o.runner_id = auth.uid()
        OR public.get_user_role() = 'admin'
        OR (public.get_user_role() = 'runner' AND o.venue_id IN (
          SELECT venue_id FROM public.runner_sessions WHERE runner_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Order items insert with order"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.customer_id = auth.uid() OR o.customer_id IS NULL)
    )
  );

-- =============================================
-- RUNNER SESSIONS
-- =============================================
CREATE POLICY "Runners can manage own session"
  ON public.runner_sessions FOR ALL
  USING (runner_id = auth.uid())
  WITH CHECK (runner_id = auth.uid());
