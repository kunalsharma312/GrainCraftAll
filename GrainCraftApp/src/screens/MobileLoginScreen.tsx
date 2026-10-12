import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppDispatch } from '../redux/hooks';
import { login, continueAsGuest, setMobilePhone } from '../redux/slices/authSlice';
import { apiService } from '../services/api';
import hapticsService from '../services/hapticsService';
import theme from '../theme';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import { EnhancedButton } from '../components/ui/EnhancedButton';
import { AnimatedComponent } from '../components/ui/AnimatedComponent';

type LoginStep = 'phone' | 'otp';

interface MobileLoginScreenProps {
  onLoginSuccess?: () => void;
}

export default function MobileLoginScreen({ onLoginSuccess }: MobileLoginScreenProps) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<LoginStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // OTP timer countdown
  useEffect(() => {
    if (!otpExpiry) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setOtpExpiry(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiry]);

  /**
   * Validate phone number format (10 digits for India)
   */
  const isValidPhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  /**
   * Request OTP to be sent to the phone number
   */
  const handleRequestOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a mobile number');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      // Call API to request OTP
      const response = await apiService.requestOTP(phoneNumber);

      if (response.success) {
        hapticsService.notify('success');
        setOtpRequested(true);
        setStep('otp');
        // OTP valid for 5 minutes
        setOtpExpiry(Date.now() + 5 * 60 * 1000);
        setTimeRemaining(300);
        Alert.alert('OTP Sent', `OTP has been sent to ${phoneNumber}`);
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP and login
   */
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'OTP should be 6 digits');
      return;
    }

    setLoading(true);
    try {
      // Call API to verify OTP and login
      const response = await apiService.verifyOTP(phoneNumber, otp);

      if (response.success && response.user && response.token) {
        apiService.setAuthToken(response.token);
        dispatch(setMobilePhone(phoneNumber));
        dispatch(login(response.user));
        hapticsService.notify('success');
        onLoginSuccess?.();
      } else {
        Alert.alert('Error', response.message || 'Invalid OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await apiService.requestOTP(phoneNumber);

      if (response.success) {
        hapticsService.notify('success');
        setOtpExpiry(Date.now() + 5 * 60 * 1000);
        setTimeRemaining(300);
        Alert.alert('OTP Resent', 'Check your SMS for the new OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Go back to phone number entry
   */
  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setOtpRequested(false);
    setOtpExpiry(null);
  };

  /**
   * Continue as guest
   */
  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const response = await apiService.loginAsGuest();
      if (response.user && response.token) {
        apiService.setAuthToken(response.token);
        dispatch(continueAsGuest());
        hapticsService.notify('success');
        onLoginSuccess?.();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to login as guest');
    } finally {
      setLoading(false);
    }
  };

  const isOtpExpired = otpExpiry !== null && Date.now() > otpExpiry;
  const formattedPhoneNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <AppScreen contentStyle={styles.screen}>
        <AnimatedComponent type="slideInDown" duration={500}>
          <View style={styles.header}>
            <Text style={styles.title}>Sign in with Mobile</Text>
            <Text style={styles.subtitle}>
              {step === 'phone' ? 'Enter your mobile number' : 'Enter the OTP sent to your mobile'}
            </Text>
          </View>
        </AnimatedComponent>

        <AnimatedComponent type="slideInUp" delay={100} duration={500}>
          <AppCard variant="warm" style={styles.card}>
            {step === 'phone' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="10-digit mobile number"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="phone-pad"
                      maxLength={14}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      editable={!loading}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    We'll send you a one-time password to verify your number
                  </Text>
                </View>

                <EnhancedButton
                  title={loading ? 'Sending OTP...' : 'Get OTP'}
                  onPress={handleRequestOTP}
                  variant="primary"
                  fullWidth
                  disabled={loading || !isValidPhoneNumber(phoneNumber)}
                  style={styles.button}
                />
              </>
            ) : (
              <>
                <View style={styles.phoneDisplay}>
                  <Text style={styles.phoneDisplayLabel}>OTP sent to</Text>
                  <Text style={styles.phoneDisplayNumber}>{formattedPhoneNumber}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Enter OTP</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="6-digit OTP"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    editable={!loading}
                  />
                  <Text style={styles.helperText}>
                    {isOtpExpired ? (
                      <Text style={styles.expiredText}>OTP has expired. Request a new one.</Text>
                    ) : (
                      <>
                        Valid for <Text style={styles.timerText}>{timeRemaining}s</Text>
                      </>
                    )}
                  </Text>
                </View>

                <EnhancedButton
                  title={loading ? 'Verifying...' : 'Verify OTP'}
                  onPress={handleVerifyOTP}
                  variant="primary"
                  fullWidth
                  disabled={loading || otp.length !== 6 || isOtpExpired}
                  style={styles.button}
                />

                <View style={styles.resendContainer}>
                  <Text style={styles.resendLabel}>Didn't receive OTP?</Text>
                  {!isOtpExpired && timeRemaining > 30 ? (
                    <Text style={styles.resendDisabledText}>
                      Resend available in {timeRemaining - 30}s
                    </Text>
                  ) : (
                    <EnhancedButton
                      title="Resend OTP"
                      onPress={handleResendOTP}
                      variant="secondary"
                      size="small"
                      disabled={loading}
                    />
                  )}
                </View>

                <EnhancedButton
                  title="Change Number"
                  onPress={handleBackToPhone}
                  variant="secondary"
                  fullWidth
                  disabled={loading}
                  style={styles.backButton}
                />
              </>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <EnhancedButton
              title="Continue as Guest"
              onPress={handleGuestLogin}
              variant="secondary"
              fullWidth
              disabled={loading}
              style={styles.guestButton}
            />
          </AppCard>
        </AnimatedComponent>

        <AnimatedComponent type="fadeIn" delay={300} duration={600}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>🔒 Your mobile number is secure and used only for order verification</Text>
          </View>
        </AnimatedComponent>
      </AppScreen>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: theme.colors.text,
  },
  otpInput: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingVertical: 12,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  expiredText: {
    color: '#EF5350',
    fontWeight: '600',
  },
  timerText: {
    color: '#FFA726',
    fontWeight: '700',
  },
  button: {
    marginTop: 16,
  },
  phoneDisplay: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  phoneDisplayLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  phoneDisplayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  resendLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  resendDisabledText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  backButton: {
    marginTop: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  guestButton: {
    marginBottom: 0,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
