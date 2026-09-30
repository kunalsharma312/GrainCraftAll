import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import theme from '../../theme';
import Text from '../ThemedText';

interface NoticeBannerProps {
  title: string;
  description?: string;
  tone?: 'warm' | 'success';
  style?: StyleProp<ViewStyle>;
}

export default function NoticeBanner({ title, description, tone = 'warm', style }: NoticeBannerProps) {
  return (
    <View style={[styles.container, styles[tone], style]}>
      <Text style={[styles.title, tone === 'success' && styles.successTitle]}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, borderRadius: theme.components.button.borderRadius, marginBottom: 15 },
  warm: { backgroundColor: theme.colors.surfaceTint },
  success: { backgroundColor: theme.colors.surfaceWarm },
  title: { fontSize: theme.typography.fontSize.label, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  successTitle: { color: theme.colors.success },
  description: { fontSize: theme.typography.fontSize.small, color: theme.colors.detail, marginTop: 2 },
});
