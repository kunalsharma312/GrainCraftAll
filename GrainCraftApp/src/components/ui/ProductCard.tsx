import { Image, StyleSheet, View } from 'react-native';
import type { DiscoverItem } from '../../redux/types';
import theme from '../../theme';
import Text from '../ThemedText';
import AppCard from './AppCard';
import PrimaryButton from './PrimaryButton';

interface ProductCardProps {
  item: DiscoverItem;
  onAdd: (item: DiscoverItem) => void;
}

export default function ProductCard({ item, onAdd }: ProductCardProps) {
  return (
    <AppCard style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <PrimaryButton title="+ Add to Grain Basket" onPress={() => onAdd(item)} style={styles.button} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: 0, marginBottom: 12, overflow: 'hidden' },
  image: { width: 100, minHeight: 150 },
  content: { flex: 1, padding: 12, alignItems: 'flex-start' },
  name: { fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  subtitle: { fontSize: theme.typography.fontSize.label, color: theme.colors.textSecondary, marginVertical: 3 },
  price: { fontSize: theme.typography.fontSize.body, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary, marginBottom: 6 },
  button: { minHeight: 32, paddingVertical: 6, paddingHorizontal: 10 },
});
