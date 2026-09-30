import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

/**
 * Notification Service
 *
 * Wraps expo-notifications to provide:
 *  - Permission handling (with graceful degradation on simulators / web)
 *  - Push token registration for server-driven notifications
 *  - Local notifications for order lifecycle events
 *  - Listener registration for foreground receipt and tap responses
 *
 * All methods are defensive: on unsupported platforms or when permission is
 * denied they no-op rather than throw, so the checkout flow is never blocked.
 */

export type OrderNotificationType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_milling'
  | 'order_out_for_delivery'
  | 'order_delivered'
  | 'order_cancelled';

export interface NotificationData {
  type: OrderNotificationType | string;
  orderId?: string;
  productId?: string;
  screen?: string;
  [key: string]: unknown;
}

// Show alerts + play sound even while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ANDROID_CHANNEL_ID = 'graincraft-orders';

class NotificationService {
  private pushToken: string | null = null;
  private permissionGranted = false;

  private get isSupported(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Request permission and register for a push token.
   * Call once after the user authenticates.
   */
  async initialize(): Promise<{ granted: boolean; token: string | null }> {
    if (!this.isSupported) {
      return { granted: false, token: null };
    }

    try {
      await this.configureAndroidChannel();

      const granted = await this.requestPermissions();
      this.permissionGranted = granted;

      if (!granted) {
        return { granted: false, token: null };
      }

      const token = await this.registerForPushToken();
      return { granted: true, token };
    } catch {
      return { granted: false, token: null };
    }
  }

  private async configureAndroidChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'Order Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2E7D32',
        sound: 'default',
      });
    } catch {
      // Ignore channel setup failures.
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isSupported) return false;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Register for an Expo push token. Requires a physical device.
   * The token should be sent to the backend to enable server push.
   */
  private async registerForPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
      // Push tokens are not available on simulators/emulators.
      return null;
    }
    try {
      const projectId =
        (Notifications as any)?.easConfig?.projectId ??
        process.env.EXPO_PUBLIC_PROJECT_ID;

      const tokenResponse = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );
      this.pushToken = tokenResponse.data;
      return this.pushToken;
    } catch {
      return null;
    }
  }

  getPushToken(): string | null {
    return this.pushToken;
  }

  hasPermission(): boolean {
    return this.permissionGranted;
  }

  /**
   * Fire a local notification immediately (or after `delaySeconds`).
   * Used to confirm order actions without requiring the backend.
   */
  async sendLocal(
    title: string,
    body: string,
    data: NotificationData,
    delaySeconds = 0
  ): Promise<string | null> {
    if (!this.isSupported || !this.permissionGranted) return null;
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data as Record<string, unknown>,
          sound: 'default',
        },
        trigger:
          delaySeconds > 0
            ? { seconds: delaySeconds, channelId: ANDROID_CHANNEL_ID }
            : null,
      });
      return id;
    } catch {
      return null;
    }
  }

  /** Convenience: notify the user their order was placed. */
  notifyOrderPlaced(orderId: string, total: number): Promise<string | null> {
    return this.sendLocal(
      '🌾 Order Confirmed!',
      `Your order #${orderId.slice(-6).toUpperCase()} for $${total.toFixed(
        2
      )} is being milled fresh. We'll keep you posted.`,
      { type: 'order_placed', orderId, screen: 'Orders' }
    );
  }

  /** Convenience: schedule a simulated status update after a delay. */
  scheduleOrderStatus(
    orderId: string,
    type: OrderNotificationType,
    delaySeconds: number
  ): Promise<string | null> {
    const messages: Record<OrderNotificationType, { title: string; body: string }> = {
      order_placed: { title: '🌾 Order Confirmed!', body: 'Your order is confirmed.' },
      order_confirmed: {
        title: '✅ Order Accepted',
        body: `Order #${orderId.slice(-6).toUpperCase()} accepted by the mill.`,
      },
      order_milling: {
        title: '⚙️ Milling in Progress',
        body: 'Your grains are being stone-milled fresh right now.',
      },
      order_out_for_delivery: {
        title: '🚚 Out for Delivery',
        body: `Order #${orderId.slice(-6).toUpperCase()} is on its way to you!`,
      },
      order_delivered: {
        title: '📦 Delivered',
        body: 'Enjoy your freshly milled grains! Tap to rate your order.',
      },
      order_cancelled: {
        title: '❌ Order Cancelled',
        body: `Order #${orderId.slice(-6).toUpperCase()} has been cancelled.`,
      },
    };

    const message = messages[type];
    return this.sendLocal(message.title, message.body, { type, orderId, screen: 'Orders' }, delaySeconds);
  }

  /** Cancel a scheduled notification (e.g. if an order is cancelled). */
  async cancel(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
      // Ignore.
    }
  }

  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // Ignore.
    }
  }

  /** Clear the app icon badge count. */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch {
      // Ignore.
    }
  }

  /**
   * Listen for notifications received while the app is foregrounded.
   * Returns a subscription; call `.remove()` to clean up.
   */
  addReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Listen for the user tapping a notification.
   * Use this to deep-link into the relevant screen.
   */
  addResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Returns the notification response that launched the app (if the app was
   * cold-started by tapping a notification), otherwise null.
   */
  async getLastResponse(): Promise<Notifications.NotificationResponse | null> {
    try {
      return await Notifications.getLastNotificationResponseAsync();
    } catch {
      return null;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
