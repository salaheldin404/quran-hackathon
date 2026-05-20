"use client";

import { ReflectionResponse } from "@/types/reflection";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, BookOpen, Heart, Sparkles, ExternalLink } from "lucide-react";
import DOMPurify from "dompurify";
import { Link } from "@/i18n/navigation";

interface ReflectionResultsProps {
  data: ReflectionResponse;
  onReset: () => void;
}

export default function ReflectionResults({
  data,
  onReset,
}: ReflectionResultsProps) {
  const t = useTranslations("reflection");
  return (
    <div className=" mx-auto space-y-8 px-4 pb-20">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-4 rounded-full bg-primary/10 mb-4"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold">
          {t("your_reflection")}
        </h2>

        {/* Themes Display */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {data.themes?.map((theme, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="px-3 py-1 bg-primary/5 text-primary border-primary/20"
            >
              {theme}
            </Badge>
          ))}
        </div>

        <p className="text-muted-foreground italic mt-4">
          &quot;{data.motivationalMessage}&quot;
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Reflection */}
        <div className="md:col-span-2">
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6">
              <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {data.reflection}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quranic Verses */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">{t("quranic_verses")}</h3>
          </div>
          <div className="space-y-4">
            {data.verses?.map((verse, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="overflow-hidden border-none bg-card/40 backdrop-blur-md shadow-lg group hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="outline"
                          className="text-primary font-semibold border-primary/30 w-fit"
                        >
                          {verse.surahName}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/surahs/${verse.surahNumber}?verse=${verse.ayahNumber}`}
                          className="p-2 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors group/link"
                          title={t("view_verse")}
                        >
                          <ExternalLink className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                        </Link>
                        <Quote className="w-5 h-5 text-primary/20" />
                      </div>
                    </div>
                    <p className="text-2xl text-right uthmanic-text leading-relaxed">
                      {verse.text}
                    </p>

                    <div
                      className="text-sm text-muted-foreground leading-relaxed border-t border-border/20 pt-4 mt-4"
                      dangerouslySetInnerHTML={{
                        __html: verse?.tafsir
                          ? DOMPurify.sanitize(` التفسير الميسر: ${verse.tafsir} `)
                          : "",
                      }}
                    />
               
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Athkar Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-400" />
            <h3 className="text-xl font-semibold">{t("suggested_athkar")}</h3>
          </div>
          {data.athkar?.map((thikr, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
            >
              <Card className="bg-background/40 backdrop-blur-sm border-border/50">
                <CardContent className="p-5 space-y-3">
                  <p className="text-xl text-right font-arabic leading-relaxed">
                    {thikr.arabic}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/10">
                    <Badge
                      variant="secondary"
                      className="text-[12px] font-medium bg-primary/5 text-primary dark:text-white/50 border-primary/10"
                    >
                      {thikr.purpose}
                    </Badge>
                    {thikr.reference && (
                      <span className="text-[10px] text-muted-foreground italic">
                        {thikr.reference}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Smart Wird / Plan */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-semibold">{t("recommended_plan")}</h3>
          </div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  {/* <p className="text-sm font-medium text-primary mb-1">{t("recommended_plan")}</p> */}
                  <p className="text-lg font-bold">{data.wirdPlan}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <button
            onClick={onReset}
            className="w-full mt-4 py-3 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {t("start_over")}
          </button>
        </div>
      </div>

      <div className="text-center pt-8 border-t border-border/20">
        <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
      </div>
    </div>
  );
}
