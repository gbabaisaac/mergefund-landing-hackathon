import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radii } from '@/src/theme';

type Props = { name: string; size?: number };

export default function Avatar({ name, size = 44 }: Props) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: typography.fontDisplayMed,
    color: colors.brand,
  },
});
