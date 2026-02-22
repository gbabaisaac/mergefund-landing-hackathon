-- RowRunner Seed Data
-- Run after 002_rls_policies.sql

-- Venues (real coordinates for proximity detection)
INSERT INTO public.venues (name, city, state, type, latitude, longitude) VALUES
  ('Amica Mutual Pavilion', 'Providence', 'RI', 'arena', 41.8303, -71.4153),
  ('Ryan Center', 'Kingston', 'RI', 'arena', 41.4862, -71.5260),
  ('TD Garden', 'Boston', 'MA', 'arena', 42.3662, -71.0621),
  ('Madison Square Garden', 'New York', 'NY', 'arena', 40.7505, -73.9934),
  ('Crypto.com Arena', 'Los Angeles', 'CA', 'arena', 34.0430, -118.2673)
ON CONFLICT DO NOTHING;

-- Restaurants (Amica Mutual Pavilion)
INSERT INTO public.restaurants (id, venue_id, name, category, eta_minutes)
SELECT
  gen_random_uuid(),
  v.id,
  r.name,
  r.category,
  r.eta
FROM public.venues v
CROSS JOIN (VALUES
  ('Stadium Grill', 'burgers', 15),
  ('Pizza Palace', 'pizza', 20),
  ('Taco Stand', 'mexican', 12)
) AS r(name, category, eta)
WHERE v.name = 'Amica Mutual Pavilion'
ON CONFLICT DO NOTHING;

-- Menu items for Stadium Grill at Amica
INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT
  r.id,
  mi.name,
  mi.description,
  mi.price,
  mi.section
FROM public.restaurants r
JOIN public.venues v ON r.venue_id = v.id
CROSS JOIN (VALUES
  ('Cheeseburger', 'Classic beef patty with cheddar', 12.99, 'Mains'),
  ('Bacon Burger', 'Angus beef with crispy bacon & swiss', 14.99, 'Mains'),
  ('Fries', 'Crispy golden fries', 4.99, 'Sides'),
  ('Onion Rings', 'Beer-battered onion rings', 5.99, 'Sides'),
  ('Soda', 'Coca-Cola, Sprite, or Dr Pepper', 3.49, 'Drinks'),
  ('Water', 'Dasani bottled water', 2.99, 'Drinks'),
  ('Craft Beer', 'Rotating local selection', 9.99, 'Drinks')
) AS mi(name, description, price, section)
WHERE r.name = 'Stadium Grill' AND v.name = 'Amica Mutual Pavilion'
ON CONFLICT DO NOTHING;
