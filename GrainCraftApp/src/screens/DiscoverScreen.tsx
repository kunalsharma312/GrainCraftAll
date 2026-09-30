import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Animated } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addToCart } from '../redux/slices/cartSlice';
import { fetchDiscoverItems } from '../redux/slices/productSlice';
import theme from '../theme';
import BrandLogo from '../components/BrandLogo';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import SectionHeading from '../components/ui/SectionHeading';
import ProductCard from '../components/ui/ProductCard';
import { LoadingSpinner, ErrorMessage } from '../components/ui/LoadingSpinner';
import { EmptyStateFallback } from '../components/ui/EmptyStateFallback';
import { AnimatedComponent } from '../components/ui/AnimatedComponent';

export default function DiscoverScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const { items: products, loading, error } = useAppSelector(state => state.products);

  const scrollAnimValue = new Animated.Value(0);

  // Fetch products when screen is focused
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchDiscoverItems());
    }, [dispatch])
  );

  const handleRetry = () => {
    dispatch(fetchDiscoverItems());
  };

  if (loading && products.length === 0) {
    return (
      <AppScreen>
        <LoadingSpinner message="Loading grain vault..." fullScreen />
      </AppScreen>
    );
  }

  return (
    <AppScreen style={{ flex: 1, padding: 0 }}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollAnimValue } } }],
          { useNativeDriver: false }
        )}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <AnimatedComponent type="slideInDown" delay={0} duration={500}>
          <View style={styles.topHeader}>
            <BrandLogo />
          </View>
        </AnimatedComponent>

        <AnimatedComponent type="slideInUp" delay={100} duration={500}>
          <AppCard variant="warm" style={styles.profileCard}>
            <View style={styles.profileHeading}>
              <View>
                <Text style={styles.userName}>{user?.name ?? 'GrainCraft Member'}</Text>
                <Text style={styles.userSub}>{user?.email ?? ''}</Text>
              </View>
            </View>
          </AppCard>
        </AnimatedComponent>

        {error && (
          <AnimatedComponent type="slideInDown" duration={300}>
            <ErrorMessage message={error} onRetry={handleRetry} />
          </AnimatedComponent>
        )}

        {products.length === 0 && !error ? (
          <EmptyStateFallback
            icon="inbox"
            title="No Products Available"
            message="Check back soon for fresh heritage grains"
            action={{ label: 'Refresh', onPress: handleRetry }}
          />
        ) : (
          <>
            <AnimatedComponent type="fadeIn" delay={200} duration={400}>
              <SectionHeading title={`The Grain Vault (${products.length} Available)`} />
            </AnimatedComponent>
            {products.map((item, index) => (
              <AnimatedComponent
                key={item.id}
                type="slideInUp"
                delay={300 + index * 50}
                duration={400}
              >
                <ProductCard
                  item={item}
                  onAdd={product => dispatch(addToCart(product))}
                />
              </AnimatedComponent>
            ))}
          </>
        )}
      </Animated.ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topHeader: { marginBottom: 15 },
  profileCard: { marginBottom: 15 },
  profileHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: {
    fontSize: theme.typography.fontSize.headingSmall,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  userSub: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
