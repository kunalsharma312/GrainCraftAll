import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import theme from '../../theme';

interface AppCardProps extends PropsWithChildren {
  variant?: 'default' | 'warm' | 'outlined';
  style?: StyleProp<ViewStyle>;
}

export default function AppCard({ children, variant = 'default', style }: AppCardProps) {
  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { borderRadius: theme.components.card.borderRadius, padding: 15, borderWidth: theme.components.card.borderWidth, borderColor: theme.colors.border },
  default: { backgroundColor: theme.colors.surface },
  warm: { backgroundColor: theme.colors.surfaceWarm },
  outlined: { backgroundColor: 'transparent' },
});
