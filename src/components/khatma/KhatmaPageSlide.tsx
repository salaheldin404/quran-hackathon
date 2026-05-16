"use client";

import { memo, useEffect, useRef } from "react";
import { useGetVersesPageQuery } from "@/lib/store/features/versesApi";
import { Verse } from "@/types/verse";
import { Surah } from "@/types/surah";
import { useFont } from "@/hooks/useFont";
import { toArabicNumber } from "@/lib/utils/surah";
import quranData from "@/data/all-quran-surah.json";
import { useLocale } from "next-intl";
import { useAppSelector } from "@/lib/store/hooks";
import VerseDisplay from "@/components/verse/VerseDisplay";
import KhatmaSurahHeader from "./KhatmaSurahHeader";
import PageSkeleton from "./PageSkeleton";
import PageError from "./PageError";
import TopInfoReadingBar from "../surah/TopInfoReadingBar";

interface KhatmaPageSlideProps {
  pageNumber: number;
  shouldFetch: boolean;
  params: string;
  /** Called when the currently playing verse belongs to this page */
  onVerseHighlighted?: () => void;
  /** Called when verses are loaded for activity tracking */
  onVersesLoaded?: (verses: Verse[]) => void;
}

/** Groups consecutive verses by their chapter_id to insert surah headers */
function groupVersesByChapter(
  verses: Verse[],
): Array<{ chapterId: number; verses: Verse[] }> {
  const groups: Array<{ chapterId: number; verses: Verse[] }> = [];

  for (const verse of verses) {
    const id = Number(verse.chapter_id);
    const last = groups[groups.length - 1];
    if (last && last.chapterId === id) {
      last.verses.push(verse);
    } else {
      groups.push({ chapterId: id, verses: [verse] });
    }
  }
  return groups;
}

const SURAH_WITH_NO_BISMILLAH = new Set([1, 9]);

function getSurahName(chapterId: number): string {
  return quranData.data[chapterId - 1]?.name ?? "";
}

/** Build a full Surah object from static JSON data */
function getSurah(chapterId: number): Surah | null {
  const s = quranData.data[chapterId - 1];
  if (!s) return null;
  return {
    number: s.number,
    name: s.name,
    shortName: s.shortName,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    numberOfAyahs: s.numberOfAyahs,
    revelationType: s.revelationType,
    revelationOrder: s.revelationOrder,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

const KhatmaPageSlide = memo(
  ({
    pageNumber,
    shouldFetch,
    params,
    onVerseHighlighted,
    onVersesLoaded,
  }: KhatmaPageSlideProps) => {
    const locale = useLocale();
    const { fontSize, fontFamily } = useFont();
    const currentVerse = useAppSelector((state) => state.audio.currentVerse);

    const { data, isFetching, isError } = useGetVersesPageQuery(
      { pageNumber, params },
      { skip: !shouldFetch },
    );

    // Auto-scroll carousel when the playing verse lands on this page
    const onVerseHighlightedRef = useRef(onVerseHighlighted);
    useEffect(() => {
      onVerseHighlightedRef.current = onVerseHighlighted;
    }, [onVerseHighlighted]);

    // Call onVersesLoaded when verses are available
    useEffect(() => {
      if (data?.verses?.length) {
        onVersesLoaded?.(data.verses as Verse[]);
      }
    }, [data?.verses, onVersesLoaded]);

    useEffect(() => {
      if (!currentVerse?.verse_key || !data?.verses?.length) return;
      const isOnThisPage = (data.verses as Verse[]).some(
        (v) => v.verse_key === currentVerse.verse_key,
      );
      if (isOnThisPage) {
        onVerseHighlightedRef.current?.();
      }
    }, [currentVerse?.verse_key, data?.verses]);

    // Placeholder while the slide is outside the fetch window
    if (!shouldFetch && !data) {
      return <PageSkeleton />;
    }

    if (isFetching && !data) {
      return <PageSkeleton />;
    }

    if (isError || !data?.verses?.length) {
      return <PageError pageNumber={pageNumber} />;
    }

    const verses = data.verses as Verse[];
    const firstVerse = verses[0];
    const juzNumber = firstVerse?.juz_number ?? "";
    const hizbNumber = firstVerse?.hizb_number ?? "";
    const surahNumber = firstVerse?.chapter_id ?? null;
    const chaptersOnPage = groupVersesByChapter(verses);

    const juzLabel =
      locale === "ar"
        ? `جزء ${toArabicNumber(Number(juzNumber))}`
        : `Juz ${juzNumber}`;
    const hizbLabel =
      locale === "ar"
        ? `حزب ${toArabicNumber(Number(hizbNumber))}`
        : `Hizb ${hizbNumber}`;

    const surahLabel = surahNumber ? getSurahName(Number(surahNumber)) : "";

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Top info bar ─────────────────────────────────── */}
        <TopInfoReadingBar
          surahName={surahLabel}
          juzLabel={juzLabel}
          hizbLabel={hizbLabel}
        />

        {/* ── Scrollable verse content ─────────────────────── */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 pt-2 pb-4 khatma-slide-scroll">
          {chaptersOnPage.map(({ chapterId, verses: chapterVerses }) => {
            const isFirstVerseOfSurah = chapterVerses[0]?.verse_number === 1;
            const surahName = getSurahName(chapterId);
            const surahObj = getSurah(chapterId);
            const showBismillah =
              isFirstVerseOfSurah && !SURAH_WITH_NO_BISMILLAH.has(chapterId);

            return (
              <div key={chapterId}>
                {/* Surah Header — shown only when a new surah begins on this page */}
                {isFirstVerseOfSurah && (
                  <KhatmaSurahHeader
                    surahName={surahName}
                    showBismillah={showBismillah}
                  />
                )}

                {/* Verses — inline mushaf-style flow with audio + actions */}
                {surahObj && (
                  <div
                    dir="rtl"
                    className={`${fontSize} ${fontFamily} leading-relaxed md:leading-loose`}
                  >
                    {chapterVerses.map((verse) => {
                      return (
                        <VerseDisplay
                          key={verse.verse_key}
                          verse={verse}
                          surah={surahObj}
                          disableScroll={true}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

KhatmaPageSlide.displayName = "KhatmaPageSlide";

export default KhatmaPageSlide;
