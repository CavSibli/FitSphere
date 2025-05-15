import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
    addProduct: builder.mutation({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Products'],
    }),
    getProducts: builder.query({
      query: () => '/products',
      providesTags: ['Products'],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Products', id }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Products', id },
        'Products',
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
    updateProductTrendy: builder.mutation({
      query: ({ id, trendy }) => ({
        url: `/products/${id}/trendy`,
        method: 'PATCH',
        body: { trendy },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Products', id },
        'Products',
      ],
    }),
    createGuestOrder: builder.mutation({
      query: (orderData) => ({
        url: '/guest-orders/checkout',
        method: 'POST',
        body: orderData,
      }),
    }),
    createUserOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),
    getAllOrders: builder.query({
      query: () => '/admin/orders',
      providesTags: ['Orders'],
    }),
    getGuestOrders: builder.query({
      query: () => '/guest-orders',
      providesTags: ['GuestOrders'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/admin/orders/${orderId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),
    updateGuestOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/guest-orders/${orderId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['GuestOrders'],
    }),
    getDashboardStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),
    getUsers: builder.query({
      query: () => '/auth/users',
      providesTags: ['Users'],
    }),
    getUserProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['Profile'],
    }),
    getUserOrders: builder.query({
      query: () => '/orders/user/me',
      providesTags: ['UserOrders'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useAddProductMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductTrendyMutation,
  useCreateGuestOrderMutation,
  useCreateUserOrderMutation,
  useGetAllOrdersQuery,
  useGetGuestOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdateGuestOrderStatusMutation,
  useGetDashboardStatsQuery,
  useGetUsersQuery,
  useGetUserProfileQuery,
  useGetUserOrdersQuery,
} = apiSlice;
