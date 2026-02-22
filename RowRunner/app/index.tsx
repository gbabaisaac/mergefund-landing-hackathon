import { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, runner, typography, spacing, radii } from '@/src/theme';
import Button from '@/src/components/ui/Button';

export default function WelcomeScreen() {
  const router = useRouter();
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoSlide = useRef(new Animated.Value(30)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(logoSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(taglineFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(btnFade, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(btnSlide, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Animated.View style={[styles.logoWrap, { opacity: logoFade, transform: [{ translateY: logoSlide }] }]}>
          <Image
            source={require('../assets/images/splash-icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
          Skip the line.{'\n'}Not the game.
        </Animated.Text>
      </View>

      <Animated.View style={[styles.bottom, { opacity: btnFade, transform: [{ translateY: btnSlide }] }]}>
        <Pressable
          style={({ pressed }) => [styles.dasherBtn, pressed && styles.dasherPressed]}
          onPress={() => router.push('/(runner)/auth')}
        >
          <Text style={styles.dasherText}>I'm a Dasher</Text>
        </Pressable>

        <View style={{ height: spacing.sm }} />

        <Button title="Get Started" onPress={() => router.push('/auth')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  logoWrap: { alignItems: 'center' },
  logoImage: { width: 280, height: 180 },
  tagline: {
    fontFamily: typography.fontBody,
    fontSize: typography.sizeLg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginTop: spacing.md,
  },
  bottom: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl + 16 },
  dasherBtn: {
    height: 52,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: runner.brand,
    width: '100%',
    shadowColor: runner.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  dasherPressed: { opacity: 0.85 },
  dasherText: {
    fontFamily: typography.fontBodyBold,
    fontSize: typography.sizeLg,
    color: colors.white,
  },
});
