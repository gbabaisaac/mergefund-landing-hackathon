import { useState, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';

export type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  section: string;
  row: string;
  seat: string;
};

export function useOrders(userId?: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total, created_at, section, row, seat')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { orders, loading, fetchOrders };
}
