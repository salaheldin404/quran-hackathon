import type { RootState } from "@/lib/store/store";
import { LastRead, Surah } from "./surah";
import {
  ReciterWishlist,
  WishlistReciterDB,
  WishlistSurahDB,
} from "./wishlist";
import { AthkarState } from "@/lib/store/slices/athkar-slice";

export type SyncStatus = "idle" | "pending" | "syncing" | "synced" | "error";

export interface LocalStorageState {
  font: RootState["font"];
  audio: {
    reciter: RootState["audio"]["reciter"];
    lastPlay: RootState["audio"]["lastPlay"];
    volume: RootState["audio"]["volume"];
  };
  surah: {
    lastRead: RootState["surah"]["lastRead"];
  };
  wishlist: {
    reciters: RootState["wishlist"]["reciters"];
    surahs: RootState["wishlist"]["surahs"];
  };
  athkar: RootState["athkar"];
  language: RootState["language"];
}

export interface DatabaseState {
  reciterId: number;
  reciterName: string;
  volume: number;
  fontStyle: string;
  fontSize: number;
  ayahNumberStyle: string;
  language: string;
  lastRead: LastRead | null;
  lastReadAt?: string;
  lastPlayedSurahId?: number | null;
  lastPlayedAt?: string;
  athkarData: Omit<AthkarState, "expirationDate">;
  athkarExpiration: string | null;
  playHistory: Surah[];
  wishlistSurahs: Surah[];
  wishlistReciters: ReciterWishlist[];
}

export interface WishlistSurahResponse extends Omit<
  WishlistSurahDB,
  "updatedAt" | "createdAt"
> {
  updatedAt: string;
  createdAt: string;
}
export interface WishlistReciterResponse extends Omit<
  WishlistReciterDB,
  "updatedAt" | "createdAt"
> {
  updatedAt: string;
  createdAt: string;
}

export interface SettingsResponse {
  id: string;
  userId: string;
  reciterId: number;

  reciterName: string;
  volume: number;
  fontStyle: string;
  fontSize: number;
  ayahNumberStyle: string;
  language: string;
  lastRead: Partial<LastRead> | null;
  lastReadAt: string | null;
  lastPlayedSurahId: number | null;
  lastPlayedAt: string | null;
  athkarData: Omit<AthkarState, "expirationDate">;
  athkarExpiration: string | null;
  playHistory: Surah[];
  wishlistSurahs: Surah[];
  wishlistReciters: ReciterWishlist[];

  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsDB extends Omit<
  SettingsResponse,
  | "wishlistSurahs"
  | "wishlistReciters"
  | "createdAt"
  | "updatedAt"
  | "lastReadAt"
  | "lastPlayedAt"
  | "athkarExpiration"
  | "playHistory"
> {
  athkarExpiration: Date | null;
  lastReadAt: Date | null;
  lastPlayedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayHistoryDB {
  id: string;
  settingsId: string;
  surahId: number;
  reciterId: number;
  surahName: string;
  url: string;
  reciterName: string;
  mushafName: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  shortName: string;
  mushafId: number;
  createdAt: Date;

  updatedAt: Date;
}
