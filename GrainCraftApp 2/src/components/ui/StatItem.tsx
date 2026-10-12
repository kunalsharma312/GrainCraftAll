import { StyleSheet, View } from 'react-native';
import theme from '../../theme';
import Text from '../ThemedText';

interface StatItemProps {
  value: string | number;
  label: string;
}

export default function StatItem({ value, label }: StatItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1 },
  value: { fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  label: { fontSize: theme.typography.fontSize.caption, color: theme.colors.textMuted, marginTop: 2, textAlign: 'center' },
});
