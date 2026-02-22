import { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '@/src/theme';
import { supabase } from '@/src/lib/supabase';
import { sanitizeEmail, sanitizeText, isValidEmail, isValidPassword } from '@/src/lib/sanitize';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import ScreenHeader from '@/src/components/ui/ScreenHeader';

export default function CreateRunnerScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!isValidEmail(sanitizeEmail(email))) e.email = 'Enter a valid email';
    if (!name.trim()) e.name = 'Name is required';
    if (!isValidPassword(password)) e.password = 'Min 8 chars with 1 number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: sanitizeEmail(email),
        password,
        email_confirm: true,
        user_metadata: { full_name: sanitizeText(name) },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from('user_roles').insert({ user_id: data.user.id, role: 'runner' });
      }
      Alert.alert('Runner Created', `${name.trim()} has been added.`, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      setErrors({ form: err.message ?? 'Failed to create runner' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="New Runner" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          <Ionicons name="person-add" size={32} color={colors.brand} />
        </View>
        <Text style={styles.headline}>Add a new runner</Text>
        <Text style={styles.subtext}>They'll be able to sign in and claim deliveries</Text>

        {errors.form ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{errors.form}</Text>
          </View>
        ) : null}

        <Input label="Full Name" placeholder="Jane Doe" value={name} onChangeText={setName} autoCapitalize="words" error={errors.name} containerStyle={styles.field} />
        <Input label="Email" placeholder="runner@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={errors.email} containerStyle={styles.field} />
        <Input label="Temporary Password" placeholder="Min 8 chars, 1 number" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} containerStyle={styles.field} />

        <Button title="Create Runner" onPress={handleCreate} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.md },
  headline: { fontFamily: typography.fontDisplay, fontSize: typography.size2xl, color: colors.textPrimary, textAlign: 'center' },
  subtext: { fontFamily: typography.fontBody, fontSize: typography.sizeMd, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  field: { marginBottom: spacing.md },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: '#FEF2F2', borderRadius: 8, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.error, flex: 1 },
});
