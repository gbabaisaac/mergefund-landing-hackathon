import { Stack } from 'expo-router';
import { colors } from '@/src/theme';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="orders/index" options={{ title: 'Order History' }} />
      <Stack.Screen name="orders/[id]" options={{ title: 'Order Details' }} />
    </Stack>
  );
}
