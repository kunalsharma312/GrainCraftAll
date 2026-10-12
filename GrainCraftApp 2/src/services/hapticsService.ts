import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Haptics Service
 *
 * Thin, safe wrapper around expo-haptics. Every call is guarded so that a
 * missing capability (e.g. web, older device, or disabled setting) never
 * throws or interrupts the user flow. Haptics are a progressive enhancement:
 * if they fail, the app keeps working exactly as before.
 */

type ImpactStyle = 'light' | 'medium' | 'heavy';
type NotificationType = 'success' | 'warning' | 'error';

class HapticsService {
  private enabled = true;

  /** Haptics only make sense on physical iOS/Android devices. */
  private get isSupported(): boolean {
    return this.enabled && (Platform.OS === 'ios' || Platform.OS === 'android');
  }

  /** Allow the user to turn haptics off from a settings screen. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** A light tap - good for selection changes and minor UI feedback. */
  async selection(): Promise<void> {
    if (!this.isSupported) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Silently ignore - haptics are non-critical.
    }
  }

  /** Physical impact feedback. Use for button presses and add-to-cart. */
  async impact(style: ImpactStyle = 'medium'): Promise<void> {
    if (!this.isSupported) return;
    try {
      const map: Record<ImpactStyle, Haptics.ImpactFeedbackStyle> = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      await Haptics.impactAsync(map[style]);
    } catch {
      // Ignore.
    }
  }

  /** Semantic feedback for the outcome of an action (order placed, error). */
  async notify(type: NotificationType = 'success'): Promise<void> {
    if (!this.isSupported) return;
    try {
      const map: Record<NotificationType, Haptics.NotificationFeedbackType> = {
        success: Haptics.NotificationFeedbackType.Success,
        warning: Haptics.NotificationFeedbackType.Warning,
        error: Haptics.NotificationFeedbackType.Error,
      };
      await Haptics.notificationAsync(map[type]);
    } catch {
      // Ignore.
    }
  }

  // ---- Semantic helpers used across the app ----

  /** Item added to the cart. */
  addToCart(): Promise<void> {
    return this.impact('medium');
  }

  /** Order successfully placed. */
  orderSuccess(): Promise<void> {
    return this.notify('success');
  }

  /** Payment or validation failure. */
  actionFailed(): Promise<void> {
    return this.notify('error');
  }

  /** Tab / segment change. */
  tabChange(): Promise<void> {
    return this.selection();
  }

  /** Primary button press. */
  buttonPress(): Promise<void> {
    return this.impact('light');
  }
}

export const hapticsService = new HapticsService();
export default hapticsService;
