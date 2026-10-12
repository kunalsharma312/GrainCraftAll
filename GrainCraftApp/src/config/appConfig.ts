/**
 * App / Design Configuration
 * ----------------------------------------------------------------------------
 * Change the look and basic content of the phase-1 shop from ONE place. No need
 * to hunt through screens. See INTEGRATIONS.md -> "Changing the design".
 *
 * Colors here intentionally mirror the existing theme so the simple shop and
 * the full app look consistent, but you can override any of them freely.
 */

export interface AppConfig {
  /** Shop name shown in the header. */
  shopName: string;
  /** Short tagline under the shop name. */
  tagline: string;
  /** Currency symbol used for all prices. */
  currencySymbol: string;
  /** Country dial code shown before the mobile input (phase-1 form). */
  phoneCountryCode: string;
  /** Required length of the local mobile number (India = 10). */
  phoneLocalDigits: number;

  /** Delivery/shipping charge (in currency units) applied below the free-delivery threshold. */
  deliveryCharge: number;
  /** Order subtotal at/above which delivery is free. */
  freeDeliveryThreshold: number;

  /**
   * Info banners shown on the homepage below the header. Edit / add / remove
   * freely - they render as a horizontally scrolling strip.
   */
  banners: Array<{
    emoji: string;
    title: string;
    subtitle: string;
  }>;

  /**
   * Category filter chips on the homepage. `key` matches an item's `category`
   * field in mockData.json ('wheat' | 'millet' | 'flour'); 'all' shows everything.
   */
  categories: Array<{ key: string; label: string; emoji: string }>;

  /** Featured hero card shown at the top of the homepage. */
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    image: string;
  };

  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    accentSoft: string;
    heroTint: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    successSoft: string;
    danger: string;
    cartBar: string;
    star: string;
  };

  layout: {
    radius: number;
    cardRadius: number;
    spacing: number;
  };
}

export const appConfig: AppConfig = {
  shopName: 'GrainCraft',
  tagline: 'Fresh stone-milled grains, delivered',
  currencySymbol: '₹',
  phoneCountryCode: '+91',
  phoneLocalDigits: 10,

  deliveryCharge: 50,
  freeDeliveryThreshold: 500,

  banners: [
    {
      emoji: '🌾',
      title: 'Freshly chakki-milled',
      subtitle: 'Ground to order, never stored long',
    },
    {
      emoji: '🚚',
      title: 'Free delivery over ₹500',
      subtitle: 'Doorstep delivery in your city',
    },
    {
      emoji: '💵',
      title: 'Cash on delivery',
      subtitle: 'Pay when you receive your order',
    },
    {
      emoji: '📍',
      title: 'Wheat from MP, Punjab & more',
      subtitle: 'Pick your favourite regional atta',
    },
  ],

  categories: [
    { key: 'all', label: 'All', emoji: '🍽️' },
    { key: 'wheat', label: 'Wheat Atta', emoji: '🌾' },
    { key: 'millet', label: 'Millets', emoji: '🌱' },
    { key: 'flour', label: 'Flours', emoji: '🥣' },
  ],

  hero: {
    badge: '🌾 Milled fresh today',
    title: 'Chakki-fresh atta,\ndelivered to your door',
    subtitle: 'Heritage grains from MP, Punjab & Rajasthan',
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Wheat%20and%20wheat%20based%20foods.jpg?width=800',
  },

  colors: {
    primary: '#8B4513',
    primaryDark: '#5C2E0D',
    accent: '#C9822E',
    accentSoft: '#F6E7D2',
    heroTint: '#FDF6EC',
    background: '#FBF8F3',
    surface: '#FFFFFF',
    text: '#2C1D0C',
    textMuted: '#7A6A57',
    border: '#EDE6DC',
    success: '#2E7D32',
    successSoft: '#E7F3E8',
    danger: '#C62828',
    cartBar: '#5C2E0D',
    star: '#F5A623',
  },

  layout: {
    radius: 10,
    cardRadius: 14,
    spacing: 16,
  },
};

export default appConfig;
