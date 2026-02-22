import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, runner, typography, spacing, radii, shadows } from '@/src/theme';
import { useRunnerStore } from '@/src/stores/runnerStore';
import { supabase } from '@/src/lib/supabase';
import { sendOrderEmail } from '@/src/lib/sendOrderEmail';
import ScreenHeader from '@/src/components/ui/ScreenHeader';
import StatusPill from '@/src/components/ui/StatusPill';

type Order = { id: string; status: string; section: string; row: string; seat: string; total: number };

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

export default function RunnerConfirmedScreen() {
  const routerObj = useRouter();
  const runnerId = useRunnerStore((s) => s.runnerId);
  const venueName = useRunnerStore((s) => s.venueName);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!runnerId) return;
    const { data } = await supabase
      .from('orders')
      .select('id, status, section, row, seat, total')
      .eq('runner_id', runnerId)
      .in('status', ['claimed', 'confirmed'])
      .order('created_at', { ascending: true });
    setOrders(data ?? []);
  }, [runnerId]);

  useEffect(() => { fetchOrders().finally(() => setLoading(false)); }, [fetchOrders]);
  const onRefresh = async () => { setRefreshing(true); await fetchOrders(); setRefreshing(false); };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { data } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select('id, customer_email, customer_name, section, row, seat, total')
      .single();

    if (data?.customer_email) {
      sendOrderEmail({
        to: data.customer_email,
        customerName: data.customer_name ?? 'Customer',
        orderId: data.id,
        status: newStatus,
        section: data.section,
        row: data.row,
        seat: data.seat,
        total: Number(data.total).toFixed(2),
        venueName: venueName ?? undefined,
      });
    }

    fetchOrders();
  };

  const nextAction = (status: string): { label: string; nextStatus: string; icon: keyof typeof Ionicons.glyphMap } | null => {
    switch (status) {
      case 'claimed': return { label: 'Mark Picked Up', nextStatus: 'confirmed', icon: 'bag-handle' };
      case 'confirmed': return { label: 'Mark Delivered', nextStatus: 'delivered', icon: 'checkmark-circle' };
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={venueName ?? 'Dashboard'} onBack={() => routerObj.replace('/(runner)/events')} />
      <TabBar active="confirmed" onSwitch={(t) => {
        if (t === 'active') routerObj.replace('/(runner)/dashboard');
        if (t === 'delivered') routerObj.replace('/(runner)/dashboard/delivered');
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
          renderItem={({ item }) => {
            const action = nextAction(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <StatusPill status={item.status} />
                  <Text style={styles.total}>${Number(item.total).toFixed(2)}</Text>
                </View>
                <View style={styles.seatRow}>
                  <Ionicons name="location" size={14} color={runner.brand} />
                  <Text style={styles.seatText}>{item.section} · Row {item.row} · Seat {item.seat}</Text>
                </View>
                {action ? (
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.actionPressed]}
                    onPress={() => updateStatus(item.id, action.nextStatus)}
                  >
                    <Ionicons name={action.icon} size={18} color={colors.white} />
                    <Text style={styles.actionText}>{action.label}</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="walk-outline" size={56} color={colors.textDisabled} />
              <Text style={styles.emptyTitle}>No active runs</Text>
              <Text style={styles.emptyDesc}>Claim orders from the Active tab</Text>
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
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  total: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.md },
  seatText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: colors.textSecondary },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.success, borderRadius: radii.lg, paddingVertical: spacing.sm,
  },
  actionPressed: { opacity: 0.85 },
  actionText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeMd, color: colors.white },
  emptyTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, marginTop: spacing.md },
  emptyDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.xs },
});
