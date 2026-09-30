import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/redux/store';
import { restoreSession } from './src/redux/slices/authSlice';
import { restoreCart } from './src/redux/slices/cartSlice';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { SplashScreen } from './src/components/SplashScreen';
import { cartService } from './src/services/cartService';
import { cacheService } from './src/services/cacheService';
import { analyticsService } from './src/services/analyticsService';
import notificationService from './src/services/notificationService';
import { featureFlags } from './src/config/featureFlags';
import SimpleHomeScreen from './src/screens/SimpleHomeScreen';
import theme from './src/theme';

const AUTH_STORAGE_KEY = 'graincraft.auth-session.v1';

function AppContent() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    const initializeApp = async () => {
      try {
        // Restore user session
        const savedSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (savedSession && active) {
          try {
            store.dispatch(restoreSession(JSON.parse(savedSession)));
          } catch (error) {
            console.error('Failed to restore session:', error);
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }

        // Restore cart
        const savedCart = await cartService.loadCart();
        if (savedCart && active) {
          store.dispatch(restoreCart(savedCart));
        }

        // Clear expired cache
        await cacheService.clearExpiredCache();

        // Request notification permission + register push token (non-blocking).
        // Skipped in phase-1 simple mode or when notifications are disabled.
        if (!featureFlags.SIMPLE_MODE && featureFlags.ENABLE_NOTIFICATIONS) {
          notificationService
            .initialize()
            .then(({ granted, token }) => {
              analyticsService.info(
                'NOTIFICATIONS',
                `Permission ${granted ? 'granted' : 'denied'}${token ? ', token registered' : ''}`
              );
            })
            .catch(() => undefined);
        }

        // Log app startup
        analyticsService.info('APP', 'Application started');

      } catch (error) {
        console.error('Error initializing app:', error);
        analyticsService.error('APP', 'Error initializing app', error as Error);
      } finally {
        if (active) {
          // Simulate loading for smoother transition
          setTimeout(() => setIsReady(true), 1000);
        }
      }
    };

    initializeApp();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const unsubscribe = store.subscribe(() => {
      const { user, addresses, isGuest } = store.getState().auth;
      const { items: cartItems } = store.getState().cart;

      // Save user session
      if (!user || isGuest) {
        AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => undefined);
      } else {
        AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ user, addresses, isGuest: false })
        ).catch(() => undefined);
      }

      // Save cart
      if (cartItems.length > 0) {
        cartService.saveCart(cartItems).catch(() => undefined);
      }
    });

    return unsubscribe;
  }, [isReady]);

  return (
    <>
      <SplashScreen isVisible={!isReady} />
      {isReady && (
        <ErrorBoundary>
          {/* Phase 1: simple shop. Flip featureFlags.SIMPLE_MODE to false for the full app. */}
          {featureFlags.SIMPLE_MODE ? <SimpleHomeScreen /> : <AppNavigator />}
        </ErrorBoundary>
      )}
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
