import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/src/theme';

type Props = {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
};

export default function ScreenHeader({ title, onBack, rightElement }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>{rightElement ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: { width: 40 },
  right: { width: 40, alignItems: 'flex-end' },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontFamily: typography.fontDisplay,
    fontSize: 28,
    color: colors.brand,
    marginTop: -2,
  },
  title: {
    flex: 1,
    fontFamily: typography.fontDisplayMed,
    fontSize: typography.sizeLg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
