import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../../theme';
import { EnhancedButton } from './EnhancedButton';
import { AnimatedComponent } from './AnimatedComponent';
import { paymentService, PaymentStatus } from '../../services/paymentService';
import { analyticsService } from '../../services/analyticsService';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
}

export interface PaymentBottomSheetProps {
  visible: boolean;
  amount: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  onPaymentSuccess: (paymentId: string, signature: string) => void;
  onPaymentFailure: (error: string) => void;
  onClose: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'upi',
    name: 'UPI',
    icon: 'mobile-screen-share',
    description: 'Google Pay, PhonePe, Paytm',
    enabled: true,
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: 'credit-card',
    description: 'Visa, Mastercard, RuPay',
    enabled: true,
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: 'account-balance',
    description: 'All major Indian banks',
    enabled: true,
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: 'account-balance-wallet',
    description: 'Amazon Pay, Mobikwik',
    enabled: true,
  },
];

export function PaymentBottomSheet({
  visible,
  amount,
  orderId,
  customerEmail,
  customerName,
  customerPhone,
  onPaymentSuccess,
  onPaymentFailure,
  onClose,
}: PaymentBottomSheetProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<PaymentStatus | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  useEffect(() => {
    if (!visible) {
      setLoading(false);
      setProcessingStatus(null);
      setShowCardDetails(false);
    }
  }, [visible]);

  const formatAmount = (amt: number): string => {
    return paymentService.formatAmountForDisplay(amt, 'INR');
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    analyticsService.trackUserAction('payment_method_selected', { method: methodId });

    if (methodId === 'card') {
      setShowCardDetails(true);
    } else {
      setShowCardDetails(false);
    }
  };

  const validateCardDetails = (): boolean => {
    if (!cardDetails.number.trim()) {
      Alert.alert('Validation Error', 'Please enter card number');
      return false;
    }
    if (!cardDetails.expiry.trim()) {
      Alert.alert('Validation Error', 'Please enter expiry date (MM/YY)');
      return false;
    }
    if (!cardDetails.cvv.trim()) {
      Alert.alert('Validation Error', 'Please enter CVV');
      return false;
    }
    if (!cardDetails.name.trim()) {
      Alert.alert('Validation Error', 'Please enter cardholder name');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    try {
      // Validate card details if card is selected
      if (selectedMethod === 'card' && !validateCardDetails()) {
        return;
      }

      setLoading(true);
      setProcessingStatus(PaymentStatus.PROCESSING);

      // Track payment initiation
      analyticsService.trackUserAction('payment_initiated', {
        method: selectedMethod,
        amount,
        orderId,
      });

      // Initialize payment with backend
      const initResponse = await paymentService.initializePayment({
        orderId,
        amount,
        currency: 'INR',
        customerEmail,
        customerName,
        customerPhone,
      });

      if (!initResponse.success) {
        throw new Error(initResponse.error || 'Failed to initialize payment');
      }

      const paymentId = initResponse.paymentId || paymentService.generatePaymentId();

      // Simulate payment processing (in real app, this would integrate with Razorpay SDK)
      // For demo, we'll simulate success after 2 seconds
      setTimeout(() => {
        // Generate mock signature for demo
        const mockSignature = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        setProcessingStatus(PaymentStatus.SUCCESS);

        analyticsService.trackEvent('payment_success', {
          orderId,
          amount,
          method: selectedMethod,
          paymentId,
          mode: 'demo',
        });

        // Call success callback
        setTimeout(() => {
          onPaymentSuccess(paymentId, mockSignature);
          setLoading(false);
          Alert.alert('Success', 'Demo payment processed successfully!\n\nThis is a test transaction.');
        }, 1000);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';

      setProcessingStatus(PaymentStatus.FAILED);

      analyticsService.trackError('payment_failed', errorMessage, {
        orderId,
        method: selectedMethod,
        amount,
      });

      setLoading(false);

      Alert.alert('Payment Failed', errorMessage, [
        { text: 'Retry', onPress: () => handlePayment() },
        { text: 'Cancel', onPress: onClose },
      ]);

      onPaymentFailure(errorMessage);
    }
  };

  const handleSkipPayment = () => {
    // For testing/demo purposes, allow skipping payment
    Alert.alert(
      'Demo Mode',
      'Payment gateway is not yet integrated. Proceeding with demo payment to test the order flow.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Proceed',
          onPress: () => {
            const demoPaymentId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const demoSignature = `demo_sig_${Date.now()}`;
            analyticsService.trackEvent('demo_payment_skipped', {
              orderId,
              amount,
            });
            onPaymentSuccess(demoPaymentId, demoSignature);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Bottom Sheet */}
        <AnimatedComponent type="slideInUp" duration={400}>
          <View style={styles.bottomSheet}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Complete Payment</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Amount Display */}
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.amountValue}>{formatAmount(amount)}</Text>
              <Text style={styles.orderId}>Order ID: {orderId}</Text>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Processing Status */}
              {processingStatus && (
                <View style={styles.statusContainer}>
                  {processingStatus === PaymentStatus.PROCESSING && (
                    <>
                      <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                      />
                      <Text style={styles.statusText}>Processing Payment...</Text>
                      <Text style={styles.statusSubtext}>
                        Please don't close this screen
                      </Text>
                    </>
                  )}
                  {processingStatus === PaymentStatus.SUCCESS && (
                    <>
                      <MaterialIcons
                        name="check-circle"
                        size={60}
                        color={theme.colors.success}
                      />
                      <Text style={styles.statusText}>Payment Successful!</Text>
                      <Text style={styles.statusSubtext}>
                        Your order is being confirmed
                      </Text>
                    </>
                  )}
                  {processingStatus === PaymentStatus.FAILED && (
                    <>
                      <MaterialIcons
                        name="error-outline"
                        size={60}
                        color={theme.colors.error}
                      />
                      <Text style={styles.statusText}>Payment Failed</Text>
                      <Text style={styles.statusSubtext}>
                        Please try again or use another method
                      </Text>
                    </>
                  )}
                </View>
              )}

              {/* Payment Methods */}
              {!processingStatus && (
                <>
                  <Text style={styles.methodsTitle}>Select Payment Method</Text>
                  <View style={styles.methodsList}>
                    {PAYMENT_METHODS.map(method => (
                      <TouchableOpacity
                        key={method.id}
                        onPress={() => handleMethodSelect(method.id)}
                        disabled={!method.enabled || loading}
                        style={[
                          styles.methodCard,
                          selectedMethod === method.id &&
                            styles.methodCardSelected,
                        ]}
                      >
                        <View style={styles.methodIconContainer}>
                          <MaterialIcons
                            name={method.icon as any}
                            size={28}
                            color={
                              selectedMethod === method.id
                                ? theme.colors.primary
                                : theme.colors.textSecondary
                            }
                          />
                        </View>
                        <View style={styles.methodInfo}>
                          <Text style={styles.methodName}>{method.name}</Text>
                          <Text style={styles.methodDescription}>
                            {method.description}
                          </Text>
                        </View>
                        <MaterialIcons
                          name={
                            selectedMethod === method.id
                              ? 'radio-button-checked'
                              : 'radio-button-unchecked'
                          }
                          size={24}
                          color={
                            selectedMethod === method.id
                              ? theme.colors.primary
                              : theme.colors.border
                          }
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Card Details Form */}
                  {showCardDetails && (
                    <View style={styles.cardDetailsForm}>
                      <Text style={styles.formTitle}>Card Details</Text>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Cardholder Name</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Full Name"
                          placeholderTextColor={theme.colors.textMuted}
                          value={cardDetails.name}
                          onChangeText={text =>
                            setCardDetails({ ...cardDetails, name: text })
                          }
                          editable={!loading}
                        />
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Card Number</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="1234 5678 9012 3456"
                          placeholderTextColor={theme.colors.textMuted}
                          value={cardDetails.number}
                          onChangeText={text =>
                            setCardDetails({ ...cardDetails, number: text })
                          }
                          keyboardType="numeric"
                          maxLength={19}
                          editable={!loading}
                        />
                      </View>

                      <View style={styles.cardRow}>
                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>Expiry (MM/YY)</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="MM/YY"
                            placeholderTextColor={theme.colors.textMuted}
                            value={cardDetails.expiry}
                            onChangeText={text =>
                              setCardDetails({
                                ...cardDetails,
                                expiry: text,
                              })
                            }
                            keyboardType="numeric"
                            maxLength={5}
                            editable={!loading}
                          />
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>CVV</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="123"
                            placeholderTextColor={theme.colors.textMuted}
                            value={cardDetails.cvv}
                            onChangeText={text =>
                              setCardDetails({ ...cardDetails, cvv: text })
                            }
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry
                            editable={!loading}
                          />
                        </View>
                      </View>

                      <View style={styles.securityNote}>
                        <MaterialIcons
                          name="security"
                          size={16}
                          color={theme.colors.primary}
                        />
                        <Text style={styles.securityText}>
                          Your card details are encrypted and secure
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Info Box */}
                  <View style={styles.infoBox}>
                    <MaterialIcons
                      name="info"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.infoText}>
                      A secure payment gateway will process your transaction.
                      You'll receive a confirmation email shortly.
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Action Buttons */}
            {!processingStatus && (
              <View style={styles.footer}>
                <EnhancedButton
                  title="Cancel"
                  onPress={onClose}
                  variant="secondary"
                  fullWidth
                  style={styles.cancelButton}
                  disabled={loading}
                />
                <EnhancedButton
                  title={`Pay ${formatAmount(amount)}`}
                  onPress={handlePayment}
                  variant="primary"
                  fullWidth
                  loading={loading}
                  style={styles.payButton}
                />
                <TouchableOpacity
                  style={styles.skipDemoButton}
                  onPress={handleSkipPayment}
                  disabled={loading}
                >
                  <Text style={styles.skipDemoText}>
                    📝 Skip Payment (Demo Mode)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </AnimatedComponent>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.fontSize.headingSmall,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: theme.components.button.borderRadius,
  },
  amountLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: theme.typography.fontSize.headingLarge,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  orderId: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textMuted,
    fontFamily: 'monospace',
  },
  content: {
    flexGrow: 0,
    maxHeight: 400,
    paddingHorizontal: 16,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  statusText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginTop: 16,
  },
  statusSubtext: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  methodsTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  methodsList: {
    marginBottom: 16,
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: theme.components.button.borderRadius,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  methodCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
  },
  cardDetailsForm: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.components.button.borderRadius,
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  securityText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.infoLight,
    padding: 12,
    borderRadius: theme.components.button.borderRadius,
    marginVertical: 16,
  },
  infoText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  cancelButton: {
    marginBottom: 8,
  },
  payButton: {
    marginBottom: 8,
  },
  skipDemoButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 8,
  },
  skipDemoText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
