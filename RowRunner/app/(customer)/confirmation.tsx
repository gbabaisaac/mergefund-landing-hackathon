import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '@/src/theme';
import { supabase } from '@/src/lib/supabase';
import Button from '@/src/components/ui/Button';

type OrderStep = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
};

const STEPS: OrderStep[] = [
  { key: 'pending', label: 'Order Placed', icon: 'checkmark-circle', description: 'Your order has been received' },
  { key: 'claimed', label: 'Runner Assigned', icon: 'person', description: 'A runner has claimed your order' },
  { key: 'confirmed', label: 'Runner En Route', icon: 'walk', description: 'Your runner picked up the food and is heading to you' },
  { key: 'delivered', label: 'Delivered', icon: 'happy', description: 'Enjoy your meal!' },
];

function statusToStep(status: string): number {
  const idx = STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function ConfirmationScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [orderStatus, setOrderStatus] = useState('pending');
  const checkScale = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!orderId) return;

    const fetchInitial = async () => {
      const { data } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();
      if (data) {
        setOrderStatus(data.status);
        setCurrentStep(statusToStep(data.status));
      }
    };
    fetchInitial();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          const newStatus = payload.new.status as string;
          setOrderStatus(newStatus);
          setCurrentStep(statusToStep(newStatus));
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  const isDelivered = orderStatus === 'delivered';
  const isCancelled = orderStatus === 'cancelled';
  const canCancel = orderStatus === 'pending' || orderStatus === 'claimed';

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This cannot be undone.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            if (!orderId) return;
            const { error } = await supabase
              .from('orders')
              .update({ status: 'cancelled' })
              .eq('id', orderId);
            if (error) {
              Alert.alert('Error', 'Could not cancel the order. Please try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[
          styles.checkCircle,
          isDelivered && styles.checkDelivered,
          isCancelled && styles.checkCancelled,
          { transform: [{ scale: checkScale }] },
        ]}>
          <Ionicons
            name={isCancelled ? 'close' : isDelivered ? 'happy' : 'checkmark'}
            size={36}
            color={colors.white}
          />
        </Animated.View>
        <Animated.View style={{ opacity: fadeIn, alignItems: 'center' }}>
          <Text style={styles.title}>
            {isCancelled ? 'Order Cancelled' : isDelivered ? 'Order Delivered!' : 'Order Confirmed!'}
          </Text>
          {orderId ? (
            <Text style={styles.orderId}>Order #{orderId.slice(0, 8).toUpperCase()}</Text>
          ) : null}
        </Animated.View>
      </View>

      {isCancelled ? (
        <Animated.View style={[styles.cancelledCard, { opacity: fadeIn }]}>
          <Ionicons name="information-circle" size={22} color={colors.error} />
          <Text style={styles.cancelledText}>
            This order has been cancelled. No charges will be applied.
          </Text>
        </Animated.View>
      ) : (
        <>
          <Animated.View style={[styles.tracker, { opacity: fadeIn }]}>
            <Text style={styles.trackerTitle}>Live Order Status</Text>
            {STEPS.map((step, i) => {
              const isComplete = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={styles.stepIndicator}>
                    <View style={[
                      styles.dot,
                      isComplete && styles.dotComplete,
                      isCurrent && styles.dotCurrent,
                    ]}>
                      {isComplete ? (
                        <Ionicons name={step.icon} size={16} color={colors.white} />
                      ) : (
                        <Ionicons name={step.icon} size={16} color={colors.textDisabled} />
                      )}
                    </View>
                    {i < STEPS.length - 1 ? (
                      <View style={[styles.line, isComplete && styles.lineComplete]} />
                    ) : null}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, isComplete && styles.stepLabelComplete, isCurrent && styles.stepLabelCurrent]}>
                      {step.label}
                    </Text>
                    {isCurrent ? <Text style={styles.stepDesc}>{step.description}</Text> : null}
                  </View>
                </View>
              );
            })}
          </Animated.View>

          {!isDelivered ? (
            <Animated.View style={[styles.etaCard, { opacity: fadeIn }]}>
              <Ionicons name="time-outline" size={20} color={colors.brand} />
              <Text style={styles.etaText}>
                {orderStatus === 'pending' && 'Waiting for a runner to claim your order…'}
                {orderStatus === 'claimed' && 'Runner is picking up your food…'}
                {orderStatus === 'confirmed' && 'Runner is on the way to your seat!'}
              </Text>
            </Animated.View>
          ) : null}
        </>
      )}

      <View style={styles.bottom}>
        {canCancel ? (
          <Button title="Cancel Order" onPress={handleCancel} variant="secondary" style={styles.cancelBtn} textStyle={styles.cancelBtnText} />
        ) : null}
        <Button title="Back to Home" onPress={() => router.replace('/')} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  header: { alignItems: 'center', paddingTop: 80, marginBottom: spacing.xl },
  checkCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadows.md,
  },
  checkDelivered: { backgroundColor: colors.brand },
  title: { fontFamily: typography.fontDisplay, fontSize: typography.size2xl, color: colors.textPrimary },
  orderId: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: spacing.xs },

  tracker: {
    backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, ...shadows.sm,
  },
  trackerTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeMd, color: colors.textPrimary, marginBottom: spacing.md },
  stepRow: { flexDirection: 'row', minHeight: 48 },
  stepIndicator: { alignItems: 'center', width: 36, marginRight: spacing.md },
  dot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  dotComplete: { backgroundColor: colors.brand, borderColor: colors.brand },
  dotCurrent: { backgroundColor: colors.brand, borderColor: colors.brandDark, ...shadows.sm },
  line: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2 },
  lineComplete: { backgroundColor: colors.brand },
  stepContent: { flex: 1, paddingBottom: spacing.md },
  stepLabel: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeMd, color: colors.textDisabled },
  stepLabelComplete: { color: colors.textPrimary },
  stepLabelCurrent: { fontFamily: typography.fontBodyBold, color: colors.brand },
  stepDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: 2 },

  etaCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.brandLight, borderRadius: radii.lg,
    padding: spacing.md, marginTop: spacing.lg,
  },
  etaText: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textPrimary, flex: 1 },

  checkCancelled: { backgroundColor: colors.error },
  cancelledCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: '#FEF2F2', borderRadius: radii.lg, borderWidth: 1, borderColor: '#FECACA',
    padding: spacing.md, marginTop: spacing.lg,
  },
  cancelledText: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.error, flex: 1 },
  cancelBtn: { marginBottom: spacing.sm, borderColor: colors.error },
  cancelBtnText: { color: colors.error },

  bottom: { marginTop: 'auto', paddingBottom: spacing.xxl, paddingTop: spacing.lg },
});
