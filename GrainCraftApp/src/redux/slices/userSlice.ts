import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { UserProfile, UserStatsResponse, Address, AddressRequest, AddressesResponse } from '../../services/types';
import { ApiError } from '../../services/types';

interface UserState {
  profile: UserProfile | null;
  stats: UserStatsResponse | null;
  addresses: Address[];
  loading: boolean;
  error: string | null;
  addressLoading: boolean;
  addressError: string | null;
}

const initialState: UserState = {
  profile: null,
  stats: null,
  addresses: [],
  loading: false,
  error: null,
  addressLoading: false,
  addressError: null,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk<UserProfile, void, { rejectValue: ApiError }>(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getUserProfile();
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const fetchUserStats = createAsyncThunk<UserStatsResponse, void, { rejectValue: ApiError }>(
  'user/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getUserStats();
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const updateUserProfile = createAsyncThunk<UserProfile, Partial<UserProfile>, { rejectValue: ApiError }>(
  'user/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      return await apiService.updateUserProfile(data);
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const fetchAddresses = createAsyncThunk<AddressesResponse, void, { rejectValue: ApiError }>(
  'user/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getAddresses();
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const createAddress = createAsyncThunk<Address, AddressRequest, { rejectValue: ApiError }>(
  'user/createAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      return await apiService.createAddress(addressData);
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const updateAddress = createAsyncThunk<Address, { id: string; data: Partial<AddressRequest> }, { rejectValue: ApiError }>(
  'user/updateAddress',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await apiService.updateAddress(id, data);
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const deleteAddress = createAsyncThunk<string, string, { rejectValue: ApiError }>(
  'user/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteAddress(id);
      return id;
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAddressError: (state) => {
      state.addressError = null;
    },
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load profile';
      });

    // Fetch stats
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load stats';
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      });

    // Fetch addresses
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.addressLoading = true;
        state.addressError = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addressLoading = false;
        state.addresses = action.payload.addresses;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.addressLoading = false;
        state.addressError = action.payload?.message || 'Failed to load addresses';
      });

    // Create address
    builder
      .addCase(createAddress.pending, (state) => {
        state.addressLoading = true;
        state.addressError = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.addressLoading = false;
        state.addresses.push(action.payload);
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.addressLoading = false;
        state.addressError = action.payload?.message || 'Failed to create address';
      });

    // Update address
    builder
      .addCase(updateAddress.pending, (state) => {
        state.addressLoading = true;
        state.addressError = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.addressLoading = false;
        const index = state.addresses.findIndex((a) => a.id === action.payload.id);
        if (index >= 0) {
          state.addresses[index] = action.payload;
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.addressLoading = false;
        state.addressError = action.payload?.message || 'Failed to update address';
      });

    // Delete address
    builder
      .addCase(deleteAddress.pending, (state) => {
        state.addressLoading = true;
        state.addressError = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addressLoading = false;
        state.addresses = state.addresses.filter((a) => a.id !== action.payload);
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.addressLoading = false;
        state.addressError = action.payload?.message || 'Failed to delete address';
      });
  },
});

export const { clearError, clearAddressError, setProfile } = userSlice.actions;
export default userSlice.reducer;
