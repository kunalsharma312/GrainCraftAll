import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { saveAddress } from '../redux/slices/authSlice';
import { placeOrder, removeFromCart } from '../redux/slices/cartSlice';
import type { Address } from '../redux/types';
import theme from '../theme';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import SectionHeading from '../components/ui/SectionHeading';
import NoticeBanner from '../components/ui/NoticeBanner';
import EmptyState from '../components/ui/EmptyState';
import AddressOption from '../components/ui/AddressOption';
import AddressEntryForm from '../components/ui/AddressEntryForm';

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);
  const addresses = useAppSelector(state => state.auth.addresses);
  const user = useAppSelector(state => state.auth.user);
  const [selectedAddrId, setSelectedAddrId] = useState('');
  const [addressSheetVisible, setAddressSheetVisible] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedAddress = addresses.find(address => address.id === selectedAddrId);

  const handleSaveAddress = (address: Address) => {
    dispatch(saveAddress(address));
    setSelectedAddrId(address.id);
    setAddressSheetVisible(false);
    setShowAddressForm(false);
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddrId(address.id);
    setAddressSheetVisible(false);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Your grain basket is empty.');
      return;
    }
    if (!selectedAddress) {
      Alert.alert('Delivery address needed', 'Add an address or select one of your saved addresses before placing the order.');
      return;
    }
    const deliveryAddress = `${selectedAddress.fullName}, ${selectedAddress.phone}, ${selectedAddress.houseNumber}${selectedAddress.street ? `, ${selectedAddress.street}` : ''}${selectedAddress.landmark ? `, near ${selectedAddress.landmark}` : ''}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}`;
    dispatch(placeOrder({ address: deliveryAddress }));
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
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>

          {selectedAddress ? (
            <>
              <Text style={styles.addressTitle}>Delivering to</Text>
              <AddressOption address={selectedAddress} selected onSelect={() => setAddressSheetVisible(true)} />
              <PrimaryButton title="Change delivery address" onPress={() => setAddressSheetVisible(true)} variant="secondary" style={styles.proceedButton} />
              <PrimaryButton title="Place Fresh Milling Order" onPress={handleCheckout} style={styles.proceedButton} />
            </>
          ) : (
            <PrimaryButton title="Proceed — choose delivery address" onPress={() => setAddressSheetVisible(true)} />
          )}
        </AppCard>
      )}

      <Modal visible={addressSheetVisible} transparent animationType="slide" onRequestClose={() => setAddressSheetVisible(false)}>
        <View style={styles.modalRoot}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close address selection" style={styles.backdrop} activeOpacity={1} onPress={() => setAddressSheetVisible(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose a delivery address</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close" onPress={() => setAddressSheetVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetContent} keyboardShouldPersistTaps="handled">
              {!showAddressForm && (
                <>
                  {addresses.length === 0 ? (
                    <Text style={styles.noAddresses}>No saved addresses yet. Add one to continue.</Text>
                  ) : (
                    addresses.map(address => (
                      <AddressOption key={address.id} address={address} selected={selectedAddrId === address.id} onSelect={handleSelectAddress} />
                    ))
                  )}
                  <PrimaryButton title="＋ Add a new address" onPress={() => setShowAddressForm(true)} variant="secondary" style={styles.addAddressButton} />
                </>
              )}

              {showAddressForm && <AddressEntryForm initialName={user?.name} onSave={handleSaveAddress} />}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  noAddresses: { fontSize: theme.typography.fontSize.small, color: theme.colors.textSecondary, marginBottom: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15 },
  totalLabel: { fontSize: theme.typography.fontSize.subtitle, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  totalAmount: { fontSize: theme.typography.fontSize.subtitle, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.primary },
  proceedButton: { marginTop: 10 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  bottomSheet: { maxHeight: '85%', minHeight: '35%', backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, paddingBottom: 28 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  sheetTitle: { fontSize: theme.typography.fontSize.headingSmall, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text },
  closeButton: { fontSize: theme.typography.fontSize.subtitle, color: theme.colors.textSecondary, padding: 6 },
  sheetContent: { flexGrow: 0, marginTop: 12 },
  addAddressButton: { marginTop: 10 },
});
