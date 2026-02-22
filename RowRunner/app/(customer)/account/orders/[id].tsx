import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '@/src/theme';
import { supabase } from '@/src/lib/supabase';
import ScreenHeader from '@/src/components/ui/ScreenHeader';
import StatusPill from '@/src/components/ui/StatusPill';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      setOrder(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Order" onBack={() => router.back()} />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.brand} /></View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Order" onBack={() => router.back()} />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textDisabled} />
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={`Order #${order.id.slice(0, 8)}`} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <StatusPill status={order.status} />
            <Text style={styles.date}>{new Date(order.created_at).toLocaleDateString()}</Text>
          </View>

          <View style={styles.seatBadge}>
            <Ionicons name="location-outline" size={16} color={colors.brand} />
            <Text style={styles.seatText}>Section {order.section} · Row {order.row} · Seat {order.seat}</Text>
          </View>

          <View style={styles.divider} />

          {order.items?.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}×</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <PriceRow label="Subtotal" value={order.subtotal ?? 0} />
          <PriceRow label="Tax" value={order.tax ?? 0} />
          <PriceRow label="Service Fee" value={order.service_fee ?? 0} />
          <PriceRow label="Tip" value={order.tip ?? 0} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${(order.total ?? 0).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={styles.priceVal}>${value.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.md },
  scroll: { padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, ...shadows.sm },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  date: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textDisabled },
  seatBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.brandLight, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.sm, alignSelf: 'flex-start' },
  seatText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: colors.brand },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  itemQty: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeSm, color: colors.brand, width: 28 },
  itemName: { flex: 1, fontFamily: typography.fontBodyMed, fontSize: typography.sizeMd, color: colors.textPrimary },
  itemPrice: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeMd, color: colors.textPrimary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  priceLabel: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary },
  priceVal: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: colors.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  totalLabel: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary },
  totalValue: { fontFamily: typography.fontDisplay, fontSize: typography.sizeXl, color: colors.brand },
});
