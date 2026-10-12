import { Share, Platform } from 'react-native';

/**
 * Share Service
 *
 * Uses React Native's built-in Share API (available on iOS + Android) to let
 * users share products, custom blends, and orders via the native share sheet.
 * A deep link is embedded in each message so recipients can open the item
 * directly in the app (see linkingConfig in the navigator).
 *
 * All methods resolve to a boolean indicating whether the share completed,
 * and never throw - a failed/cancelled share should never break the UI.
 */

const APP_SCHEME = 'com.graincraftapp.mobile';
const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://graincraftapp.com';

export interface ShareableProduct {
  id: string;
  name: string;
  subtitle?: string;
  price?: number;
}

export interface ShareableBlend {
  id?: string;
  name: string;
  ingredients?: { name: string; percentage: number }[];
  price?: number;
}

export interface ShareableOrder {
  id: string;
  total: number;
  status?: string;
}

class ShareService {
  private get isSupported(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /** Build an app deep link, e.g. com.graincraftapp.mobile://product/123 */
  buildDeepLink(path: string): string {
    return `${APP_SCHEME}://${path.replace(/^\//, '')}`;
  }

  /** Build a web fallback URL for recipients without the app installed. */
  buildWebLink(path: string): string {
    return `${WEB_BASE_URL}/${path.replace(/^\//, '')}`;
  }

  private async open(message: string, title: string, url?: string): Promise<boolean> {
    if (!this.isSupported) return false;
    try {
      // iOS supports a dedicated `url` field; Android folds it into `message`.
      const content =
        Platform.OS === 'ios' && url
          ? { message, url, title }
          : { message: url ? `${message}\n\n${url}` : message, title };

      const result = await Share.share(content, {
        dialogTitle: title,
        subject: title,
      });
      return result.action === Share.sharedAction;
    } catch {
      return false;
    }
  }

  /** Share a single product. */
  async shareProduct(product: ShareableProduct): Promise<boolean> {
    const priceText = product.price != null ? ` — $${product.price.toFixed(2)}` : '';
    const message = `Check out ${product.name}${priceText} on GrainCraft! 🌾${
      product.subtitle ? `\n${product.subtitle}` : ''
    }`;
    const url = this.buildWebLink(`product/${product.id}`);
    return this.open(message, `Share ${product.name}`, url);
  }

  /** Share a custom blend, including its composition. */
  async shareBlend(blend: ShareableBlend): Promise<boolean> {
    const composition = blend.ingredients?.length
      ? '\n\nBlend recipe:\n' +
        blend.ingredients
          .map(i => `• ${i.name}: ${i.percentage}%`)
          .join('\n')
      : '';
    const priceText = blend.price != null ? `\nPrice: $${blend.price.toFixed(2)}` : '';
    const message = `I crafted "${blend.name}" on GrainCraft 🌾${composition}${priceText}`;
    const url = blend.id ? this.buildWebLink(`blend/${blend.id}`) : this.buildWebLink('blend');
    return this.open(message, `Share ${blend.name}`, url);
  }

  /** Share an order status / tracking link. */
  async shareOrder(order: ShareableOrder): Promise<boolean> {
    const shortId = order.id.slice(-6).toUpperCase();
    const statusText = order.status ? ` (${order.status})` : '';
    const message = `My GrainCraft order #${shortId}${statusText} — $${order.total.toFixed(
      2
    )} of freshly milled grains! 🌾`;
    const url = this.buildWebLink(`orders/${order.id}`);
    return this.open(message, `Share order #${shortId}`, url);
  }

  /** Generic app referral share. */
  async shareApp(): Promise<boolean> {
    const message =
      'Get fresh stone-milled flour delivered with GrainCraft 🌾 Heritage grains, milled to order.';
    return this.open(message, 'Share GrainCraft', this.buildWebLink(''));
  }
}

export const shareService = new ShareService();
export default shareService;
