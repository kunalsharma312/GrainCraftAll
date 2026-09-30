import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, CartState } from '../types';
import { cartService } from '../../services/cartService';
import { analyticsService } from '../../services/analyticsService';

const initialState: CartState = {
  items: [],
  orders: [],
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

      // Track analytics
      analyticsService.trackAddToCart(action.payload.id, existing ? 2 : 1, action.payload.price);

      // Persist cart
      cartService.saveCart(state.items).catch(err => {
        console.error('Failed to persist cart:', err);
      });
    },

    incrementItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item) {
        item.quantity += 1;
        cartService.saveCart(state.items);
      }
    },

    decrementItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        cartService.saveCart(state.items);
      }
    },

    setItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
        cartService.saveCart(state.items);
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      cartService.saveCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      cartService.clearCart();
    },

    restoreCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  addToCart,
  incrementItem,
  decrementItem,
  setItemQuantity,
  removeFromCart,
  clearCart,
  restoreCart,
} = cartSlice.actions;

export default cartSlice.reducer;
