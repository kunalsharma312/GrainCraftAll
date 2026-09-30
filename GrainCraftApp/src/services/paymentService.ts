/**
 * Payment Service
 * Handles payment processing via Razorpay/Stripe
 */

import { Order, UserProfile } from './types';

export interface PaymentInitRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
}

export interface PaymentResponse {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  signature?: string;
  error?: string;
  message?: string;
}

export interface PaymentVerificationRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: 'razorpay' | 'stripe' | 'upi' | 'wallet';
  status: PaymentStatus;
  transactionId?: string;
  signature?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

class PaymentService {
  private apiBase = process.env.EXPO_PUBLIC_API_URL || '';
  private razorpayKeyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';

  /**
   * Initialize payment order with backend
   */
  async initializePayment(request: PaymentInitRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiBase}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Payment initialization failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        orderId: data.orderId,
        paymentId: data.paymentId,
      };
    } catch (error) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize payment',
      };
    }
  }

  /**
   * Verify payment signature after successful transaction
   */
  async verifyPayment(request: PaymentVerificationRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiBase}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Payment verification failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: data.valid === true,
        orderId: data.orderId,
        paymentId: data.paymentId,
        message: data.message || 'Payment verified successfully',
        error: data.error,
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify payment',
      };
    }
  }

  /**
   * Get payment record for order
   */
  async getPaymentRecord(orderId: string): Promise<PaymentRecord | null> {
    try {
      const response = await fetch(`${this.apiBase}/payments/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment record: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment record:', error);
      return null;
    }
  }

  /**
   * Create refund for order
   */
  async createRefund(orderId: string, amount: number, reason: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiBase}/payments/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error(`Refund creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Refund initiated successfully',
      };
    } catch (error) {
      console.error('Refund error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create refund',
      };
    }
  }

  /**
   * Get payment methods available
   */
  async getPaymentMethods(): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiBase}/payments/methods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment methods: ${response.statusText}`);
      }

      const data = await response.json();
      return data.methods || ['razorpay', 'upi', 'wallet'];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return ['razorpay', 'upi', 'wallet'];
    }
  }

  /**
   * Format amount for payment (paise/cents)
   */
  formatAmountForPayment(amount: number, currency: string = 'INR'): number {
    // Razorpay expects amount in paise (1 INR = 100 paise)
    if (currency === 'INR') {
      return Math.round(amount * 100);
    }
    // Stripe expects amount in cents (1 USD = 100 cents)
    return Math.round(amount * 100);
  }

  /**
   * Format amount for display
   */
  formatAmountForDisplay(amount: number, currency: string = 'INR'): string {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(amount);
  }

  /**
   * Generate payment ID
   */
  generatePaymentId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if Razorpay is available
   */
  isRazorpayAvailable(): boolean {
    return !!this.razorpayKeyId;
  }

  /**
   * Get Razorpay key ID
   */
  getRazorpayKeyId(): string {
    return this.razorpayKeyId;
  }
}

export const paymentService = new PaymentService();
