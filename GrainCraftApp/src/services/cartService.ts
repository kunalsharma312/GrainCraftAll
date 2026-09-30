/**
 * Cart Management Service
 * Handles cart persistence, quantity management, and calculations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from './types';

const CART_STORAGE_KEY = 'graincraftapp.cart.v1';

class CartService {
  /**
   * Save cart to persistent storage
   */
  async saveCart(items: CartItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }

  /**
   * Load cart from persistent storage
   */
  async loadCart(): Promise<CartItem[]> {
    try {
      const data = await AsyncStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load cart:', error);
      return [];
    }
  }

  /**
   * Clear cart from storage
   */
  async clearCart(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  }

  /**
   * Calculate total cart value
   */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  /**
   * Calculate total number of items
   */
  calculateItemCount(items: CartItem[]): number {
    return items.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Get cart summary
   */
  getCartSummary(items: CartItem[]): {
    totalItems: number;
    totalPrice: number;
    itemCount: number;
  } {
    return {
      totalItems: items.length,
      totalPrice: this.calculateTotal(items),
      itemCount: this.calculateItemCount(items),
    };
  }

  /**
   * Validate cart before checkout
   */
  validateCart(items: CartItem[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (items.length === 0) {
      errors.push('Cart is empty');
    }

    items.forEach((item) => {
      if (!item.id || !item.name || !item.price) {
        errors.push(`Invalid item: ${item.name || 'Unknown'}`);
      }
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${item.name}`);
      }
      if (item.price < 0) {
        errors.push(`Invalid price for ${item.name}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const cartService = new CartService();
