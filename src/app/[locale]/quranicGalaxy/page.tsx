"use client";
import { Constellations } from "@/components/galaxy/Constellations";
import { StarField } from "@/components/galaxy/StarField";
import { GalaxySurah, Theme } from "@/types/galaxy";
import { useCallback, useMemo, useState } from "react";
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

const QuranicGalaxy = () => {
  const t = useTranslations("QuranicGalaxy");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [selectedSurah, setSelectedSurah] = useState<GalaxySurah | null>(null);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const { isMobile, isTablet, isMounted } = useBreakpoint();
  const rotations = isMobile ? 3.7 : isTablet ? 3 : 2.5;

  const galaxyPositions = useMemo(
    () => milkyWayPositions(rotations),
    [rotations],
  );

  const activeThemeSurahSet = useMemo(
    () => (activeTheme ? new Set(activeTheme.surahIds) : null),
    [activeTheme],
  );
  const visibleSurahs = useMemo(() => {
    if (!activeThemeSurahSet) {
      return galaxySurahs.map((surah, i) => ({
        ...surah,
        position: galaxyPositions[i],
      }));
    }

    const filtered = galaxySurahs.filter((surah) =>
      activeThemeSurahSet.has(surah.number),
    );

    const focusedLayout = generateFocusedLayout(filtered.length); // cache-hit if same count

    return filtered.map((surah, i) => ({
      ...surah,
      position: focusedLayout[i],
    }));
  }, [activeThemeSurahSet, galaxyPositions]);

  const handleStarClick = useCallback((surah: GalaxySurah) => {
    setSelectedSurah(surah);
  }, []);

  const handleClose = useCallback(() => {
    // setTimeout(() => setSelectedSurah(null), (ZOOM_DURATION + 0.2) * 500);
    setSelectedSurah(null);
  }, []);

  return (
    <div className="relative  h-screen overflow-hidden bg-[#030309] select-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
          radial-gradient(ellipse 60% 40% at 20% 30%, rgba(80,20,140,0.25) 0%, transparent 70%),
          radial-gradient(ellipse 50% 35% at 80% 70%, rgba(20,60,120,0.20) 0%, transparent 70%),
          radial-gradient(ellipse 40% 30% at 55% 20%, rgba(120,60,20,0.12) 0%, transparent 70%)
        `,
        }}
      />

      {isMounted && (
        <>
          {/* Background star field */}
          <StarField />

          <motion.div className="absolute inset-0">
            {/* Thematic constellation lines */}
            <Constellations activeTheme={activeTheme} surahs={visibleSurahs} />
            <AnimatePresence mode="popLayout">
              {/* Surah stars */}
              {visibleSurahs.map((surah) => (
                <Star
                  key={surah.number}
                  surah={surah}
                  isFilteredView={activeTheme !== null}
                  onClick={() => handleStarClick(surah)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence>
            <GalaxySurahDetails
              onClose={handleClose}
              selectedSurah={selectedSurah}
            />
          </AnimatePresence>
          <AnimatePresence>
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="absolute top-0 inset-x-0 flex flex-col items-center pt-5 md:pt-10 pointer-events-none">
                <h1
                  className="text-xl sm:text-4xl font-bold tracking-widest text-white/90"
                  style={{ textShadow: "0 0 30px rgba(200,160,255,0.6)" }}
                >
                  {t("Header.title")}
                </h1>
                <p className="mt-2 text-[10px] text-center sm:text-sm text-white/40 tracking-wider">
                  {t("Header.description")}
                </p>
              </div>

              {/* Theme constellation filter */}
              <div className="pointer-events-auto">
                <ThemeFilter
                  activeTheme={activeTheme}
                  onSelect={setActiveTheme}
                />
              </div>

              {/* Search Bar */}
              <div className="pointer-events-auto">
                <SearchBar
                  surahs={galaxySurahs as GalaxySurah[]}
                  onSelect={handleStarClick}
                />
              </div>

              <div
                className={`absolute top-3 md:top-6 ${isArabic ? "left-6" : "right-6"} z-50 pointer-events-auto`}
              >
                <HomeNav />
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default QuranicGalaxy;
