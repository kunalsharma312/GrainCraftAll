/**
 * API Service Layer
 * Centralized API communication with proper error handling and type safety
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  ApiResponse,
  ApiError,
  DiscoverItem,
  DiscoverItemsResponse,
  BlendIngredient,
  BlendIngredientsResponse,
  Blend,
  BlendRequest,
  OrderRequest,
  Order,
  OrdersResponse,
  Address,
  AddressRequest,
  AddressesResponse,
  UserProfile,
  UserStatsResponse,
  AppConfig,
  HealthCheckResponse,
} from './types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.graincraftapp.com/v1';
const API_TIMEOUT = 30000; // 30 seconds

class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );

    // Add request interceptor to attach auth token
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });
  }

  /**
   * Set authentication token for subsequent requests
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common.Authorization;
    }
  }

  /**
   * Centralized error handler
   */
  private handleError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      status: error.response?.status || 0,
    };

    if (error.response) {
      apiError.status = error.response.status;
      const data = error.response.data as Record<string, unknown>;

      apiError.code = (data.code as string) || `HTTP_${error.response.status}`;
      apiError.message = (data.message as string) || error.message;
      apiError.details = data.details as Record<string, unknown>;

      // Handle specific status codes
      if (error.response.status === 401) {
        apiError.code = 'UNAUTHORIZED';
        apiError.message = 'Authentication failed. Please login again.';
      } else if (error.response.status === 403) {
        apiError.code = 'FORBIDDEN';
        apiError.message = 'You do not have permission to access this resource.';
      } else if (error.response.status === 404) {
        apiError.code = 'NOT_FOUND';
        apiError.message = 'Resource not found.';
      } else if (error.response.status === 422) {
        apiError.code = 'VALIDATION_ERROR';
        apiError.message = 'Invalid data provided.';
      }
    } else if (error.request) {
      apiError.code = 'NETWORK_ERROR';
      apiError.message = 'Network error. Please check your connection.';
    }

    throw apiError;
  }

  // ============ HEALTH & CONFIG ============

  /**
   * Check API health
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await this.client.get<HealthCheckResponse>('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get app configuration from backend
   */
  async getAppConfig(): Promise<AppConfig> {
    try {
      const response = await this.client.get<AppConfig>('/config');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // ============ DISCOVER / PRODUCTS ============

  /**
   * Get all discover items (products)
   */
  async getDiscoverItems(page = 1, pageSize = 20): Promise<DiscoverItemsResponse> {
    try {
      const response = await this.client.get<DiscoverItemsResponse>('/products', {
        params: { page, pageSize },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get single discover item details
   */
  async getDiscoverItem(id: string): Promise<DiscoverItem> {
    try {
      const response = await this.client.get<DiscoverItem>(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Search discover items
   */
  async searchDiscoverItems(query: string, page = 1, pageSize = 20): Promise<DiscoverItemsResponse> {
    try {
      const response = await this.client.get<DiscoverItemsResponse>('/products/search', {
        params: { q: query, page, pageSize },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // ============ BLEND INGREDIENTS ============

  /**
   * Get all blend ingredients
   */
  async getBlendIngredients(): Promise<BlendIngredientsResponse> {
    try {
      const response = await this.client.get<BlendIngredientsResponse>('/blend/ingredients');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Create custom blend
   */
  async createBlend(blendData: BlendRequest): Promise<Blend> {
    try {
      const response = await this.client.post<Blend>('/blend/create', blendData);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Calculate blend price and nutrition
   */
  async calculateBlend(blendData: BlendRequest): Promise<Blend> {
    try {
      const response = await this.client.post<Blend>('/blend/calculate', blendData);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // ============ ORDERS ============

  /**
   * Get user's orders
   */
  async getOrders(page = 1, pageSize = 20): Promise<OrdersResponse> {
    try {
      const response = await this.client.get<OrdersResponse>('/orders', {
        params: { page, pageSize },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get single order details
   */
  async getOrder(id: string): Promise<Order> {
    try {
      const response = await this.client.get<Order>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Create new order
   */
  async createOrder(orderData: OrderRequest): Promise<Order> {
    try {
      const response = await this.client.post<Order>('/orders', orderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string): Promise<Order> {
    try {
      const response = await this.client.post<Order>(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // ============ ADDRESSES ============

  /**
   * Get all user addresses
   */
  async getAddresses(): Promise<AddressesResponse> {
    try {
      const response = await this.client.get<AddressesResponse>('/addresses');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get single address
   */
  async getAddress(id: string): Promise<Address> {
    try {
      const response = await this.client.get<Address>(`/addresses/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Create new address
   */
  async createAddress(addressData: AddressRequest): Promise<Address> {
    try {
      const response = await this.client.post<Address>('/addresses', addressData);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Update address
   */
  async updateAddress(id: string, addressData: Partial<AddressRequest>): Promise<Address> {
    try {
      const response = await this.client.put<Address>(`/addresses/${id}`, addressData);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(id: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.delete<{ success: boolean }>(`/addresses/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // ============ USER PROFILE ============

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await this.client.get<UserProfile>('/user/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStatsResponse> {
    try {
      const response = await this.client.get<UserStatsResponse>('/user/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await this.client.put<UserProfile>('/user/profile', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // ============ AUTHENTICATION ============

  /**
   * Login with OAuth token
   */
  async loginWithToken(token: string, provider: 'google' | 'apple'): Promise<{ user: UserProfile; token: string }> {
    try {
      const response = await this.client.post<{ user: UserProfile; token: string }>('/auth/login', {
        token,
        provider,
      });
      const { token: authToken } = response.data;
      this.setAuthToken(authToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Login as guest
   */
  async loginAsGuest(): Promise<{ user: UserProfile; token: string }> {
    try {
      const response = await this.client.post<{ user: UserProfile; token: string }>('/auth/guest');
      const { token: authToken } = response.data;
      this.setAuthToken(authToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post<{ success: boolean }>('/auth/logout');
      this.setAuthToken(null);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string }> {
    try {
      const response = await this.client.post<{ token: string }>('/auth/refresh');
      const { token } = response.data;
      this.setAuthToken(token);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

export default apiService;
