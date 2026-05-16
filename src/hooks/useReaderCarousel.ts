"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import {
  clampReaderCarouselIndex,
  DEFAULT_READER_CAROUSEL_OPTIONS,
  getInitialFetchedReaderSlides,
} from "./useReaderCarouselState";

export interface UseReaderCarouselOptions {
  slideCount: number;
  isRTL: boolean;
  initialIndex?: number;
  keyboardNavigation?: boolean;
  preloadAdjacentSlides?: boolean;
  emblaOptions?: EmblaOptionsType;
  onReadingPageChange?: (params: {
    previousIndex: number;
    currentIndex: number;
    secondsSpent: number;
  }) => void;
}

export interface UseReaderCarouselReturn {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  emblaApi: ReturnType<typeof useEmblaCarousel>[1];
  selectedIndex: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  canClickVisualLeft: boolean;
  canClickVisualRight: boolean;
  fetchedSlides: Set<number>;
  handleVisualLeft: () => void;
  handleVisualRight: () => void;
  scrollTo: (index: number) => void;
}

const useReaderCarousel = ({
  slideCount,
  isRTL,
  initialIndex = 0,
  keyboardNavigation = true,
  preloadAdjacentSlides = true,
  emblaOptions,
  onReadingPageChange,
}: UseReaderCarouselOptions): UseReaderCarouselReturn => {
  const safeInitialIndex = clampReaderCarouselIndex(initialIndex, slideCount);
  const [selectedIndex, setSelectedIndex] = useState(safeInitialIndex);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [fetchedSlides, setFetchedSlides] = useState<Set<number>>(() =>
    getInitialFetchedReaderSlides({
      initialIndex: safeInitialIndex,
      slideCount,
      preloadAdjacentSlides,
    }),
  );
  const isInitialScrollDone = useRef(false);
  const previousIndexRef = useRef(safeInitialIndex);
  const pageEnterTimeRef = useRef(Date.now());

  const [emblaRef, emblaApi] = useEmblaCarousel({
    ...DEFAULT_READER_CAROUSEL_OPTIONS,
    ...emblaOptions,
    direction: isRTL ? "rtl" : "ltr",
  });

  useEffect(() => {
    setSelectedIndex(safeInitialIndex);
    setFetchedSlides(
      getInitialFetchedReaderSlides({
        initialIndex: safeInitialIndex,
        slideCount,
        preloadAdjacentSlides,
      }),
    );
    isInitialScrollDone.current = false;
  }, [safeInitialIndex, slideCount, preloadAdjacentSlides]);

  useEffect(() => {
    setFetchedSlides((prev) => {
      const next = new Set(prev);
      next.add(selectedIndex);

      if (preloadAdjacentSlides) {
        if (selectedIndex > 0) next.add(selectedIndex - 1);
        if (selectedIndex < slideCount - 1) next.add(selectedIndex + 1);
      }

      return next.size === prev.size ? prev : next;
    });
  }, [selectedIndex, slideCount, preloadAdjacentSlides]);

  const onSelect = useCallback(
    (api: EmblaCarouselType) => {
      const currentIndex = api.selectedScrollSnap();
      const previousIndex = previousIndexRef.current;
      const secondsSpent = Math.floor(
        (Date.now() - pageEnterTimeRef.current) / 1000,
      );
      setSelectedIndex(api.selectedScrollSnap());
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());

      if (currentIndex !== previousIndex) {
        onReadingPageChange?.({ previousIndex, currentIndex, secondsSpent });
      }
      previousIndexRef.current = currentIndex;
      pageEnterTimeRef.current = Date.now();
    },
    [onReadingPageChange],
  );

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || isInitialScrollDone.current) return;

    if (safeInitialIndex > 0) {
      emblaApi.scrollTo(safeInitialIndex, true);
    }

    isInitialScrollDone.current = true;
  }, [emblaApi, safeInitialIndex]);

  const handleVisualLeft = useCallback(() => {
    if (isRTL) emblaApi?.scrollNext();
    else emblaApi?.scrollPrev();
  }, [emblaApi, isRTL]);

  const handleVisualRight = useCallback(() => {
    if (isRTL) emblaApi?.scrollPrev();
    else emblaApi?.scrollNext();
  }, [emblaApi, isRTL]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") handleVisualRight();
      if (event.key === "ArrowLeft") handleVisualLeft();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleVisualLeft, handleVisualRight, keyboardNavigation]);

  return {
    emblaRef,
    emblaApi,
    selectedIndex,
    canScrollPrev,
    canScrollNext,
    canClickVisualLeft: isRTL ? canScrollNext : canScrollPrev,
    canClickVisualRight: isRTL ? canScrollPrev : canScrollNext,
    fetchedSlides,
    handleVisualLeft,
    handleVisualRight,
    scrollTo,
  };
};

export default useReaderCarousel;
