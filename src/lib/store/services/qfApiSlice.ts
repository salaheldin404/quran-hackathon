import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api/qf",
  credentials: "include",
});


export const qfApiSlice = createApi({
  reducerPath: "qfApi",
  baseQuery,
  endpoints: () => ({}),
  tagTypes: ["Note"],
});