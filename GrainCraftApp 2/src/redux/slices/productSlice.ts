import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { DiscoverItem, DiscoverItemsResponse } from '../../services/types';
import { ApiError } from '../../services/types';

interface ProductState {
  items: DiscoverItem[];
  selectedItem: DiscoverItem | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
}

const initialState: ProductState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  page: 1,
  pageSize: 20,
  total: 0,
};

// Async thunks
export const fetchDiscoverItems = createAsyncThunk<
  DiscoverItemsResponse,
  { page?: number; pageSize?: number } | undefined,
  { rejectValue: ApiError }
>('products/fetchItems', async (params, { rejectWithValue }) => {
  try {
    return await apiService.getDiscoverItems(params?.page || 1, params?.pageSize || 20);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchDiscoverItem = createAsyncThunk<DiscoverItem, string, { rejectValue: ApiError }>(
  'products/fetchItem',
  async (id, { rejectWithValue }) => {
    try {
      return await apiService.getDiscoverItem(id);
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const searchDiscoverItems = createAsyncThunk<
  DiscoverItemsResponse,
  { query: string; page?: number; pageSize?: number },
  { rejectValue: ApiError }
>('products/search', async (params, { rejectWithValue }) => {
  try {
    return await apiService.searchDiscoverItems(params.query, params.page || 1, params.pageSize || 20);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch discover items
    builder
      .addCase(fetchDiscoverItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscoverItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
      })
      .addCase(fetchDiscoverItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load products';
      });

    // Fetch single item
    builder
      .addCase(fetchDiscoverItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscoverItem.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchDiscoverItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load product';
      });

    // Search items
    builder
      .addCase(searchDiscoverItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchDiscoverItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
      })
      .addCase(searchDiscoverItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Search failed';
      });
  },
});

export const { clearError, clearSelectedItem } = productSlice.actions;
export default productSlice.reducer;
