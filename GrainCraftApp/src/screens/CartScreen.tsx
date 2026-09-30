import { useCallback, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { removeFromCart, incrementItem, decrementItem } from '../redux/slices/cartSlice';
import { createOrder, fetchOrders } from '../redux/slices/orderSlice';
import { fetchAddresses, createAddress } from '../redux/slices/userSlice';
import { analyticsService } from '../services/analyticsService';
import hapticsService from '../services/hapticsService';
import notificationService from '../services/notificationService';
import type { Address } from '../services/types';
import type { RootStackParamList } from '../redux/types';
import theme from '../theme';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import SectionHeading from '../components/ui/SectionHeading';
import NoticeBanner from '../components/ui/NoticeBanner';
import AddressOption from '../components/ui/AddressOption';
import AddressEntryForm from '../components/ui/AddressEntryForm';
import { LoadingSpinner, ErrorMessage } from '../components/ui/LoadingSpinner';
import { EmptyStateFallback } from '../components/ui/EmptyStateFallback';
import { AnimatedComponent } from '../components/ui/AnimatedComponent';
import { EnhancedButton } from '../components/ui/EnhancedButton';
import { PaymentBottomSheet } from '../components/ui/PaymentBottomSheet';
import { MaterialIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'MainApp'>;

export default function CartScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);
  const user = useAppSelector(state => state.auth.user);
  const addresses = useAppSelector(state => state.user.addresses);
  const { loading: addressLoading, error: addressError } = useAppSelector(state => state.user);
  const { creating: orderCreating, paymentProcessing } = useAppSelector(state => state.orders);

  const [selectedAddrId, setSelectedAddrId] = useState('');
  const [addressSheetVisible, setAddressSheetVisible] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchAddresses());
      analyticsService.trackPageView('cart_screen');
    }, [dispatch])
  );

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedAddress = addresses.find(address => address.id === selectedAddrId);

  const handleSaveAddress = (address: Address) => {
    dispatch(createAddress(address as any)).then(() => {
      setShowAddressForm(false);
      analyticsService.trackUserAction('address_created');
    });
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddrId(address.id);
    setAddressSheetVisible(false);
    analyticsService.trackUserAction('address_selected', { addressId: address.id });
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
    if (!user) {
      Alert.alert('User not found', 'Please log in to place an order.');
      return;
    }

    // Show payment sheet instead of direct order creation
    setPendingOrder({
      items: cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        type: item.id.startsWith('blend') ? 'blend' : 'product',
      })),
      addressId: selectedAddress.id,
    });
    setPaymentSheetVisible(true);
    analyticsService.trackUserAction('checkout_initiated', { total, itemCount: cartItems.length });
  };

  const handlePaymentSuccess = (paymentId: string, signature: string) => {
    if (!user || !pendingOrder) {
      Alert.alert('Error', 'Unable to process order');
      return;
    }

    dispatch(
      createOrder({
        orderData: pendingOrder,
        user,
        paymentId,
        paymentSignature: signature,
      })
    )
      .unwrap()
      .then((order) => {
        setPaymentSheetVisible(false);
        hapticsService.orderSuccess();
        analyticsService.trackOrderPlaced(order.id, order.total, cartItems.length);

        // Local push confirming the order, plus a simulated status timeline
        // so the user experiences the full lifecycle in demo mode.
        notificationService.notifyOrderPlaced(order.id, order.total);
        notificationService.scheduleOrderStatus(order.id, 'order_milling', 15);
        notificationService.scheduleOrderStatus(order.id, 'order_out_for_delivery', 30);

        // Navigate to confirmation screen
        navigation.navigate('OrderConfirmation', { order });

        dispatch(fetchOrders());
      })
      .catch((error: any) => {
        hapticsService.actionFailed();
        analyticsService.trackError('order_placement_failed', error.message);
        Alert.alert(
          'Order Failed',
          error.message || 'Failed to place order. Please try again.'
        );
      });
  };

  const handlePaymentFailure = (error: string) => {
    hapticsService.actionFailed();
    analyticsService.trackError('payment_failed', error);
    Alert.alert('Payment Failed', error);
  };

  const handleRemoveItem = (itemId: string) => {
    hapticsService.impact('light');
    dispatch(removeFromCart(itemId));
    analyticsService.trackUserAction('item_removed', { itemId });
  };

  const handleIncrementItem = (itemId: string) => {
    hapticsService.selection();
    dispatch(incrementItem(itemId));
  };

  const handleDecrementItem = (itemId: string) => {
    hapticsService.selection();
    dispatch(decrementItem(itemId));
  };

  if (cartItems.length === 0 && !addressSheetVisible) {
    return (
      <AppScreen>
        <NoticeBanner title="⚙️ Milled-to-Order Dispatch" description="Stone mill #4 idle & preheated for your batch" tone="success" />
        <EmptyStateFallback
          icon="shopping-cart"
          title="Cart is Empty"
          message="Browse the grain vault and add items to get started"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen style={{ flex: 1, padding: 0 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <AnimatedComponent type="slideInDown" duration={400}>
          <NoticeBanner title="⚙️ Milled-to-Order Dispatch" description="Stone mill #4 idle & preheated for your batch" tone="success" />
        </AnimatedComponent>

        <AnimatedComponent type="slideInUp" delay={50} duration={400}>
          <SectionHeading title={`My Grain Basket (${cartItems.length} items)`} />
        </AnimatedComponent>

        {cartItems.map((item, index) => (
          <AnimatedComponent
            key={item.id}
            type="slideInUp"
            delay={100 + index * 30}
            duration={400}
          >
            <AppCard style={styles.cartCard}>
              <View style={styles.cartRow}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    onPress={() => handleDecrementItem(item.id)}
                    style={styles.quantityButton}
                  >
                    <MaterialIcons name="remove" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => handleIncrementItem(item.id)}
                    style={styles.quantityButton}
                  >
                    <MaterialIcons name="add" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(item.id)}
                    style={styles.removeButton}
                  >
                    <MaterialIcons name="close" size={18} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </AppCard>
          </AnimatedComponent>
        ))}

        <AnimatedComponent type="slideInUp" delay={300} duration={500}>
          <AppCard variant="warm" style={styles.checkoutBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
            </View>

            {selectedAddress ? (
              <>
                <Text style={styles.addressTitle}>Delivering to</Text>
                <AddressOption address={selectedAddress} selected onSelect={() => setAddressSheetVisible(true)} />
                <EnhancedButton
                  title="Change delivery address"
                  onPress={() => setAddressSheetVisible(true)}
                  variant="secondary"
                  fullWidth
                  style={styles.proceedButton}
                />
                <EnhancedButton
                  title="Proceed to Payment"
                  onPress={handleCheckout}
                  variant="primary"
                  fullWidth
                  loading={orderCreating || paymentProcessing}
                  style={styles.proceedButton}
                  icon="credit-card"
                />
              </>
            ) : (
              <EnhancedButton
                title="Proceed — choose delivery address"
                onPress={() => setAddressSheetVisible(true)}
                variant="primary"
                fullWidth
              />
            )}
          </AppCard>
        </AnimatedComponent>
      </ScrollView>

      <Modal
        visible={addressSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressSheetVisible(false)}
      >
        <View style={styles.modalRoot}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Close address selection"
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setAddressSheetVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose a delivery address</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setAddressSheetVisible(false)}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {addressError && <ErrorMessage message={addressError} onRetry={() => dispatch(fetchAddresses())} />}

            <ScrollView style={styles.sheetContent} keyboardShouldPersistTaps="handled">
              {!showAddressForm && (
                <>
                  {addressLoading ? (
                    <LoadingSpinner message="Loading addresses..." />
                  ) : addresses.length === 0 ? (
                    <Text style={styles.noAddresses}>No saved addresses yet. Add one to continue.</Text>
                  ) : (
                    addresses.map(address => (
                      <AddressOption
                        key={address.id}
                        address={address}
                        selected={selectedAddrId === address.id}
                        onSelect={handleSelectAddress}
                      />
                    ))
                  )}
                  <EnhancedButton
                    title="＋ Add a new address"
                    onPress={() => setShowAddressForm(true)}
                    variant="secondary"
                    fullWidth
                    style={styles.addAddressButton}
                  />
                </>
              )}

              {showAddressForm && <AddressEntryForm initialName={user?.name} onSave={handleSaveAddress} />}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <PaymentBottomSheet
        visible={paymentSheetVisible}
        amount={total}
        orderId={pendingOrder?.orderId || 'ORDER_' + Date.now()}
        customerEmail={user?.email || ''}
        customerName={user?.name || ''}
        customerPhone={user?.phone || ''}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
        onClose={() => {
          setPaymentSheetVisible(false);
          setPendingOrder(null);
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cartCard: { padding: 12, marginBottom: 10 },
  cartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemDetails: { flex: 1 },
  itemName: {
    fontSize: theme.typography.fontSize.bodyLarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  itemSubtitle: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    marginVertical: 3,
  },
  itemPrice: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F5F3F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    paddingLeft: 4,
  },
  checkoutBox: { marginTop: 15 },
  addressTitle: {
    fontSize: theme.typography.fontSize.bodySmall,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 6,
  },
  noAddresses: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15 },
  totalLabel: {
    fontSize: theme.typography.fontSize.subtitle,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  totalAmount: {
    fontSize: theme.typography.fontSize.subtitle,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  proceedButton: { marginTop: 10 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  bottomSheet: {
    maxHeight: '85%',
    minHeight: '35%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    paddingBottom: 28,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sheetTitle: {
    fontSize: theme.typography.fontSize.headingSmall,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  closeButton: {
    fontSize: theme.typography.fontSize.subtitle,
    color: theme.colors.textSecondary,
    padding: 6,
  },
  sheetContent: { flexGrow: 0, marginTop: 12 },
  addAddressButton: { marginTop: 10 },
});
