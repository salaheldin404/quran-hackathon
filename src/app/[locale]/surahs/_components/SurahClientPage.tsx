"use client";

// React and Next.js imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

// Third-party library imports
import { toast } from "sonner";
import { LuBookOpen, LuFileText } from "react-icons/lu";

// UI Component imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SurahInfo from "@/components/surah/SurahInfo";
import VersesLoadingSkeleton from "@/components/verse/VersesLoadingSkeleton";
import ReadingContent from "@/components/surah/ReadingContent";
import TranslationContent from "@/components/surah/TranslationContent";
import SurahNavigationButton from "@/components/surah/SurahNavigationButton";

// Redux/API imports
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useGetVersesChapterQuery } from "@/lib/store/features/versesApi";
import { setGoToVerse, setLastRead } from "@/lib/store/slices/surah-slice";

// Utility, Data, and Type imports
import { groupVersesByPage } from "@/lib/utils/verse";
import { Verse } from "@/types/verse";
import SurahTopBar from "@/components/surah/SurahTopBar";
import useSurahNavigation from "@/hooks/useSurahNavigation";
import { Surah } from "@/types/surah";
import { toArabicNumber } from "@/lib/utils/surah";

import useReaderCarousel from "@/hooks/useReaderCarousel";
import ReaderPageHeader from "@/components/surah/ReaderPageHeader";

interface SurahClientPageProps {
  initialSurah: Surah;
  locale: "en" | "ar";
}

