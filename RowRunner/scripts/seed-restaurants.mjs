import 'dotenv/config';

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };

async function query(path, opts = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { ...opts, headers: { ...HEADERS, ...opts.headers } });
  if (!res.ok) { const t = await res.text(); throw new Error(`${res.status}: ${t}`); }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

const VENUE_RESTAURANTS = {
  'Amica Mutual Pavilion': [
    { name: 'The Penalty Box Grill', category: 'burgers', eta: 12, items: [
      { name: 'Smash Burger', desc: 'Double smashed patties with american cheese', price: 11.99, section: 'Mains' },
      { name: 'Chicken Sandwich', desc: 'Crispy fried chicken with pickles & slaw', price: 12.49, section: 'Mains' },
      { name: 'Loaded Fries', desc: 'Cheese, bacon, jalapeños, ranch', price: 7.99, section: 'Sides' },
      { name: 'Onion Rings', desc: 'Beer-battered with chipotle aioli', price: 5.99, section: 'Sides' },
      { name: 'Draft IPA', desc: 'Rotating local craft IPA', price: 9.99, section: 'Drinks' },
      { name: 'Lemonade', desc: 'Fresh-squeezed lemonade', price: 4.49, section: 'Drinks' },
    ]},
    { name: 'Federal Hill Pizza', category: 'pizza', eta: 18, items: [
      { name: 'Cheese Pizza Slice', desc: 'Classic NY-style cheese', price: 5.99, section: 'Pizza' },
      { name: 'Pepperoni Slice', desc: 'Loaded with crispy pepperoni', price: 6.99, section: 'Pizza' },
      { name: 'Buffalo Chicken Slice', desc: 'Spicy buffalo chicken & blue cheese', price: 7.49, section: 'Pizza' },
      { name: 'Garlic Knots (6)', desc: 'Warm with garlic butter & parmesan', price: 4.99, section: 'Sides' },
      { name: 'Bottled Water', desc: 'Dasani 20oz', price: 3.49, section: 'Drinks' },
    ]},
    { name: 'Narragansett Nachos', category: 'mexican', eta: 10, items: [
      { name: 'Loaded Nachos', desc: 'Chips, queso, pico, sour cream, jalapeños', price: 10.99, section: 'Mains' },
      { name: 'Chicken Quesadilla', desc: 'Grilled chicken with pepper jack', price: 9.99, section: 'Mains' },
      { name: 'Chips & Guac', desc: 'Fresh guacamole with tortilla chips', price: 6.49, section: 'Sides' },
      { name: 'Frozen Margarita', desc: 'Classic lime frozen margarita', price: 11.99, section: 'Drinks' },
    ]},
  ],
  'Ryan Center': [
    { name: 'Rhody Burger Bar', category: 'burgers', eta: 14, items: [
      { name: 'The Ram Burger', desc: 'Half-pound angus with cheddar & special sauce', price: 12.99, section: 'Mains' },
      { name: 'Veggie Burger', desc: 'Black bean patty with avocado', price: 11.49, section: 'Mains' },
      { name: 'Sweet Potato Fries', desc: 'With honey mustard dipping sauce', price: 5.99, section: 'Sides' },
      { name: 'Milkshake', desc: 'Vanilla, chocolate, or strawberry', price: 6.99, section: 'Drinks' },
      { name: 'Fountain Soda', desc: 'Coke, Sprite, Fanta, or Dr Pepper', price: 3.99, section: 'Drinks' },
    ]},
    { name: 'Kingston Wings', category: 'chicken', eta: 15, items: [
      { name: 'Buffalo Wings (8)', desc: 'Classic buffalo with blue cheese', price: 11.99, section: 'Wings' },
      { name: 'BBQ Wings (8)', desc: 'Smoky BBQ glaze', price: 11.99, section: 'Wings' },
      { name: 'Honey Garlic Wings (8)', desc: 'Sweet & savory garlic glaze', price: 11.99, section: 'Wings' },
      { name: 'Chicken Tenders (5)', desc: 'Hand-breaded with ranch', price: 9.49, section: 'Baskets' },
      { name: 'Celery & Carrots', desc: 'With blue cheese or ranch', price: 3.49, section: 'Sides' },
    ]},
    { name: 'South County Subs', category: 'deli', eta: 8, items: [
      { name: 'Italian Sub', desc: 'Ham, salami, provolone, lettuce, tomato, oil & vinegar', price: 10.99, section: 'Subs' },
      { name: 'Turkey Club', desc: 'Turkey, bacon, lettuce, tomato, mayo', price: 10.49, section: 'Subs' },
      { name: 'Meatball Sub', desc: 'House meatballs with marinara & mozzarella', price: 10.99, section: 'Subs' },
      { name: 'Bag of Chips', desc: 'Lays, Doritos, or Cape Cod', price: 2.49, section: 'Sides' },
    ]},
  ],
  'TD Garden': [
    { name: 'Garden Grille', category: 'grill', eta: 15, items: [
      { name: 'Fenway Frank', desc: 'Grilled all-beef hot dog with mustard & relish', price: 7.99, section: 'Mains' },
      { name: 'BBQ Pulled Pork', desc: 'Slow-smoked pulled pork on brioche', price: 13.99, section: 'Mains' },
      { name: 'Grilled Sausage', desc: 'Italian sausage with peppers & onions', price: 10.99, section: 'Mains' },
      { name: 'Waffle Fries', desc: 'Crispy waffle-cut with ketchup', price: 5.99, section: 'Sides' },
      { name: 'Sam Adams Lager', desc: 'Boston Lager draft 16oz', price: 12.99, section: 'Drinks' },
      { name: 'Hard Seltzer', desc: 'Truly or White Claw', price: 10.99, section: 'Drinks' },
    ]},
    { name: 'Lobstah Roll Co.', category: 'seafood', eta: 12, items: [
      { name: 'Maine Lobster Roll', desc: 'Chilled lobster with butter on split-top bun', price: 22.99, section: 'Mains' },
      { name: 'Clam Chowdah', desc: 'New England style in a bread bowl', price: 11.99, section: 'Mains' },
      { name: 'Fish & Chips', desc: 'Beer-battered cod with tartar sauce', price: 14.99, section: 'Mains' },
      { name: 'Coleslaw', desc: 'Creamy New England style', price: 3.99, section: 'Sides' },
    ]},
    { name: 'Causeway Pizza', category: 'pizza', eta: 16, items: [
      { name: 'Cheese Personal Pizza', desc: '10-inch hand-tossed cheese', price: 9.99, section: 'Pizza' },
      { name: 'Pepperoni Personal Pizza', desc: '10-inch with crispy cup pepperoni', price: 11.49, section: 'Pizza' },
      { name: 'Mozzarella Sticks (6)', desc: 'With marinara dipping sauce', price: 7.99, section: 'Sides' },
      { name: 'Cannoli', desc: 'Classic ricotta-filled cannoli', price: 5.99, section: 'Dessert' },
    ]},
  ],
  'Madison Square Garden': [
    { name: 'MSG Smokehouse', category: 'bbq', eta: 14, items: [
      { name: 'Brisket Platter', desc: 'Slow-smoked brisket with two sides', price: 18.99, section: 'Mains' },
      { name: 'Smoked Turkey Leg', desc: 'Giant smoked turkey drumstick', price: 14.99, section: 'Mains' },
      { name: 'Mac & Cheese', desc: 'Creamy three-cheese blend', price: 6.99, section: 'Sides' },
      { name: 'Cornbread', desc: 'Honey butter cornbread muffin', price: 3.99, section: 'Sides' },
      { name: 'Sweet Tea', desc: 'Southern-style sweet iced tea', price: 4.49, section: 'Drinks' },
    ]},
    { name: 'Midtown Deli', category: 'deli', eta: 10, items: [
      { name: 'Pastrami on Rye', desc: 'Stacked pastrami with mustard on rye', price: 15.99, section: 'Sandwiches' },
      { name: 'Reuben', desc: 'Corned beef, sauerkraut, swiss, russian dressing', price: 15.99, section: 'Sandwiches' },
      { name: 'Knish', desc: 'Classic potato knish', price: 5.49, section: 'Sides' },
      { name: 'Pickle', desc: 'Whole kosher dill pickle', price: 2.99, section: 'Sides' },
      { name: "Dr. Brown's Cream Soda", desc: 'Classic NYC cream soda', price: 3.99, section: 'Drinks' },
    ]},
    { name: 'Broadway Bites', category: 'asian', eta: 12, items: [
      { name: 'Chicken Teriyaki Bowl', desc: 'Grilled chicken, rice, teriyaki glaze, sesame', price: 13.99, section: 'Bowls' },
      { name: 'Pork Bao Buns (3)', desc: 'Steamed buns with braised pork & hoisin', price: 11.99, section: 'Small Plates' },
      { name: 'Veggie Spring Rolls (4)', desc: 'Crispy rolls with sweet chili sauce', price: 7.99, section: 'Small Plates' },
      { name: 'Edamame', desc: 'Steamed & salted soybeans', price: 5.49, section: 'Sides' },
    ]},
    { name: 'Penn Station Pretzels', category: 'snacks', eta: 5, items: [
      { name: 'Jumbo Soft Pretzel', desc: 'Warm salted pretzel with cheese dip', price: 7.99, section: 'Pretzels' },
      { name: 'Pretzel Bites', desc: 'Bite-size with beer cheese', price: 8.99, section: 'Pretzels' },
      { name: 'Churros (3)', desc: 'Cinnamon sugar with chocolate sauce', price: 6.99, section: 'Sweets' },
      { name: 'Cracker Jack', desc: 'Classic caramel popcorn & peanuts', price: 4.99, section: 'Sweets' },
    ]},
  ],
  'Crypto.com Arena': [
    { name: 'Showtime Tacos', category: 'mexican', eta: 10, items: [
      { name: 'Street Tacos (3)', desc: 'Carne asada, cilantro, onion, lime', price: 12.99, section: 'Tacos' },
      { name: 'Fish Tacos (3)', desc: 'Battered fish, cabbage slaw, crema', price: 13.49, section: 'Tacos' },
      { name: 'Burrito Bowl', desc: 'Rice, beans, choice of protein, pico, guac', price: 14.99, section: 'Bowls' },
      { name: 'Elote', desc: 'Mexican street corn with cotija & chili', price: 5.99, section: 'Sides' },
      { name: 'Horchata', desc: 'Traditional cinnamon rice drink', price: 4.99, section: 'Drinks' },
    ]},
    { name: 'Staples Burger Co.', category: 'burgers', eta: 14, items: [
      { name: 'Classic Cheeseburger', desc: 'Angus beef, american cheese, lettuce, tomato', price: 13.99, section: 'Burgers' },
      { name: 'Mushroom Swiss Burger', desc: 'Sautéed mushrooms & melted swiss', price: 14.99, section: 'Burgers' },
      { name: 'Truffle Fries', desc: 'Parmesan & truffle oil', price: 8.99, section: 'Sides' },
      { name: 'Craft Lager', desc: 'Golden Road Mango Cart', price: 11.99, section: 'Drinks' },
    ]},
    { name: 'Pacific Poke', category: 'asian', eta: 8, items: [
      { name: 'Ahi Tuna Poke Bowl', desc: 'Sushi rice, ahi tuna, avocado, edamame, ponzu', price: 16.99, section: 'Bowls' },
      { name: 'Salmon Poke Bowl', desc: 'Sushi rice, salmon, mango, cucumber, spicy mayo', price: 17.49, section: 'Bowls' },
      { name: 'Veggie Bowl', desc: 'Tofu, avocado, seaweed, pickled ginger', price: 13.99, section: 'Bowls' },
      { name: 'Miso Soup', desc: 'Traditional with tofu & wakame', price: 3.99, section: 'Sides' },
    ]},
    { name: 'LA Churro Stand', category: 'desserts', eta: 5, items: [
      { name: 'Classic Churros (4)', desc: 'Cinnamon sugar with chocolate dip', price: 7.99, section: 'Churros' },
      { name: 'Stuffed Churro', desc: 'Filled with dulce de leche', price: 5.99, section: 'Churros' },
      { name: 'Açaí Bowl', desc: 'Açaí, granola, banana, berries, honey', price: 11.99, section: 'Bowls' },
      { name: 'Agua Fresca', desc: 'Watermelon, mango, or hibiscus', price: 4.99, section: 'Drinks' },
    ]},
  ],
};

