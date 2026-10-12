import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Address, AuthState, LocationData } from '../types';

const initialState: AuthState = {
  isAuthenticated: false,
  isGuest: false,
  user: null,
  addresses: [],
  location: null,
  mobilePhone: undefined,
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
    restoreSession: (state, action: PayloadAction<Pick<AuthState, 'user' | 'addresses' | 'isGuest' | 'location' | 'mobilePhone'> | null>) => {
      state.user = action.payload?.user ?? null;
      state.addresses = action.payload?.addresses ?? [];
      state.isGuest = action.payload?.isGuest ?? false;
      state.location = action.payload?.location ?? null;
      state.mobilePhone = action.payload?.mobilePhone;
      state.isAuthenticated = Boolean(state.user) || state.isGuest;
    },
    setLocation: (state, action: PayloadAction<LocationData>) => {
      state.location = action.payload;
    },
    setMobilePhone: (state, action: PayloadAction<string>) => {
      state.mobilePhone = action.payload;
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
      state.location = null;
      state.mobilePhone = undefined;
    },
  },
});

export const { login, logout, restoreSession, saveAddress, continueAsGuest, setLocation, setMobilePhone } = authSlice.actions;
export default authSlice.reducer;
