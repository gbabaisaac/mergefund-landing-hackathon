import { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, typography, radii, spacing } from '@/src/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
};

export default function Input({ label, error, rightIcon, containerStyle, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.wrapper, focused && styles.wrapperFocused, error && styles.wrapperError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textDisabled}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          {...rest}
        />
        {rightIcon ?? null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: typography.fontBodyMed,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  wrapperFocused: {
    borderColor: colors.borderFocus,
    borderWidth: 2,
  },
  wrapperError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontBody,
    fontSize: typography.sizeMd,
    color: colors.textPrimary,
    height: '100%',
    padding: 0,
  },
  error: {
    fontFamily: typography.fontBody,
    fontSize: typography.sizeXs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
