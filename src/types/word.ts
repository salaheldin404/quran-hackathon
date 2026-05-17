import { VerseTiming } from "./verse";

export interface Word {
  char_type_name: CharType;
  codeV1?: string;
  codeV2?: string;
  page_number?: number;
  line_number?: number;
  position: number;
  location?: string;

  id?: number;
  text_uthmani?: string;
  text_indopak?: string;
  text_qpc_hafs: string;
  chapter_id: number | string;
  text?: string;
}
export interface WordVerse {
  verseNumber: number;
  verseKey: string;
  chapterId: number | string;
  timestamps?: VerseTiming;
  translationsLabel: string;
  translationsCount: number;
}

export enum CharType {
  Word = "word",
  End = "end",
  Pause = "pause",
  Sajdah = "sajdah",
  RubElHizb = "rub-el-hizb",
}
