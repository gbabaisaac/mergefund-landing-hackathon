import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radii, spacing } from '@/src/theme';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: colors.warning + '20', text: colors.warning },
  confirmed: { bg: colors.brand + '20', text: colors.brand },
  claimed: { bg: colors.brand + '20', text: colors.brand },
  preparing: { bg: colors.warning + '20', text: colors.warning },
  ready: { bg: colors.success + '20', text: colors.success },
  picked_up: { bg: colors.brand + '20', text: colors.brandDark },
  delivered: { bg: colors.success + '20', text: colors.success },
  cancelled: { bg: colors.error + '20', text: colors.error },
};

export default function StatusPill({ status }: { status: string }) {
  const palette = STATUS_COLORS[status] ?? { bg: colors.surfaceAlt, text: colors.textSecondary };
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>{status.replace('_', ' ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  text: {
    fontFamily: typography.fontBodyBold,
    fontSize: typography.sizeXs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
