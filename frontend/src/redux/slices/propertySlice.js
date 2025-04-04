import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for property actions
export const fetchProperties = createAsyncThunk(
  'property/fetchProperties',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/properties', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'property/fetchPropertyById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/properties/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (propertyData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post('/api/properties', propertyData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateProperty = createAsyncThunk(
  'property/updateProperty',
  async ({ id, propertyData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`/api/properties/${id}`, propertyData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const toggleLikeProperty = createAsyncThunk(
  'property/toggleLike',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(`/api/properties/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { id, likes: response.data.likes };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  properties: [],
  currentProperty: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
  loading: false,
  error: null,
  filters: {
    type: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    state: '',
    bedrooms: '',
    bathrooms: '',
    search: ''
  }
};

// Property slice
const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch properties';
      })
      // Fetch single property
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch property';
      })
      // Create property
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties.unshift(action.payload.property);
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create property';
      })
      // Update property
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.properties.findIndex(p => p._id === action.payload.property._id);
        if (index !== -1) {
          state.properties[index] = action.payload.property;
        }
        if (state.currentProperty?._id === action.payload.property._id) {
          state.currentProperty = action.payload.property;
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update property';
      })
      // Delete property
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = state.properties.filter(p => p._id !== action.payload);
        if (state.currentProperty?._id === action.payload) {
          state.currentProperty = null;
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete property';
      })
      // Toggle like
      .addCase(toggleLikeProperty.fulfilled, (state, action) => {
        const property = state.properties.find(p => p._id === action.payload.id);
        if (property) {
          property.likes = action.payload.likes;
        }
        if (state.currentProperty?._id === action.payload.id) {
          state.currentProperty.likes = action.payload.likes;
        }
      });
  }
});

export const { setFilters, clearFilters, clearError } = propertySlice.actions;
export default propertySlice.reducer;