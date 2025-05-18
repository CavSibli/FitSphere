import { apiSlice } from '../api/apiSlice';

const guestOrdersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createGuestOrder: builder.mutation({
      query: (orderData) => ({
        url: '/guest-orders/checkout',
        method: 'POST',
        body: orderData,
      }),
    }),
    getGuestOrders: builder.query({
      query: () => '/guest-orders',
      providesTags: ['GuestOrders'],
    }),
    getGuestOrderDetails: builder.query({
      query: (id) => `/guest-orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'GuestOrders', id }],
    }),
    updateGuestOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/guest-orders/${orderId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['GuestOrders'],
    }),
  }),
});

export const {
  useCreateGuestOrderMutation,
  useGetGuestOrdersQuery,
  useGetGuestOrderDetailsQuery,
  useUpdateGuestOrderStatusMutation,
} = guestOrdersApiSlice; 