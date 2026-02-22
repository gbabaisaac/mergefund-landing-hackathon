INSERT INTO public.venues (id, name, slug) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Stadium Central', 'stadium-central'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Arena North', 'arena-north'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Concert Hall', 'concert-hall')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.restaurants (id, venue_id, name, category, eta_minutes) VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Stadium Grill', 'American', 15),
  ('b2c3d4e5-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'Pizza Palace', 'Italian', 20),
  ('b2c3d4e5-0003-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001', 'Taco Stand', 'Mexican', 12),
  ('b2c3d4e5-0004-4000-8000-000000000004', 'a1b2c3d4-0002-4000-8000-000000000002', 'Arena Bistro', 'American', 18)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menu_items (restaurant_id, name, description, price, section) VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001', 'Cheeseburger', 'Classic beef with cheddar', 12.99, 'Mains'),
  ('b2c3d4e5-0001-4000-8000-000000000001', 'Fries', 'Crispy golden fries', 4.99, 'Sides'),
  ('b2c3d4e5-0001-4000-8000-000000000001', 'Soda', 'Coca-Cola, Sprite, or Dr Pepper', 3.49, 'Drinks');
