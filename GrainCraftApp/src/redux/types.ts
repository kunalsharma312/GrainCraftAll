import mockData from '../assets/mockData.json';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  phone?: string;
}
export type DiscoverItem = (typeof mockData.discoverItems)[number];
export type BlendIngredient = (typeof mockData.blendIngredients)[number];

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
}

export interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: UserProfile | null;
  addresses: Address[];
}

export interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  components?: string[];
  image?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  title: string;
  status: string;
  millInfo: string;
  delivery: {
    type?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };
  total: number;
  items: OrderItem[];
  paymentMethod?: string;
  transactionId?: string;
  estimatedDelivery?: string;
}

export interface CartState {
  items: CartItem[];
  orders: Order[];
}

export type RootStackParamList = {
  Auth: undefined;
  MainApp: undefined;
  OrderConfirmation: { order: Order };
}

export type MainTabParamList = {
  Discover: undefined;
  Blend: undefined;
  Cart: undefined;
  Orders: undefined;
}
