import { newVersionApiSlice } from "../services/newVersionApiSlice";

export const chaptersApi = newVersionApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChapters: builder.query({
      query: () => `/chapters`,
    }),
    getChapter: builder.query({
      query: (id) => `/chapters/${id}`,
    }),
    getChapterInfo: builder.query({
      query: ({id,params} : { id: number; params?: string }) => `/chapters/${id}/info?${params}`,
    }),
  }),
});

export const {
  useGetChaptersQuery,
  useGetChapterInfoQuery,
  useGetChapterQuery,
} = chaptersApi;
