"use client";

import { useCallback, useMemo, useState } from "react";
import KhatmaPageSlide from "./KhatmaPageSlide";
import { useLocale, useTranslations } from "next-intl";
import { toArabicNumber } from "@/lib/utils/surah";
import { Loader2 } from "lucide-react";
import { setKhatmaBookmark } from "@/lib/store/slices/khatma-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { findOwnedPlan, updateKhatma } from "@/server/khatma";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "../ui/button";
import DotIndicators from "./DotIndicators";
import ReaderPageHeader from "../surah/ReaderPageHeader";
import useReaderCarousel from "@/hooks/useReaderCarousel";

interface KhatmaReaderCarouselProps {
  start: number;
  end: number;
}

const KhatmaReaderCarousel = ({ start, end }: KhatmaReaderCarouselProps) => {
  const locale = useLocale();
  const t = useTranslations("KhatmaReader");
  const isRTL = locale === "ar";
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isSavingBookmark, setIsSavingBookmark] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  const { user } = useAppSelector((state) => state.sync);

  const khatmaId = useAppSelector((state) => state.khatma.khatmaId);

  const storeSlideIndex = useAppSelector(
    (state) => state.khatma.khatmaBookmarkIndex,
  );

  const pages = useMemo(
    () => Array.from({ length: end - start + 1 }, (_, i) => start + i),
    [start, end],
  );
  const {
    emblaRef,
    selectedIndex,
    canClickVisualLeft,
    canClickVisualRight,
    fetchedSlides,
    handleVisualLeft,
    handleVisualRight,
    scrollTo,
  } = useReaderCarousel({
    slideCount: pages.length,
    isRTL,
    initialIndex: storeSlideIndex,
  });
  const isCurrentBookmark = storeSlideIndex === selectedIndex;
  const isLastSlide = selectedIndex === pages.length - 1;

  const params = useMemo(
    () =>
      new URLSearchParams({
        fields:
          "qpc_uthmani_hafs,page_number,juz_number,hizb_number,verse_key,verse_number,chapter_id,audio",
        per_page: "50",
      }).toString(),
    [],
  );

  const handleCompleteReading = async () => {
    const userId = user?.id;
    if (!userId) {
      toast.error(t("noActiveKhatma"));
      return;
    }
    setIsUpdatingProgress(true);

    const khatmaPlan = await findOwnedPlan(khatmaId!, userId);
    if (!khatmaPlan) {
      toast.error(t("noActiveKhatma"));
      setIsUpdatingProgress(false);
      return;
    }
    const newCompletedPages = Math.min(
      khatmaPlan.totalPages,
      khatmaPlan.completedPages + khatmaPlan.pagesPerDay,
    );
    const newCurrentPage = Math.min(
      khatmaPlan.totalPages,
      khatmaPlan.currentPage + khatmaPlan.pagesPerDay,
    );
    const isCompleted = newCompletedPages >= khatmaPlan.totalPages;
    const result = await updateKhatma(khatmaPlan.id, {
      completedPages: newCompletedPages,
      currentPage: newCurrentPage,
      isCompleted,
      bookMarkIndex: null,
    });
    if (result.status === 200) {
      toast.success(t("progressUpdated"));

      router.push(isCompleted ? "/khatma/finish" : "/khatma");
    } else {
      toast.error(result.message);
      setIsUpdatingProgress(false);
    }
  };

  const handleBookmark = useCallback(async () => {
    if (!khatmaId) {
      toast.error(t("noActiveKhatma"));
      return;
    }
    dispatch(setKhatmaBookmark(selectedIndex));
    setIsSavingBookmark(true);
    const result = await updateKhatma(khatmaId, {
      bookMarkIndex: selectedIndex,
    });
    if (result.status == 200) {
      toast.success(t("bookmarkSaved"));
    } else {
      toast.error(result.message);
    }
    setIsSavingBookmark(false);
  }, [selectedIndex, dispatch, khatmaId, t]);

  const currentPage = pages[selectedIndex] ?? start;
  const pageLabel = isRTL ? toArabicNumber(currentPage) : String(currentPage);
  const totalLabel = isRTL
    ? toArabicNumber(pages.length)
    : String(pages.length);
  const indexLabel = isRTL
    ? toArabicNumber(selectedIndex + 1)
    : String(selectedIndex + 1);
  const pageText = isRTL ? `صفحة ${pageLabel}` : `Page ${pageLabel}`;

  if (isUpdatingProgress) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-8rem)] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("updatingProgress")}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] max-h-[900px]">
      <ReaderPageHeader
        pageText={pageText}
        currentIndexLabel={indexLabel}
        totalItemsLabel={totalLabel}
        bookmarkLabel={t("saveBookmark")}
        isBookmarked={isCurrentBookmark}
        isBookmarkLoading={isSavingBookmark}
        onBookmark={handleBookmark}
        onPrevious={handleVisualRight}
        onNext={handleVisualLeft}
        canGoPrevious={canClickVisualRight}
        canGoNext={canClickVisualLeft}
      />

      {/* Embla Carousel */}
      <div className="flex-1 min-h-0 relative ">
        <div
          className="khatma-carousel overflow-hidden h-full "
          ref={emblaRef}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="khatma-carousel__container flex gap-2 h-full">
            {pages.map((pageNumber, index) => (
              <div
                key={pageNumber}
                className="khatma-carousel__slide flex-[0_0_100%]  min-w-0 h-full"
              >
                <div className="h-full  border border-border/30 bg-card shadow-sm overflow-hidden">
                  <KhatmaPageSlide
                    pageNumber={pageNumber}
                    shouldFetch={fetchedSlides.has(index)}
                    params={params}
                    onVerseHighlighted={() => scrollTo(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom controls — dots + swipe hint */}
      <div className="flex flex-col items-center gap-2 px-4 py-3 border-t border-border/40 bg-card/80 backdrop-blur-sm shrink-0 rounded-b-xl">
        {isLastSlide ? (
          <Button
            onClick={handleCompleteReading}
            className="cursor-pointer w-full md:w-auto px-8 py-2.5 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
          >
            {isUpdatingProgress ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              t("markTodayComplete")
            )}
          </Button>
        ) : (
          <DotIndicators
            total={pages.length}
            selected={selectedIndex}
            onSelect={scrollTo}
          />
        )}

        {/* Mobile swipe hint (only shown briefly) */}
        <p className="text-[10px] text-muted-foreground/50 font-cairo md:hidden select-none">
          {isRTL ? "اسحب للتنقل بين الصفحات" : "Swipe to navigate pages"}
        </p>
      </div>
    </div>
  );
};

export default KhatmaReaderCarousel;
