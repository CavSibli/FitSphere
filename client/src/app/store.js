import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice'; // RTK Query slice
import authReducer from '../features/authSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    // autres slices à ajouter
  },
  middleware: (getDefault) =>
    getDefault().concat(apiSlice.middleware),
});
