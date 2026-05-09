export interface Surah {
  number: number;
  name: string;
  shortName: string;
  revelationType: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationOrder: number;
  serverLink?: string;
  reciterName?: string;
  reciterId?: number;
  mushafName?: string;
  mushafId?: string | number;
}

export interface LastRead {
  chapter_id: number | string;
  verse_number: number;
  verse_key: string;
  page_number: number;
  qpc_uthmani_hafs: string;
}

export type SurahSearchResult<T = Surah> = T & {
  matchType: "name" | "englishName" | "translation" | "number";
};

export interface SurahInfo {
  chapter_id: number;
  id: number;
  language_name: string | null;
  short_text: string;
  source: string;
  text: string;
  resource_id: number;
}

export interface SurahInfoResource {
  author_name: string;
  id: number;
  name: string;
  slug: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

