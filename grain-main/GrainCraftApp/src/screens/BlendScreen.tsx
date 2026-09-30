import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addToCart } from '../redux/slices/cartSlice';
import { fetchBlendIngredients, calculateBlend, clearError } from '../redux/slices/blendSlice';
import theme from '../theme';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import SectionHeading from '../components/ui/SectionHeading';
import IngredientCard from '../components/IngredientCard';
import { LoadingSpinner, ErrorMessage } from '../components/ui/LoadingSpinner';
import shareService from '../services/shareService';
import hapticsService from '../services/hapticsService';

export default function BlendScreen() {
  const dispatch = useAppDispatch();
  const { ingredients, calculatedBlend, loading, error } = useAppSelector(state => state.blend);
  const [proportions, setProportions] = useState<Record<string, number>>({});

  // Initialize proportions when ingredients load
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchBlendIngredients());
    }, [dispatch])
  );

  // Initialize proportions equally
  const initiateProportions = () => {
    if (ingredients.length > 0) {
      const equal = 100 / ingredients.length;
      const newProportions: Record<string, number> = {};
      ingredients.forEach((ing, idx) => {
        newProportions[ing.id] = Math.round(equal * 100) / 100;
      });
      setProportions(newProportions);
    }
  };

  // Initialize on ingredient load
  if (ingredients.length > 0 && Object.keys(proportions).length === 0) {
    initiateProportions();
  }

  const totalPercentage = Object.values(proportions).reduce((a, b) => a + b, 0);
  const blendName = ingredients.slice(0, 2).map(ing => ing.name.split(' ')[0]).join(' & ') + ' Blend';
  
  const handleCalculateBlend = () => {
    if (totalPercentage !== 100) {
      Alert.alert('Invalid Formulation', 'Blend proportions must total exactly 100%');
      return;
    }

    const blendData = {
      ingredients: ingredients.map(ing => ({
        id: ing.id,
        percentage: proportions[ing.id] || 0,
      })),
    };

    dispatch(calculateBlend(blendData));
  };

  const handleAddBlend = () => {
    if (!calculatedBlend) {
      Alert.alert('Calculate Blend First', 'Click calculate to determine the price and nutrition');
      return;
    }

    hapticsService.addToCart();
    dispatch(addToCart({
      id: `blend-${Date.now()}`,
      name: calculatedBlend.name || blendName,
      subtitle: `Custom blend • ${ingredients.map(ing => ing.name).join(', ')}`,
      price: calculatedBlend.totalPrice,
      components: calculatedBlend.ingredients.map(ing => `${ing.percentage}% ${ing.name}`),
    }));
    Alert.alert('Blend Added!', 'Your custom blend has been added to cart.');
  };

  const handleShareBlend = () => {
    if (!calculatedBlend) return;
    hapticsService.selection();
    shareService.shareBlend({
      name: calculatedBlend.name || blendName,
      price: calculatedBlend.totalPrice,
      ingredients: calculatedBlend.ingredients.map(ing => ({
        name: ing.name,
        percentage: ing.percentage,
      })),
    });
  };

  if (loading && ingredients.length === 0) {
    return (
      <AppScreen>
        <LoadingSpinner message="Loading blend ingredients..." fullScreen />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <Text style={styles.title}>Custom Flour Atelier</Text>
      <Text style={styles.sub}>Craft your unique batch. Select heritage grains and calibrate proportions to precisely 100% for balanced gluten structure.</Text>

      {error && <ErrorMessage message={error} onRetry={() => dispatch(fetchBlendIngredients())} />}

      <AppCard variant="warm" style={styles.card}>
        <View style={styles.formulationHeading}>
          <Text style={styles.formulationLabel}>Grist Formulation</Text>
          <Text
            style={[
              styles.formulationLabel,
              { color: totalPercentage === 100 ? theme.colors.successBright : theme.colors.error },
            ]}
          >
            {totalPercentage.toFixed(1)}% Total
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(totalPercentage, 100)}%` }]} />
        </View>

        {calculatedBlend && (
          <View style={styles.metricsRow}>
            <View>
              <Text style={styles.mVal}>{calculatedBlend.estimatedNutrition.protein.toFixed(1)}g</Text>
              <Text style={styles.mLbl}>PROTEIN / 100g</Text>
            </View>
            <View>
              <Text style={styles.mVal}>{calculatedBlend.estimatedNutrition.fiber.toFixed(1)}g</Text>
              <Text style={styles.mLbl}>FIBER (Prebiotic)</Text>
            </View>
            <View>
              <Text style={styles.mVal}>{calculatedBlend.estimatedNutrition.gi}</Text>
              <Text style={styles.mLbl}>EST. GI (Low Index)</Text>
            </View>
          </View>
        )}
      </AppCard>

      <SectionHeading title="Milling Components (Stone Mill Hopper #04)" />

      {ingredients.map(ingredient => (
        <IngredientCard
          key={ingredient.id}
          ingredient={ingredient}
          percentage={proportions[ingredient.id] || 0}
          onAdjust={delta =>
            setProportions(current => ({
              ...current,
              [ingredient.id]: Math.max(0, Math.min(100, (current[ingredient.id] || 0) + delta)),
            }))
          }
        />
      ))}

      <PrimaryButton
        title={
          calculatedBlend
            ? `Add Blend to Cart ($${calculatedBlend.totalPrice.toFixed(2)})`
            : 'Calculate Blend'
        }
        onPress={calculatedBlend ? handleAddBlend : handleCalculateBlend}
        disabled={loading}
      />

      {calculatedBlend && (
        <PrimaryButton
          title="Share this blend"
          onPress={handleShareBlend}
          variant="secondary"
          style={styles.shareBlendBtn}
        />
      )}
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
  shareBlendBtn: { marginTop: 10 },
});
