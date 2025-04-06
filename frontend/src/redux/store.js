import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import transactionReducer from './slices/transactionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    transaction: transactionReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/register/fulfilled',
          'property/createProperty/pending',
          'property/updateProperty/pending'
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.token',
          'meta.arg.images',
          'meta.arg.propertyData.images',
          'meta.arg'
        ],
        // Ignore these paths in the state
        ignoredPaths: ['auth.token']
      }
    })
});