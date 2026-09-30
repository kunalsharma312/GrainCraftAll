import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.graincraftapp.com/v1';
const API_TIMEOUT = 30000;

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

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

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Load token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('graincraftapp_auth_token');
      if (token) {
        this.authToken = token;
      }
    }
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('graincraftapp_auth_token', token);
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('graincraftapp_auth_token');
      delete this.client.defaults.headers.common.Authorization;
    }
  }

  private handleError(error: any): ApiError {
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
    } else if (error.request) {
      apiError.code = 'NETWORK_ERROR';
      apiError.message = 'Network error. Please check your connection.';
    }

    throw apiError;
  }

  // ============ PRODUCTS ============

  async getProducts(page = 1, pageSize = 20) {
    const response = await this.client.get('/products', {
      params: { page, pageSize },
    });
    return response.data;
  }

  async searchProducts(query: string, page = 1, pageSize = 20) {
    const response = await this.client.get('/products/search', {
      params: { q: query, page, pageSize },
    });
    return response.data;
  }

  // ============ BLENDS ============

  async getBlendIngredients() {
    const response = await this.client.get('/blend/ingredients');
    return response.data;
  }

  async calculateBlend(blendData: any) {
    const response = await this.client.post('/blend/calculate', blendData);
    return response.data;
  }

  async createBlend(blendData: any) {
    const response = await this.client.post('/blend/create', blendData);
    return response.data;
  }

  // ============ ORDERS ============

  async getOrders(page = 1, pageSize = 20) {
    const response = await this.client.get('/orders', {
      params: { page, pageSize },
    });
    return response.data;
  }

  async getOrder(id: string) {
    const response = await this.client.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData: any) {
    const response = await this.client.post('/orders', orderData);
    return response.data;
  }

  async cancelOrder(id: string) {
    const response = await this.client.post(`/orders/${id}/cancel`);
    return response.data;
  }

  // ============ ADDRESSES ============

  async getAddresses() {
    const response = await this.client.get('/addresses');
    return response.data;
  }

  async createAddress(addressData: any) {
    const response = await this.client.post('/addresses', addressData);
    return response.data;
  }

  async updateAddress(id: string, addressData: any) {
    const response = await this.client.put(`/addresses/${id}`, addressData);
    return response.data;
  }

  async deleteAddress(id: string) {
    const response = await this.client.delete(`/addresses/${id}`);
    return response.data;
  }

  // ============ USER ============

  async getUserProfile() {
    const response = await this.client.get('/user/profile');
    return response.data;
  }

  async updateUserProfile(data: any) {
    const response = await this.client.put('/user/profile', data);
    return response.data;
  }

  // ============ AUTH ============

  async loginWithToken(token: string, provider: string) {
    const response = await this.client.post('/auth/login', {
      token,
      provider,
    });
    const { token: authToken } = response.data;
    this.setAuthToken(authToken);
    return response.data;
  }

  async loginAsGuest() {
    const response = await this.client.post('/auth/guest');
    const { token: authToken } = response.data;
    this.setAuthToken(authToken);
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    this.setAuthToken(null);
    return { success: true };
  }

  // ============ PAYMENTS ============

  async initializePayment(paymentData: any) {
    const response = await this.client.post('/payments/initialize', paymentData);
    return response.data;
  }

  async verifyPayment(verificationData: any) {
    const response = await this.client.post('/payments/verify', verificationData);
    return response.data;
  }

  // ============ HEALTH ============

  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
