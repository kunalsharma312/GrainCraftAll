import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import theme from '../../theme';
import Text from '../ThemedText';

interface EmptyStateProps {
  message: string;
  style?: StyleProp<ViewStyle>;
}

export default function EmptyState({ message, style }: EmptyStateProps) {
  return (
    <View accessibilityRole="summary" style={[styles.container, style]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 30 },
  message: { textAlign: 'center', color: theme.colors.textSubtle },
});
