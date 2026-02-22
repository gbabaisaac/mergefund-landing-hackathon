import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '@/src/theme';
import StatusPill from '@/src/components/ui/StatusPill';

type Props = {
  order: { id: string; status: string; total: number; created_at: string; section: string; row: string; seat: string };
  onPress?: () => void;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OrderCard({ order, onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress} disabled={!onPress}>
      <View style={styles.topRow}>
        <StatusPill status={order.status} />
        <Text style={styles.time}>{timeAgo(order.created_at)}</Text>
      </View>
      <View style={styles.details}>
        <View style={styles.seatBadge}>
          <Text style={styles.seatText}>📍 {order.section} · Row {order.row} · Seat {order.seat}</Text>
        </View>
        <Text style={styles.total}>${order.total.toFixed(2)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  pressed: { opacity: 0.92 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  time: { fontFamily: typography.fontBody, fontSize: typography.sizeXs, color: colors.textDisabled },
  details: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seatBadge: { backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.sm },
  seatText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: colors.textSecondary },
  total: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary },
});
