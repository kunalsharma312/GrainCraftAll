import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import hapticsService from '../services/hapticsService';
import notificationService from '../services/notificationService';
import { navigationRef, linking, handleNotificationNavigation } from './linking';
import AuthScreen from '../screens/AuthScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import BlendScreen from '../screens/BlendScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import { OrderConfirmationScreen } from '../screens/OrderConfirmationScreen';
import theme from '../theme';
import { useAppSelector } from '../redux/hooks';
import type { MainTabParamList, RootStackParamList } from '../redux/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
type IoniconName = ComponentProps<typeof Ionicons>['name'];

const tabIcons: Record<keyof MainTabParamList, { focused: IoniconName; unfocused: IoniconName }> = {
  Discover: { focused: 'grid', unfocused: 'grid-outline' },
  Blend: { focused: 'color-filter', unfocused: 'color-filter-outline' },
  Cart: { focused: 'cart', unfocused: 'cart-outline' },
  Orders: { focused: 'cube', unfocused: 'cube-outline' },
};

function MainTabNavigator() {
  const cartItems = useAppSelector(state => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tab.Navigator
      screenListeners={{
        tabPress: () => {
          hapticsService.tabChange();
        },
      }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: theme.components.tabBar.height,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.fontSize.caption,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icon = tabIcons[route.name];
          return <Ionicons name={focused ? icon.focused : icon.unfocused} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Blend" component={BlendScreen} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarBadge: cartCount > 0 ? cartCount : undefined }} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  // Respond to notification taps by deep-linking into the relevant screen.
  useEffect(() => {
    const responseSub = notificationService.addResponseListener(response => {
      const data = response.notification.request.content.data as {
        screen?: string;
        orderId?: string;
        productId?: string;
      };
      handleNotificationNavigation(data);
    });

    // Handle the case where the app was launched from a notification tap.
    let active = true;
    notificationService.getLastResponse().then(response => {
      if (active && response) {
        const data = response.notification.request.content.data as {
          screen?: string;
          orderId?: string;
          productId?: string;
        };
        handleNotificationNavigation(data);
      }
    });

    return () => {
      active = false;
      responseSub.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainApp" component={MainTabNavigator} />
            <Stack.Screen 
              name="OrderConfirmation" 
              component={OrderConfirmationScreen}
              options={{
                gestureEnabled: false,
                animation: 'slide_from_right',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
