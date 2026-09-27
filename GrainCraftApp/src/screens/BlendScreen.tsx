import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useAppDispatch } from '../redux/hooks';
import mockData from '../assets/mockData.json';
import { addToCart } from '../redux/slices/cartSlice';
import theme from '../theme';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import SectionHeading from '../components/ui/SectionHeading';
import IngredientCard from '../components/IngredientCard';

export default function BlendScreen() {
  const dispatch = useAppDispatch();
  const [proportions, setProportions] = useState({ ing1: 50, ing2: 50 });
  const totalPercentage = proportions.ing1 + proportions.ing2;

  const handleAddBlend = () => {
    dispatch(addToCart({
      id: `blend-${Date.now()}`,
      name: 'Custom Flour Atelier Grist',
      subtitle: `2 kg pouch • ${proportions.ing1}% Khapli, ${proportions.ing2}% Ragi`,
      price: 9.8,
      components: [`${proportions.ing1}% Heritage Khapli`, `${proportions.ing2}% Sprouted Ragi`],
    }));
    Alert.alert('Atelier Milled!', 'Your custom flour grist has been successfully added to your cart.');
  };

  return (
    <AppScreen>
      <Text style={styles.title}>Custom Flour Atelier</Text>
      <Text style={styles.sub}>Craft your unique batch. Select heritage grains and calibrate proportions to precisely 100% for balanced gluten structure.</Text>

      <AppCard variant="warm" style={styles.card}>
        <View style={styles.formulationHeading}>
          <Text style={styles.formulationLabel}>Grist Formulation</Text>
          <Text style={[styles.formulationLabel, { color: totalPercentage === 100 ? theme.colors.successBright : theme.colors.error }]}>{totalPercentage}% Total</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(totalPercentage, 100)}%` }]} />
        </View>

        <View style={styles.metricsRow}>
          <View><Text style={styles.mVal}>27.8g</Text><Text style={styles.mLbl}>PROTEIN / 100g</Text></View>
          <View><Text style={styles.mVal}>25.3g</Text><Text style={styles.mLbl}>FIBER (Prebiotic)</Text></View>
          <View><Text style={styles.mVal}>116</Text><Text style={styles.mLbl}>EST. GI (Low Index)</Text></View>
        </View>
      </AppCard>

      <SectionHeading title="Milling Components (Stone Mill Hopper #04)" />

      {mockData.blendIngredients.map((ingredient, index) => {
        const key = index === 0 ? 'ing1' : 'ing2';
        const value = proportions[key];
        return (
          <IngredientCard
            key={ingredient.id}
            ingredient={ingredient}
            percentage={value}
            onAdjust={delta => setProportions(current => ({ ...current, [key]: Math.max(0, Math.min(100, current[key] + delta)) }))}
          />
        );
      })}

      <PrimaryButton title="Add Atelier Blend to Cart ($9.80)" onPress={handleAddBlend} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.typography.fontSize.headingLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  sub: { fontSize: theme.typography.fontSize.small, color: theme.colors.textSecondary, marginBottom: 15 },
  card: { marginBottom: 15 },
  formulationHeading: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  formulationLabel: { fontSize: theme.typography.fontSize.small, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.detail },
  progressBar: { height: 8, backgroundColor: theme.colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: theme.colors.primary },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.colors.surface, padding: 10, borderRadius: theme.components.button.borderRadius },
  mVal: { fontSize: theme.typography.fontSize.body, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  mLbl: { fontSize: theme.typography.fontSize.captionSmall, color: theme.colors.textMuted, marginTop: 2 },
});
