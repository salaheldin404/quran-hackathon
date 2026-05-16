import { Streak } from "@/types/streak";
import { qfApiSlice } from "../services/qfApiSlice";

export const streaksApi = qfApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStreaks: builder.query({
      query: (params?: string) => `/v1/streaks?${params}`,
      transformResponse: (response: { data: Streak[] }) => response.data,
    }),
    getCurrentStreak: builder.query({
      query: () => ({
        url: `/v1/streaks/current-streak-days?type=QURAN`,
        headers: {
          "x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
      transformResponse: (response: { data: { days: number } }) =>
        response.data,
    }),
  }),
});

export const { useGetStreaksQuery, useGetCurrentStreakQuery } = streaksApi;
