import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '@/src/theme';

const OPTIONS = [15, 20, 25];

type Props = {
  selected: number;
  customDollars: number | null;
  onSelectPercent: (pct: number) => void;
  onSelectCustom: (amount: number | null) => void;
};

export default function TipSelector({ selected, customDollars, onSelectPercent, onSelectCustom }: Props) {
  const isCustom = customDollars !== null;
  const [showInput, setShowInput] = useState(isCustom);
  const [inputVal, setInputVal] = useState(isCustom ? customDollars.toFixed(2) : '');

  const handlePreset = (pct: number) => {
    setShowInput(false);
    setInputVal('');
    onSelectPercent(pct);
  };

  const handleOther = () => {
    setShowInput(true);
    onSelectCustom(inputVal ? parseFloat(inputVal) : 0);
  };

  const handleCustomChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    const limited = formatted.includes('.') ? formatted.slice(0, formatted.indexOf('.') + 3) : formatted;
    setInputVal(limited);
    const num = parseFloat(limited);
    onSelectCustom(isNaN(num) ? 0 : num);
  };

  return (
    <View>
      <View style={styles.row}>
        {OPTIONS.map((pct) => (
          <Pressable
            key={pct}
            style={[styles.pill, selected === pct && !isCustom && styles.pillActive]}
            onPress={() => handlePreset(pct)}
          >
            <Text style={[styles.label, selected === pct && !isCustom && styles.labelActive]}>{pct}%</Text>
            <Text style={[styles.hint, selected === pct && !isCustom && styles.hintActive]}>
              {pct === 15 ? 'Good' : pct === 20 ? 'Great' : 'Amazing'}
            </Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.pill, isCustom && styles.pillActive]}
          onPress={handleOther}
        >
          <Text style={[styles.label, isCustom && styles.labelActive]}>Other</Text>
        </Pressable>
      </View>

      {showInput || isCustom ? (
        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <Text style={styles.dollar}>$</Text>
            <TextInput
              style={styles.input}
              value={inputVal}
              onChangeText={handleCustomChange}
              placeholder="0.00"
              placeholderTextColor={colors.textDisabled}
              keyboardType="decimal-pad"
              maxLength={6}
              autoFocus
            />
          </View>
          <Text style={styles.inputHint}>Enter a custom tip amount</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  pillActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandLight,
  },
  label: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeLg, color: colors.textPrimary },
  labelActive: { color: colors.brand },
  hint: { fontFamily: typography.fontBody, fontSize: typography.sizeXs, color: colors.textDisabled, marginTop: 2 },
  hintActive: { color: colors.brand },

  inputRow: { marginTop: spacing.sm, alignItems: 'center' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandLight,
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    width: 140,
  },
  dollar: {
    fontFamily: typography.fontBodyBold,
    fontSize: typography.sizeXl,
    color: colors.brand,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontBodyBold,
    fontSize: typography.sizeXl,
    color: colors.brand,
    textAlign: 'left',
    padding: 0,
  },
  inputHint: {
    fontFamily: typography.fontBody,
    fontSize: typography.sizeXs,
    color: colors.textDisabled,
    marginTop: spacing.xs,
  },
});
