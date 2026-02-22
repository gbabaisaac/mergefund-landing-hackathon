import { Text, Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '@/src/theme';

type Props = {
  venue: { id: string; name: string; city?: string; state?: string; type?: string };
  distanceMiles?: number | null;
  selected?: boolean;
  onPress: () => void;
};

const TYPE_EMOJI: Record<string, string> = {
  arena: '🏟️',
  stadium: '🏈',
  concert_hall: '🎵',
};

export default function VenueCard({ venue, distanceMiles, selected, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.emoji}>{TYPE_EMOJI[venue.type ?? ''] ?? '🏟️'}</Text>

      <View style={styles.info}>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.location}>
          {venue.city}{venue.state ? `, ${venue.state}` : ''}
        </Text>
      </View>

      <View style={styles.right}>
        {distanceMiles != null ? (
          <View style={styles.distBadge}>
            <Ionicons name="navigate-outline" size={12} color={colors.brand} />
            <Text style={styles.distText}>
              {distanceMiles < 1 ? `${(distanceMiles * 5280).toFixed(0)} ft` : `${distanceMiles.toFixed(1)} mi`}
            </Text>
          </View>
        ) : null}
        {selected ? (
          <View style={styles.check}>
            <Ionicons name="checkmark" size={16} color={colors.white} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandLight,
  },
  pressed: { opacity: 0.92 },
  emoji: { fontSize: 28, marginRight: spacing.md },
  info: { flex: 1 },
  name: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeMd, color: colors.textPrimary },
  location: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: spacing.xs },
  distBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  distText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeXs, color: colors.brand },
  check: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center',
  },
});
