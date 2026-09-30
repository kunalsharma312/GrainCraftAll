import { Pressable, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useRef } from 'react';
import theme from '../../theme';
import Text from '../ThemedText';
import hapticsService from '../../services/hapticsService';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
  style?: ViewStyle;
  loading?: boolean;
  /** Set to false to disable the tactile press feedback (default true). */
  haptic?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  loading = false,
  haptic = true,
}: PrimaryButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (haptic) {
      hapticsService.buttonPress();
    }
    Animated.timing(scaleValue, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
        },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.base, styles[variant], disabled && styles.disabled]}
      >
        <Text style={[styles.label, variant === 'primary' && styles.primaryLabel]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.components.button.borderRadius,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: theme.colors.surfaceTint,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.bodySmall,
    fontWeight: theme.typography.fontWeight.bold,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.bodyLarge,
  },
  disabled: {
    opacity: 0.5,
  },
});
