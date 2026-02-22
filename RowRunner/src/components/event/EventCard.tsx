import { Text, Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '@/src/theme';

type Props = {
  event: {
    id: string;
    title: string;
    description: string | null;
    starts_at: string;
    ends_at: string;
    venue_name: string;
    venue_city: string;
    venue_state: string;
  };
  distanceMiles?: number | null;
  selected?: boolean;
  onPress: () => void;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function getStatus(starts: string, ends: string): { label: string; color: string; bg: string; isLive: boolean } {
  const now = Date.now();
  const s = new Date(starts).getTime();
  const e = new Date(ends).getTime();
  if (now >= s && now <= e) return { label: 'LIVE NOW', color: '#DC2626', bg: '#FEE2E2', isLive: true };
  if (s - now < 60 * 60 * 1000 && s > now) return { label: 'STARTING SOON', color: '#D97706', bg: '#FEF3C7', isLive: false };
  return { label: formatTime(starts), color: colors.textSecondary, bg: colors.surfaceAlt, isLive: false };
}

export default function EventCard({ event, distanceMiles, selected, onPress }: Props) {
  const status = getStatus(event.starts_at, event.ends_at);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Status badge */}
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>  
          {status.isLive ? <View style={styles.liveDot} /> : null}
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
        {selected ? (
          <View style={styles.check}><Ionicons name="checkmark" size={14} color={colors.white} /></View>
        ) : null}
      </View>

      {/* Event title — the matchup */}
      <Text style={[styles.title, selected && styles.titleSelected]}>{event.title}</Text>

      {/* Description (sport type) */}
      {event.description ? (
        <Text style={styles.sport}>{event.description}</Text>
      ) : null}

      {/* Venue + location row */}
      <View style={styles.venueRow}>
        <Ionicons name="location" size={14} color={selected ? colors.brand : colors.textDisabled} />
        <Text style={[styles.venueText, selected && styles.venueTextSelected]}>
          {event.venue_name} · {event.venue_city}, {event.venue_state}
        </Text>
      </View>

      {/* Time + distance row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color={colors.textDisabled} />
          <Text style={styles.metaText}>{formatTime(event.starts_at)} – {formatTime(event.ends_at)}</Text>
        </View>
        {distanceMiles != null ? (
          <View style={styles.metaItem}>
            <Ionicons name="navigate-outline" size={13} color={colors.brand} />
            <Text style={[styles.metaText, styles.distText]}>
              {distanceMiles < 1 ? `${(distanceMiles * 5280).toFixed(0)} ft` : `${distanceMiles.toFixed(1)} mi`}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  selected: { borderColor: colors.brand, backgroundColor: colors.brandLight },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.full },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#DC2626' },
  badgeText: { fontFamily: typography.fontBodyBold, fontSize: 11 },
  check: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },

  title: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, lineHeight: 24 },
  titleSelected: { color: colors.brandDark },

  sport: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm },

  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.sm },
  venueText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: colors.textSecondary },
  venueTextSelected: { color: colors.brand },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: typography.fontBody, fontSize: typography.sizeXs, color: colors.textDisabled },
  distText: { color: colors.brand, fontFamily: typography.fontBodyMed },
});
