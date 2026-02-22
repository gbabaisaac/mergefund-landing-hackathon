-- Run this in Supabase SQL Editor to seed all restaurants and menu items
-- Each venue gets unique restaurants with full menus

-- Clear existing data
DELETE FROM public.menu_items;
DELETE FROM public.restaurants;

-- ============================================
-- AMICA MUTUAL PAVILION (Providence, RI)
-- ============================================
WITH venue AS (SELECT id FROM public.venues WHERE name = 'Amica Mutual Pavilion')
INSERT INTO public.restaurants (venue_id, name, category, eta_minutes)
SELECT venue.id, r.name, r.category, r.eta FROM venue,
(VALUES
  ('The Penalty Box Grill', 'burgers', 12),
  ('Federal Hill Pizza', 'pizza', 18),
  ('Narragansett Nachos', 'mexican', 10)
) AS r(name, category, eta);

-- Penalty Box Grill menu
INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Smash Burger', 'Double smashed patties with american cheese', 11.99, 'Mains'),
  ('Chicken Sandwich', 'Crispy fried chicken with pickles & slaw', 12.49, 'Mains'),
  ('Loaded Fries', 'Cheese, bacon, jalapeños, ranch', 7.99, 'Sides'),
  ('Onion Rings', 'Beer-battered with chipotle aioli', 5.99, 'Sides'),
  ('Draft IPA', 'Rotating local craft IPA', 9.99, 'Drinks'),
  ('Lemonade', 'Fresh-squeezed lemonade', 4.49, 'Drinks')
) AS m(name, desc, price, section)
WHERE r.name = 'The Penalty Box Grill';

-- Federal Hill Pizza menu
INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Cheese Pizza Slice', 'Classic NY-style cheese', 5.99, 'Pizza'),
  ('Pepperoni Slice', 'Loaded with crispy pepperoni', 6.99, 'Pizza'),
  ('Buffalo Chicken Slice', 'Spicy buffalo chicken & blue cheese', 7.49, 'Pizza'),
  ('Garlic Knots (6)', 'Warm with garlic butter & parmesan', 4.99, 'Sides'),
  ('Bottled Water', 'Dasani 20oz', 3.49, 'Drinks')
) AS m(name, desc, price, section)
WHERE r.name = 'Federal Hill Pizza';

-- Narragansett Nachos menu
INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Loaded Nachos', 'Chips, queso, pico, sour cream, jalapeños', 10.99, 'Mains'),
  ('Chicken Quesadilla', 'Grilled chicken with pepper jack', 9.99, 'Mains'),
  ('Chips & Guac', 'Fresh guacamole with tortilla chips', 6.49, 'Sides'),
  ('Frozen Margarita', 'Classic lime frozen margarita', 11.99, 'Drinks')
) AS m(name, desc, price, section)
WHERE r.name = 'Narragansett Nachos';

-- ============================================
-- RYAN CENTER (Kingston, RI)
-- ============================================
WITH venue AS (SELECT id FROM public.venues WHERE name = 'Ryan Center')
INSERT INTO public.restaurants (venue_id, name, category, eta_minutes)
SELECT venue.id, r.name, r.category, r.eta FROM venue,
(VALUES
  ('Rhody Burger Bar', 'burgers', 14),
  ('Kingston Wings', 'chicken', 15),
  ('South County Subs', 'deli', 8)
) AS r(name, category, eta);

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('The Ram Burger', 'Half-pound angus with cheddar & special sauce', 12.99, 'Mains'),
  ('Veggie Burger', 'Black bean patty with avocado', 11.49, 'Mains'),
  ('Sweet Potato Fries', 'With honey mustard dipping sauce', 5.99, 'Sides'),
  ('Milkshake', 'Vanilla, chocolate, or strawberry', 6.99, 'Drinks'),
  ('Fountain Soda', 'Coke, Sprite, Fanta, or Dr Pepper', 3.99, 'Drinks')
) AS m(name, desc, price, section)
WHERE r.name = 'Rhody Burger Bar';

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Buffalo Wings (8)', 'Classic buffalo with blue cheese', 11.99, 'Wings'),
  ('BBQ Wings (8)', 'Smoky BBQ glaze', 11.99, 'Wings'),
  ('Honey Garlic Wings (8)', 'Sweet & savory garlic glaze', 11.99, 'Wings'),
  ('Chicken Tenders (5)', 'Hand-breaded with ranch', 9.49, 'Baskets'),
  ('Celery & Carrots', 'With blue cheese or ranch', 3.49, 'Sides')
) AS m(name, desc, price, section)
WHERE r.name = 'Kingston Wings';

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Italian Sub', 'Ham, salami, provolone, lettuce, tomato, oil & vinegar', 10.99, 'Subs'),
  ('Turkey Club', 'Turkey, bacon, lettuce, tomato, mayo', 10.49, 'Subs'),
  ('Meatball Sub', 'House meatballs with marinara & mozzarella', 10.99, 'Subs'),
  ('Bag of Chips', 'Lays, Doritos, or Cape Cod', 2.49, 'Sides')
) AS m(name, desc, price, section)
WHERE r.name = 'South County Subs';

