import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, runner, typography, spacing, radii, shadows } from '@/src/theme';
import { useRunnerStore } from '@/src/stores/runnerStore';
import { useSessionStore } from '@/src/stores/sessionStore';
import { supabase } from '@/src/lib/supabase';
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

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function getStatus(starts: string, ends: string): { label: string; color: string; bg: string; isLive: boolean } {
  const now = Date.now();
  const s = new Date(starts).getTime();
  const e = new Date(ends).getTime();
  if (now >= s && now <= e) return { label: 'LIVE NOW', color: '#DC2626', bg: '#FEE2E2', isLive: true };
  if (s - now < 60 * 60 * 1000 && s > now) return { label: 'STARTING SOON', color: '#D97706', bg: '#FEF3C7', isLive: false };
  return { label: formatTime(starts), color: colors.textSecondary, bg: colors.surfaceAlt, isLive: false };
}

function RunnerEventCard({ event, distanceMiles, selected, onPress }: { event: EventRow; distanceMiles?: number | null; selected?: boolean; onPress: () => void }) {
  const status = getStatus(event.starts_at, event.ends_at);
  return (
    <Pressable style={({ pressed }) => [cardStyles.card, selected && cardStyles.selected, pressed && cardStyles.pressed]} onPress={onPress}>
      <View style={cardStyles.topRow}>
        <View style={[cardStyles.badge, { backgroundColor: status.bg }]}>
          {status.isLive ? <View style={cardStyles.liveDot} /> : null}
          <Text style={[cardStyles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
        {selected ? (
          <View style={cardStyles.check}><Ionicons name="checkmark" size={14} color={colors.white} /></View>
        ) : null}
      </View>
      <Text style={[cardStyles.title, selected && cardStyles.titleSelected]}>{event.title}</Text>
      {event.description ? <Text style={cardStyles.sport}>{event.description}</Text> : null}
      <View style={cardStyles.venueRow}>
        <Ionicons name="location" size={14} color={selected ? runner.brand : colors.textDisabled} />
        <Text style={[cardStyles.venueText, selected && cardStyles.venueTextSelected]}>
          {event.venue_name} · {event.venue_city}, {event.venue_state}
        </Text>
      </View>
      <View style={cardStyles.metaRow}>
        <View style={cardStyles.metaItem}>
          <Ionicons name="time-outline" size={13} color={colors.textDisabled} />
          <Text style={cardStyles.metaText}>{formatTime(event.starts_at)} – {formatTime(event.ends_at)}</Text>
        </View>
        {distanceMiles != null ? (
          <View style={cardStyles.metaItem}>
            <Ionicons name="navigate-outline" size={13} color={runner.brand} />
            <Text style={[cardStyles.metaText, cardStyles.distText]}>
              {distanceMiles < 1 ? `${(distanceMiles * 5280).toFixed(0)} ft` : `${distanceMiles.toFixed(1)} mi`}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function RunnerEventSelectionScreen() {
  const router = useRouter();
  const { eventId, setVenue, setEvent, setRunner } = useRunnerStore();
  const session = useSessionStore((s) => s.session);

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [hasCoords, setHasCoords] = useState(false);

  useEffect(() => {
    if (session?.user?.id) setRunner(session.user.id);
    loadEverything();
  }, []);

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
    } catch { /* network error */ }

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

  const handleSelect = (e: EventRow) => {
    setVenue(e.venue_id, e.venue_name);
    setEvent(e.id, e.title);
  };

  const handleContinue = async () => {
    const venueId = useRunnerStore.getState().venueId;
    const runnerId = useRunnerStore.getState().runnerId;
    if (!venueId || !runnerId) return;

    try {
      await supabase.from('runner_sessions').upsert(
        { runner_id: runnerId, venue_id: venueId },
        { onConflict: 'runner_id' },
      );
    } catch { /* best effort */ }

    router.push('/(runner)/dashboard');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="" onBack={() => router.back()} />

      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <View style={styles.roleBadge}>
            <Ionicons name="flash" size={14} color={runner.brand} />
            <Text style={styles.roleBadgeText}>Dasher Mode</Text>
          </View>
        </View>
        <Text style={styles.headline}>Where are you{'\n'}delivering?</Text>
        <Text style={styles.subtext}>
          {hasCoords ? 'Sorted by distance — nearest event selected' : 'Select the event you\'re working today'}
        </Text>
      </View>

      {locationDenied && !hasCoords ? (
        <Pressable style={styles.locBanner} onPress={loadEverything}>
          <Ionicons name="location-outline" size={18} color={runner.brand} />
          <Text style={styles.locText}>Enable location to find nearby events</Text>
          <Ionicons name="chevron-forward" size={16} color={runner.brand} />
        </Pressable>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={runner.brand} />
          <Text style={styles.loadingText}>Finding events…</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RunnerEventCard
              event={item}
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
        <Pressable
          style={({ pressed }) => [styles.continueBtn, !eventId && styles.continueBtnDisabled, pressed && eventId ? styles.continuePressed : null]}
          onPress={handleContinue}
          disabled={!eventId}
        >
          <Text style={styles.continueText}>Start Delivering</Text>
        </Pressable>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1.5,
    borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm,
  },
  selected: { borderColor: runner.brand, backgroundColor: runner.brandLight },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.full },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#DC2626' },
  badgeText: { fontFamily: typography.fontBodyBold, fontSize: 11 },
  check: { width: 22, height: 22, borderRadius: 11, backgroundColor: runner.brand, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, lineHeight: 24 },
  titleSelected: { color: runner.brandDark },
  sport: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.sm },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.sm },
  venueText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: colors.textSecondary },
  venueTextSelected: { color: runner.brand },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: typography.fontBody, fontSize: typography.sizeXs, color: colors.textDisabled },
  distText: { color: runner.brand, fontFamily: typography.fontBodyMed },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  badgeWrap: { marginBottom: spacing.sm },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    backgroundColor: runner.brandLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.full,
  },
  roleBadgeText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeXs, color: runner.brand },
  headline: { fontFamily: typography.fontDisplay, fontSize: typography.size2xl, color: colors.textPrimary, lineHeight: 34 },
  subtext: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.xs },

  locBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: runner.brandLight, marginHorizontal: spacing.lg, marginBottom: spacing.md, padding: spacing.md, borderRadius: radii.lg,
  },
  locText: { flex: 1, fontFamily: typography.fontBodyMed, fontSize: typography.sizeSm, color: runner.brand },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  loadingText: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: spacing.sm },

  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, marginTop: spacing.xxl },
  emptyTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, marginTop: spacing.md },
  emptyDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: spacing.xs },

  bottom: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  continueBtn: {
    height: 52, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
    backgroundColor: runner.brand, width: '100%',
    shadowColor: runner.brand, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  continueBtnDisabled: { opacity: 0.45 },
  continuePressed: { opacity: 0.85 },
  continueText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeLg, color: colors.white },
});
