import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '@/src/theme';
import { useSessionStore } from '@/src/stores/sessionStore';
import { supabase } from '@/src/lib/supabase';
import { sanitizeEmail, isValidEmail, isValidPassword } from '@/src/lib/sanitize';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import Avatar from '@/src/components/ui/Avatar';
import ScreenHeader from '@/src/components/ui/ScreenHeader';

type Runner = { id: string; email: string; full_name: string };

export default function AdminScreen() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const clearSession = useSessionStore((s) => s.clearSession);

  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loadingRunners, setLoadingRunners] = useState(false);

  useEffect(() => { if (isLoggedIn) fetchRunners(); }, [isLoggedIn]);

  const fetchRunners = async () => {
    setLoadingRunners(true);
    const { data } = await supabase
      .from('user_roles')
      .select('user_id, profiles(email, full_name)')
      .eq('role', 'runner');
    setRunners(
      (data ?? []).map((r: any) => ({
        id: r.user_id,
        email: r.profiles?.email ?? '',
        full_name: r.profiles?.full_name ?? 'Runner',
      })),
    );
    setLoadingRunners(false);
  };

  const handleLogin = async () => {
    setAuthError('');
    if (!isValidEmail(sanitizeEmail(email))) { setAuthError('Invalid email'); return; }
    if (!isValidPassword(password)) { setAuthError('Invalid password'); return; }
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: sanitizeEmail(email), password });
      if (error) throw error;
      const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id).eq('role', 'admin').single();
      if (!role) throw new Error('Access denied — not an admin account');
      useSessionStore.getState().setSession(data.session);
      setIsLoggedIn(true);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearSession();
    setIsLoggedIn(false);
    router.replace('/');
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.loginWrap}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={32} color={colors.brand} />
          </View>
          <Text style={styles.title}>Admin Portal</Text>
          <Text style={styles.subtitle}>Sign in with your admin credentials</Text>
          {authError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}
          <Input label="Email" placeholder="admin@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" containerStyle={styles.field} />
          <Input label="Password" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry containerStyle={styles.field} />
          <Button title="Sign In" onPress={handleLogin} loading={authLoading} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Admin" />

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Runners</Text>
        <Pressable style={styles.addBtn} onPress={() => router.push('/(admin)/create-runner')}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addBtnText}>New Runner</Text>
        </Pressable>
      </View>

      {loadingRunners ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.brand} /></View>
      ) : (
        <FlatList
          data={runners}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.runnerCard}>
              <Avatar name={item.full_name} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.runnerName}>{item.full_name}</Text>
                <Text style={styles.runnerEmail}>{item.email}</Text>
              </View>
              <View style={styles.roleBadge}>
                <Ionicons name="walk" size={12} color={colors.brand} />
                <Text style={styles.roleText}>Runner</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={56} color={colors.textDisabled} />
              <Text style={styles.emptyTitle}>No runners yet</Text>
              <Text style={styles.emptyDesc}>Tap "New Runner" to add your first one</Text>
            </View>
          }
        />
      )}

      <Pressable style={styles.signOutRow} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  loginWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  adminBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.md },
  title: { fontFamily: typography.fontDisplay, fontSize: typography.size2xl, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  field: { marginBottom: spacing.md },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: '#FEF2F2', borderRadius: 8, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.error, flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  sectionTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.brand, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.full },
  addBtnText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeSm, color: colors.white },
  list: { paddingHorizontal: spacing.lg },
  runnerCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  runnerName: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeMd, color: colors.textPrimary },
  runnerEmail: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.brandLight, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.full },
  roleText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeXs, color: colors.brand },
  emptyTitle: { fontFamily: typography.fontDisplayMed, fontSize: typography.sizeLg, color: colors.textPrimary, marginTop: spacing.md },
  emptyDesc: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.xs },
  signOutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg },
  signOutText: { fontFamily: typography.fontBodyMed, fontSize: typography.sizeMd, color: colors.error },
});
