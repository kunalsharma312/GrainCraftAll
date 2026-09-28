import mockData from '../assets/mockData.json';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
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
  delivery: string;
  total: number;
  items: OrderItem[];
}

export interface CartState {
  items: CartItem[];
  orders: Order[];
}

export type RootStackParamList = {
  Auth: undefined;
  MainApp: undefined;
}

export type MainTabParamList = {
  Discover: undefined;
  Blend: undefined;
  Cart: undefined;
  Orders: undefined;
}
