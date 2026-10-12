/**
 * Email Service
 * Handles sending email notifications for orders, confirmations, etc.
 */

import { Order, UserProfile } from './types';

export interface EmailPayload {
  to: string;
  subject: string;
  templateId?: string;
  data: Record<string, any>;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private apiBase = process.env.EXPO_PUBLIC_API_URL || '';

  /**
   * Send email via backend
   */
  async sendEmail(payload: EmailPayload): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.apiBase}/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  /**
   * Send order confirmation email with payment details
   */
  async sendOrderConfirmation(user: UserProfile, order: Order): Promise<EmailResponse> {
    return this.sendEmail({
      to: user.email,
      subject: `Order Confirmed - ${order.id}`,
      templateId: 'order_confirmation',
      data: {
        userName: user.name,
        userEmail: user.email,
        orderId: order.id,
        orderDate: order.date,
        items: order.items,
        total: order.total,
        delivery: order.delivery,
        millInfo: order.millInfo,
        paymentMethod: order.paymentMethod || 'Online',
        transactionId: order.transactionId || 'N/A',
        estimatedDelivery:
          order.estimatedDelivery ||
          new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toDateString(),
      },
    });
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt(
    user: UserProfile,
    order: Order,
    paymentDetails: {
      paymentId: string;
      paymentMethod: string;
      amount: number;
      currency: string;
      timestamp: string;
    }
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to: user.email,
      subject: `Payment Receipt - Order #${order.id}`,
      templateId: 'payment_receipt',
      data: {
        userName: user.name,
        userEmail: user.email,
        orderId: order.id,
        orderDate: order.date,
        items: order.items,
        paymentId: paymentDetails.paymentId,
        paymentMethod: paymentDetails.paymentMethod,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        timestamp: paymentDetails.timestamp,
        transactionId: order.transactionId,
        receiptUrl: `${this.apiBase}/receipts/${order.id}`,
      },
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(user: UserProfile, order: Order): Promise<EmailResponse> {
    return this.sendEmail({
      to: user.email,
      subject: `Order Status Update - ${order.id}`,
      templateId: 'order_status_update',
      data: {
        userName: user.name,
        orderId: order.id,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
        delivery: order.delivery,
      },
    });
  }

  /**
   * Send delivery notification email
   */
  async sendDeliveryNotification(user: UserProfile, order: Order): Promise<EmailResponse> {
    return this.sendEmail({
      to: user.email,
      subject: `Your Order Has Been Delivered - ${order.id}`,
      templateId: 'order_delivered',
      data: {
        userName: user.name,
        orderId: order.id,
        delivery: order.delivery,
        trackingUrl: order.trackingUrl,
      },
    });
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user: UserProfile): Promise<EmailResponse> {
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to GrainCraft!',
      templateId: 'welcome',
      data: {
        userName: user.name,
        email: user.email,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetToken: string): Promise<EmailResponse> {
    return this.sendEmail({
      to: email,
      subject: 'Reset Your GrainCraft Password',
      templateId: 'password_reset',
      data: {
        resetToken,
        resetUrl: `${this.apiBase}/reset-password?token=${resetToken}`,
      },
    });
  }

  /**
   * Send promotional email
   */
  async sendPromotionalEmail(email: string, promoData: Record<string, any>): Promise<EmailResponse> {
    return this.sendEmail({
      to: email,
      subject: 'Special Offer from GrainCraft',
      templateId: 'promotional',
      data: promoData,
    });
  }

  /**
   * Send order invoice/receipt PDF email
   */
  async sendOrderInvoice(
    user: UserProfile,
    order: Order,
    invoiceUrl: string
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to: user.email,
      subject: `Invoice - Order #${order.id}`,
      templateId: 'order_invoice',
      data: {
        userName: user.name,
        orderId: order.id,
        orderDate: order.date,
        total: order.total,
        items: order.items,
        delivery: order.delivery,
        invoiceUrl,
      },
    });
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailureNotification(
    user: UserProfile,
    orderId: string,
    errorMessage: string
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to: user.email,
      subject: `Payment Failed - Order #${orderId}`,
      templateId: 'payment_failed',
      data: {
        userName: user.name,
        orderId,
        errorMessage,
        retryUrl: `${this.apiBase}/orders/${orderId}/retry-payment`,
      },
    });
  }

  /**
   * Send order cancellation confirmation
   */
  async sendOrderCancellationConfirmation(
    user: UserProfile,
    order: Order,
    refundAmount: number
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to: user.email,
      subject: `Order Cancelled - Refund Initiated - ${order.id}`,
      templateId: 'order_cancelled',
      data: {
        userName: user.name,
        orderId: order.id,
        refundAmount,
        estimatedRefundDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString(),
      },
    });
  }
}

export const emailService = new EmailService();
