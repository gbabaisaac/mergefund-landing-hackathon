import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, runner, typography, spacing, radii, shadows } from '@/src/theme';
import { useRunnerStore } from '@/src/stores/runnerStore';
import { supabase } from '@/src/lib/supabase';
import { sendOrderEmail } from '@/src/lib/sendOrderEmail';
import ScreenHeader from '@/src/components/ui/ScreenHeader';

type Order = {
  id: string;
  status: string;
  section: string;
  row: string;
  seat: string;
  total: number;
  created_at: string;
  restaurant_name: string | null;
  items_count: number;
};

function TabBar({ active, onSwitch }: { active: string; onSwitch: (t: string) => void }) {
  const tabs = [
    { key: 'active', label: 'Active', icon: 'flash-outline' as const },
    { key: 'confirmed', label: 'My Runs', icon: 'walk-outline' as const },
    { key: 'delivered', label: 'History', icon: 'checkmark-done-outline' as const },
  ];
  return (
    <View style={tabStyles.bar}>
      {tabs.map((t) => (
        <Pressable key={t.key} style={[tabStyles.tab, active === t.key && tabStyles.tabActive]} onPress={() => onSwitch(t.key)}>
          <Ionicons name={t.icon} size={18} color={active === t.key ? runner.brand : colors.textDisabled} />
          <Text style={[tabStyles.label, active === t.key && tabStyles.labelActive]}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function RunnerActiveScreen() {
  const router = useRouter();
  const venueId = useRunnerStore((s) => s.venueId);
  const venueName = useRunnerStore((s) => s.venueName);
  const runnerId = useRunnerStore((s) => s.runnerId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!venueId) return;
    const { data } = await supabase
      .from('orders')
      .select('id, status, section, row, seat, total, created_at, restaurants(name)')
      .eq('venue_id', venueId)
      .in('status', ['pending', 'confirmed'])
      .is('runner_id', null)
      .order('created_at', { ascending: true });

    setOrders(
      (data ?? []).map((o: any) => ({
        ...o,
        restaurant_name: o.restaurants?.name ?? null,
        items_count: 0,
      })),
    );
  }, [venueId]);

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
  }, [fetchOrders]);

  useEffect(() => {
    if (!venueId) return;
    const channel = supabase
      .channel('runner-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `venue_id=eq.${venueId}` }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [venueId, fetchOrders]);

  const onRefresh = async () => { setRefreshing(true); await fetchOrders(); setRefreshing(false); };

  const claimOrder = async (orderId: string) => {
    const { error, data } = await supabase
      .from('orders')
      .update({ runner_id: runnerId, status: 'claimed' })
      .eq('id', orderId)
      .is('runner_id', null)
      .select('id, customer_email, customer_name, section, row, seat, total')
      .single();
    if (error) {
      Alert.alert('Already claimed', 'Another runner grabbed this one first.');
    } else {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (data?.customer_email) {
        sendOrderEmail({
          to: data.customer_email,
          customerName: data.customer_name ?? 'Customer',
          orderId: data.id,
          status: 'claimed',
          section: data.section,
          row: data.row,
          seat: data.seat,
          total: Number(data.total).toFixed(2),
          venueName: venueName ?? undefined,
        });
      }
    }
  };

  const timeSince = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={venueName ?? 'Dashboard'}
        onBack={() => router.replace('/(runner)/events')}
        rightElement={
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{orders.length}</Text>
          </View>
        }
      />
      <TabBar active="active" onSwitch={(t) => {
        if (t === 'confirmed') router.replace('/(runner)/dashboard/confirmed');
        if (t === 'delivered') router.replace('/(runner)/dashboard/delivered');
      }} />

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={runner.brand} /></View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={runner.brand} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.seatBadge}>
                  <Ionicons name="location" size={14} color={runner.brand} />
                  <Text style={styles.seatText}>{item.section} · Row {item.row} · Seat {item.seat}</Text>
                </View>
                <Text style={styles.total}>${Number(item.total).toFixed(2)}</Text>
              </View>

              {item.restaurant_name ? (
                <View style={styles.restaurantRow}>
                  <Ionicons name="restaurant-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.restaurantText}>{item.restaurant_name}</Text>
                </View>
              ) : null}

              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={13} color={colors.textDisabled} />
                <Text style={styles.timeText}>{timeSince(item.created_at)}</Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.claimBtn, pressed && styles.claimPressed]}
                onPress={() => claimOrder(item.id)}
              >
                <Ionicons name="hand-left" size={18} color={colors.white} />
                <Text style={styles.claimText}>Claim Order</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="hourglass-outline" size={56} color={colors.textDisabled} />
              <Text style={styles.emptyTitle}>No orders waiting</Text>
              <Text style={styles.emptyDesc}>New orders will appear here automatically.{'\n'}Pull down to refresh.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md },
  tabActive: { borderBottomWidth: 2, borderBottomColor: runner.brand },
  label: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: colors.textDisabled },
  labelActive: { color: runner.brand },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  list: { padding: spacing.lg },
  countBadge: {
    backgroundColor: runner.brand, borderRadius: radii.full, minWidth: 24, height: 24,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  countText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeXs, color: colors.white },

  card: {
    backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  seatBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: runner.brandLight, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.sm,
  },
  seatText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: runner.brand },
  total: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary },

  restaurantRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  restaurantText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: colors.textSecondary },

  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.md },
  timeText: { fontFamily: typography.fontBody, fontSize: typography.sizeXs, color: colors.textDisabled },

  claimBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: runner.brand, borderRadius: radii.lg, paddingVertical: spacing.sm,
  },
  claimPressed: { opacity: 0.85 },
  claimText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeMd, color: colors.white },

  emptyTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, marginTop: spacing.md },
  emptyDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center', lineHeight: 22 },
});
