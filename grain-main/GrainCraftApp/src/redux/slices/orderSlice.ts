import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { emailService } from '../../services/emailService';
import { paymentService, PaymentStatus } from '../../services/paymentService';
import { Order, OrderRequest, OrdersResponse, UserProfile } from '../../services/types';
import { ApiError } from '../../services/types';
import { analyticsService } from '../../services/analyticsService';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  creating: boolean;
  emailSending: boolean;
  paymentProcessing: boolean;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  page: 1,
  pageSize: 20,
  total: 0,
  creating: false,
  emailSending: false,
  paymentProcessing: false,
};

// Async thunks
export const fetchOrders = createAsyncThunk<
  OrdersResponse,
  { page?: number; pageSize?: number } | undefined,
  { rejectValue: ApiError }
>('orders/fetch', async (params, { rejectWithValue }) => {
  try {
    return await apiService.getOrders(params?.page || 1, params?.pageSize || 20);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchOrder = createAsyncThunk<Order, string, { rejectValue: ApiError }>(
  'orders/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await apiService.getOrder(id);
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const createOrder = createAsyncThunk<
  Order,
  { 
    orderData: OrderRequest; 
    user: UserProfile;
    paymentId?: string;
    paymentSignature?: string;
  },
  { rejectValue: ApiError }
>('orders/create', async ({ orderData, user, paymentId, paymentSignature }, { rejectWithValue }) => {
  try {
    const order = await apiService.createOrder(orderData);
    
    // Verify payment if payment ID is provided
    if (paymentId && paymentSignature) {
      const paymentVerification = await paymentService.verifyPayment({
        orderId: order.id,
        paymentId,
        signature: paymentSignature,
      });

      if (!paymentVerification.success) {
        analyticsService.error('PAYMENT', 'Payment verification failed', undefined, {
          orderId: order.id,
          paymentId,
        });
        throw new Error('Payment verification failed');
      }

      // Update order with payment info
      order.paymentMethod = 'Razorpay/UPI';
      order.transactionId = paymentId;
    }

    // Prepare enhanced email data
    const emailData = {
      userName: user.name,
      userEmail: user.email,
      orderId: order.id,
      orderDate: order.date,
      items: order.items,
      total: order.total,
      delivery: order.delivery,
      millInfo: order.millInfo,
      paymentMethod: order.paymentMethod || 'Online',
      transactionId: order.transactionId || 'N/A',
      estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toDateString(),
    };

    // Send confirmation email asynchronously with enhanced template
    emailService
      .sendOrderConfirmation(user, order)
      .then(result => {
        if (result.success) {
          console.log('Order confirmation email sent:', result.messageId);
          analyticsService.info('EMAIL', 'Order confirmation sent', { orderId: order.id });
        } else {
          console.warn('Failed to send order confirmation email:', result.error);
          analyticsService.warn('EMAIL', 'Order confirmation failed', { orderId: order.id, error: result.error });
        }
      })
      .catch(error => {
        console.error('Error sending order confirmation email:', error);
        analyticsService.error('EMAIL', 'Error sending confirmation email', error as Error, { orderId: order.id });
      });

    // Track order creation
    analyticsService.trackOrderPlaced(order.id, order.total, order.items.length);

    return order;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    analyticsService.error('ORDER', 'Order creation failed', error as Error, { orderData });
    return rejectWithValue({
      message: errorMessage,
      code: 'ORDER_CREATION_FAILED',
    } as ApiError);
  }
});

export const cancelOrder = createAsyncThunk<Order, string, { rejectValue: ApiError }>(
  'orders/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return await apiService.cancelOrder(id);
    } catch (error) {
      return rejectWithValue(error as ApiError);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load orders';
      });

    // Fetch single order
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load order';
      });

    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
        state.paymentProcessing = true;
        state.emailSending = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.creating = false;
        state.paymentProcessing = false;
        state.emailSending = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.paymentProcessing = false;
        state.emailSending = false;
        state.error = action.payload?.message || 'Failed to create order';
      });

    // Cancel order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index >= 0) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to cancel order';
      });
  },
});

export const { clearError, clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