-- ============================================
-- TD GARDEN (Boston, MA)
-- ============================================
WITH venue AS (SELECT id FROM public.venues WHERE name = 'TD Garden')
INSERT INTO public.restaurants (venue_id, name, category, eta_minutes)
SELECT venue.id, r.name, r.category, r.eta FROM venue,
(VALUES
  ('Garden Grille', 'grill', 15),
  ('Lobstah Roll Co.', 'seafood', 12),
  ('Causeway Pizza', 'pizza', 16)
) AS r(name, category, eta);

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Fenway Frank', 'Grilled all-beef hot dog with mustard & relish', 7.99, 'Mains'),
  ('BBQ Pulled Pork', 'Slow-smoked pulled pork on brioche', 13.99, 'Mains'),
  ('Grilled Sausage', 'Italian sausage with peppers & onions', 10.99, 'Mains'),
  ('Waffle Fries', 'Crispy waffle-cut with ketchup', 5.99, 'Sides'),
  ('Sam Adams Lager', 'Boston Lager draft 16oz', 12.99, 'Drinks'),
  ('Hard Seltzer', 'Truly or White Claw', 10.99, 'Drinks')
) AS m(name, desc, price, section)
WHERE r.name = 'Garden Grille';

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Maine Lobster Roll', 'Chilled lobster with butter on split-top bun', 22.99, 'Mains'),
  ('Clam Chowdah', 'New England style in a bread bowl', 11.99, 'Mains'),
  ('Fish & Chips', 'Beer-battered cod with tartar sauce', 14.99, 'Mains'),
  ('Coleslaw', 'Creamy New England style', 3.99, 'Sides')
) AS m(name, desc, price, section)
WHERE r.name = 'Lobstah Roll Co.';

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Cheese Personal Pizza', '10-inch hand-tossed cheese', 9.99, 'Pizza'),
  ('Pepperoni Personal Pizza', '10-inch with crispy cup pepperoni', 11.49, 'Pizza'),
  ('Mozzarella Sticks (6)', 'With marinara dipping sauce', 7.99, 'Sides'),
  ('Cannoli', 'Classic ricotta-filled cannoli', 5.99, 'Dessert')
) AS m(name, desc, price, section)
WHERE r.name = 'Causeway Pizza';

-- ============================================
-- MADISON SQUARE GARDEN (New York, NY)
-- ============================================
WITH venue AS (SELECT id FROM public.venues WHERE name = 'Madison Square Garden')
INSERT INTO public.restaurants (venue_id, name, category, eta_minutes)
SELECT venue.id, r.name, r.category, r.eta FROM venue,
(VALUES
  ('MSG Smokehouse', 'bbq', 14),
  ('Midtown Deli', 'deli', 10),
  ('Broadway Bites', 'asian', 12),
  ('Penn Station Pretzels', 'snacks', 5)
) AS r(name, category, eta);

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Brisket Platter', 'Slow-smoked brisket with two sides', 18.99, 'Mains'),
  ('Smoked Turkey Leg', 'Giant smoked turkey drumstick', 14.99, 'Mains'),
  ('Mac & Cheese', 'Creamy three-cheese blend', 6.99, 'Sides'),
  ('Cornbread', 'Honey butter cornbread muffin', 3.99, 'Sides'),
  ('Sweet Tea', 'Southern-style sweet iced tea', 4.49, 'Drinks')
) AS m(name, desc, price, section)
WHERE r.name = 'MSG Smokehouse';

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Pastrami on Rye', 'Stacked pastrami with mustard on rye', 15.99, 'Sandwiches'),
  ('Reuben', 'Corned beef, sauerkraut, swiss, russian dressing', 15.99, 'Sandwiches'),
  ('Knish', 'Classic potato knish', 5.49, 'Sides'),
  ('Pickle', 'Whole kosher dill pickle', 2.99, 'Sides'),
  ('Dr. Brown''s Cream Soda', 'Classic NYC cream soda', 3.99, 'Drinks')
) AS m(name, desc, price, section)
WHERE r.name = 'Midtown Deli';

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Chicken Teriyaki Bowl', 'Grilled chicken, rice, teriyaki glaze, sesame', 13.99, 'Bowls'),
  ('Pork Bao Buns (3)', 'Steamed buns with braised pork & hoisin', 11.99, 'Small Plates'),
  ('Veggie Spring Rolls (4)', 'Crispy rolls with sweet chili sauce', 7.99, 'Small Plates'),
  ('Edamame', 'Steamed & salted soybeans', 5.49, 'Sides')
) AS m(name, desc, price, section)
WHERE r.name = 'Broadway Bites';

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Jumbo Soft Pretzel', 'Warm salted pretzel with cheese dip', 7.99, 'Pretzels'),
  ('Pretzel Bites', 'Bite-size with beer cheese', 8.99, 'Pretzels'),
  ('Churros (3)', 'Cinnamon sugar with chocolate sauce', 6.99, 'Sweets'),
  ('Cracker Jack', 'Classic caramel popcorn & peanuts', 4.99, 'Sweets')
) AS m(name, desc, price, section)
WHERE r.name = 'Penn Station Pretzels';

