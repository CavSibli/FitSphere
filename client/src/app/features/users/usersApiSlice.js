import { apiSlice } from '../api/apiSlice';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/auth/users',
      providesTags: ['Users'],
    }),
    getDashboardStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetDashboardStatsQuery,
} = usersApiSlice; 