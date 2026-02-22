import { supabase } from './supabase';

type EmailPayload = {
  to: string;
  customerName: string;
  orderId: string;
  status: string;
  section: string;
  row: string;
  seat: string;
  total: string;
  items?: { name: string; quantity: number; price: number }[];
  venueName?: string;
};

export async function sendOrderEmail(payload: EmailPayload) {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: payload,
    });
    if (error) console.warn('Email send failed:', error.message);
    return data;
  } catch (err) {
    console.warn('Email send error:', err);
  }
}
