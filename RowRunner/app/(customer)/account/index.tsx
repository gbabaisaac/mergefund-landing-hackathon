import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '@/src/theme';
import { useSessionStore } from '@/src/stores/sessionStore';
import { supabase } from '@/src/lib/supabase';
import Avatar from '@/src/components/ui/Avatar';
import ScreenHeader from '@/src/components/ui/ScreenHeader';

function MenuRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.8 }]} onPress={onPress}>
      <View style={styles.menuIcon}><Ionicons name={icon} size={20} color={colors.brand} /></View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
    </Pressable>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const isGuest = useSessionStore((s) => s.isGuest);
  const clearSession = useSessionStore((s) => s.clearSession);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearSession();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Account" />

      {isGuest || !user ? (
        <View style={styles.guestCard}>
          <Ionicons name="person-outline" size={40} color={colors.textDisabled} />
          <Text style={styles.guestTitle}>You're browsing as a guest</Text>
          <Text style={styles.guestDesc}>Sign in to track your orders and earn rewards</Text>
          <Pressable style={styles.signInBtn} onPress={() => router.replace('/auth')}>
            <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.profileCard}>
          <Avatar name={user.user_metadata?.full_name ?? user.email ?? 'U'} size={56} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.user_metadata?.full_name ?? 'User'}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>
        </View>
      )}

      <View style={styles.menuSection}>
        <MenuRow icon="receipt-outline" label="Order History" onPress={() => router.push('/(customer)/account/orders')} />
        <MenuRow icon="notifications-outline" label="Notifications" onPress={() => {}} />
        <MenuRow icon="card-outline" label="Payment Methods" onPress={() => {}} />
        <MenuRow icon="help-circle-outline" label="Help & Support" onPress={() => {}} />
      </View>

      {!isGuest && user ? (
        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginHorizontal: spacing.lg, marginBottom: spacing.lg, ...shadows.sm,
  },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary },
  profileEmail: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: 2 },
  guestCard: {
    alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.xl, marginHorizontal: spacing.lg, marginBottom: spacing.lg, ...shadows.sm,
  },
  guestTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, marginTop: spacing.md },
  guestDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  signInBtn: { backgroundColor: colors.brand, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radii.full, marginTop: spacing.lg },
  signInText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeMd, color: colors.white },
  menuSection: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  menuLabel: { flex: 1, fontFamily: typography.fontBodyMed, fontSize: typography.sizeMd, color: colors.textPrimary },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl, padding: spacing.md },
  signOutText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeMd, color: colors.error },
});
