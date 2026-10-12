import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { BlendIngredient, Blend, BlendRequest, BlendIngredientsResponse } from '../../services/types';
import { ApiError } from '../../services/types';

interface BlendState {
  ingredients: BlendIngredient[];
  currentBlend: Blend | null;
  calculatedBlend: Blend | null;
  loading: boolean;
  error: string | null;
}

const initialState: BlendState = {
  ingredients: [],
  currentBlend: null,
  calculatedBlend: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchBlendIngredients = createAsyncThunk<BlendIngredientsResponse, void, { rejectValue: ApiError }>(
  'blend/fetchIngredients',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getBlendIngredients();
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const calculateBlend = createAsyncThunk<Blend, BlendRequest, { rejectValue: ApiError }>(
  'blend/calculate',
  async (blendData, { rejectWithValue }) => {
    try {
      return await apiService.calculateBlend(blendData);
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const createBlend = createAsyncThunk<Blend, BlendRequest, { rejectValue: ApiError }>(
  'blend/create',
  async (blendData, { rejectWithValue }) => {
    try {
      return await apiService.createBlend(blendData);
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

const blendSlice = createSlice({
  name: 'blend',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBlend: (state) => {
      state.currentBlend = null;
      state.calculatedBlend = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch ingredients
    builder
      .addCase(fetchBlendIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlendIngredients.fulfilled, (state, action) => {
        state.loading = false;
        state.ingredients = action.payload.ingredients;
      })
      .addCase(fetchBlendIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load ingredients';
      });

    // Calculate blend
    builder
      .addCase(calculateBlend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateBlend.fulfilled, (state, action) => {
        state.loading = false;
        state.calculatedBlend = action.payload;
      })
      .addCase(calculateBlend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to calculate blend';
      });

    // Create blend
    builder
      .addCase(createBlend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlend.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlend = action.payload;
      })
      .addCase(createBlend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create blend';
      });
  },
});

export const { clearError, clearCurrentBlend } = blendSlice.actions;
export default blendSlice.reducer;
