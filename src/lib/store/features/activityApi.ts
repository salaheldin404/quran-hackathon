import { Activity, ActivityDayInput } from "@/types/activity";
import { qfApiSlice } from "../services/qfApiSlice";
import { Pagination } from "@/types/paginate";

export const activityApi = qfApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivityDays: builder.query({
      query: (params?: string) => `/v1/activity-days?${params}`,
      transformResponse: (response: {
        data: Activity[];
        pagination: Pagination;
      }) => response,
    }), 
    addActivityDay: builder.mutation({
      query: (data: ActivityDayInput) => ({
        url: "/v1/activity-days",
        method: "POST",
        body: data,
        headers: {
          "x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
    }),
  }),
});

export const { useAddActivityDayMutation, useGetActivityDaysQuery,useLazyGetActivityDaysQuery } =
  activityApi;
