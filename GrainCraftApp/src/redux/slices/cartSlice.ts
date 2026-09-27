import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import mockData from '../../assets/mockData.json';
import type { CartItem, CartState, Order } from '../types';

const initialState: CartState = {
  items: [
    {
      id: '1',
      name: "Custom Artisanal Baker's Blend",
      subtitle: '2 kg pouch • Medium Stoneground',
      price: 11.3,
      quantity: 1,
      components: ['50% Heritage Khapli', '20% Sprouted Ragi'],
    },
  ],
  orders: mockData.orders as Order[],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existing = state.items.find(item => item.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    placeOrder: (state, action: PayloadAction<{ address: string }>) => {
      const newOrder: Order = {
        id: `GC-${Math.floor(10000 + Math.random() * 90000)}`,
        date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        title: state.items[0]?.name || 'Custom Grain Grist',
        status: 'Stone Mill Spinning',
        millInfo: 'Wheel 04 (Osttiroler Stone) • 54 RPM • Extraction 85%',
        delivery: `Today, by Fresh Courier (${action.payload.address})`,
        total: state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        items: state.items.map(({ name, quantity, price }) => ({ name, quantity, price })),
      };
      state.orders.unshift(newOrder);
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, placeOrder } = cartSlice.actions;
export default cartSlice.reducer;
