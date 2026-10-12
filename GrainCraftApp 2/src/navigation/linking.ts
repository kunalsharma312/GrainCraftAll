import { createNavigationContainerRef } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '../redux/types';

/**
 * Navigation ref + deep linking configuration.
 *
 * The ref lets non-component code (e.g. notification tap handlers) drive
 * navigation. The linking config maps URLs / app-scheme deep links onto the
 * navigator so that both external links and notification payloads resolve to
 * the correct screen.
 *
 * Scheme: com.graincraftapp.mobile://
 *   .../orders            -> Orders tab
 *   .../orders/:id        -> Orders tab (id available via route params)
 *   .../product/:id       -> Discover tab
 *   .../blend             -> Blend tab
 *   .../cart              -> Cart tab
 */

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const prefixes = [
  Linking.createURL('/'),
  'com.graincraftapp.mobile://',
  'https://graincraftapp.com',
];

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes,
  config: {
    screens: {
      Auth: 'auth',
      MainApp: {
        screens: {
          Discover: {
            path: 'product/:productId?',
            parse: { productId: (v: string) => v },
          },
          Blend: 'blend',
          Cart: 'cart',
          Orders: {
            path: 'orders/:orderId?',
            parse: { orderId: (v: string) => v },
          },
        },
      },
    },
  },
};

/** Safely navigate to a tab if the navigator is ready. */
export function navigateToTab(
  tab: 'Discover' | 'Blend' | 'Cart' | 'Orders',
  params?: Record<string, unknown>
): void {
  if (navigationRef.isReady()) {
    // @ts-expect-error nested navigation into the tab navigator
    navigationRef.navigate('MainApp', { screen: tab, params });
  }
}

/**
 * Map a notification data payload's `screen` field to an actual navigation.
 * Called from the notification response listener.
 */
export function handleNotificationNavigation(data: {
  screen?: string;
  orderId?: string;
  productId?: string;
}): void {
  if (!data) return;
  switch (data.screen) {
    case 'Orders':
      navigateToTab('Orders', data.orderId ? { orderId: data.orderId } : undefined);
      break;
    case 'Discover':
      navigateToTab('Discover', data.productId ? { productId: data.productId } : undefined);
      break;
    case 'Blend':
      navigateToTab('Blend');
      break;
    case 'Cart':
      navigateToTab('Cart');
      break;
    default:
      break;
  }
}
