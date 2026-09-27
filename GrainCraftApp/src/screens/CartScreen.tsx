import { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { placeOrder, removeFromCart } from '../redux/slices/cartSlice';
import theme from '../theme';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import SectionHeading from '../components/ui/SectionHeading';
import NoticeBanner from '../components/ui/NoticeBanner';
import EmptyState from '../components/ui/EmptyState';
import AddressOption from '../components/ui/AddressOption';

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
    <AppScreen>
      <NoticeBanner title="⚙️ Milled-to-Order Dispatch" description="Stone mill #4 idle & preheated for your batch" tone="success" />

      <SectionHeading title={`My Grain Basket (${cartItems.length} items)`} />

      {cartItems.map(item => (
        <AppCard key={item.id} style={styles.cartCard}>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          </View>
          <TouchableOpacity onPress={() => dispatch(removeFromCart(item.id))}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </AppCard>
      ))}

      {cartItems.length === 0 && <EmptyState message="Your grain basket is empty." />}

      {cartItems.length > 0 && (
        <AppCard variant="warm" style={styles.checkoutBox}>
          <Text style={styles.addressTitle}>Deliver To Hub / Address:</Text>
          {addresses.map(address => (
            <AddressOption key={address.id} address={address} selected={selectedAddr === address.address} onSelect={selected => setSelectedAddr(selected.address)} />
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>

          <PrimaryButton title="Place Fresh Milling Order" onPress={handleCheckout} />
        </AppCard>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cartCard: { padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemDetails: { flex: 1 },
  itemName: { fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  itemSubtitle: { fontSize: theme.typography.fontSize.small, color: theme.colors.textSecondary, marginVertical: 3 },
  itemPrice: { fontSize: theme.typography.fontSize.body, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  removeText: { color: theme.colors.error, fontWeight: theme.typography.fontWeight.bold },
  checkoutBox: { marginTop: 15 },
  addressTitle: { fontSize: theme.typography.fontSize.bodySmall, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, marginBottom: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15 },
  totalLabel: { fontSize: theme.typography.fontSize.subtitle, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  totalAmount: { fontSize: theme.typography.fontSize.subtitle, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
});
