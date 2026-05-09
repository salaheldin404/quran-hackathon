import { newVersionApiSlice } from "../services/newVersionApiSlice";

export const hadithApi = newVersionApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHadithReference: builder.query({
      query: ({ ayahKey, params }) =>
        `/hadith_references/by_ayah/${ayahKey}?${params}`,
    }),
    getHadithForSpecificAyah: builder.query({
      query: ({ ayahKey, params }) =>
        `/hadith_references/by_ayah/${ayahKey}/hadiths?${params}`,
    }),
  }),
});

export const { useGetHadithReferenceQuery, useGetHadithForSpecificAyahQuery } =
  hadithApi;
