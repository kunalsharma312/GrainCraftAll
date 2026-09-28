import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Address, AuthState } from '../types';

const initialState: AuthState = {
  isAuthenticated: false,
  isGuest: false,
  user: null,
  addresses: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<NonNullable<AuthState['user']>>) => {
      state.isAuthenticated = true;
      state.isGuest = false;
      state.user = action.payload;
    },
    continueAsGuest: (state) => {
      state.isAuthenticated = true;
      state.isGuest = true;
      state.user = null;
    },
    restoreSession: (state, action: PayloadAction<Pick<AuthState, 'user' | 'addresses' | 'isGuest'> | null>) => {
      state.user = action.payload?.user ?? null;
      state.addresses = action.payload?.addresses ?? [];
      state.isGuest = action.payload?.isGuest ?? false;
      state.isAuthenticated = Boolean(state.user) || state.isGuest;
    },
    saveAddress: (state, action: PayloadAction<Address>) => {
      const existingIndex = state.addresses.findIndex(address => address.id === action.payload.id);
      if (existingIndex >= 0) {
        state.addresses[existingIndex] = action.payload;
      } else {
        state.addresses.push(action.payload);
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.isGuest = false;
      state.user = null;
      state.addresses = [];
    },
  },
});

export const { login, logout, restoreSession, saveAddress, continueAsGuest } = authSlice.actions;
export default authSlice.reducer;
