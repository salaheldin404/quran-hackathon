import { AudioData } from "@/types/audio";
import { Radio } from "@/types/radio";
import { Surah } from "@/types/surah";
import { VerseTiming } from "@/types/verse";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ReciterData = {
  id: number;
  name: string;
  source?: string;
};

interface AudioState {
  audio_url: string | null;

  timestamps: VerseTiming[];
  reciter: ReciterData;
  chapter_id: number;
  isOpen: boolean;
  isPlaying: boolean;
  isAudioLoading: boolean;
  currentVerse: VerseTiming | null;
  radioUrl: string | null;
  radioName: string | null;
  isRadioPlaying: boolean;
  isRadioPlayerOpen: boolean;
  lastPlay: Surah[];
  volume: number;
}

export const initialState: AudioState = {
  audio_url: null,

  timestamps: [],
  reciter: { id: 7, name: "مشاري راشد العفاسي" },
  chapter_id: 0,
  isOpen: false,
  isPlaying: false,
  isAudioLoading: false,
  currentVerse: null,
  radioUrl: null,
  radioName: null,
  isRadioPlaying: false,
  isRadioPlayerOpen: false,
  lastPlay: [],
  volume: 0.5,
};

const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    setAudioData: (state, action: PayloadAction<AudioData>) => {
      state.audio_url = action.payload.audio_url;
      state.timestamps = action.payload.timestamps;
      state.chapter_id = action.payload.chapter_id;
    },
    setReciter: (state, action: PayloadAction<ReciterData>) => {
      state.reciter = action.payload;
    },
    setOpenAudioPlayer: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    setOpenRadioPlayer: (state, action: PayloadAction<boolean>) => {
      state.isRadioPlayerOpen = action.payload;
    },
    setRadioPlaying: (state, action: PayloadAction<boolean>) => {
      state.isRadioPlaying = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setAudioLoading: (state, action: PayloadAction<boolean>) => {
      state.isAudioLoading = action.payload;
    },

    setRadio: (state, action: PayloadAction<Radio>) => {
      state.radioName = action.payload.name;
      state.radioUrl = action.payload.url;
    },
    setRadioName: (state, action: PayloadAction<string>) => {
      state.radioName = action.payload;
    },
    setCurrentVerse(state, action: PayloadAction<VerseTiming | null>) {
      state.currentVerse = action.payload;
    },

    setLastPlay(state, action: PayloadAction<Surah>) {
      // if (state.lastPlay.length >= 6) {
      //   state.lastPlay.pop();
      // }
      // const surah = action.payload;
      // const existIndex = state.lastPlay.findIndex(
      //   (item) =>
      //     item.number === surah.number &&
      //     item.reciterId === surah.reciterId &&
      //     (item.mushafId ?? null) === (surah.mushafId ?? null)
      // );
      // console.log("Exist index:", existIndex);
      // if (existIndex === -1) {
      //   state.lastPlay.unshift(surah);
      // } else {
      //   state.lastPlay.splice(existIndex, 1);
      //   state.lastPlay.unshift(surah);
      // }
      const MAX_ITEMS = 6;
      const surah = action.payload;

      const match = (item: Surah) =>
        item.number === surah.number &&
        item.reciterId === surah.reciterId &&
        // normalize undefined to null for stable comparison
        (item.mushafId ?? null) === (surah.mushafId ?? null);

      const existIndex = state.lastPlay.findIndex(match);
      // If it's already the most recent, nothing to do
      if (existIndex === 0) return;

      // If exists somewhere else, remove it
      if (existIndex > -1) {
        state.lastPlay.splice(existIndex, 1);
      }

      // Insert at front
      state.lastPlay.unshift(surah);

      // Trim to MAX_ITEMS if needed
      if (state.lastPlay.length > MAX_ITEMS) {
        state.lastPlay.pop();
      }
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
    },
    hydrateAudio(
      state,
      action: PayloadAction<{
        reciterId?: number;
        reciterName?: string;
        volume?: number;
        lastPlay?: Surah[];
      }>,
    ) {
      const { reciterId, reciterName, volume, lastPlay } = action.payload;
      if (reciterId !== undefined && reciterName !== undefined) {
        state.reciter = { id: reciterId, name: reciterName };
      }
      if (volume !== undefined) {
        state.volume = volume;
      }
      if (lastPlay !== undefined) {
        state.lastPlay = lastPlay;
      }
    },
  },
});

export const {
  setAudioData,
  setReciter,
  setOpenAudioPlayer,
  setIsPlaying,
  setAudioLoading,
  setCurrentVerse,
  setRadio,
  setOpenRadioPlayer,
  setRadioPlaying,
  setRadioName,
  setLastPlay,
  setVolume,
  hydrateAudio,
} = audioSlice.actions;

export const audioReducer = audioSlice.reducer;
