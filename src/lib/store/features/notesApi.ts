import { qfApiSlice } from "../services/qfApiSlice";
import type { Note, NoteInput } from "@/types/note";
export const notesApi = qfApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotes: builder.query({
      query: (params?: string) => `/v1/notes?${params}`,
      transformResponse: (response: { data: Note[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Note" as const, id })),
              { type: "Note", id: "LIST" },
            ]
          : [{ type: "Note", id: "LIST" }],
    }),
    getNoteByVerse: builder.query({
      query: (verseKey: string) => `/v1/notes/by-verse/${verseKey}`,
      transformResponse: (response: { data: Note[] }) => response.data,
      providesTags: (result, error, verse) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Note" as const, id })),
              { type: "Note", id: `VERSE-${verse}` },
            ]
          : [{ type: "Note", id: `VERSE-${verse}` }],
    }),
    addNote: builder.mutation({
      query: (note: NoteInput) => ({
        url: "/v1/notes",
        method: "POST",
        body: note,
      }),
      transformResponse: (response: { data: Note }) => response.data,
      invalidatesTags: [{ type: "Note", id: "LIST" }],
    }),
    updateNote: builder.mutation({
      query: ({ id, ...note }: Partial<Note> & { id: string }) => ({
        url: `/v1/notes/${id}`,
        method: "PATCH",
        body: note,
      }),
      transformResponse: (response: { data: Note }) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: "Note", id }],
    }),
    deleteNote: builder.mutation({
      query: (id: string) => ({
        url: `/v1/notes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Note", id }],
    }),
  }),
});

export const {
  useGetAllNotesQuery,
  useGetNoteByVerseQuery,
  useAddNoteMutation,

  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = notesApi;
