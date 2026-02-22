import { Stack } from 'expo-router';
import { colors } from '@/src/theme';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="timing" />
      <Stack.Screen name="restaurants" />
      <Stack.Screen name="menu/[id]" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="account" />
    </Stack>
  );
}
