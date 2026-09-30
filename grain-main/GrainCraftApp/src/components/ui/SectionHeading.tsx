import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import theme from '../../theme';
import Text from '../ThemedText';

interface SectionHeadingProps {
  title: string;
  detail?: string;
  style?: StyleProp<ViewStyle>;
}

export default function SectionHeading({ title, detail, style }: SectionHeadingProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  title: { fontSize: theme.typography.fontSize.subtitle, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  detail: { marginTop: 3, fontSize: theme.typography.fontSize.small, color: theme.colors.textSecondary },
});
