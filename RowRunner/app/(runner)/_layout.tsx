import { Stack } from 'expo-router';
import { colors } from '@/src/theme';

export default function RunnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="auth" />
      <Stack.Screen name="events" />
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
