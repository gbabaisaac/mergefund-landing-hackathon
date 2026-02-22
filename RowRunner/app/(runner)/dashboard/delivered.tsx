import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, runner, typography, spacing, radii, shadows } from '@/src/theme';
import { useRunnerStore } from '@/src/stores/runnerStore';
import { supabase } from '@/src/lib/supabase';
import ScreenHeader from '@/src/components/ui/ScreenHeader';

type Order = { id: string; section: string; row: string; seat: string; total: number; created_at: string };

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

export default function RunnerDeliveredScreen() {
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
      .select('id, section, row, seat, total, created_at')
      .eq('runner_id', runnerId)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false });
    setOrders(data ?? []);
  }, [runnerId]);

  useEffect(() => { fetchOrders().finally(() => setLoading(false)); }, [fetchOrders]);
  const onRefresh = async () => { setRefreshing(true); await fetchOrders(); setRefreshing(false); };

  const totalEarned = orders.reduce((sum, o) => sum + Number(o.total) * 0.15, 0);

  return (
    <View style={styles.container}>
      <ScreenHeader title={venueName ?? 'Dashboard'} onBack={() => routerObj.replace('/(runner)/events')} />
      <TabBar active="delivered" onSwitch={(t) => {
        if (t === 'active') routerObj.replace('/(runner)/dashboard');
        if (t === 'confirmed') routerObj.replace('/(runner)/dashboard/confirmed');
      }} />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Deliveries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${totalEarned.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Estimated Tips</Text>
        </View>
      </View>

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
              <View style={styles.cardRow}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.seatText}>{item.section} · Row {item.row} · Seat {item.seat}</Text>
                  <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.total}>${Number(item.total).toFixed(2)}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="trophy-outline" size={56} color={colors.textDisabled} />
              <Text style={styles.emptyTitle}>No deliveries yet</Text>
              <Text style={styles.emptyDesc}>Start claiming orders to see your history</Text>
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
  statsRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1,
    borderColor: colors.border, padding: spacing.md, alignItems: 'center', ...shadows.sm,
  },
  statValue: { fontFamily: typography.fontDisplay, fontSize: typography.size2xl, color: runner.brand },
  statLabel: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  seatText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeMd, color: colors.textPrimary },
  dateText: { fontFamily: typography.fontBody, fontSize: typography.sizeXs, color: colors.textDisabled, marginTop: 2 },
  total: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeMd, color: colors.textPrimary },
  emptyTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, marginTop: spacing.md },
  emptyDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.xs },
});
