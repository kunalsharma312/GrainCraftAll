import { useEffect } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAppDispatch } from '../redux/hooks';
import { continueAsGuest, login } from '../redux/slices/authSlice';
import theme from '../theme';
import BrandLogo from '../components/BrandLogo';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';

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

    fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async result => {
        if (!result.ok) throw new Error('Google profile could not be loaded.');
        return result.json();
      })
      .then(profile => {
        if (!profile.id || !profile.email) throw new Error('Google did not provide an email address.');
        dispatch(login({ id: profile.id, name: profile.name || profile.email, email: profile.email, photo: profile.picture }));
      })
      .catch(error => Alert.alert('Google sign-in failed', error instanceof Error ? error.message : 'Please try again.'));
  }, [dispatch, response]);

  const handleGoogleLogin = () => {
    if (!request) {
      Alert.alert('Google sign-in setup needed', 'Add the Google OAuth client IDs to your Expo environment before signing in.');
      return;
    }
    void promptAsync();
  };

  return <PrimaryButton title="Continue with Google" onPress={handleGoogleLogin} style={styles.actionBtn} />;
}

export default function AuthScreen() {
  const dispatch = useAppDispatch();
  const platformClientId = Platform.OS === 'android'
    ? googleClientIds.androidClientId
    : Platform.OS === 'ios'
      ? googleClientIds.iosClientId
      : undefined;

  return (
    <AppScreen contentStyle={styles.container}>
      <View style={styles.header}>
        <BrandLogo />
      </View>

      <AppCard variant="warm" style={styles.card}>
        <View style={styles.millBadge}>
          <Text style={styles.millBadgeText}>🌾 FRESH STONE-MILLED FLOUR ON-DEMAND</Text>
        </View>
        <Text style={styles.title}>Welcome to the Grainery</Text>
        <Text style={styles.desc}>Sign in once with Google to access your grain vault and keep your account ready on this device.</Text>
        <Text style={styles.statusText}>🟢 Bedstone Mill #04 Active • 82°F Cool-Crush</Text>

        {platformClientId ? (
          <GoogleSignInButton />
        ) : (
          <Text style={styles.setupNote}>{Platform.OS === 'web' ? 'Google sign-in is available in the GrainCraft mobile app.' : 'Google sign-in is not configured for this platform. Add its OAuth client ID to your .env file and rebuild the app.'}</Text>
        )}
        <PrimaryButton title="Skip for now" onPress={() => dispatch(continueAsGuest())} variant="text" style={styles.skipBtn} />
        <Text style={styles.privacyNote}>Your Google name, email, and profile photo are used to set up your account. We’ll ask for delivery details when you place your first order.</Text>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center' },
  header: { marginBottom: 20 },
  card: { padding: 20 },
  millBadge: { backgroundColor: theme.colors.surfaceTint, padding: 6, borderRadius: theme.components.badge.borderRadius, alignSelf: 'flex-start', marginBottom: 10 },
  millBadgeText: { fontSize: theme.typography.fontSize.label, color: theme.colors.primary, fontWeight: theme.typography.fontWeight.bold },
  title: { fontSize: theme.typography.fontSize.display, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, marginBottom: 8 },
  desc: { fontSize: theme.typography.fontSize.bodySmall, color: theme.colors.detail, marginBottom: 12 },
  statusText: { fontSize: theme.typography.fontSize.small, color: theme.colors.success, marginBottom: 20, fontWeight: theme.typography.fontWeight.medium },
  actionBtn: { marginTop: 10 },
  skipBtn: { marginTop: 8 },
  privacyNote: { fontSize: theme.typography.fontSize.caption, color: theme.colors.textSecondary, marginTop: 12 },
  setupNote: { fontSize: theme.typography.fontSize.bodySmall, color: theme.colors.error, marginTop: 12 },
});
