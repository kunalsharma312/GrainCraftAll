import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import mockData from '../assets/mockData.json';
import { addToCart } from '../redux/slices/cartSlice';
import theme from '../theme';
import BrandLogo from '../components/BrandLogo';
import Text from '../components/ThemedText';

export default function DiscoverScreen() {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topHeader}>
        <BrandLogo />
      </View>

      <View style={styles.profileCard}>
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
          <View style={styles.statItem}><Text style={styles.statVal}>{user.batchesMilled}</Text><Text style={styles.statLbl}>Batches Milled</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{user.heritageGrainsKg}kg</Text><Text style={styles.statLbl}>Heritage Grains</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{user.grainVaults}</Text><Text style={styles.statLbl}>Grain Vaults</Text></View>
        </View>
      </View>

      <View style={styles.activeCycleCard}>
        <Text style={styles.cycleEyebrow}>⚡ ACTIVE MILLING CYCLE</Text>
        <Text style={styles.cycleTitle}>{user.activeCycle.title}</Text>
        <Text style={styles.cycleDescription}>{user.activeCycle.description}</Text>
        <View style={styles.subCycleBox}>
          <Text style={styles.nextRun}>🕒 Next Stone Friction Run: {user.activeCycle.nextRun}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>The Grain Vault ({mockData.discoverItems.length} Saved)</Text>
      {mockData.discoverItems.map(item => (
        <View key={item.id} style={styles.itemCard}>
          <Image source={{ uri: item.image }} style={styles.itemImg} />
          <View style={styles.itemContent}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemSub}>{item.subtitle}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => dispatch(addToCart(item))}>
              <Text style={styles.addBtnTxt}>+ Add to Grain Basket</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: theme.colors.background, paddingBottom: 30 },
  topHeader: { marginBottom: 15 },
  profileCard: { backgroundColor: theme.colors.surfaceWarm, borderRadius: theme.components.card.borderRadius, padding: 15, borderWidth: theme.components.card.borderWidth, borderColor: theme.colors.border, marginBottom: 15 },
  profileHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: theme.typography.fontSize.headingSmall, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  userSub: { fontSize: theme.typography.fontSize.small, color: theme.colors.textSecondary, marginTop: 2 },
  tierBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.colors.surfaceTint, padding: 12, borderRadius: theme.components.button.borderRadius, marginTop: 12, alignItems: 'center' },
  tierTitle: { fontSize: theme.typography.fontSize.bodySmall, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  pts: { fontSize: theme.typography.fontSize.bodySmall, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, backgroundColor: theme.colors.surface, padding: 10, borderRadius: theme.components.button.borderRadius },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  statLbl: { fontSize: theme.typography.fontSize.caption, color: theme.colors.textMuted, marginTop: 2 },
  activeCycleCard: { backgroundColor: theme.colors.primary, borderRadius: theme.components.card.borderRadius, padding: 15, marginBottom: 20 },
  cycleEyebrow: { color: theme.colors.textContrast, fontSize: theme.typography.fontSize.label, fontWeight: theme.typography.fontWeight.bold, marginBottom: 4 },
  cycleTitle: { color: theme.colors.textContrast, fontSize: theme.typography.fontSize.headingSmall, fontWeight: theme.typography.fontWeight.bold },
  cycleDescription: { color: theme.colors.textOnWarm, fontSize: theme.typography.fontSize.bodySmall, marginBottom: 12 },
  subCycleBox: { backgroundColor: theme.colors.overlay, padding: 8, borderRadius: theme.components.badge.borderRadius },
  nextRun: { color: theme.colors.gold, fontSize: theme.typography.fontSize.label, fontWeight: theme.typography.fontWeight.bold },
  sectionTitle: { fontSize: theme.typography.fontSize.subtitle, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, marginBottom: 10 },
  itemCard: { backgroundColor: theme.colors.surface, borderRadius: 10, flexDirection: 'row', marginBottom: 12, borderWidth: theme.components.card.borderWidth, borderColor: theme.colors.border, overflow: 'hidden' },
  itemImg: { width: 100, height: 150 },
  itemContent: { flex: 1, padding: 12 },
  itemName: { fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  itemSub: { fontSize: theme.typography.fontSize.label, color: theme.colors.textSecondary, marginVertical: 3 },
  itemPrice: { fontSize: theme.typography.fontSize.body, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary, marginBottom: 6 },
  addBtn: { backgroundColor: theme.colors.primary, paddingVertical: 6, paddingHorizontal: 10, borderRadius: theme.components.badge.borderRadius, alignSelf: 'flex-start' },
  addBtnTxt: { color: theme.colors.textOnPrimary, fontSize: theme.typography.fontSize.label, fontWeight: theme.typography.fontWeight.bold },
});
