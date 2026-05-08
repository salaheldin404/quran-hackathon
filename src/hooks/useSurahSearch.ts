"use client";
import { Surah, SurahSearchResult } from "@/types/surah";
import { useMemo } from "react";

export const useSurahSearch = <T extends Surah>({
  searchTerm,
  limit,
  surahs,
}: {
  searchTerm: string;
  limit?: number;
  surahs?: T[];
}) => {
  return useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];
    if (!surahs) return [];

    return surahs
      .map((surah) => {
        let matchType: SurahSearchResult["matchType"] | null = null;

        // Search by number
        if (surah.number.toString() === term) {
          matchType = "number";
        }
        // Search by Arabic name (full or short)
        else if (
          surah.name.toLowerCase().includes(term) ||
          surah.shortName.toLowerCase().includes(term)
        ) {
          matchType = "name";
        }
        // Search by English name
        else if (surah.englishName.toLowerCase().includes(term)) {
          matchType = "englishName";
        }
        // Search by English translation
        else if (
          surah.englishNameTranslation.toLowerCase().includes(term)
        ) {
          matchType = "translation";
        }

        if (matchType) {
          return { ...surah, matchType } as SurahSearchResult<T>;
        }
        return null;
      })
      .filter((item): item is SurahSearchResult<T> => item !== null)
      .sort((a, b) => {
        // Prioritize exact number matches
        if (a.matchType === "number") return -1;
        if (b.matchType === "number") return 1;
        // Then sort by surah number
        return a.number - b.number;
      })
      .slice(0, limit);
  }, [searchTerm, limit, surahs]);
};
