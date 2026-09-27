import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { placeOrder, removeFromCart } from '../redux/slices/cartSlice';
import theme from '../theme';
import Text from '../components/ThemedText';

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);
  const addresses = useAppSelector(state => state.auth.addresses);
  const [selectedAddr, setSelectedAddr] = useState(addresses[0]?.address || 'Brooklyn Hub');
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Your grain basket is empty.');
      return;
    }
    dispatch(placeOrder({ address: selectedAddr }));
    Alert.alert('Order Dispatched!', 'Stone mill #4 is now preheating for your batch.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>⚙️ Milled-to-Order Dispatch</Text>
        <Text style={styles.bannerDescription}>Stone mill #4 idle & preheated for your batch</Text>
      </View>

      <Text style={styles.title}>My Grain Basket ({cartItems.length} items)</Text>

      {cartItems.map(item => (
        <View key={item.id} style={styles.cartCard}>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          </View>
          <TouchableOpacity onPress={() => dispatch(removeFromCart(item.id))}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      {cartItems.length === 0 && <Text style={styles.emptyText}>Your grain basket is empty.</Text>}

      {cartItems.length > 0 && (
        <View style={styles.checkoutBox}>
          <Text style={styles.addressTitle}>Deliver To Hub / Address:</Text>
          {addresses.map(address => (
            <TouchableOpacity key={address.id} style={[styles.addrChip, selectedAddr === address.address && styles.selectedAddr]} onPress={() => setSelectedAddr(address.address)}>
              <Text style={[styles.addressLabel, selectedAddr === address.address && styles.selectedAddressLabel]}>📍 {address.address}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleCheckout}>
            <Text style={styles.btnTxt}>Place Fresh Milling Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: theme.colors.background, paddingBottom: 30 },
  banner: { backgroundColor: theme.colors.surfaceTint, padding: 10, borderRadius: theme.components.button.borderRadius, marginBottom: 15 },
  bannerTitle: { fontSize: theme.typography.fontSize.label, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.success },
  bannerDescription: { fontSize: theme.typography.fontSize.small, color: theme.colors.detail, marginTop: 2 },
  title: { fontSize: theme.typography.fontSize.heading, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, marginBottom: 12 },
  cartCard: { backgroundColor: theme.colors.surface, borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: theme.components.card.borderWidth, borderColor: theme.colors.border },
  itemDetails: { flex: 1 },
  itemName: { fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  itemSubtitle: { fontSize: theme.typography.fontSize.small, color: theme.colors.textSecondary, marginVertical: 3 },
  itemPrice: { fontSize: theme.typography.fontSize.body, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  removeText: { color: theme.colors.error, fontWeight: theme.typography.fontWeight.bold },
  emptyText: { textAlign: 'center', color: theme.colors.textSubtle, marginVertical: 30 },
  checkoutBox: { backgroundColor: theme.colors.surfaceWarm, padding: 15, borderRadius: theme.components.card.borderRadius, marginTop: 15, borderWidth: theme.components.card.borderWidth, borderColor: theme.colors.border },
  addressTitle: { fontSize: theme.typography.fontSize.bodySmall, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, marginBottom: 6 },
  addrChip: { padding: 8, backgroundColor: theme.colors.surface, borderRadius: theme.components.badge.borderRadius, marginBottom: 6, borderWidth: theme.components.input.borderWidth, borderColor: theme.colors.borderStrong },
  selectedAddr: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  addressLabel: { color: theme.colors.detail, fontSize: theme.typography.fontSize.small },
  selectedAddressLabel: { color: theme.colors.textContrast },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15 },
  totalLabel: { fontSize: theme.typography.fontSize.subtitle, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  totalAmount: { fontSize: theme.typography.fontSize.subtitle, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  btn: { backgroundColor: theme.colors.primary, padding: 15, borderRadius: theme.components.button.borderRadius, alignItems: 'center' },
  btnTxt: { color: theme.colors.textOnPrimary, fontWeight: theme.typography.fontWeight.bold, fontSize: theme.typography.fontSize.bodyLarge },
});
