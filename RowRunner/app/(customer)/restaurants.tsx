import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '@/src/theme';
import { useCartStore } from '@/src/stores/cartStore';
import { supabase } from '@/src/lib/supabase';
import ScreenHeader from '@/src/components/ui/ScreenHeader';

type Restaurant = { id: string; name: string; category: string | null; eta_minutes: number };

const CATEGORY_ICONS: Record<string, string> = {
  burgers: '🍔', pizza: '🍕', mexican: '🌮', asian: '🍜',
  drinks: '🥤', desserts: '🍦', grill: '🔥', chicken: '🍗',
};

export default function RestaurantsScreen() {
  const router = useRouter();
  const venueId = useCartStore((s) => s.venueId);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!venueId) return;
    const { data } = await supabase
      .from('restaurants')
      .select('id, name, category, eta_minutes')
      .eq('venue_id', venueId)
      .order('name');
    setRestaurants(data ?? []);
  }, [venueId]);

  useEffect(() => { fetchData().finally(() => setLoading(false)); }, [fetchData]);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const getCategoryIcon = (cat: string | null) => {
    if (!cat) return '🍽️';
    return CATEGORY_ICONS[cat.toLowerCase()] ?? '🍽️';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Restaurants" onBack={() => router.back()} />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.brand} /></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Restaurants" onBack={() => router.back()} />
      <FlatList
        data={restaurants}
        keyExtractor={(r) => r.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => router.push(`/(customer)/menu/${item.id}`)}
          >
            <Text style={styles.emoji}>{getCategoryIcon(item.category)}</Text>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            {item.category ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>
            ) : null}
            <View style={styles.etaRow}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.eta}>{item.eta_minutes} min</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.empty}>No restaurants available{'\n'}for this venue yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  row: { justifyContent: 'space-between' },
  card: {
    width: '48%', backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    marginBottom: spacing.md, alignItems: 'center', ...shadows.sm,
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  emoji: { fontSize: 36, marginBottom: spacing.sm },
  name: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeMd, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  badge: { backgroundColor: colors.brandLight, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.full, marginBottom: spacing.xs },
  badgeText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeXs, color: colors.brand, textTransform: 'capitalize' },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eta: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  empty: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
