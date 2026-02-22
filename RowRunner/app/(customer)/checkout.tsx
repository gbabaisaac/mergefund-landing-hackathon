import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '@/src/theme';
import { useCartStore } from '@/src/stores/cartStore';
import { useSessionStore } from '@/src/stores/sessionStore';
import { supabase } from '@/src/lib/supabase';
import { sendOrderEmail } from '@/src/lib/sendOrderEmail';
import { sanitizeSeatField, sanitizeText, sanitizeEmail, isValidSeatField, isValidEmail } from '@/src/lib/sanitize';
import ScreenHeader from '@/src/components/ui/ScreenHeader';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import TipSelector from '@/src/components/order/TipSelector';

const TAX_RATE = 0.07;
const SERVICE_FEE = 2.50;

export default function CheckoutScreen() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const {
    items, venueId, customerName, section, row, seat, phone, email, tipPercent, customTipDollars, allergyNotes,
    setCustomerName, setSeat, setPhone, setEmail, setTipPercent, setCustomTipDollars, setAllergyNotes, updateQuantity, subtotal, clearCart,
  } = useCartStore();

  const [nameVal, setNameVal] = useState(customerName || user?.user_metadata?.full_name || '');
  const [sectionVal, setSectionVal] = useState(section);
  const [rowVal, setRowVal] = useState(row);
  const [seatVal, setSeatVal] = useState(seat);
  const [phoneVal, setPhoneVal] = useState(phone);
  const [emailVal, setEmailVal] = useState(email || user?.email || '');
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sub = subtotal();
  const tax = sub * TAX_RATE;
  const tipAmt = customTipDollars !== null ? customTipDollars : sub * (tipPercent / 100);
  const total = sub + tax + SERVICE_FEE + tipAmt;

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').substring(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePlace = async () => {
    const e: Record<string, string> = {};
    if (!nameVal.trim()) e.name = 'Name is required';
    if (!isValidSeatField(sectionVal)) e.section = 'Required';
    if (!isValidSeatField(rowVal)) e.row = 'Required';
    if (!isValidSeatField(seatVal)) e.seat = 'Required';
    const phoneDigits = phoneVal.replace(/\D/g, '');
    if (phoneDigits.length < 10) e.phone = 'Enter a valid 10-digit number';
    if (!isValidEmail(sanitizeEmail(emailVal))) e.email = 'Enter a valid email';
    if (items.length === 0) e.cart = 'Cart is empty';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setCustomerName(nameVal.trim());
    setSeat(sectionVal, rowVal, seatVal);
    setPhone(phoneVal);
    setEmail(sanitizeEmail(emailVal));
    setPlacing(true);

    try {
      const session = useSessionStore.getState().session;
      const cartState = useCartStore.getState();
      const restaurantId = cartState.items[0]?.restaurantId ?? null;

      const cleanedEmail = sanitizeEmail(emailVal);

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          venue_id: cartState.venueId,
          restaurant_id: restaurantId,
          customer_id: session?.user?.id ?? null,
          customer_name: nameVal.trim(),
          customer_email: cleanedEmail,
          customer_phone: phoneVal,
          status: 'pending',
          section: sectionVal,
          row: rowVal,
          seat: seatVal,
          notes: cartState.notes || null,
          allergy_notes: allergyNotes || null,
          subtotal: sub,
          tax,
          service_fee: SERVICE_FEE,
          tip_percent: tipPercent,
          tip_amount: tipAmt,
          total,
          timing_type: cartState.timingType,
          scheduled_at: cartState.scheduledAt,
        })
        .select('id')
        .single();

      if (orderErr) throw orderErr;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      sendOrderEmail({
        to: cleanedEmail,
        customerName: nameVal.trim(),
        orderId: order.id,
        status: 'pending',
        section: sectionVal,
        row: rowVal,
        seat: seatVal,
        total: total.toFixed(2),
        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        venueName: cartState.venueName ?? undefined,
      });

      clearCart();
      router.replace(`/(customer)/confirmation?orderId=${order.id}`);
    } catch (err: any) {
      Alert.alert('Order failed', err.message ?? 'Something went wrong. Please try again.');
      setPlacing(false);
    }
  };

  if (items.length === 0 && !placing) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Checkout" onBack={() => router.back()} />
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={56} color={colors.textDisabled} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDesc}>Add items from the menu to get started</Text>
          <Button title="Browse Menu" onPress={() => router.back()} variant="secondary" style={{ marginTop: spacing.lg, width: 200 }} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Checkout" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── 1. Your Order ── */}
        <SectionLabel icon="receipt-outline" label="Your Order" />
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
            <View style={styles.qtyRow}>
              <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                <Ionicons name="remove" size={16} color={colors.textPrimary} />
              </Pressable>
              <Text style={styles.qtyVal}>{item.quantity}</Text>
              <Pressable style={[styles.qtyBtn, styles.qtyBtnAdd]} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                <Ionicons name="add" size={16} color={colors.white} />
              </Pressable>
            </View>
          </View>
        ))}

        {/* ── 2. Your Name ── */}
        <SectionLabel icon="person-outline" label="Your Name" />
        <Input
          placeholder="Full name"
          value={nameVal}
          onChangeText={setNameVal}
          autoCapitalize="words"
          error={errors.name}
          containerStyle={styles.fieldBottom}
        />

        {/* ── 3. Seat Info ── */}
        <SectionLabel icon="location-outline" label="Deliver to Your Seat" />
        <View style={styles.seatRow}>
          <Input placeholder="Section" value={sectionVal} onChangeText={(t) => setSectionVal(sanitizeSeatField(t))} error={errors.section} containerStyle={{ flex: 1 }} />
          <Input placeholder="Row" value={rowVal} onChangeText={(t) => setRowVal(sanitizeSeatField(t))} error={errors.row} containerStyle={{ flex: 1 }} />
          <Input placeholder="Seat" value={seatVal} onChangeText={(t) => setSeatVal(sanitizeSeatField(t))} error={errors.seat} containerStyle={{ flex: 1 }} />
        </View>

        {/* ── 4. Phone Number ── */}
        <SectionLabel icon="call-outline" label="Phone Number" />
        <Input
          placeholder="(555) 123-4567"
          value={phoneVal}
          onChangeText={(t) => setPhoneVal(formatPhone(t))}
          keyboardType="phone-pad"
          error={errors.phone}
          containerStyle={styles.fieldBottom}
        />

        {/* ── 5. Email ── */}
        <SectionLabel icon="mail-outline" label="Email" />
        <Input
          placeholder="you@example.com"
          value={emailVal}
          onChangeText={(t) => setEmailVal(sanitizeEmail(t))}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          containerStyle={styles.fieldBottom}
        />

        {/* ── 6. Allergies & Special Requests ── */}
        <SectionLabel icon="alert-circle-outline" label="Allergies & Special Requests" />
        <Input
          placeholder="e.g. No nuts, extra napkins"
          value={allergyNotes}
          onChangeText={(t) => setAllergyNotes(sanitizeText(t))}
          multiline
          containerStyle={{ marginBottom: spacing.xs }}
        />
        <Text style={styles.charCount}>{allergyNotes.length}/300</Text>

        {/* ── 7. Tip ── */}
        <SectionLabel icon="heart-outline" label="Tip Your Runner" />
        <TipSelector selected={tipPercent} customDollars={customTipDollars} onSelectPercent={setTipPercent} onSelectCustom={setCustomTipDollars} />

        {/* ── 8. Total Box ── */}
        <View style={styles.totalBox}>
          <PriceRow label="Subtotal" value={sub} />
          <PriceRow label="Tax (7%)" value={tax} />
          <PriceRow label="Service fee" value={SERVICE_FEE} />
          <PriceRow label={customTipDollars !== null ? 'Runner tip (custom)' : `Runner tip (${tipPercent}%)`} value={tipAmt} />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.lg, marginBottom: spacing.xxl }}>
          <Button title={placing ? 'Processing...' : `Pay $${total.toFixed(2)}`} onPress={handlePlace} loading={placing} disabled={placing} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionLabel({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Ionicons name={icon} size={18} color={colors.brand} />
      <Text style={styles.sectionLabelText}>{label}</Text>
    </View>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={styles.priceValue}>${value.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  emptyTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, marginTop: spacing.md },
  emptyDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.xs },

  sectionLabelRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.xl, marginBottom: spacing.sm,
  },
  sectionLabelText: {
    fontFamily: typography.fontDisplayMed, fontSize: typography.sizeMd, color: colors.textPrimary,
  },

  fieldBottom: { marginBottom: spacing.xs },

  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  itemName: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeMd, color: colors.textPrimary },
  itemPrice: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnAdd: { backgroundColor: colors.brand },
  qtyVal: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeMd, color: colors.textPrimary, minWidth: 20, textAlign: 'center' },

  seatRow: { flexDirection: 'row', gap: spacing.sm },

  charCount: { fontFamily: typography.fontBody, fontSize: typography.sizeXs, color: colors.textDisabled, textAlign: 'right', marginBottom: spacing.sm },

  totalBox: {
    backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginTop: spacing.xl, ...shadows.sm,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  priceLabel: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary },
  priceValue: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeMd, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary },
  totalValue: { fontFamily: typography.fontDisplay, fontSize: typography.sizeXl, color: colors.brand },
});
