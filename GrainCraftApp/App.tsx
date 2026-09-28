import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/redux/store';
import { restoreSession } from './src/redux/slices/authSlice';
import theme from './src/theme';

const AUTH_STORAGE_KEY = 'graincraft.auth-session.v1';

function AppContent() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(AUTH_STORAGE_KEY)
      .then(savedSession => {
        if (savedSession) {
          try {
            store.dispatch(restoreSession(JSON.parse(savedSession)));
          } catch {
            return AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsReady(true);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const { user, addresses, isGuest } = store.getState().auth;
    if (!user || isGuest) {
      AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => undefined);
      return;
    }
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, addresses, isGuest: false })).catch(() => undefined);
  }, [isReady]);

  useEffect(() => store.subscribe(() => {
    if (!isReady) return;
    const { user, addresses, isGuest } = store.getState().auth;
    if (!user || isGuest) {
      AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => undefined);
      return;
    }
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, addresses, isGuest: false })).catch(() => undefined);
  }), [isReady]);

  if (!isReady) {
    return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.colors.background }}><ActivityIndicator color={theme.colors.primary} /></View>;
  }

  return <AppNavigator />;
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
