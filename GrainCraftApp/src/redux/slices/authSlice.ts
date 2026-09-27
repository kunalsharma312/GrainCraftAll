import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import mockData from '../../assets/mockData.json';
import type { Address, AuthState } from '../types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: mockData.user,
  addresses: [{ id: '1', address: 'Brooklyn Hub, New York' }],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ addresses?: Address[] } | undefined>) => {
      state.isAuthenticated = true;
      if (action.payload?.addresses) {
        state.addresses = action.payload.addresses;
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
