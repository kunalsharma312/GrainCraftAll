import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View, Animated } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAppDispatch } from '../redux/hooks';
import { login, continueAsGuest } from '../redux/slices/authSlice';
import { apiService } from '../services/api';
import biometricService, { BiometricCapability } from '../services/biometricService';
import hapticsService from '../services/hapticsService';
import theme from '../theme';
import BrandLogo from '../components/BrandLogo';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import { AnimatedComponent } from '../components/ui/AnimatedComponent';
import { EnhancedButton } from '../components/ui/EnhancedButton';
import { MaterialIcons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

const googleClientIds = {
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};

function GoogleSignInButton() {
  const dispatch = useAppDispatch();
  const [request, response, promptAsync] = Google.useAuthRequest({
    ...googleClientIds,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type !== 'success') return;

    const accessToken = response.authentication?.accessToken;
    if (!accessToken) {
      Alert.alert('Google sign-in failed', 'Google did not return an access token. Please try again.');
      return;
    }

    // Use API service to login with Google token
    apiService
      .loginWithToken(accessToken, 'google')
      .then(({ user, token }) => {
        apiService.setAuthToken(token);
        // Remember this user so they can use biometric quick-login next time.
        biometricService.getCapability().then(cap => {
          if (cap.available) {
            biometricService.enable({ user, token });
          }
        });
        dispatch(login(user));
      })
      .catch(error => {
        Alert.alert('Sign-in failed', error.message || 'Please try again.');
      });
  }, [dispatch, response]);

  const handleGoogleLogin = () => {
    if (!request) {
      Alert.alert('Google sign-in setup needed', 'Add the Google OAuth client IDs to your Expo environment before signing in.');
      return;
    }
    void promptAsync();
  };

  return (
    <EnhancedButton
      title="Continue with Google"
      onPress={handleGoogleLogin}
      variant="primary"
      fullWidth
      style={styles.actionBtn}
    />
  );
}

export default function AuthScreen() {
  const dispatch = useAppDispatch();
  const [biometric, setBiometric] = useState<BiometricCapability | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const platformClientId = Platform.OS === 'android'
    ? googleClientIds.androidClientId
    : Platform.OS === 'ios'
      ? googleClientIds.iosClientId
      : undefined;

  // Detect biometric hardware + whether the user previously opted in.
  useEffect(() => {
    let active = true;
    (async () => {
      const [cap, enabled] = await Promise.all([
        biometricService.getCapability(),
        biometricService.isEnabled(),
      ]);
      if (active) {
        setBiometric(cap);
        setBiometricEnabled(enabled);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleBiometricLogin = async () => {
    const result = await biometricService.authenticate('Sign in to GrainCraft');
    if (result.success && result.profile?.user) {
      hapticsService.notify('success');
      const { user, token } = result.profile as { user: any; token?: string };
      if (token) {
        apiService.setAuthToken(token);
      }
      dispatch(login(user));
    } else if (!result.success && result.error) {
      hapticsService.notify('error');
      Alert.alert('Biometric sign-in failed', result.error);
    }
  };

  const handleGuestLogin = () => {
    apiService
      .loginAsGuest()
      .then(({ user, token }) => {
        apiService.setAuthToken(token);
        dispatch(continueAsGuest());
      })
      .catch(error => {
        Alert.alert('Guest login failed', error.message || 'Please try again.');
      });
  };

  const showBiometric = biometric?.available && biometricEnabled;

  return (
    <AppScreen contentStyle={styles.container}>
      <AnimatedComponent type="slideInDown" duration={500}>
        <View style={styles.header}>
          <BrandLogo />
        </View>
      </AnimatedComponent>

      <AnimatedComponent type="slideInUp" delay={100} duration={500}>
        <AppCard variant="warm" style={styles.card}>
          <View style={styles.millBadge}>
            <Text style={styles.millBadgeText}>🌾 FRESH STONE-MILLED FLOUR ON-DEMAND</Text>
          </View>
          <Text style={styles.title}>Welcome to the Grainery</Text>
          <Text style={styles.desc}>
            Sign in once with Google to access your grain vault and keep your account ready on this device.
          </Text>
          <Text style={styles.statusText}>🟢 Bedstone Mill #04 Active • 82°F Cool-Crush</Text>

          {platformClientId ? (
            <GoogleSignInButton />
          ) : (
            <Text style={styles.setupNote}>
              {Platform.OS === 'web'
                ? 'Google sign-in is available in the GrainCraft mobile app.'
                : 'Google sign-in is not configured for this platform. Add its OAuth client ID to your .env file and rebuild the app.'}
            </Text>
          )}

          {showBiometric && (
            <EnhancedButton
              title={`Sign in with ${biometric?.friendlyName}`}
              onPress={handleBiometricLogin}
              variant="secondary"
              fullWidth
              style={styles.biometricBtn}
              icon={
                <MaterialIcons
                  name={biometric?.primaryType === 'face' ? 'face' : 'fingerprint'}
                  size={20}
                  color={theme.colors.primary}
                />
              }
            />
          )}

          <EnhancedButton
            title="Skip for now"
            onPress={handleGuestLogin}
            variant="secondary"
            fullWidth
            style={styles.skipBtn}
          />

          <Text style={styles.privacyNote}>
            Your Google name, email, and profile photo are used to set up your account. We'll ask for delivery details
            when you place your first order.
          </Text>
        </AppCard>
      </AnimatedComponent>

      <AnimatedComponent type="fadeIn" delay={300} duration={600}>
        <View style={styles.features}>
          <FeatureItem icon="🌾" title="Heritage Grains" description="Organic and traditional varieties" />
          <FeatureItem icon="⚙️" title="Stone Milled" description="Fresh ground to order" />
          <FeatureItem icon="🚚" title="Fast Delivery" description="Local delivery available" />
        </View>
      </AnimatedComponent>
    </AppScreen>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center' },
  header: { marginBottom: 20 },
  card: { padding: 20, marginBottom: 24 },
  millBadge: {
    backgroundColor: '#FFE082',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  millBadgeText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  desc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 20,
    fontWeight: '600',
  },
  actionBtn: { marginTop: 12 },
  biometricBtn: { marginTop: 10 },
  skipBtn: { marginTop: 8 },
  privacyNote: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 12,
    lineHeight: 16,
  },
  setupNote: {
    fontSize: 13,
    color: '#EF5350',
    marginTop: 12,
  },
  features: { marginTop: 32, gap: 12 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  featureIcon: { fontSize: 24 },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  featureDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
