import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api/v4",
  credentials: "include",
});


export const newVersionApiSlice = createApi({
  reducerPath: "apiv2",
  baseQuery,
  endpoints: () => ({}),
});
