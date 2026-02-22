import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '@/src/theme';
import { useSessionStore } from '@/src/stores/sessionStore';
import { supabase } from '@/src/lib/supabase';
import ScreenHeader from '@/src/components/ui/ScreenHeader';
import OrderCard from '@/src/components/order/OrderCard';

type Order = { id: string; status: string; total: number; created_at: string; section: string; row: string; seat: string };

export default function OrderHistoryScreen() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch_ = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('orders')
      .select('id, status, total, created_at, section, row, seat')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });
    setOrders(data ?? []);
  };

  useEffect(() => { fetch_().finally(() => setLoading(false)); }, [user]);

  const onRefresh = async () => { setRefreshing(true); await fetch_(); setRefreshing(false); };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Order History" onBack={() => router.back()} />
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.brand} /></View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => router.push(`/(customer)/account/orders/${item.id}`)} />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="receipt-outline" size={56} color={colors.textDisabled} />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyDesc}>Your order history will appear here</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  list: { padding: spacing.lg },
  emptyTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, marginTop: spacing.md },
  emptyDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.xs },
});
