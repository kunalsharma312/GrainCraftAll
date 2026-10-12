import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Biometric Authentication Service
 *
 * Wraps expo-local-authentication to enable Face ID / Touch ID / fingerprint
 * quick sign-in. The flow:
 *   1. After a successful normal login, call enable() to remember that the
 *      user opted into biometric login (a flag + minimal profile is stored).
 *   2. On the auth screen, if isEnabled() is true and hardware is available,
 *      offer a "Sign in with Face ID / fingerprint" shortcut.
 *   3. authenticate() runs the native prompt and, on success, returns the
 *      stored profile so the caller can restore the session.
 *
 * Security note: this stores only a lightweight profile locally to restore a
 * session after a successful device-level biometric check. It is not a
 * replacement for server-side auth tokens.
 */

const BIOMETRIC_ENABLED_KEY = 'graincraft.biometric.enabled.v1';
const BIOMETRIC_PROFILE_KEY = 'graincraft.biometric.profile.v1';

export type BiometricType = 'face' | 'fingerprint' | 'iris' | 'none';

export interface BiometricCapability {
  hasHardware: boolean;
  isEnrolled: boolean;
  available: boolean;
  primaryType: BiometricType;
  friendlyName: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  profile?: Record<string, unknown> | null;
}

class BiometricService {
  private get isSupported(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /** Inspect what biometric hardware is available and enrolled. */
  async getCapability(): Promise<BiometricCapability> {
    const fallback: BiometricCapability = {
      hasHardware: false,
      isEnrolled: false,
      available: false,
      primaryType: 'none',
      friendlyName: 'Biometrics',
    };

    if (!this.isSupported) return fallback;

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let primaryType: BiometricType = 'none';
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        primaryType = 'face';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        primaryType = 'fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        primaryType = 'iris';
      }

      return {
        hasHardware,
        isEnrolled,
        available: hasHardware && isEnrolled,
        primaryType,
        friendlyName: this.friendlyName(primaryType),
      };
    } catch {
      return fallback;
    }
  }

  private friendlyName(type: BiometricType): string {
    switch (type) {
      case 'face':
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock';
      case 'fingerprint':
        return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      case 'iris':
        return 'Iris';
      default:
        return 'Biometrics';
    }
  }

  /** Run the native biometric prompt. Returns success + stored profile. */
  async authenticate(promptMessage?: string): Promise<BiometricAuthResult> {
    if (!this.isSupported) {
      return { success: false, error: 'Biometrics not supported on this platform.' };
    }

    try {
      const capability = await this.getCapability();
      if (!capability.available) {
        return {
          success: false,
          error: capability.hasHardware
            ? 'No biometrics enrolled on this device.'
            : 'This device has no biometric hardware.',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || `Sign in with ${capability.friendlyName}`,
        cancelLabel: 'Use another method',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const profile = await this.getStoredProfile();
        return { success: true, profile };
      }

      return {
        success: false,
        error: 'error' in result ? String(result.error) : 'Authentication cancelled.',
      };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Biometric authentication failed.' };
    }
  }

  /**
   * Enable biometric login and remember a lightweight profile so a future
   * biometric success can restore the session.
   */
  async enable(profile: Record<string, unknown>): Promise<boolean> {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      await AsyncStorage.setItem(BIOMETRIC_PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch {
      return false;
    }
  }

  /** Turn off biometric login and clear the stored profile. */
  async disable(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([BIOMETRIC_ENABLED_KEY, BIOMETRIC_PROFILE_KEY]);
    } catch {
      // Ignore.
    }
  }

  async isEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return value === 'true';
    } catch {
      return false;
    }
  }

  private async getStoredProfile(): Promise<Record<string, unknown> | null> {
    try {
      const raw = await AsyncStorage.getItem(BIOMETRIC_PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

export const biometricService = new BiometricService();
export default biometricService;
