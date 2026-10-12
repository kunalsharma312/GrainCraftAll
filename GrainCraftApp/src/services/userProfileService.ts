/**
 * User Profile Service
 * Manages user details, mobile number updates, addresses, and order history
 */

import { Address } from '../redux/types';

export interface UserProfile {
  id: string;
  mobileNumber: string;
  email?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress extends Address {
  createdAt?: string;
  updatedAt?: string;
  isDefault?: boolean;
}

export interface UserOrder {
  orderId: string;
  orderNo: string;
  date: string;
  grains: string[];
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'delivered' | 'cancelled';
}

export interface UserFullProfile {
  user: UserProfile;
  addresses: UserAddress[];
  orders: UserOrder[];
}

class UserProfileService {
  private apiBaseUrl: string = process.env.EXPO_PUBLIC_API_URL || 'https://api.graincraftapp.com/v1';

  /**
   * Fetch user profile by mobile number
   */
  async getUserProfileByMobile(mobileNumber: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Phone': mobileNumber,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // User doesn't exist
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Create or update user mobile number
   */
  async updateMobileNumber(
    oldMobileNumber: string | null,
    newMobileNumber: string,
    email?: string,
    name?: string
  ): Promise<{ success: boolean; user: UserProfile | null; message: string }> {
    try {
      const payload: any = {
        mobileNumber: newMobileNumber,
      };

      if (email) payload.email = email;
      if (name) payload.name = name;

      const response = await fetch(`${this.apiBaseUrl}/user/update-mobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldMobileNumber,
          ...payload,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          user: null,
          message: error.message || `Failed to update mobile number`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        user: data.user,
        message: 'Mobile number updated successfully',
      };
    } catch (error) {
      console.error('Error updating mobile number:', error);
      return {
        success: false,
        user: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Save or update user address
   */
  async saveAddress(
    mobileNumber: string,
    address: Partial<UserAddress>
  ): Promise<{ success: boolean; address: UserAddress | null; message: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Phone': mobileNumber,
        },
        body: JSON.stringify({
          ...address,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          address: null,
          message: error.message || 'Failed to save address',
        };
      }

      const data = await response.json();
      return {
        success: true,
        address: data.address,
        message: 'Address saved successfully',
      };
    } catch (error) {
      console.error('Error saving address:', error);
      return {
        success: false,
        address: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all addresses for a user
   */
  async getUserAddresses(mobileNumber: string): Promise<UserAddress[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Phone': mobileNumber,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.addresses || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  }

  /**
   * Get user order history
   */
  async getUserOrders(mobileNumber: string, limit: number = 10): Promise<UserOrder[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/orders?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Phone': mobileNumber,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  /**
   * Get complete user profile (user + addresses + orders)
   */
  async getFullUserProfile(mobileNumber: string): Promise<UserFullProfile | null> {
    try {
      const [user, addresses, orders] = await Promise.all([
        this.getUserProfileByMobile(mobileNumber),
        this.getUserAddresses(mobileNumber),
        this.getUserOrders(mobileNumber),
      ]);

      if (!user) {
        return null;
      }

      return {
        user,
        addresses,
        orders,
      };
    } catch (error) {
      console.error('Error fetching full user profile:', error);
      return null;
    }
  }

  /**
   * Get or create user with mobile number
   */
  async getOrCreateUser(mobileNumber: string): Promise<{
    success: boolean;
    user: UserProfile | null;
    isNew: boolean;
    message: string;
  }> {
    try {
      // First try to get existing user
      const existingUser = await this.getUserProfileByMobile(mobileNumber);

      if (existingUser) {
        return {
          success: true,
          user: existingUser,
          isNew: false,
          message: 'User profile found',
        };
      }

      // Create new user if doesn't exist
      const result = await this.updateMobileNumber(null, mobileNumber);

      return {
        success: result.success,
        user: result.user,
        isNew: true,
        message: result.success ? 'User profile created' : result.message,
      };
    } catch (error) {
      console.error('Error in getOrCreateUser:', error);
      return {
        success: false,
        user: null,
        isNew: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update user profile with details
   */
  async updateUserProfile(
    mobileNumber: string,
    details: Partial<UserProfile>
  ): Promise<{ success: boolean; user: UserProfile | null; message: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Phone': mobileNumber,
        },
        body: JSON.stringify(details),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          user: null,
          message: error.message || 'Failed to update profile',
        };
      }

      const data = await response.json();
      return {
        success: true,
        user: data.user,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        user: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(
    mobileNumber: string,
    addressId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/address/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Phone': mobileNumber,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Failed to delete address',
        };
      }

      return {
        success: true,
        message: 'Address deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting address:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate mobile number format
   */
  isValidMobileNumber(mobileNumber: string): boolean {
    const cleaned = mobileNumber.replace(/\D/g, '');
    return cleaned.length === 10;
  }

  /**
   * Format mobile number
   */
  formatMobileNumber(mobileNumber: string): string {
    const cleaned = mobileNumber.replace(/\D/g, '');
    return cleaned.length === 10 ? `+91${cleaned}` : mobileNumber;
  }

  /**
   * Get default address
   */
  getDefaultAddress(addresses: UserAddress[]): UserAddress | null {
    return addresses.find(addr => addr.isDefault) || addresses[0] || null;
  }

  /**
   * Mark address as default
   */
  async setDefaultAddress(
    mobileNumber: string,
    addressId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/address/${addressId}/default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Phone': mobileNumber,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: 'Failed to set default address',
        };
      }

      return {
        success: true,
        message: 'Default address updated',
      };
    } catch (error) {
      console.error('Error setting default address:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(mobileNumber: string, days: number = 30): Promise<UserOrder[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/orders?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Phone': mobileNumber,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(mobileNumber: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    favoriteGrain: string | null;
    lastOrderDate: string | null;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Phone': mobileNumber,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        totalOrders: data.totalOrders || 0,
        totalSpent: data.totalSpent || 0,
        favoriteGrain: data.favoriteGrain || null,
        lastOrderDate: data.lastOrderDate || null,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        favoriteGrain: null,
        lastOrderDate: null,
      };
    }
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService();

export default userProfileService;
