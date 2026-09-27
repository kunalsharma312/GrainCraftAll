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
import StatItem from '../components/ui/StatItem';

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
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userSub}>Artisan Sourdough Enthusiast • Member since Oct 2023</Text>
          </View>
        </View>

        <View style={styles.tierBox}>
          <Text style={styles.tierTitle}>⭐ {user.tier}</Text>
          <Text style={styles.pts}>{user.points} FLOUR PTS</Text>
        </View>

        <View style={styles.statsRow}>
          <StatItem value={user.batchesMilled} label="Batches Milled" />
          <StatItem value={`${user.heritageGrainsKg}kg`} label="Heritage Grains" />
          <StatItem value={user.grainVaults} label="Grain Vaults" />
        </View>
      </AppCard>

      <View style={styles.activeCycleCard}>
        <Text style={styles.cycleEyebrow}>⚡ ACTIVE MILLING CYCLE</Text>
        <Text style={styles.cycleTitle}>{user.activeCycle.title}</Text>
        <Text style={styles.cycleDescription}>{user.activeCycle.description}</Text>
        <View style={styles.subCycleBox}>
          <Text style={styles.nextRun}>🕒 Next Stone Friction Run: {user.activeCycle.nextRun}</Text>
        </View>
      </View>

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
  tierBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.colors.surfaceTint, padding: 12, borderRadius: theme.components.button.borderRadius, marginTop: 12, alignItems: 'center' },
  tierTitle: { fontSize: theme.typography.fontSize.bodySmall, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  pts: { fontSize: theme.typography.fontSize.bodySmall, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, backgroundColor: theme.colors.surface, padding: 10, borderRadius: theme.components.button.borderRadius },
  activeCycleCard: { backgroundColor: theme.colors.primary, borderRadius: theme.components.card.borderRadius, padding: 15, marginBottom: 20 },
  cycleEyebrow: { color: theme.colors.textContrast, fontSize: theme.typography.fontSize.label, fontWeight: theme.typography.fontWeight.bold, marginBottom: 4 },
  cycleTitle: { color: theme.colors.textContrast, fontSize: theme.typography.fontSize.headingSmall, fontWeight: theme.typography.fontWeight.bold },
  cycleDescription: { color: theme.colors.textOnWarm, fontSize: theme.typography.fontSize.bodySmall, marginBottom: 12 },
  subCycleBox: { backgroundColor: theme.colors.overlay, padding: 8, borderRadius: theme.components.badge.borderRadius },
  nextRun: { color: theme.colors.gold, fontSize: theme.typography.fontSize.label, fontWeight: theme.typography.fontWeight.bold },
});
