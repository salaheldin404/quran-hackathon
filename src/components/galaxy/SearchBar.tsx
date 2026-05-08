"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSurahSearch } from "@/hooks/useSurahSearch";
import { Input } from "../ui/input";
import { Search, X, Star } from "lucide-react";
import { useState, useCallback } from "react";
import { GalaxySurah } from "@/types/galaxy";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog";

interface SearchBarProps {
  surahs: GalaxySurah[];
  onSelect: (surah: GalaxySurah) => void;
}

const SearchBar = ({ surahs, onSelect }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("QuranicGalaxy.Search");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const results = useSurahSearch<GalaxySurah>({
    searchTerm: query,
    surahs,
    limit: 10, 
  });

  const handleSelect = useCallback(
    (surah: GalaxySurah) => {
      onSelect(surah);
      setQuery("");
      setIsOpen(false);
    },
    [onSelect],
  );

  return (
    <div
      className={`fixed top-3 md:top-6 ${isArabic ? "right-6" : "left-6"} z-50`}
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            className="flex items-center justify-center size-8 md:size-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 pointer-events-auto shadow-lg"
            title={t("placeholder")}
          >
            <Search className="text-xs md:text-xl transition-transform duration-300 group-hover:scale-110" />
          </button>
        </DialogTrigger>

        <DialogContent aria-describedby={undefined} className="sm:max-w-[550px] bg-black/80 backdrop-blur-2xl border-white/10 p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <DialogTitle className="sr-only">{t("placeholder")}</DialogTitle>

          <div className="relative flex flex-col h-[60vh] sm:h-[500px]">
            {/* Search Input Area */}
            <div className="p-4 border-b border-white/5 bg-white/5">
              <div className="relative flex items-center bg-white/5 rounded-2xl border border-white/10 transition-all duration-300 focus-within:border-white/20 focus-within:bg-white/10">
                <div
                  className={`px-4 text-white/40 ${isArabic ? "order-last" : "order-first"}`}
                >
                  <Search size={18} />
                </div>

                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("placeholder")}
                  className="bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base"
                />

                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="px-4 text-white/40 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {query.length > 0 ? (
                  results.length > 0 ? (
                    results.map((surah, index) => (
                      <motion.button
                        key={surah.number}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleSelect(surah as GalaxySurah)}
                        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors group/item rounded-2xl text-right rtl:text-right ltr:text-left mb-1"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border shrink-0 transition-transform group-hover/item:scale-110"
                          style={{
                            borderColor: `${surah.color}40`,
                            color: surah.color,
                            backgroundColor: `${surah.color}10`,
                          }}
                        >
                          {surah.number}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-lg leading-tight">
                            {isArabic ? surah.name : surah.englishName}
                          </p>
                          <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                            {isArabic ? surah.englishName : surah.name} •
                            <span>
                              {surah.numberOfAyahs} {t("verses")}
                            </span>
                          </p>
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 px-4 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Search size={32} className="text-white/20" />
                      </div>
                      <p className="text-white/40 text-sm">{t("no_results")}</p>
                    </motion.div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 opacity-40">
                    <Star size={48} className="mb-4 text-white/10" />
                    <p className="text-sm max-w-[200px]">{t("placeholder")}</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchBar;