async function seed() {
  console.log('Fetching venues...');
  const venues = await query('venues?select=id,name&is_active=eq.true');
  console.log(`Found ${venues.length} venues.`);

  for (const v of venues) {
    // Delete existing menu items for this venue's restaurants
    const existingRests = await query(`restaurants?select=id&venue_id=eq.${v.id}`);
    for (const r of existingRests) {
      await query(`menu_items?restaurant_id=eq.${r.id}`, { method: 'DELETE' });
    }
    if (existingRests.length) {
      await query(`restaurants?venue_id=eq.${v.id}`, { method: 'DELETE' });
    }
  }
  console.log('Cleared old restaurant data.\n');

  for (const v of venues) {
    const restaurants = VENUE_RESTAURANTS[v.name];
    if (!restaurants) { console.log(`No restaurants for "${v.name}", skipping.`); continue; }
    console.log(`${v.name}:`);

    for (const r of restaurants) {
      const [rest] = await query('restaurants', {
        method: 'POST',
        body: JSON.stringify({ venue_id: v.id, name: r.name, category: r.category, eta_minutes: r.eta }),
      });
      console.log(`  ✓ ${r.name} (${r.items.length} items)`);

      const menuRows = r.items.map(i => ({
        restaurant_id: rest.id, name: i.name, description: i.desc, price: i.price, section: i.section,
      }));
      await query('menu_items', { method: 'POST', body: JSON.stringify(menuRows) });
    }
  }
  console.log('\n✅ All restaurants and menus seeded!');
}

seed().catch(e => { console.error(e); process.exit(1); });