-- ============================================
-- CRYPTO.COM ARENA (Los Angeles, CA)
-- ============================================
WITH venue AS (SELECT id FROM public.venues WHERE name = 'Crypto.com Arena')
INSERT INTO public.restaurants (venue_id, name, category, eta_minutes)
SELECT venue.id, r.name, r.category, r.eta FROM venue,
(VALUES
  ('Showtime Tacos', 'mexican', 10),
  ('Staples Burger Co.', 'burgers', 14),
  ('Pacific Poke', 'asian', 8),
  ('LA Churro Stand', 'desserts', 5)
) AS r(name, category, eta);

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Street Tacos (3)', 'Carne asada, cilantro, onion, lime', 12.99, 'Tacos'),
  ('Fish Tacos (3)', 'Battered fish, cabbage slaw, crema', 13.49, 'Tacos'),
  ('Burrito Bowl', 'Rice, beans, choice of protein, pico, guac', 14.99, 'Bowls'),
  ('Elote', 'Mexican street corn with cotija & chili', 5.99, 'Sides'),
  ('Horchata', 'Traditional cinnamon rice drink', 4.99, 'Drinks')
) AS m(name, desc, price, section)
WHERE r.name = 'Showtime Tacos';

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Classic Cheeseburger', 'Angus beef, american cheese, lettuce, tomato', 13.99, 'Burgers'),
  ('Mushroom Swiss Burger', 'Sautéed mushrooms & melted swiss', 14.99, 'Burgers'),
  ('Truffle Fries', 'Parmesan & truffle oil', 8.99, 'Sides'),
  ('Craft Lager', 'Golden Road Mango Cart', 11.99, 'Drinks')
) AS m(name, desc, price, section)
WHERE r.name = 'Staples Burger Co.';

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Ahi Tuna Poke Bowl', 'Sushi rice, ahi tuna, avocado, edamame, ponzu', 16.99, 'Bowls'),
  ('Salmon Poke Bowl', 'Sushi rice, salmon, mango, cucumber, spicy mayo', 17.49, 'Bowls'),
  ('Veggie Bowl', 'Tofu, avocado, seaweed, pickled ginger', 13.99, 'Bowls'),
  ('Miso Soup', 'Traditional with tofu & wakame', 3.99, 'Sides')
) AS m(name, desc, price, section)
WHERE r.name = 'Pacific Poke';

INSERT INTO public.menu_items (restaurant_id, name, description, price, section)
SELECT r.id, m.name, m.desc, m.price, m.section
FROM public.restaurants r, (VALUES
  ('Classic Churros (4)', 'Cinnamon sugar with chocolate dip', 7.99, 'Churros'),
  ('Stuffed Churro', 'Filled with dulce de leche', 5.99, 'Churros'),
  ('Açaí Bowl', 'Açaí, granola, banana, berries, honey', 11.99, 'Bowls'),
  ('Agua Fresca', 'Watermelon, mango, or hibiscus', 4.99, 'Drinks')
) AS m(name, desc, price, section)
WHERE r.name = 'LA Churro Stand';
