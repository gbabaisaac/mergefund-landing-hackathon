import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, runner, typography, spacing, radii } from '@/src/theme';
import { supabase } from '@/src/lib/supabase';
import { useSessionStore } from '@/src/stores/sessionStore';
import { sanitizeEmail, isValidEmail } from '@/src/lib/sanitize';
import Input from '@/src/components/ui/Input';

export default function RunnerAuthScreen() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const setRole = useSessionStore((s) => s.setRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!isValidEmail(sanitizeEmail(email))) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const cleaned = sanitizeEmail(email);
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleaned, password });
      if (error) throw error;
      if (!data.session) throw new Error('Sign in failed');

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.session.user.id)
        .single();

      if (roleError || !roleData || roleData.role !== 'runner') {
        await supabase.auth.signOut();
        setErrors({ form: 'Access denied. Runner accounts only.' });
        setLoading(false);
        return;
      }

      setSession(data.session);
      setRole('runner');
      router.replace('/(runner)/events');
    } catch (err: any) {
      setErrors({ form: err.message ?? 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = (
    <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textSecondary} />
    </Pressable>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.badgeWrap}>
          <View style={styles.badge}>
            <Ionicons name="flash" size={16} color={runner.brand} />
            <Text style={styles.badgeText}>Dasher Portal</Text>
          </View>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to start delivering</Text>

        {errors.form ? (
          <View style={styles.formError}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.formErrorText}>{errors.form}</Text>
          </View>
        ) : null}

        <Input
          label="Email"
          placeholder="runner@example.com"
          value={email}
          onChangeText={(t) => setEmail(sanitizeEmail(t))}
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
          containerStyle={styles.field}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          error={errors.password}
          containerStyle={styles.field}
          rightIcon={EyeIcon}
        />

        <View style={styles.field}>
          <Pressable
            style={({ pressed }) => [styles.signInBtn, pressed && styles.signInPressed, loading && styles.signInDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.signInText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
          <Text style={styles.backText}>Back to customer app</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },

  badgeWrap: { marginBottom: spacing.lg },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: runner.brandLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.full,
  },
  badgeText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeSm, color: runner.brand },

  title: { fontFamily: typography.fontDisplay, fontSize: typography.size3xl, color: colors.textPrimary },
  subtitle: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },

  field: { marginBottom: spacing.md },

  formError: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: '#FEF2F2', borderRadius: 8, padding: spacing.sm, marginBottom: spacing.md,
  },
  formErrorText: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.error, flex: 1 },

  signInBtn: {
    height: 52, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center',
    backgroundColor: runner.brand, width: '100%',
    shadowColor: runner.brand, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  signInPressed: { opacity: 0.85 },
  signInDisabled: { opacity: 0.5 },
  signInText: { fontFamily: typography.fontBodyBold, fontSize: typography.sizeLg, color: colors.white },

  backRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.xl },
  backText: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary },
});
