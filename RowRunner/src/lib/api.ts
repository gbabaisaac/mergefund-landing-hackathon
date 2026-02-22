/**
 * RowRunner Supabase API helpers
 * Use these to fetch venues, restaurants, menu items, and create orders
 */
import { supabase } from './supabase';

export type Venue = { id: string; name: string; slug: string | null };
export type Restaurant = { id: string; venue_id: string; name: string; category: string | null; eta_minutes: number };
export type MenuItem = { id: string; restaurant_id: string; name: string; description: string | null; price: number; section: string | null };

export async function fetchVenues(): Promise<Venue[]> {
  const { data, error } = await supabase.from('venues').select('id, name, slug').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchRestaurants(venueId: string): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, venue_id, name, category, eta_minutes')
    .eq('venue_id', venueId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, restaurant_id, name, description, price, section')
    .eq('restaurant_id', restaurantId)
    .order('section')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export type CreateOrderInput = {
  venue_id: string;
  restaurant_id: string;
  customer_id?: string | null;
  section: string;
  row: string;
  seat: string;
  notes?: string | null;
  allergy_notes?: string | null;
  subtotal: number;
  tax: number;
  service_fee: number;
  tip_percent?: number | null;
  tip_amount: number;
  total: number;
  timing_type?: 'asap' | 'scheduled';
  scheduled_at?: string | null;
  items: { name: string; price: number; quantity: number }[];
};

export async function createOrder(input: CreateOrderInput) {
  const { items, ...orderData } = input;
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();
  if (orderError) throw orderError;
  if (!order) throw new Error('Failed to create order');

  const orderItems = items.map((item) => ({
    order_id: order.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  return order;
}
