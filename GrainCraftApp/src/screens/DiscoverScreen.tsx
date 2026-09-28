import { StyleSheet, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import mockData from '../assets/mockData.json';
import { addToCart } from '../redux/slices/cartSlice';
import theme from '../theme';
import BrandLogo from '../components/BrandLogo';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import SectionHeading from '../components/ui/SectionHeading';
import ProductCard from '../components/ui/ProductCard';

export default function DiscoverScreen() {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

  return (
    <AppScreen>
      <View style={styles.topHeader}>
        <BrandLogo />
      </View>

      <AppCard variant="warm" style={styles.profileCard}>
        <View style={styles.profileHeading}>
          <View>
            <Text style={styles.userName}>{user?.name ?? 'GrainCraft Member'}</Text>
            <Text style={styles.userSub}>{user?.email ?? ''}</Text>
          </View>
        </View>
      </AppCard>

      <SectionHeading title={`The Grain Vault (${mockData.discoverItems.length} Saved)`} />
      {mockData.discoverItems.map(item => <ProductCard key={item.id} item={item} onAdd={product => dispatch(addToCart(product))} />)}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topHeader: { marginBottom: 15 },
  profileCard: { marginBottom: 15 },
  profileHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: theme.typography.fontSize.headingSmall, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  userSub: { fontSize: theme.typography.fontSize.small, color: theme.colors.textSecondary, marginTop: 2 },
});
