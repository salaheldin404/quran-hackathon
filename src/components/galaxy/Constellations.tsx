import { GalaxySurah, Theme } from "@/types/galaxy";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  activeTheme: Theme | null;
  surahs: GalaxySurah[];
};

export function Constellations({ activeTheme, surahs }: Props) {
  if (!activeTheme) return null;

  const themeSurahs = surahs
    .filter((s) => activeTheme.surahIds.includes(s.number))
    .sort((a, b) => a.number - b.number);

  // Build pairs of consecutive surahs to draw lines between
  const segments = themeSurahs.slice(0, -1).map((s, i) => ({
    id: `${s.number}-${themeSurahs[i + 1].number}`,
    x1: s.position.x,
    y1: s.position.y,
    x2: themeSurahs[i + 1].position.x,
    y2: themeSurahs[i + 1].position.y,
  }));

  return (
    <AnimatePresence>
      {activeTheme && (
        <motion.svg
          key={activeTheme.id}
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
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

          {segments.map((seg, i) => (
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            />
          ))}

          {/* Highlight dots at each surah node */}
          {themeSurahs.map((s) => (
            <motion.circle
              key={s.number}
              cx={`${s.position.x}%`}
              cy={`${s.position.y}%`}
              r={3.5}
              fill="none"
              stroke={activeTheme.color}
              strokeWidth={1}
              initial={{ opacity: 0, r: 8 }}
              animate={{ opacity: 0.7, r: 3.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          ))}
        </motion.svg>
      )}
    </AnimatePresence>
  );
}
