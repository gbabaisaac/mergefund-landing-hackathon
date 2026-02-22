import { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '@/src/theme';
import { useCartStore } from '@/src/stores/cartStore';
import ScreenHeader from '@/src/components/ui/ScreenHeader';
import Button from '@/src/components/ui/Button';

export default function TimingScreen() {
  const router = useRouter();
  const { timingType, setTiming } = useCartStore();
  const [selected, setSelected] = useState<'asap' | 'scheduled'>(timingType);
  const [scheduledTime, setScheduledTime] = useState('');

  const handleContinue = () => {
    setTiming(selected, selected === 'scheduled' ? scheduledTime : undefined);
    router.push('/(customer)/restaurants');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="" onBack={() => router.back()} />

      <View style={styles.content}>
        <Text style={styles.headline}>When do you need{'\n'}your order?</Text>
        <Text style={styles.subtext}>Choose your preferred delivery time</Text>

        <Pressable style={[styles.card, selected === 'asap' && styles.cardActive]} onPress={() => setSelected('asap')}>
          <View style={[styles.iconCircle, selected === 'asap' && styles.iconCircleActive]}>
            <Ionicons name="flash" size={24} color={selected === 'asap' ? colors.brand : colors.textDisabled} />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, selected === 'asap' && styles.cardTitleActive]}>ASAP</Text>
            <Text style={styles.cardDesc}>Get it as soon as possible</Text>
          </View>
          {selected === 'asap' ? (
            <View style={styles.radio}><View style={styles.radioDot} /></View>
          ) : <View style={styles.radioEmpty} />}
        </Pressable>

        <Pressable style={[styles.card, selected === 'scheduled' && styles.cardActive]} onPress={() => setSelected('scheduled')}>
          <View style={[styles.iconCircle, selected === 'scheduled' && styles.iconCircleActive]}>
            <Ionicons name="time" size={24} color={selected === 'scheduled' ? colors.brand : colors.textDisabled} />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, selected === 'scheduled' && styles.cardTitleActive]}>Schedule for Later</Text>
            <Text style={styles.cardDesc}>Choose a specific time</Text>
          </View>
          {selected === 'scheduled' ? (
            <View style={styles.radio}><View style={styles.radioDot} /></View>
          ) : <View style={styles.radioEmpty} />}
        </Pressable>

        {selected === 'scheduled' ? (
          <View style={styles.timeWrap}>
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.timeInput}
              placeholder="e.g. 7:30 PM"
              placeholderTextColor={colors.textDisabled}
              value={scheduledTime}
              onChangeText={setScheduledTime}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.bottom}>
        <Button title="Continue to Restaurants" onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  headline: { fontFamily: typography.fontDisplay, fontSize: typography.size2xl, color: colors.textPrimary },
  subtext: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm,
  },
  cardActive: { borderColor: colors.brand, backgroundColor: colors.brandLight },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  iconCircleActive: { backgroundColor: colors.white },
  cardText: { flex: 1 },
  cardTitle: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeLg, color: colors.textPrimary },
  cardTitleActive: { color: colors.brand },
  cardDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.brand },
  radioEmpty: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border },
  timeWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    height: 52, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.md, paddingHorizontal: spacing.md,
  },
  timeInput: { flex: 1, fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textPrimary },
  bottom: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
});
