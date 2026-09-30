/**
 * API Service Type Definitions
 * These types represent data structures returned from the backend API
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

// Product/Discover related types
export interface DiscoverItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  components: string[];
  image?: string;
  description?: string;
  available: boolean;
  stock?: number;
  tags?: string[];
}

export interface DiscoverItemsResponse {
  items: DiscoverItem[];
  total: number;
  page: number;
  pageSize: number;
}

// Blend ingredients
export interface BlendIngredient {
  id: string;
  name: string;
  type: string;
  desc: string;
  price: number;
  unit?: string;
  available?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface BlendIngredientsResponse {
  ingredients: BlendIngredient[];
  total: number;
}

// Blend related
export interface BlendRequest {
  ingredients: Array<{
    id: string;
    percentage: number;
  }>;
  totalWeight?: number;
}

export interface Blend {
  id: string;
  name: string;
  ingredients: Array<{
    id: string;
    name: string;
    percentage: number;
    price: number;
  }>;
  totalPrice: number;
  estimatedNutrition: {
    protein: number;
    fiber: number;
    gi: number;
  };
}

// Order related
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit?: string;
}

export interface OrderRequest {
  items: Array<{
    id: string;
    quantity: number;
    type: 'product' | 'blend';
  }>;
  addressId: string;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  date: string;
  title: string;
  status: 'pending' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  millInfo: string;
  delivery: string;
  total: number;
  items: OrderItem[];
  estimatedDelivery?: string;
  trackingUrl?: string;
  paymentMethod?: string;
  transactionId?: string;
}

// Cart item stored in Redux + persisted locally
export interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  components?: string[];
  image?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

// Address related
export interface Address {
  id: string;
  fullName: string;
  phone: string;
  houseNumber: string;
  street: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export interface AddressRequest {
  fullName: string;
  phone: string;
  houseNumber: string;
  street: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export interface AddressesResponse {
  addresses: Address[];
  total: number;
}

// User profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStatsResponse {
  tier: string;
  points: number;
  batchesMilled: number;
  heritageGrainsKg: number;
  grainVaults: number;
  activeCycle?: {
    frequency: string;
    title: string;
    description: string;
    nextRun: string;
  };
}

// Configuration/Settings
export interface AppConfig {
  version: string;
  features: {
    blendCustomization: boolean;
    subscriptions: boolean;
    loyaltyProgram: boolean;
    millStatus: boolean;
  };
  mills: Array<{
    id: string;
    name: string;
    location: string;
    status: 'active' | 'idle' | 'maintenance';
    temperature?: number;
  }>;
  currencies: {
    primary: string;
    symbol: string;
  };
}

// Health check
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}
