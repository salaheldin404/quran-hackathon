"use  client";
import { GalaxySurah, Point, Theme } from "@/types/galaxy";
import { motion, AnimatePresence } from "framer-motion";
import { memo, useMemo } from "react";

interface Segment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  transition: { duration: number; delay: number };
}
const SVG_TRANSITION = { duration: 0.4 } as const;
const SVG_INITIAL = { opacity: 0 } as const;
const SVG_ANIMATE = { opacity: 1 } as const;
const SVG_EXIT = { opacity: 0 } as const;

const CIRCLE_INITIAL = { opacity: 0, r: 8 } as const;
const CIRCLE_ANIMATE = { opacity: 0.7, r: 3.5 } as const;
const CIRCLE_EXIT = { opacity: 0 } as const;
const CIRCLE_TRANSITION = { duration: 0.5, delay: 0.1 } as const;

const LINE_ANIMATE = { opacity: 0.55 } as const;
const LINE_EXIT = { opacity: 0 } as const;

type Props = {
  activeTheme: Theme | null;
  surahs: GalaxySurah[]; // no position — stable source references
  positionMap: Map<number, Point>; // O(1) lookup by surah.number
};

const Constellations = memo(
  ({ activeTheme, surahs, positionMap }: Props) => {
    const { themeSurahs, segments } = useMemo(() => {
      if (!activeTheme) return { themeSurahs: [], segments: [] };
      const filtered = surahs
        .filter((s) => activeTheme.surahIds.includes(s.number))
        .sort((a, b) => a.number - b.number);

      const segs = filtered
        .slice(0, -1)
        .map((s, i) => {
          const next = filtered[i + 1];
          const pos1 = positionMap.get(s.number);
          const pos2 = positionMap.get(next.number);

          // Guard: positions may be absent if layout hasn't been calculated yet
          if (!pos1 || !pos2) return null;

          return {
            id: `${s.number}-${next.number}`,
            x1: pos1.x,
            y1: pos1.y,
            x2: pos2.x,
            y2: pos2.y,
            // Cache per-segment transition so it isn't recreated each render
            transition: { duration: 0.35, delay: i * 0.04 },
          };
        })
        .filter(Boolean) as Segment[];

      return { themeSurahs: filtered, segments: segs };
    }, [activeTheme, surahs, positionMap]);

    return (
      <AnimatePresence>
        {activeTheme && (
          <motion.svg
            key={activeTheme.id}
            className="absolute inset-0 w-full h-full pointer-events-none"
            initial={SVG_INITIAL}
            animate={SVG_ANIMATE}
            exit={SVG_EXIT}
            transition={SVG_TRANSITION}
            aria-hidden="true"
          >
            <defs>
              <filter id="lineGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {segments.map((seg) => (
              <motion.line
                key={seg.id}
                x1={`${seg.x1}%`}
                y1={`${seg.y1}%`}
                x2={`${seg.x2}%`}
                y2={`${seg.y2}%`}
                stroke={activeTheme.color}
                strokeWidth={0.7}
                strokeDasharray="3 5"
                filter="url(#lineGlow)"
                initial={SVG_INITIAL}
                animate={LINE_ANIMATE}
                exit={LINE_EXIT}
                transition={seg.transition}
              />
            ))}

            {themeSurahs.map((s) => {
              const pos = positionMap.get(s.number);
              if (!pos) return null;
              return (
                <motion.circle
                  key={s.number}
                  cx={`${pos.x}%`}
                  cy={`${pos.y}%`}
                  r={3.5}
                  fill="none"
                  stroke={activeTheme.color}
                  strokeWidth={1}
                  initial={CIRCLE_INITIAL}
                  animate={CIRCLE_ANIMATE}
                  exit={CIRCLE_EXIT}
                  transition={CIRCLE_TRANSITION}
                />
              );
            })}
          </motion.svg>
        )}
      </AnimatePresence>
    );
  },

  (prev, next) =>
    prev.activeTheme === next.activeTheme &&
    prev.positionMap === next.positionMap &&
    prev.surahs === next.surahs,
);

Constellations.displayName = "Constellations";

export default Constellations;
