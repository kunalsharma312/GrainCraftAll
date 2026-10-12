import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Linking,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../redux/types';
import theme from '../theme';
import AppScreen from '../components/ui/AppScreen';
import { AnimatedComponent } from '../components/ui/AnimatedComponent';
import { EnhancedButton } from '../components/ui/EnhancedButton';
import AppCard from '../components/ui/AppCard';
import SectionHeading from '../components/ui/SectionHeading';
import { analyticsService } from '../services/analyticsService';
import { clearCart } from '../redux/slices/cartSlice';
import { fetchOrders } from '../redux/slices/orderSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderConfirmation'>;

export function OrderConfirmationScreen({ navigation, route }: Props) {
  const { order } = route.params;
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const [showDetails, setShowDetails] = useState(false);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => {
    // Track confirmation screen view
    analyticsService.trackPageView('order_confirmation');

    // Clear cart after order confirmed
    dispatch(clearCart());

    // Calculate estimated delivery (3-5 business days)
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 4);
    setEstimatedDelivery(delivery.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, [dispatch]);

  const handleShareOrder = async () => {
    try {
      await Share.share({
        message: `Order #${order.id} placed successfully!\nAmount: ₹${order.total}\nEstimated Delivery: ${estimatedDelivery}\n\nOrder from GrainCraft - Fresh Milled Grains`,
        title: 'Order Confirmation',
      });
      analyticsService.trackUserAction('order_shared', { orderId: order.id });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleViewOrders = () => {
    dispatch(fetchOrders());
    // Orders lives inside the MainApp tab navigator.
    navigation.navigate('MainApp', { screen: 'Orders' } as never);
    analyticsService.trackUserAction('view_orders_from_confirmation');
  };

  const handleContinueShopping = () => {
    navigation.navigate('MainApp', { screen: 'Discover' } as never);
    analyticsService.trackUserAction('continue_shopping_from_confirmation');
  };

  const handleDownloadReceipt = () => {
    Alert.alert('Receipt', 'Receipt has been sent to your email.\nYou can download it anytime from your order history.');
    analyticsService.trackUserAction('download_receipt_requested', { orderId: order.id });
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Order Support - ${order.id}`);
    const body = encodeURIComponent(`Hi,\n\nI need help with my order #${order.id}\n\nThank you`);
    Linking.openURL(`mailto:support@graincraftapp.com?subject=${subject}&body=${body}`);
    analyticsService.trackUserAction('contact_support_from_confirmation');
  };

  return (
    <AppScreen style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Animation */}
        <AnimatedComponent type="scaleIn" duration={600}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={80} color={theme.colors.success} />
            </View>
            <Text style={styles.successTitle}>Order Confirmed!</Text>
            <Text style={styles.successSubtitle}>Your milling order has been placed successfully</Text>
          </View>
        </AnimatedComponent>

        {/* Order ID Card */}
        <AnimatedComponent type="slideInUp" delay={200} duration={500}>
          <AppCard variant="warm" style={styles.orderIdCard}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderIdValue}>{order.id}</Text>
            <View style={styles.orderIdFooter}>
              <Text style={styles.orderDate}>
                {new Date(order.date).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <TouchableOpacity onPress={handleShareOrder}>
                <MaterialIcons name="share" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </AppCard>
        </AnimatedComponent>

        {/* Delivery Timeline */}
        <AnimatedComponent type="slideInUp" delay={300} duration={500}>
          <SectionHeading title="Delivery Timeline" />
          <View style={styles.timeline}>
            <TimelineStep
              icon="check-circle"
              title="Order Confirmed"
              description="Just now"
              completed
            />
            <TimelineStep
              icon="grain"
              title="Processing at Mill"
              description="Within 24 hours"
              completed={false}
            />
            <TimelineStep
              icon="local-shipping"
              title="Out for Delivery"
              description="In 2-3 days"
              completed={false}
            />
            <TimelineStep
              icon="home"
              title="Delivered"
              description={estimatedDelivery}
              completed={false}
            />
          </View>
        </AnimatedComponent>

        {/* Order Summary */}
        <AnimatedComponent type="slideInUp" delay={400} duration={500}>
          <SectionHeading title="Order Summary" />
          <AppCard style={styles.summaryCard}>
            <TouchableOpacity
              onPress={() => setShowDetails(!showDetails)}
              style={styles.summaryHeader}
            >
              <View>
                <Text style={styles.itemCount}>{order.items.length} items</Text>
                <Text style={styles.totalPrice}>₹{order.total.toFixed(2)}</Text>
              </View>
              <MaterialIcons
                name={showDetails ? 'expand-less' : 'expand-more'}
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>

            {showDetails && (
              <View style={styles.detailsContainer}>
                <View style={styles.divider} />
                {order.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.name || 'Item'}
                      </Text>
                      <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}

                <View style={[styles.divider, styles.topDivider]} />

                <View style={styles.pricingBreakdown}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Subtotal</Text>
                    <Text style={styles.priceValue}>₹{order.total.toFixed(2)}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Delivery Fee</Text>
                    <Text style={[styles.priceValue, styles.freeDelivery]}>Free</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Tax</Text>
                    <Text style={styles.priceValue}>₹0</Text>
                  </View>
                  <View style={[styles.priceRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>₹{order.total.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            )}
          </AppCard>
        </AnimatedComponent>

        {/* Delivery Address */}
        <AnimatedComponent type="slideInUp" delay={500} duration={500}>
          <SectionHeading title="Delivery Address" />
          <AppCard style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
              <Text style={styles.addressType}>{order.delivery?.type || 'Home'}</Text>
            </View>
            <Text style={styles.addressText}>
              {order.delivery?.address || 'Address loading...'}
            </Text>
            {order.delivery?.city && (
              <Text style={styles.addressCity}>
                {order.delivery.city}, {order.delivery.state} {order.delivery.pincode}
              </Text>
            )}
            <Text style={styles.addressPhone}>{order.delivery?.phone || ''}</Text>
          </AppCard>
        </AnimatedComponent>

        {/* Payment Status */}
        <AnimatedComponent type="slideInUp" delay={600} duration={500}>
          <SectionHeading title="Payment Status" />
          <AppCard style={styles.paymentCard}>
            <View style={styles.paymentStatus}>
              <View style={styles.statusBadge}>
                <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
                <Text style={styles.statusText}>Paid</Text>
              </View>
              <Text style={styles.paymentMethod}>{order.paymentMethod || 'Online'}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.transactionId}>
              Transaction ID: {order.transactionId || 'N/A'}
            </Text>
          </AppCard>
        </AnimatedComponent>

        {/* Important Info */}
        <AnimatedComponent type="slideInUp" delay={700} duration={500}>
          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="info" size={20} color={theme.colors.primary} />
              <Text style={styles.infoTitle}>What's Next?</Text>
            </View>
            <Text style={styles.infoText}>
              ✓ Confirmation email sent to {user?.email}{'\n'}
              ✓ Track your order in real-time{'\n'}
              ✓ Fresh milling starts within 24 hours
            </Text>
          </View>
        </AnimatedComponent>
      </ScrollView>

      {/* Action Buttons */}
      <AnimatedComponent type="slideInUp" delay={800} duration={500}>
        <View style={styles.actionButtons}>
          <EnhancedButton
            title="Download Receipt"
            onPress={handleDownloadReceipt}
            variant="secondary"
            fullWidth
            icon="download"
            style={styles.actionButton}
          />
          <EnhancedButton
            title="View All Orders"
            onPress={handleViewOrders}
            variant="secondary"
            fullWidth
            icon="list"
            style={styles.actionButton}
          />
          <EnhancedButton
            title="Continue Shopping"
            onPress={handleContinueShopping}
            variant="primary"
            fullWidth
            icon="shopping-bag"
          />
          <TouchableOpacity
            onPress={handleContactSupport}
            style={styles.supportLink}
          >
            <MaterialIcons name="help-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.supportText}>Need help? Contact Support</Text>
          </TouchableOpacity>
        </View>
      </AnimatedComponent>
    </AppScreen>
  );
}

interface TimelineStepProps {
  icon: string;
  title: string;
  description: string;
  completed: boolean;
}

function TimelineStep({ icon, title, description, completed }: TimelineStepProps) {
  return (
    <View style={styles.timelineStep}>
      <View style={[styles.stepIcon, completed && styles.stepIconCompleted]}>
        <MaterialIcons
          name={icon as any}
          size={20}
          color={completed ? theme.colors.success : theme.colors.textSecondary}
        />
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, completed && styles.stepTitleCompleted]}>
          {title}
        </Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  successContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: theme.typography.fontSize.headingLarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  orderIdCard: {
    marginVertical: 16,
    paddingVertical: 20,
  },
  orderIdLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  orderIdValue: {
    fontSize: theme.typography.fontSize.headingSmall,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  orderIdFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
  },
  timeline: {
    marginBottom: 24,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepIconCompleted: {
    backgroundColor: theme.colors.successLight,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  stepTitleCompleted: {
    color: theme.colors.text,
  },
  stepDescription: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textMuted,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
  },
  itemCount: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: theme.typography.fontSize.headingSmall,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  detailsContainer: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  topDivider: {
    marginTop: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 4,
  },
  itemQty: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
  },
  itemTotal: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    minWidth: 70,
    textAlign: 'right',
  },
  pricingBreakdown: {
    marginTop: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
  },
  priceValue: {
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  freeDelivery: {
    color: theme.colors.success,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  addressCard: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressType: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginLeft: 8,
  },
  addressText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  addressCity: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  addressPhone: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  paymentCard: {
    marginBottom: 16,
  },
  paymentStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
  },
  paymentMethod: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
  },
  transactionId: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  infoBox: {
    backgroundColor: theme.colors.infoLight,
    borderRadius: theme.components.button.borderRadius,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginLeft: 8,
  },
  infoText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text,
    lineHeight: 18,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    marginBottom: 8,
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  supportText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
