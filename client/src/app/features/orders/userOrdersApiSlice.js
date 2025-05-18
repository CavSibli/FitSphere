import { apiSlice } from '../api/apiSlice';

const userOrdersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUserOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),
    getUserOrders: builder.query({
      query: () => '/orders/user/me',
      providesTags: ['UserOrders'],
    }),
    getAllOrders: builder.query({
      query: () => '/admin/orders',
      providesTags: ['Orders'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/admin/orders/${orderId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),
    getDashboardStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useCreateUserOrderMutation,
  useGetUserOrdersQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetDashboardStatsQuery,
} = userOrdersApiSlice; 