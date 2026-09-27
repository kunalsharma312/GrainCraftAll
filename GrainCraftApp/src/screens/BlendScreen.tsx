import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppDispatch } from '../redux/hooks';
import mockData from '../assets/mockData.json';
import { addToCart } from '../redux/slices/cartSlice';
import theme from '../theme';
import Text from '../components/ThemedText';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Custom Flour Atelier</Text>
      <Text style={styles.sub}>Craft your unique batch. Select heritage grains and calibrate proportions to precisely 100% for balanced gluten structure.</Text>

      <View style={styles.card}>
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
      </View>

      <Text style={styles.sectionTitle}>Milling Components (Stone Mill Hopper #04)</Text>

      {mockData.blendIngredients.map((ingredient, index) => {
        const key = index === 0 ? 'ing1' : 'ing2';
        const value = proportions[key];
        return (
          <View key={ingredient.id} style={styles.compCard}>
            <View style={styles.ingredientHeading}>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
              <Text style={styles.ingredientPrice}>${ingredient.price}/kg • {value}%</Text>
            </View>
            <Text style={styles.ingredientDescription}>{ingredient.desc}</Text>
            <View style={styles.adjustmentRow}>
              <TouchableOpacity style={styles.adjBtn} onPress={() => setProportions(current => ({ ...current, [key]: Math.max(0, value - 5) }))}>
                <Text style={styles.adjustmentLabel}>- 5%</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjBtn} onPress={() => setProportions(current => ({ ...current, [key]: Math.min(100, value + 5) }))}>
                <Text style={styles.adjustmentLabel}>+ 5%</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.actionBtn} onPress={handleAddBlend}>
        <Text style={styles.actionBtnText}>Add Atelier Blend to Cart ($9.80)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: theme.colors.background, paddingBottom: 30 },
  title: { fontSize: theme.typography.fontSize.headingLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  sub: { fontSize: theme.typography.fontSize.small, color: theme.colors.textSecondary, marginBottom: 15 },
  card: { backgroundColor: theme.colors.surfaceWarm, borderRadius: theme.components.card.borderRadius, padding: 15, borderWidth: theme.components.card.borderWidth, borderColor: theme.colors.border, marginBottom: 15 },
  formulationHeading: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  formulationLabel: { fontSize: theme.typography.fontSize.small, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.detail },
  progressBar: { height: 8, backgroundColor: theme.colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: theme.colors.primary },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.colors.surface, padding: 10, borderRadius: theme.components.button.borderRadius },
  mVal: { fontSize: theme.typography.fontSize.body, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  mLbl: { fontSize: theme.typography.fontSize.captionSmall, color: theme.colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, marginBottom: 10 },
  compCard: { backgroundColor: theme.colors.surface, borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: theme.components.card.borderWidth, borderColor: theme.colors.border },
  ingredientHeading: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ingredientName: { fontWeight: theme.typography.fontWeight.bold, fontSize: theme.typography.fontSize.body },
  ingredientPrice: { fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  ingredientDescription: { fontSize: theme.typography.fontSize.label, color: theme.colors.textSecondary, marginBottom: 10 },
  adjustmentRow: { flexDirection: 'row', justifyContent: 'space-between' },
  adjBtn: { backgroundColor: theme.colors.surfaceTint, paddingVertical: 6, paddingHorizontal: 20, borderRadius: theme.components.badge.borderRadius },
  adjustmentLabel: { fontWeight: theme.typography.fontWeight.bold },
  actionBtn: { backgroundColor: theme.colors.primary, padding: 15, borderRadius: theme.components.button.borderRadius, alignItems: 'center' },
  actionBtnText: { color: theme.colors.textOnPrimary, fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.bold },
});
