import { StyleSheet, View } from 'react-native';
import type { BlendIngredient } from '../redux/types';
import theme from '../theme';
import Text from './ThemedText';
import AppCard from './ui/AppCard';
import PrimaryButton from './ui/PrimaryButton';

interface IngredientCardProps {
  ingredient: BlendIngredient;
  percentage: number;
  onAdjust: (delta: number) => void;
}

export default function IngredientCard({ ingredient, percentage, onAdjust }: IngredientCardProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.name}>{ingredient.name}</Text>
        <Text style={styles.price}>${ingredient.price}/kg • {percentage}%</Text>
      </View>
      <Text style={styles.description}>{ingredient.desc}</Text>
      <View style={styles.actions}>
        <PrimaryButton title="- 5%" variant="secondary" onPress={() => onAdjust(-5)} style={styles.adjustButton} />
        <PrimaryButton title="+ 5%" variant="secondary" onPress={() => onAdjust(5)} style={styles.adjustButton} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, marginBottom: 12 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  name: { fontWeight: theme.typography.fontWeight.bold, fontSize: theme.typography.fontSize.body },
  price: { fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  description: { fontSize: theme.typography.fontSize.label, color: theme.colors.textSecondary, marginBottom: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  adjustButton: { minWidth: 100 },
});
