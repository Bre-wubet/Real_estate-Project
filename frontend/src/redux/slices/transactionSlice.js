import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Async thunks for transaction actions
export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (transactionData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post('/transactions', transactionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const completeTransaction = createAsyncThunk(
  'transaction/completeTransaction',
  async ({ transactionId, paymentMethod }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `/transactions/${transactionId}/complete`,
        { paymentMethod },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserTransactions = createAsyncThunk(
  'transaction/fetchUserTransactions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get('/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transaction/fetchTransactionById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cancelTransaction = createAsyncThunk(
  'transaction/cancelTransaction',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`/transactions/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,
  paymentIntent: null
};

// Transaction slice
const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPaymentIntent: (state, action) => {
      state.paymentIntent = action.payload;
    },
    clearPaymentIntent: (state) => {
      state.paymentIntent = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload.transaction);
        state.currentTransaction = action.payload.transaction;
        state.paymentIntent = {
          clientSecret: action.payload.clientSecret
        };
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create transaction';
      })
      // Complete transaction
      .addCase(completeTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex(
          t => t._id === action.payload.transaction._id
        );
        if (index !== -1) {
          state.transactions[index] = action.payload.transaction;
        }
        state.currentTransaction = action.payload.transaction;
        state.paymentIntent = null;
      })
      .addCase(completeTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to complete transaction';
      })
      // Fetch user transactions
      .addCase(fetchUserTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch transactions';
      })
      // Fetch single transaction
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch transaction';
      })
      // Cancel transaction
      .addCase(cancelTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex(
          t => t._id === action.payload.transaction._id
        );
        if (index !== -1) {
          state.transactions[index] = action.payload.transaction;
        }
        if (state.currentTransaction?._id === action.payload.transaction._id) {
          state.currentTransaction = action.payload.transaction;
        }
      })
      .addCase(cancelTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to cancel transaction';
      });
  }
});

export const { clearError, setPaymentIntent, clearPaymentIntent } = transactionSlice.actions;
export default transactionSlice.reducer;