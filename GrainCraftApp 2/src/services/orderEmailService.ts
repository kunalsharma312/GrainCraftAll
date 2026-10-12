import { featureFlags } from '../config/featureFlags';
import { appConfig } from '../config/appConfig';

/**
 * Order Email Service (Phase 1)
 * ----------------------------------------------------------------------------
 * Delivers a placed order to the shop owner. The delivery channel is chosen by
 * featureFlags.ORDER_DELIVERY:
 *   'email'   -> EmailJS REST API (no backend, free tier). See INTEGRATIONS.md.
 *   'api'     -> POST to your own backend endpoint.
 *   'console' -> log only (local testing).
 *
 * EmailJS is used via its REST endpoint so we don't need a native SDK. You
 * configure it entirely from environment variables:
 *   EXPO_PUBLIC_EMAILJS_SERVICE_ID
 *   EXPO_PUBLIC_EMAILJS_TEMPLATE_ID
 *   EXPO_PUBLIC_EMAILJS_PUBLIC_KEY
 *   EXPO_PUBLIC_SHOP_OWNER_EMAIL   (where orders are sent)
 *
 * If nothing is configured, the service falls back to 'console' so the app
 * never crashes during development.
 */

export interface SimpleOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface SimpleCustomer {
  address: string;
  pincode: string;
  /** Local number only (e.g. 10 digits for India); country code added here. */
  mobile: string;
}

export interface SimpleOrder {
  items: SimpleOrderItem[];
  customer: SimpleCustomer;
  /** Items subtotal before delivery. */
  subtotal?: number;
  /** Delivery/shipping charge (0 when free). */
  deliveryCharge?: number;
  /** Grand total (subtotal + delivery). */
  total: number;
  placedAt: string;
}

export interface OrderResult {
  success: boolean;
  channel: 'email' | 'api' | 'console';
  error?: string;
}

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

class OrderEmailService {
  private get env() {
    return {
      serviceId: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID,
      templateId: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID,
      publicKey: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY,
      ownerEmail: process.env.EXPO_PUBLIC_SHOP_OWNER_EMAIL,
      apiUrl: process.env.EXPO_PUBLIC_ORDER_API_URL,
    };
  }

  /** Human-readable summary of the order, reused across channels. */
  private buildSummary(order: SimpleOrder): string {
    const lines = order.items
      .map(
        item =>
          `- ${item.name} — ${item.quantity} kg = ${appConfig.currencySymbol}${(
            item.price * item.quantity
          ).toFixed(2)}`
      )
      .join('\n');

    const sym = appConfig.currencySymbol;
    const hasBreakdown = order.subtotal != null && order.deliveryCharge != null;

    return [
      `New ${appConfig.shopName} order`,
      '',
      'ITEMS:',
      lines,
      '',
      ...(hasBreakdown
        ? [
            `Subtotal: ${sym}${order.subtotal!.toFixed(2)}`,
            `Delivery: ${
              order.deliveryCharge! > 0 ? `${sym}${order.deliveryCharge!.toFixed(2)}` : 'FREE'
            }`,
          ]
        : []),
      `TOTAL: ${sym}${order.total.toFixed(2)}`,
      '',
      'DELIVER TO:',
      `Address: ${order.customer.address}`,
      `Pincode: ${order.customer.pincode}`,
      `Mobile: ${appConfig.phoneCountryCode} ${order.customer.mobile}`,
      '',
      `Placed at: ${order.placedAt}`,
    ].join('\n');
  }

  /** Place an order through the configured channel. */
  async placeOrder(order: SimpleOrder): Promise<OrderResult> {
    const channel = featureFlags.ORDER_DELIVERY;

    try {
      if (channel === 'email') {
        return await this.sendViaEmailJs(order);
      }
      if (channel === 'api') {
        return await this.sendViaApi(order);
      }
      return this.logToConsole(order);
    } catch (error: any) {
      // Never let a delivery failure crash the checkout; fall back to console.
      this.logToConsole(order);
      return {
        success: false,
        channel,
        error: error?.message || 'Failed to submit order',
      };
    }
  }

  private async sendViaEmailJs(order: SimpleOrder): Promise<OrderResult> {
    const { serviceId, templateId, publicKey, ownerEmail } = this.env;

    if (!serviceId || !templateId || !publicKey) {
      // Not configured yet - fall back so the flow still works in dev.
      this.logToConsole(order);
      return {
        success: false,
        channel: 'email',
        error:
          'EmailJS is not configured. Set EXPO_PUBLIC_EMAILJS_* env vars (see INTEGRATIONS.md).',
      };
    }

    const summary = this.buildSummary(order);
    const itemsText = order.items
      .map(i => `${i.name} (${i.quantity} kg)`)
      .join(', ');

    // These keys map to variables inside your EmailJS template.
    const templateParams = {
      to_email: ownerEmail || '',
      shop_name: appConfig.shopName,
      order_summary: summary,
      items: itemsText,
      subtotal:
        order.subtotal != null ? `${appConfig.currencySymbol}${order.subtotal.toFixed(2)}` : '',
      delivery:
        order.deliveryCharge != null
          ? order.deliveryCharge > 0
            ? `${appConfig.currencySymbol}${order.deliveryCharge.toFixed(2)}`
            : 'FREE'
          : '',
      total: `${appConfig.currencySymbol}${order.total.toFixed(2)}`,
      address: order.customer.address,
      pincode: order.customer.pincode,
      mobile: `${appConfig.phoneCountryCode} ${order.customer.mobile}`,
      placed_at: order.placedAt,
    };

    const response = await fetch(EMAILJS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`EmailJS responded ${response.status}: ${text}`);
    }

    return { success: true, channel: 'email' };
  }

  private async sendViaApi(order: SimpleOrder): Promise<OrderResult> {
    const { apiUrl } = this.env;
    if (!apiUrl) {
      this.logToConsole(order);
      return {
        success: false,
        channel: 'api',
        error: 'EXPO_PUBLIC_ORDER_API_URL is not set (see INTEGRATIONS.md).',
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error(`Order API responded ${response.status}`);
    }

    return { success: true, channel: 'api' };
  }

  private logToConsole(order: SimpleOrder): OrderResult {
    // eslint-disable-next-line no-console
    console.log('[ORDER]\n' + this.buildSummary(order));
    return { success: true, channel: 'console' };
  }
}

export const orderEmailService = new OrderEmailService();
export default orderEmailService;
