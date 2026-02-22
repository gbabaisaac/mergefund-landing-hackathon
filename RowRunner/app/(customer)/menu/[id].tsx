import { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '@/src/theme';
import { useCartStore } from '@/src/stores/cartStore';
import { supabase } from '@/src/lib/supabase';
import ScreenHeader from '@/src/components/ui/ScreenHeader';

type MenuItem = { id: string; name: string; description: string | null; price: number; section: string | null };

export default function MenuScreen() {
  const router = useRouter();
  const { id: restaurantId } = useLocalSearchParams<{ id: string }>();
  const { addItem, updateQuantity, items, itemCount, subtotal } = useCartStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const cartBarAnim = useRef(new Animated.Value(0)).current;
  const prevCount = useRef(0);

  useEffect(() => {
    (async () => {
      const [{ data: rest }, { data: mi }] = await Promise.all([
        supabase.from('restaurants').select('name').eq('id', restaurantId).single(),
        supabase.from('menu_items').select('id, name, description, price, section').eq('restaurant_id', restaurantId).order('section').order('name'),
      ]);
      setRestaurantName(rest?.name ?? '');
      setMenuItems(mi ?? []);
      setLoading(false);
    })();
  }, [restaurantId]);

  const count = itemCount();
  useEffect(() => {
    if (count > 0 && prevCount.current === 0) {
      Animated.spring(cartBarAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
    } else if (count === 0 && prevCount.current > 0) {
      Animated.timing(cartBarAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
    prevCount.current = count;
  }, [count]);

  const sections = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    menuItems.forEach((item) => {
      const key = item.section ?? 'Menu';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [menuItems]);

  const getQty = (id: string) => items.find((i) => i.id === id)?.quantity ?? 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Menu" onBack={() => router.back()} />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.brand} /></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={restaurantName} onBack={() => router.back()} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        renderItem={({ item }) => {
          const qty = getQty(item.id);
          return (
            <View style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description ? <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text> : null}
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.qtyControls}>
                {qty > 0 ? (
                  <>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.id, qty - 1)}>
                      <Ionicons name="remove" size={18} color={colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.qtyText}>{qty}</Text>
                  </>
                ) : null}
                <Pressable
                  style={[styles.qtyBtn, styles.addBtn]}
                  onPress={() => addItem({ id: item.id, name: item.name, price: item.price, restaurantId: restaurantId! })}
                >
                  <Ionicons name="add" size={18} color={colors.white} />
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}><Text style={styles.empty}>No menu items available.</Text></View>
        }
      />

      <Animated.View style={[styles.cartBar, {
        transform: [{ translateY: cartBarAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }],
        opacity: cartBarAnim,
      }]}>
        <Pressable style={styles.cartBarInner} onPress={() => router.push('/(customer)/checkout')}>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{count}</Text>
          </View>
          <Text style={styles.cartLabel}>View Cart</Text>
          <Text style={styles.cartTotal}>${subtotal().toFixed(2)}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  list: { padding: spacing.md, paddingBottom: 120 },
  sectionTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  itemCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm,
  },
  itemLeft: { flex: 1, marginRight: spacing.md },
  itemName: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeMd, color: colors.textPrimary },
  itemDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  itemPrice: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeMd, color: colors.brand, marginTop: spacing.xs },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  addBtn: { backgroundColor: colors.brand },
  qtyText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeMd, color: colors.textPrimary, minWidth: 20, textAlign: 'center' },
  empty: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary },
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.md, paddingBottom: spacing.xxl, paddingTop: spacing.sm,
  },
  cartBarInner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.brand, borderRadius: radii.lg,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg, ...shadows.lg,
  },
  cartBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  cartBadgeText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeSm, color: colors.white },
  cartLabel: { flex: 1, fontFamily: typography.fontBodyBold, fontSize: typography.sizeLg, color: colors.white },
  cartTotal: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.white },
});
