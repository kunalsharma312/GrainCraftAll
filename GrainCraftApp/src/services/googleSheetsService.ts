import axios, { AxiosInstance } from 'axios';
import { Address } from '../redux/types';

export interface UserSheetData {
  sheetName: string;
  action: 'create' | 'update';
  id?: string;
  number: string;
  email?: string;
  address?: string;
  orderNo?: string;
  payment?: string;
  paid?: string;
}

export interface OrderSheetData {
  sheetName: string;
  action: 'create' | 'update';
  orderId?: string;
  orderNumber?: string;
  Grains?: string;
  Amount?: number;
  Status?: string;
}

export interface GrainData {
  id: string;
  grain: string;
  price: number | string;
  discount: number | string;
  delivery_charge: number | string;
  city: string;
  state: string;
}

class GoogleSheetsService {
  private client: AxiosInstance;
  private scriptUrl: string;

  constructor() {
    this.scriptUrl = process.env.EXPO_PUBLIC_GOOGLE_SHEETS_SCRIPT_URL || '';
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setScriptUrl(url: string): void {
    this.scriptUrl = url;
  }

  isConfigured(): boolean {
    return Boolean(this.scriptUrl && this.scriptUrl.trim().length > 0);
  }

  async fetchGrainDetails(): Promise<GrainData[]> {
    if (!this.isConfigured()) {
      console.warn('Google Sheets not configured');
      return [];
    }
    try {
      const response = await this.client.get(this.scriptUrl, {
        params: { sheetName: 'grainInfo' },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching grains:', error);
      return [];
    }
  }

  async fetchAllUsers(): Promise<any[]> {
    if (!this.isConfigured()) {
      return [];
    }
    try {
      const response = await this.client.get(this.scriptUrl, {
        params: { sheetName: 'users' },
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async fetchAllOrders(): Promise<any[]> {
    if (!this.isConfigured()) {
      return [];
    }
    try {
      const response = await this.client.get(this.scriptUrl, {
        params: { sheetName: 'orders' },
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async createUser(userData: {
    number: string;
    email?: string;
    address?: string;
    payment?: string;
  }): Promise<{ success: boolean; userId?: string; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: 'Google Sheets not configured' };
    }
    try {
      const payload: UserSheetData = {
        sheetName: 'users',
        action: 'create',
        number: userData.number,
        email: userData.email || '',
        address: userData.address || '',
        payment: userData.payment || 'COD',
        paid: 'No',
      };
      const response = await this.client.post(this.scriptUrl, payload);
      if (response.data.status === 'success') {
        return {
          success: true,
          userId: response.data.userId,
          message: response.data.message,
        };
      }
      return {
        success: false,
        message: response.data.message || 'Failed to create user',
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateUser(userId: string, updates: Partial<UserSheetData>): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!this.isConfigured()) {
      return { success: false, message: 'Google Sheets not configured' };
    }
    try {
      const payload: any = {
        sheetName: 'users',
        action: 'update',
        id: userId,
        ...updates,
      };
      const response = await this.client.post(this.scriptUrl, payload);
      return {
        success: response.data.status === 'success',
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateUserMobileNumber(userId: string, newMobileNumber: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.updateUser(userId, { number: newMobileNumber } as any);
  }

  async updateUserAddress(
    userId: string,
    address: Address,
    email?: string
  ): Promise<{ success: boolean; message: string }> {
    const formattedAddress = `${address.houseNumber} ${address.street}, ${address.landmark}, ${address.city}, ${address.state} ${address.pincode}`;
    return this.updateUser(userId, {
      address: formattedAddress,
      email: email,
    } as any);
  }

  async createOrder(orderData: {
    orderNumber: string;
    Grains: string;
    Amount: number;
    Status?: string;
  }): Promise<{ success: boolean; orderId?: string; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: 'Google Sheets not configured' };
    }
    try {
      const payload: OrderSheetData = {
        sheetName: 'orders',
        action: 'create',
        orderNumber: orderData.orderNumber,
        Grains: orderData.Grains,
        Amount: orderData.Amount,
        Status: orderData.Status || 'Pending',
      };
      const response = await this.client.post(this.scriptUrl, payload);
      if (response.data.status === 'success') {
        return {
          success: true,
          orderId: response.data.orderId,
          message: response.data.message,
        };
      }
      return {
        success: false,
        message: response.data.message || 'Failed to create order',
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: 'Google Sheets not configured' };
    }
    try {
      const payload: OrderSheetData = {
        sheetName: 'orders',
        action: 'update',
        orderId: orderId,
        Status: status,
      };
      const response = await this.client.post(this.scriptUrl, payload);
      return {
        success: response.data.status === 'success',
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error updating order:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async storeUserMobileData(mobileNumber: string, email?: string): Promise<boolean> {
    const result = await this.createUser({
      number: mobileNumber,
      email: email || '',
      payment: 'COD',
    });
    return result.success;
  }

  async storeOrderData(
    userId: string,
    address: Address,
    orderData: any,
    email?: string
  ): Promise<boolean> {
    try {
      const addressResult = await this.updateUserAddress(userId, address, email);
      if (!addressResult.success) return false;

      const grainsList = orderData?.items?.map((item: any) => `${item.name} x${item.quantity}`).join('; ') || '';
      const orderResult = await this.createOrder({
        orderNumber: orderData?.id || `ORD-${Date.now()}`,
        Grains: grainsList,
        Amount: orderData?.total || 0,
        Status: 'Pending',
      });
      return orderResult.success;
    } catch (error) {
      console.error('Error storing order data:', error);
      return false;
    }
  }

  async getUserByMobileNumber(mobileNumber: string): Promise<any | null> {
    try {
      const users = await this.fetchAllUsers();
      return users.find(user => user.number === mobileNumber) || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getOrdersByMobileNumber(mobileNumber: string): Promise<any[]> {
    try {
      const user = await this.getUserByMobileNumber(mobileNumber);
      if (!user) return [];
      return await this.fetchAllOrders();
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getGrainsByLocation(city: string, state: string): Promise<GrainData[]> {
    try {
      const allGrains = await this.fetchGrainDetails();
      const normalizeString = (str: string) => str.toLowerCase().trim();
      const normalizedCity = normalizeString(city);
      const normalizedState = normalizeString(state);

      return allGrains.filter(grain => {
        const grainCity = normalizeString(grain.city);
        const grainState = normalizeString(grain.state);
        return (
          grainCity === normalizedCity ||
          grainCity.includes(normalizedCity) ||
          normalizedCity.includes(grainCity) ||
          grainState === normalizedState ||
          grainState.includes(normalizedState) ||
          normalizedState.includes(grainState)
        );
      });
    } catch (error) {
      console.error('Error filtering grains:', error);
      return [];
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
