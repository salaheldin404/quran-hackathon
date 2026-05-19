"use client";
import Constellations from "@/components/galaxy/Constellations";
import StarField from "@/components/galaxy/StarField";
import { GalaxySurah, Point, Theme } from "@/types/galaxy";
import { CSSProperties, useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  galaxySurahs,
  generateFocusedLayout,
  milkyWayPositions,
} from "@/lib/utils/galaxy";
import Star from "@/components/galaxy/Star";
import ThemeFilter from "@/components/galaxy/ThemeFilter";
import HomeNav from "@/components/galaxy/HomeNav";
import GalaxySurahDetails from "@/components/galaxy/GalaxySurahDetails";
import SearchBar from "@/components/galaxy/SearchBar";
import { useLocale, useTranslations } from "next-intl";
import { useBreakpoint } from "@/hooks/useBreakPoint";

const BACKGROUND_STYLE = {
  background: `
    radial-gradient(ellipse 60% 40% at 20% 30%, rgba(80,20,140,0.25) 0%, transparent 70%),
    radial-gradient(ellipse 50% 35% at 80% 70%, rgba(20,60,120,0.20) 0%, transparent 70%),
    radial-gradient(ellipse 40% 30% at 55% 20%, rgba(120,60,20,0.12) 0%, transparent 70%)
  `,
};

// Overlay animation — only needs initial/animate, no AnimatePresence
const OVERLAY_INITIAL = { opacity: 0 } as const;
const OVERLAY_ANIMATE = { opacity: 1 } as const;
const OVERLAY_TRANSITION = { duration: 0.5 } as const;

const HEADER_SHADOW: CSSProperties = {
  textShadow: "0 0 30px rgba(200,160,255,0.6)",
};
const QuranicGalaxy = () => {
  const t = useTranslations("QuranicGalaxy");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [selectedSurah, setSelectedSurah] = useState<GalaxySurah | null>(null);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const { isMobile, isTablet, isMounted } = useBreakpoint();
  const rotations = useMemo(() => {
    if (isMobile) return 3.7;
    if (isTablet) return 3;
    return 2.5;
  }, [isMobile, isTablet]);

  const galaxyPositions = useMemo(
    () => milkyWayPositions(rotations),
    [rotations],
  );

  const activeThemeSurahSet = useMemo(
    () => (activeTheme ? new Set(activeTheme.surahIds) : null),
    [activeTheme],
  );
    const { visibleSurahs, positionMap } = useMemo(() => {
      const sourceSurahs = activeThemeSurahSet
        ? galaxySurahs.filter((s) => activeThemeSurahSet.has(s.number))
        : galaxySurahs;

      const positions: Point[] = activeThemeSurahSet
        ? generateFocusedLayout(sourceSurahs.length)
        : galaxyPositions;

      const map = new Map<number, Point>();
      sourceSurahs.forEach((s, i) => map.set(s.number, positions[i]));

      return { visibleSurahs: sourceSurahs, positionMap: map };
    }, [activeThemeSurahSet, galaxyPositions]);
  
  const clickHandlersRef = useRef<Map<number, () => void>>(new Map());

  const getClickHandler = useCallback(
    (surah: GalaxySurah) => {
      const existing = clickHandlersRef.current.get(surah.number);
      if (existing) return existing;
      const handler = () => setSelectedSurah(surah);
      clickHandlersRef.current.set(surah.number, handler);
      return handler;
    },
    [positionMap], // eslint-disable-line react-hooks/exhaustive-deps
  );


  const handleClose = useCallback(() => {
    setSelectedSurah(null);
  }, []);

  // HomeNav position class — stable string, not a template literal recreated each render
  const homeNavClass = isArabic
    ? "absolute top-3 md:top-6 left-6 z-50 pointer-events-auto"
    : "absolute top-3 md:top-6 right-6 z-50 pointer-events-auto";

  const isFilteredView = activeTheme !== null;

  return (
    <div className="relative  h-screen overflow-hidden bg-[#030309] select-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={BACKGROUND_STYLE}
      />

      {isMounted && (
        <>
          {/* Background star field */}
          <StarField />

          <motion.div className="absolute inset-0">
            {/* Thematic constellation lines */}
            <Constellations positionMap={positionMap} activeTheme={activeTheme} surahs={visibleSurahs} />
            <AnimatePresence>
              {visibleSurahs.map((surah) => (
                <Star
                  key={surah.number}
                  surah={surah}
                  position={positionMap.get(surah.number)!}
                  isFilteredView={isFilteredView}
                  onClick={getClickHandler(surah)}
                  isMobile={isMobile}
                  isArabic={isArabic}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence>
            {selectedSurah && (
              <GalaxySurahDetails
                onClose={handleClose}
                selectedSurah={selectedSurah}
              />
            )}
          </AnimatePresence>

          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={OVERLAY_INITIAL}
            animate={OVERLAY_ANIMATE}
            transition={OVERLAY_TRANSITION}
          >
            {/* Header */}
            <div className="absolute top-0 inset-x-0 flex flex-col items-center pt-5 md:pt-10 pointer-events-none">
              <h1
                className="text-xl sm:text-4xl font-bold tracking-widest text-white/90"
                style={HEADER_SHADOW}
              >
                {t("Header.title")}
              </h1>
              <p className="mt-2 text-[10px] text-center sm:text-sm text-white/40 tracking-wider">
                {t("Header.description")}
              </p>
            </div>

            <div className="pointer-events-auto">
              <ThemeFilter
                activeTheme={activeTheme}
                onSelect={setActiveTheme}
              />
            </div>

            <div className="pointer-events-auto">
              
              <SearchBar surahs={galaxySurahs} onSelect={setSelectedSurah} />
            </div>

            <div className={homeNavClass}>
              <HomeNav />
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default QuranicGalaxy;
