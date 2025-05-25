import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  redirectTo: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      // Nettoyer l'état avant de définir les nouvelles credentials
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.redirectTo = null;

      // Définir les nouvelles credentials
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      
      // Définir la redirection en fonction du rôle
      if (user.role === 'admin') {
        state.redirectTo = '/dashboard-admin';
      } else if (user.role === 'user') {
        state.redirectTo = '/dashboard-user';
      }
    },
    logout: (state) => {
      // Nettoyer complètement l'état
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.redirectTo = null;
      localStorage.removeItem('token');
    },
    clearRedirect: (state) => {
      state.redirectTo = null;
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      } else {
        // Si pas de token, s'assurer que l'état est vide
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.redirectTo = null;
      }
    }
  }
});

export const { setCredentials, logout, clearRedirect, initializeAuth } = authSlice.actions;

export default authSlice.reducer;

// Sélecteurs
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectRedirectTo = (state) => state.auth.redirectTo;

  export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getUserProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['Profile'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserProfileQuery,
} = authApiSlice;
