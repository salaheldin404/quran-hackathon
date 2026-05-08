'use client'
import { THEMES } from "@/lib/utils/galaxy";
import { Theme } from "@/types/galaxy";
import {motion, AnimatePresence} from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLocale } from "next-intl";

interface ThemeFilterProps {
  activeTheme: Theme | null;
  onSelect: (theme: Theme | null) => void;
}
const ThemeFilter = ({ activeTheme, onSelect }: ThemeFilterProps) => {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const label = isArabic ? "موضوعات القرآن" : "Quranic Themes";
  return (
    <motion.div
      className="absolute w-full bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      {/* Label */}
      <div className="flex items-center gap-1.5 text-white/30 text-[10px] sm:text-xs tracking-widest">
        <Sparkles size={10} />
        <span> {label} </span>
        <Sparkles size={10} />
      </div>

      {/* Theme buttons */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {THEMES.map((theme) => {
          const isActive = activeTheme?.id === theme.id;
          return (
            <motion.button
              key={theme.id}
              onClick={() => onSelect(isActive ? null : theme)}
              className="relative px-2 md:px-3 py-1.5 rounded-full text-[8px] sm:text-xs font-medium transition-all duration-200 backdrop-blur-sm"
              style={{
                background: isActive
                  ? `${theme.color}22`
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${isActive ? theme.color + "70" : "rgba(255,255,255,0.10)"}`,
                color: isActive ? theme.color : "rgba(255,255,255,0.45)",
                boxShadow: isActive ? `0 0 16px ${theme.color}30` : "none",
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Active glow pulse */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ border: `1px solid ${theme.color}40` }}
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                  />
                )}
              </AnimatePresence>

              <span dir={isArabic ? "rtl" : "ltr"}>
                {isArabic ? theme.label : theme.subtitle}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default ThemeFilter
