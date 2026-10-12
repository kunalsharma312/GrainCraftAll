/**
 * Feature Flags
 * ----------------------------------------------------------------------------
 * Single place to turn app capabilities on/off. Nothing is deleted from the
 * codebase - advanced features simply stay dormant until you flip a flag here.
 *
 * PHASE 1 (default): SIMPLE_MODE = true
 *   The app shows a single, no-frills shop: browse grains, add to a cart at the
 *   bottom, fill a short form (address + pincode + mobile), and the order is
 *   emailed to the shop owner. No login, no payment gateway, no blends.
 *
 * LATER PHASES: set SIMPLE_MODE = false to bring back the full experience
 *   (Google auth, custom blends, in-app payment, push notifications, biometric
 *   login, order history, etc.). Each of those can also be toggled on its own.
 *
 * See INTEGRATIONS.md for what each flag needs (env vars, setup) and how to
 * change the design.
 */

export interface FeatureFlags {
  /** Master switch. true = phase-1 simple shop, false = full app. */
  SIMPLE_MODE: boolean;

  // --- Individual capabilities (only relevant when SIMPLE_MODE = false) ---
  /** Google OAuth sign-in on the auth screen. */
  ENABLE_GOOGLE_AUTH: boolean;
  /** Face ID / Touch ID / fingerprint quick login. */
  ENABLE_BIOMETRIC: boolean;
  /** Custom grain blend builder (Blend tab). */
  ENABLE_BLENDS: boolean;
  /** In-app payment sheet (Razorpay/Stripe/demo). */
  ENABLE_PAYMENT: boolean;
  /** Local + push notifications for order updates. */
  ENABLE_NOTIFICATIONS: boolean;
  /** Native share buttons on products and blends. */
  ENABLE_SHARE: boolean;
  /** Haptic feedback on interactions. */
  ENABLE_HAPTICS: boolean;
  /** Order history screen. */
  ENABLE_ORDER_HISTORY: boolean;

  // --- Phase-1 order handling ---
  /**
   * How a placed order is delivered to the shop owner.
   *  'email'   -> send via EmailJS (see INTEGRATIONS.md, no backend needed)
   *  'api'     -> POST to your own backend endpoint
   *  'console' -> just log the order (useful for local testing)
   */
  ORDER_DELIVERY: 'email' | 'api' | 'console';
}

export const featureFlags: FeatureFlags = {
  SIMPLE_MODE: true,

  ENABLE_GOOGLE_AUTH: false,
  ENABLE_BIOMETRIC: false,
  ENABLE_BLENDS: false,
  ENABLE_PAYMENT: false,
  ENABLE_NOTIFICATIONS: false,
  ENABLE_SHARE: false,
  ENABLE_HAPTICS: true,
  ENABLE_ORDER_HISTORY: false,

  ORDER_DELIVERY: 'email',
};

/** Convenience helper: is a given feature currently on? */
export function isEnabled(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag] === true;
}

export default featureFlags;