const SurahClientPage = ({ initialSurah, locale }: SurahClientPageProps) => {
  const surah = initialSurah;
  const id = surah.number.toString();
  const searchParams = useSearchParams();
  const verseQuery = searchParams.get("verse");
  const { currentVerseLocation, lastRead } = useAppSelector(
    (state) => state.surah,
  );

  const dispatch = useAppDispatch();
  const t = useTranslations("Surah");
  const t2 = useTranslations("SurahPage");
  const [groupedVerses, setGroupedVerses] = useState<Record<string, Verse[]>>(
    {},
  );
  const numericId = Number(id);

  const [activeTab, setActiveTab] = useState("reading");
  const isRTL = locale === "ar";

  const chapterParams = useMemo(() => {
    const params = new URLSearchParams({
      fields:
        "text_uthmani,qpc_uthmani_hafs,text_uthmani_tajweed,page_number,audio,chapter_id",
      per_page: "all",
      translations: "131,85",
      translation_fields: "resource_name,language_id",
    });
    return params.toString();
  }, []);

  const { data: versesData, isFetching } = useGetVersesChapterQuery(
    {
      params: chapterParams.toString(),
      chapterId: numericId,
    },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    },
  );

  const { handleNextSurah, handlePreviousSurah, navigationState } =
    useSurahNavigation(numericId);

  const readingPages = useMemo(
    () => Object.keys(groupedVerses),
    [groupedVerses],
  );

  const {
    emblaRef: readingCarouselRef,
    emblaApi: readingCarouselApi,
    selectedIndex: selectedPageIndex,
    canClickVisualLeft,
    canClickVisualRight,
    handleVisualLeft,
    handleVisualRight,
    scrollTo,
  } = useReaderCarousel({
    slideCount: readingPages.length,
    isRTL,
    preloadAdjacentSlides: false,
  });

  const currentReaderPage = readingPages[selectedPageIndex] ?? readingPages[0];
  const currentPageVerses = currentReaderPage
    ? (groupedVerses[currentReaderPage] ?? [])
    : [];
  const currentPageAnchorVerse = currentPageVerses[0];
  const isCurrentPageSaved =
    Number(lastRead?.chapter_id) === numericId &&
    Number(lastRead?.page_number) === Number(currentReaderPage);
  const currentReaderPageLabel = currentReaderPage
    ? locale === "ar"
      ? toArabicNumber(Number(currentReaderPage))
      : currentReaderPage
    : "-";
  const selectedReaderLabel =
    locale === "ar"
      ? toArabicNumber(selectedPageIndex + 1)
      : String(selectedPageIndex + 1);
  const totalReaderLabel =
    locale === "ar" ? toArabicNumber(readingPages.length) : readingPages.length;

  const handleSaveMark = useCallback(() => {
    if (!currentPageAnchorVerse) return;

    dispatch(setGoToVerse(null));
    dispatch(
      setLastRead({
        chapter_id: currentPageAnchorVerse.chapter_id,
        verse_number: currentPageAnchorVerse.verse_number,
        page_number: currentPageAnchorVerse.page_number,
        qpc_uthmani_hafs: currentPageAnchorVerse.qpc_uthmani_hafs,
        verse_key: currentPageAnchorVerse.verse_key,
      }),
    );
    toast.success(`${t2("marked-saved")}`);
  }, [currentPageAnchorVerse, dispatch, t2]);

  // Memoize bismillah condition
  const showBismillah = useMemo(
    () => surah?.number !== 1 && surah?.number !== 9,
    [surah?.number],
  );

  // useScrollToLastRead({ lastRead, isFetching, verseQuery });

  useEffect(() => {
    if (versesData) {
      const grouped = groupVersesByPage(versesData.verses);

      setGroupedVerses(grouped);
    }
  }, [versesData]);

  useEffect(() => {
    if (verseQuery) {
      dispatch(setGoToVerse(`${id}:${verseQuery}`));
    } else {
      dispatch(setGoToVerse(null));
    }
  }, [verseQuery, dispatch, id]);

  useEffect(() => {
    if (!readingCarouselApi || !readingPages.length) return;

    const targetPage = verseQuery
      ? versesData?.verses?.find(
          (verse: Verse) => verse.verse_key === `${id}:${verseQuery}`,
        )?.page_number
      : lastRead?.chapter_id === numericId
        ? lastRead.page_number
        : null;

    if (!targetPage) return;

    const targetIndex = readingPages.indexOf(String(targetPage));
    if (targetIndex >= 0) {
      readingCarouselApi.scrollTo(targetIndex, true);
    }
  }, [
    id,
    lastRead,
    numericId,
    readingCarouselApi,
    readingPages,
    verseQuery,
    versesData?.verses,
  ]);

  if (!surah) {
    return (
      <div className="text-center py-10 space-y-3">
        <h3 className="text-2xl font-bold">{t2("not-found")}</h3>
        <p className="text-gray-500">{t2("not-found-description")}</p>
      </div>
    );
  }
  return (
    <div className="py-10 relative" dir={isRTL ? "rtl" : "ltr"}>
      {activeTab === "translation" && (
        <SurahTopBar
          surah={surah}
          currentVerseLocation={currentVerseLocation}
        />
      )}
      <div className="max-w-4xl mx-auto p-3 md:p-6 pb-10">
        <SurahInfo surah={surah} locale={locale} t={t} t2={t2} />
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full my-4"
        >
          <TabsList className="grid w-full grid-cols-2 h-auto rounded-0">
            <TabsTrigger
              value="reading"
              className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white py-3"
            >
              <LuFileText className="h-4 w-4" />
              {t2("reading")}
            </TabsTrigger>
            <TabsTrigger
              value="translation"
              className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white py-3"
            >
              <LuBookOpen className="h-4 w-4" />
              {t2("translation")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reading">
            {isFetching ? (
              <VersesLoadingSkeleton />
            ) : (
              <div
                dir={isRTL ? "rtl" : "ltr"}
                className="mt-6 overflow-hidden rounded-md rounded-t-xl border border-border/40 dark:bg-card/40"
              >
                <ReaderPageHeader
                  bookmarkLabel={t2("save-mark")}
                  canGoNext={canClickVisualLeft}
                  canGoPrevious={canClickVisualRight}
                  currentIndexLabel={selectedReaderLabel}
                  isBookmarkLoading={false}
                  isBookmarked={isCurrentPageSaved}
                  onBookmark={handleSaveMark}
                  onNext={handleVisualLeft}
                  onPrevious={handleVisualRight}
                  pageText={
                    locale === "ar"
                      ? `صفحة ${currentReaderPageLabel}`
                      : `Page ${currentReaderPageLabel}`
                  }
                  totalItemsLabel={String(totalReaderLabel)}
                />

                <div className="h-[calc(100dvh-12rem)]  max-h-[900px] ">
                  <div
                    ref={readingCarouselRef}
                    className="h-full overflow-hidden"
                    dir={isRTL ? "rtl" : "ltr"}
                    role="region"
                    aria-roledescription="carousel"
                    aria-label={
                      locale === "ar"
                        ? "صفحات قراءة السورة"
                        : "Surah reading pages"
                    }
                  >
                    <div className="flex h-full gap-2">
                      {readingPages.map((pageNumber, index) => {
                        const versesOnPage = groupedVerses[pageNumber];
                        return (
                          <div
                            key={pageNumber}
                            className="min-w-0 flex-[0_0_100%]"
                            role="group"
                            aria-roledescription="slide"
                            aria-label={
                              locale === "ar"
                                ? `صفحة ${toArabicNumber(Number(pageNumber))}`
                                : `Page ${pageNumber}`
                            }
                          >
                            <ReadingContent
                              pageNumber={pageNumber}
                              verses={versesOnPage}
                              locale={locale}
                              surah={surah}
                              showBismillah={showBismillah && index === 0}
                              onVerseHighlighted={() => scrollTo(index)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="border-t border-border/40 px-4 py-2 text-center font-cairo text-[11px] text-muted-foreground md:hidden">
                  {locale === "ar"
                    ? "اسحب للتنقل بين الصفحات"
                    : "Swipe to move between pages"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="translation">
            {isFetching ? (
              <VersesLoadingSkeleton />
            ) : (
              <TranslationContent verses={versesData?.verses} surah={surah} />
            )}
          </TabsContent>
        </Tabs>

        {!isFetching && (
          <SurahNavigationButton
            onNextSurah={handleNextSurah}
            onPreviousSurah={handlePreviousSurah}
            isPreviousDisabled={navigationState.isPreviousDisabled}
            isNextDisabled={navigationState.isNextDisabled}
          />
        )}
      </div>
    </div>
  );
};

export default SurahClientPage;
