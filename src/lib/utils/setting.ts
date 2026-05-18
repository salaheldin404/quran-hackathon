import { DatabaseState, PlayHistoryDB, SettingsResponse, UserSettingsDB } from "@/types/settings";
import { WishlistReciterDB, WishlistSurahDB } from "@/types/wishlist";
import { RootState } from "../store/store";

export const transformDBToResponse = (
  settings: UserSettingsDB & {
    wishlistSurahs: WishlistSurahDB[];
    wishlistReciters: WishlistReciterDB[];
    playHistory: PlayHistoryDB[];
  },
): SettingsResponse => {
  return {
    ...settings,
    lastReadAt: settings.lastReadAt ? settings.lastReadAt.toISOString() : null,
    lastPlayedAt: settings.lastPlayedAt
      ? settings.lastPlayedAt.toISOString()
      : null,
    athkarExpiration: settings.athkarExpiration
      ? settings.athkarExpiration.toISOString()
      : null,
    playHistory: settings.playHistory.map((history) => ({
      number: history.surahId,
      name: history.surahName,
      serverLink: history.url,
      reciterId: history.reciterId,
      mushafName: history.mushafName,
      reciterName: history.reciterName,
      mushafId: history.mushafId,
      englishName: history.englishName, 
      englishNameTranslation: history.englishNameTranslation,
      shortName: history.shortName,
      revelationType: history.revelationType,
      numberOfAyahs: history.numberOfAyahs,
      revelationOrder: 0,
      createdAt: history.createdAt.toISOString(),
      updatedAt: history.updatedAt.toISOString(),

    })),
    wishlistSurahs: settings.wishlistSurahs.map((surah) => ({
      createdAt: surah.createdAt.toISOString(),
      updatedAt: surah.updatedAt.toISOString(),
      number: surah.surahId,
      name: surah.surahName,
      serverLink: surah.url,
      reciterId: surah.reciterId,
      reciterName: surah.reciterName,
      mushafId: surah.mushafId,
      mushafName: surah.mushafName,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      shortName: surah.shortName,
      revelationType: surah.revelationType,
      numberOfAyahs: surah.numberOfAyahs,
      revelationOrder: 0,
    })),
    wishlistReciters: settings.wishlistReciters.map((reciter) => ({
      createdAt: reciter.createdAt.toISOString(),
      updatedAt: reciter.updatedAt.toISOString(),
      reciter_name: reciter.reciterName,
      reciter_id: reciter.reciterId,
      reciter_image: reciter.reciterImage,
      mushaf_name: reciter.mushafName,
      mushaf_id: reciter.mushafId,
    })),
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
};

export const transformReduxToDB = (reduxState: {
  font: RootState["font"];
  audio: RootState["audio"];
  surah: RootState["surah"];
  athkar: RootState["athkar"];
  wishlist: RootState["wishlist"];
  language: RootState["language"];
}): DatabaseState => {
  const { font, audio, surah, athkar, wishlist, language } = reduxState;

  // Extract athkar data without expirationDate
  const { expirationDate, ...athkarData } = athkar;

  
  // Don't persist a specific reciter (custom source) — fall back to the default.
  // Play history is always saved as-is.
  const safeReciter = audio.reciter.source
    ? { id: 7, name: "مشاري راشد العفاسي" }
    : audio.reciter;

  return {
    // Audio settings (flattened from nested object)
    reciterId: safeReciter.id,
    reciterName: safeReciter.name,
    volume: audio.volume,

    // Font settings (flattened from nested object)
    fontStyle: font.quranFont.style,
    fontSize: font.quranFont.size,
    ayahNumberStyle: font.ayahNumberStyle,

    // Language setting
    language: language.language,

    // Last read (stored as JSON)
    lastRead: surah.lastRead,

    // Last played surah
    lastPlayedSurahId: audio.lastPlay.length > 0
      ? audio.lastPlay[audio.lastPlay.length - 1].number
      : null,

    // Athkar data (without expirationDate, stored separately)
    athkarData,
    athkarExpiration: expirationDate || null,

    playHistory: audio.lastPlay,

    // Wishlists (using Redux format - will be transformed in API route)
    wishlistSurahs: wishlist.surahs,
    wishlistReciters: wishlist.reciters,
  };
};
 