import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import theme from '../../theme';
import Text from '../ThemedText';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function PrimaryButton({ title, onPress, variant = 'primary', disabled = false, style }: PrimaryButtonProps) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.base, styles[variant], disabled && styles.disabled, style]}>
      <Text style={[styles.label, variant === 'primary' && styles.primaryLabel]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 42, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: theme.components.button.borderRadius },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.surfaceTint },
  text: { backgroundColor: 'transparent', paddingHorizontal: 4 },
  label: { color: theme.colors.text, fontSize: theme.typography.fontSize.bodySmall, fontWeight: theme.typography.fontWeight.bold },
  primaryLabel: { color: theme.colors.textOnPrimary, fontSize: theme.typography.fontSize.bodyLarge },
  disabled: { opacity: 0.5 },
});
