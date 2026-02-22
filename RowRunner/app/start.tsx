import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, typography, spacing, radii } from '@/src/theme';
import { useCartStore } from '@/src/stores/cartStore';
import { supabase } from '@/src/lib/supabase';
import Button from '@/src/components/ui/Button';
import EventCard from '@/src/components/event/EventCard';
import ScreenHeader from '@/src/components/ui/ScreenHeader';

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  venue_id: string;
  venue_name: string;
  venue_city: string;
  venue_state: string;
  venue_lat: number | null;
  venue_lon: number | null;
  distanceMiles: number | null;
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function EventSelectionScreen() {
  const router = useRouter();
  const { eventId, setVenue, setEvent } = useCartStore();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [hasCoords, setHasCoords] = useState(false);

  useEffect(() => { loadEverything(); }, []);

  const requestLocation = async (): Promise<{ lat: number; lon: number } | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocationDenied(true); return null; }
      setLocationDenied(false);
      const timeout = new Promise<null>((r) => setTimeout(() => r(null), 5000));
      const locate = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then(
        (loc) => ({ lat: loc.coords.latitude, lon: loc.coords.longitude }),
      );
      return await Promise.race([locate, timeout]);
    } catch { return null; }
  };

  const applyDistances = (rows: EventRow[], coords: { lat: number; lon: number }) => {
    rows.forEach((r) => {
      if (r.venue_lat != null && r.venue_lon != null) {
        r.distanceMiles = haversine(coords.lat, coords.lon, r.venue_lat, r.venue_lon);
      }
    });
    rows.sort((a, b) => (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999));
    if (rows.length > 0) {
      setVenue(rows[0].venue_id, rows[0].venue_name);
      setEvent(rows[0].id, rows[0].title);
    }
  };

  const loadEverything = async () => {
    setLoading(true);
    const now = new Date().toISOString();

    let rawEvents: any[] | null = null;
    try {
      const supabaseTimeout = new Promise<{ data: null }>((r) => setTimeout(() => r({ data: null }), 8000));
      const query = supabase
        .from('events')
        .select('id, title, description, starts_at, ends_at, venue_id, venues(id, name, city, state, latitude, longitude)')
        .eq('is_active', true)
        .gte('ends_at', now)
        .order('starts_at');
      const result = await Promise.race([query, supabaseTimeout]);
      rawEvents = (result as any).data;
    } catch { /* network error — show empty */ }

    const rows: EventRow[] = (rawEvents ?? []).map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      venue_id: e.venues?.id ?? e.venue_id,
      venue_name: e.venues?.name ?? '',
      venue_city: e.venues?.city ?? '',
      venue_state: e.venues?.state ?? '',
      venue_lat: e.venues?.latitude ?? null,
      venue_lon: e.venues?.longitude ?? null,
      distanceMiles: null,
    }));

    setEvents(rows);
    setLoading(false);

    const coords = await requestLocation();
    if (coords) {
      setHasCoords(true);
      applyDistances([...rows], coords);
      setEvents([...rows]);
    }
  };

  const handleRetryLocation = async () => {
    const coords = await requestLocation();
    if (!coords) return;
    setHasCoords(true);
    const updated = events.map((r) => ({
      ...r,
      distanceMiles: r.venue_lat != null && r.venue_lon != null ? haversine(coords.lat, coords.lon, r.venue_lat, r.venue_lon) : null,
    })).sort((a, b) => (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999));
    setEvents(updated);
    if (updated.length > 0) {
      setVenue(updated[0].venue_id, updated[0].venue_name);
      setEvent(updated[0].id, updated[0].title);
    }
  };

  const handleSelect = (e: EventRow) => {
    setVenue(e.venue_id, e.venue_name);
    setEvent(e.id, e.title);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="" onBack={() => router.back()} />

      <View style={styles.header}>
        <Text style={styles.headline}>What are you{'\n'}attending?</Text>
        <Text style={styles.subtext}>
          {hasCoords ? 'Sorted by distance — nearest event selected' : 'Select the event you\'re at today'}
        </Text>
      </View>

      {locationDenied && !hasCoords ? (
        <Pressable style={styles.locBanner} onPress={handleRetryLocation}>
          <Ionicons name="location-outline" size={18} color={colors.brand} />
          <Text style={styles.locText}>Enable location to find nearby events</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.brand} />
        </Pressable>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.loadingText}>Finding events near you…</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <EventCard
              event={{
                id: item.id,
                title: item.title,
                description: item.description,
                starts_at: item.starts_at,
                ends_at: item.ends_at,
                venue_name: item.venue_name,
                venue_city: item.venue_city,
                venue_state: item.venue_state,
              }}
              distanceMiles={item.distanceMiles}
              selected={item.id === eventId}
              onPress={() => handleSelect(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={56} color={colors.textDisabled} />
              <Text style={styles.emptyTitle}>No live events</Text>
              <Text style={styles.emptyDesc}>There are no active events right now.{'\n'}Check back when a game or show is happening.</Text>
            </View>
          }
        />
      )}

      <View style={styles.bottom}>
        <Button
          title="Continue"
          onPress={() => router.push('/(customer)/timing')}
          disabled={!eventId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  headline: { fontFamily: typography.fontDisplay, fontSize: typography.size2xl, color: colors.textPrimary, lineHeight: 34 },
  subtext: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.xs },

  locBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.brandLight, marginHorizontal: spacing.lg, marginBottom: spacing.md, padding: spacing.md, borderRadius: radii.lg,
  },
  locText: { flex: 1, fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: colors.brand },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  loadingText: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: spacing.sm },

  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, marginTop: spacing.xxl },
  emptyTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, marginTop: spacing.md },
  emptyDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: spacing.xs },

  bottom: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
});
