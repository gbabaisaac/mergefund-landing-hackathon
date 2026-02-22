import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '@/src/theme';

type Props = {
  item: { id: string; name: string; price: number; quantity: number };
  onIncrement: () => void;
  onDecrement: () => void;
};

export default function CartItem({ item, onIncrement, onDecrement }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>${(item.price * item.quantity).toFixed(2)}</Text>
      </View>
      <View style={styles.controls}>
        <Pressable style={styles.btn} onPress={onDecrement}>
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.qty}>{item.quantity}</Text>
        <Pressable style={[styles.btn, styles.addBtn]} onPress={onIncrement}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  info: { flex: 1 },
  name: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeMd, color: colors.textPrimary },
  price: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btn: {
    width: 32, height: 32, borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeLg, color: colors.textPrimary },
  addBtn: { backgroundColor: colors.brand },
  addBtnText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeLg, color: colors.white },
  qty: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeMd, color: colors.textPrimary, minWidth: 22, textAlign: 'center' },
});
