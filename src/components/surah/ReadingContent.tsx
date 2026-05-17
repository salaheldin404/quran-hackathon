"use client";
import React, { memo, useEffect, useMemo, useRef } from "react";
import VerseDisplay from "../verse/VerseDisplay";
import { Verse } from "@/types/verse";
import { toArabicNumber } from "@/lib/utils/surah";
// import LazyRender from "../verse/LazyRender";
import { Surah } from "@/types/surah";
import {  useAppSelector } from "@/lib/store/hooks";
import { useFont } from "@/hooks/useFont";

interface ReadingContentProps {
  pageNumber: number;
  verses: Verse[];
  locale: string;
  surah: Surah;
  showBismillah?: boolean;
  onVerseHighlighted?: () => void;
}

const ReadingContent = memo(
  ({
    pageNumber,
    verses,
    locale,
    surah,
    showBismillah = false,
    onVerseHighlighted,
  }: ReadingContentProps) => {
    const { goToVerse } = useAppSelector(
      (state) => state.surah,
    );
    const currentVerse = useAppSelector((state) => state.audio.currentVerse);
    const { fontSize, fontFamily } = useFont();
    // const isLastReadPage = lastRead?.page_number === Number(pageNumber);
    const pageLabel =
      locale === "ar" ? toArabicNumber(Number(pageNumber)) : pageNumber;

    const { juzLabel, hizbLabel } = useMemo(() => {
      const firstVerse = verses[0];
      const juzNumber = firstVerse?.juz_number;
      const hizbNumber = firstVerse?.hizb_number;

      return {
        juzLabel:
          locale === "ar"
            ? `جزء ${toArabicNumber(Number(juzNumber ?? 0))}`
            : `Juz ${juzNumber ?? "-"}`,
        hizbLabel:
          locale === "ar"
            ? `حزب ${toArabicNumber(Number(hizbNumber ?? 0))}`
            : `Hizb ${hizbNumber ?? "-"}`,
      };
    }, [locale, verses]);
    const onVerseHighlightedRef = useRef(onVerseHighlighted);
    useEffect(() => {
      onVerseHighlightedRef.current = onVerseHighlighted;
    }, [onVerseHighlighted]);

    useEffect(() => {
      if (!currentVerse?.verse_key || !verses?.length) return;
      const isOnThisPage = verses.some(
        (v) => v.verse_key === currentVerse.verse_key,
      );
      if (isOnThisPage) {
        onVerseHighlightedRef.current?.();
      }
    }, [currentVerse?.verse_key, verses]);
  
    return (
      <article
        id={`${surah.number}-${pageNumber}`}
        className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border/40 bg-background shadow-sm"
        aria-label={locale === "ar" ? `صفحة ${pageLabel}` : `Page ${pageLabel}`}
      >
        <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-background/95 px-3 py-2 text-xs text-muted-foreground backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-cairo font-semibold text-foreground/80">
              {surah.name}
            </span>
            <span className="rounded-md bg-muted/60 px-2 py-0.5 font-cairo">
              {juzLabel}
            </span>
          </div>
          <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 font-cairo font-semibold text-primary">
            {hizbLabel}
          </span>
        </div>

        <div className="khatma-slide-scroll flex-1 overflow-y-auto px-2 py-4 sm:px-6 sm:py-5">
          {showBismillah && (
            <div className="mb-5 grid max-w-full place-content-center overflow-hidden text-center">
              <p className="mushaf-text text-6xl sm:text-7xl">﷽</p>
            </div>
          )}

          <div
            dir="rtl"
            className={`${fontSize} ${fontFamily}  leading-relaxed md:leading-loose`}
          >
            {verses.map((verse) => {
              const isVerseTarget = verse.verse_key === goToVerse;
              const scrollVerseId = isVerseTarget
                ? `${verse.verse_key}`
                : undefined;
              return (
                <VerseDisplay
                  key={verse.verse_key}
                  verse={verse}
                  surah={surah}
                  scrollId={scrollVerseId}
                />
              );
            })}
          </div>
        </div>
{/* 
        <div className="shrink-0 border-t border-border/40 px-4 py-2 text-center">
          <span className="block font-cairo text-sm font-medium text-muted-foreground">
            {pageLabel}
            test
          </span>
        </div> */}
      </article>
    );
  },
);

ReadingContent.displayName = "ReadingContent";

export default ReadingContent;
