import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/src/theme';
import { supabase } from '@/src/lib/supabase';
import { useSessionStore } from '@/src/stores/sessionStore';
import { sanitizeEmail, isValidEmail, isValidPassword } from '@/src/lib/sanitize';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

export default function AuthScreen() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const setGuest = useSessionStore((s) => s.setGuest);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!isValidEmail(sanitizeEmail(email))) e.email = 'Enter a valid email address';
    if (!isValidPassword(password)) e.password = 'Min 8 characters with at least 1 number';
    if (isSignUp) {
      if (!name.trim()) e.name = 'Name is required';
      if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAuth = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const cleaned = sanitizeEmail(email);
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleaned, password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) throw error;
        setSession(data.session);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleaned, password });
        if (error) throw error;
        setSession(data.session);
      }
      router.replace('/start');
    } catch (err: any) {
      setErrors({ form: err.message ?? 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    setGuest(true);
    router.replace('/start');
  };

  const EyeIcon = (
    <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textSecondary} />
    </Pressable>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Sign up to track orders and earn rewards' : 'Sign in to your RowRunner account'}
        </Text>

        {errors.form ? (
          <View style={styles.formError}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.formErrorText}>{errors.form}</Text>
          </View>
        ) : null}

        {isSignUp ? (
          <Input label="Full Name" placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" error={errors.name} containerStyle={styles.field} />
        ) : null}

        <Input
          label="Email" placeholder="you@example.com" value={email}
          onChangeText={(t) => setEmail(sanitizeEmail(t))}
          onBlur={() => {
            if (email && !isValidEmail(email)) setErrors((e) => ({ ...e, email: 'Enter a valid email address' }));
            else setErrors(({ email: _, ...rest }) => rest);
          }}
          autoCapitalize="none" keyboardType="email-address" error={errors.email} containerStyle={styles.field}
        />

        <Input
          label="Password" placeholder="Min 8 characters, 1 number" value={password}
          onChangeText={setPassword} secureTextEntry={!showPassword} error={errors.password}
          containerStyle={styles.field} rightIcon={EyeIcon}
        />

        {isSignUp ? (
          <Input label="Confirm Password" placeholder="Re-enter password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} error={errors.confirmPassword} containerStyle={styles.field} />
        ) : null}

        <View style={styles.field}>
          <Button title={isSignUp ? 'Create Account' : 'Sign In'} onPress={handleAuth} loading={loading} />
        </View>

        <Pressable onPress={() => { setIsSignUp(!isSignUp); setErrors({}); }} style={styles.toggleRow}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={styles.toggleLink}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Button title="Continue as Guest" onPress={handleGuest} variant="secondary" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  title: { fontFamily: typography.fontDisplay, fontSize: typography.size3xl, color: colors.textPrimary },
  subtitle: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  formError: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: '#FEF2F2', borderRadius: 8, padding: spacing.sm, marginBottom: spacing.md },
  formErrorText: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.error, flex: 1 },
  toggleRow: { alignItems: 'center', marginTop: spacing.lg },
  toggleText: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textSecondary },
  toggleLink: { fontFamily: typography.fontBodyBold, color: colors.brand },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.textDisabled, marginHorizontal: spacing.md },
});
