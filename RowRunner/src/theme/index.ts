export const colors = {
  brand: '#2F6FED',
  brandDark: '#1A4FB5',
  brandLight: '#EBF1FD',
  white: '#FFFFFF',
  background: '#F7F9FF',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF3FB',
  textPrimary: '#0D1B3E',
  textSecondary: '#5A6A85',
  textDisabled: '#B0BBCC',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#D8E2F0',
  borderFocus: '#2F6FED',
  overlay: 'rgba(13, 27, 62, 0.5)',
} as const;

export const runner = {
  brand: '#F97316',
  brandDark: '#C2410C',
  brandLight: '#FFF7ED',
  accent: '#FDBA74',
} as const;

export const typography = {
  fontDisplay: 'Sora_700Bold',
  fontDisplayMed: 'Sora_600SemiBold',
  fontBody: 'Inter_400Regular',
  fontBodyMed: 'Inter_500Medium',
  fontBodyBold: 'Inter_600SemiBold',
  sizeXs: 11,
  sizeSm: 13,
  sizeMd: 15,
  sizeLg: 17,
  sizeXl: 20,
  size2xl: 24,
  size3xl: 30,
  size4xl: 36,
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 } as const;

export const shadows = {
  sm: { shadowColor: '#2F6FED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  md: { shadowColor: '#2F6FED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  lg: { shadowColor: '#0D1B3E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
} as const;
