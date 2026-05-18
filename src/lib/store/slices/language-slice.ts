import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LanguageState {
  language: "ar" | "en";
}

const initialState: LanguageState = {
  language: "ar",
};

export const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<"ar" | "en">) => {
      state.language = action.payload;
    },
    hydrateLanguage: (state, action: PayloadAction<Partial<LanguageState> | null>) => {
      if (action.payload?.language) {
        state.language = action.payload.language;
      }
    },
  },
});

export const { setLanguage, hydrateLanguage } = languageSlice.actions;
export default languageSlice.reducer;
