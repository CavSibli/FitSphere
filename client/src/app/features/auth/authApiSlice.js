import { apiSlice } from '../api/apiSlice';

const authApiSlice = apiSlice.injectEndpoints({
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
    getUsers: builder.query({
      query: () => '/auth/users',
      providesTags: ['Users'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserProfileQuery,
  useGetUsersQuery,
} = authApiSlice; 