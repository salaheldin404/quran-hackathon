"use client";

import { JourneyStats } from "@/lib/utils/activity";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { THEMES } from "@/lib/utils/galaxy";
import quranData from "@/data/all-quran-surah.json";
import { motion } from "framer-motion";
import { Sparkles, Compass, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "../ui/button";

interface InsightsSectionProps {
  stats: JourneyStats;
}

export function InsightsSection({ stats }: InsightsSectionProps) {
  const t = useTranslations("Journey.insights");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const mostReadSurah = quranData.data.find(
    (s) => s.number === Number(stats.insights.mostReadSurahId),
  );
  const mostReadTheme = THEMES.find(
    (th) => th.id === stats.insights.mostReadThemeId,
  );

  if (!mostReadSurah && !mostReadTheme) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {mostReadSurah && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="border-primary/10 bg-primary/5 overflow-hidden group h-full relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                {t("mostReadSurah")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between pb-16">
              <div>
                <h3 className="text-2xl font-bold">
                  {isArabic ? mostReadSurah.name : mostReadSurah.englishName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {mostReadSurah.englishNameTranslation}
                </p>
              </div>
              <div className="text-5xl opacity-10 font-bold group-hover:opacity-20 transition-opacity">
                {mostReadSurah.number}
              </div>
            </CardContent>

            <div className="absolute bottom-4 ltr:right-4 rtl:left-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 hover:text-primary transition-all duration-300 gap-1 group/btn"
              >
                <Link href={`/surahs/${mostReadSurah.number}`}>
                  {t("readSurah")}
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {mostReadTheme && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="border-primary/10 bg-primary/5 relative overflow-hidden group h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {t("mostReadTheme")}
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-16 relative">
              <div className="flex items-center justify-between ">
                <div>
                  <h3 className="text-2xl font-bold text-primary">
                    {isArabic ? mostReadTheme.label : mostReadTheme.subtitle}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mostReadTheme.surahIds.length}
                    {isArabic ? " سورة" : " surahs"}
                  </p>
                </div>
              </div>

              <div className="w-24 h-24 -z-10 absolute -bottom-4 -right-4 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity bg-primary" />
            </CardContent>

            <div className="absolute bottom-4 ltr:right-4 rtl:left-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="transition-all duration-300 gap-1 group/btn bg-primary/15 text-primary hover:bg-primary/25 hover:text-primary"
              >
                <Link href={`/quranicGalaxy`}>
                  {t("viewThemes")}
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
