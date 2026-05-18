"use client";

import { JourneyStats } from "@/lib/utils/activity";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Flame,
  Trophy,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

interface StreakCardProps {
  stats:
    | {
        currentStreak: number;
      }
    | Pick<
        JourneyStats,
        | "currentStreak"
        | "isReadToday"
        | "longestStreak"
        | "totalReadingDays"
        | "consistencyPercentage"
      >;
  variant?: "detailed" | "compact";
  isLoading?: boolean;
}

export function StreakCard({
  stats,
  variant = "detailed",
  isLoading = false,
}: StreakCardProps) {
  const t = useTranslations("Journey.streak");

  const cardClass =
    variant === "detailed"
      ? "flex-col gap-6 "
      : "flex-row gap-3 py-1 justify-between items-center";
  const showDetails =
    variant === "detailed" &&
    "longestStreak" in stats &&
    "totalReadingDays" in stats &&
    "consistencyPercentage" in stats &&
    typeof stats.longestStreak === "number" &&
    typeof stats.totalReadingDays === "number" &&
    typeof stats.consistencyPercentage === "number";

  const items = [
    {
      label: t("longest"),
      value:
        showDetails &&
        `${stats.longestStreak} ${t("days", { count: stats.longestStreak })}`,
      icon: Trophy,
    },
    {
      label: t("totalDays"),
      value: showDetails && stats.totalReadingDays,
      icon: Calendar,
    },
    {
      label: t("consistency"),
      value: showDetails && `${stats.consistencyPercentage}%`,
      icon: CheckCircle2,
    },
  ];
  return (
    <Card
      className={`${cardClass} w-full h-full border-primary/10 bg-primary/5 overflow-hidden relative`}
    >
      <CardHeader className={`${variant === "compact" ? "flex-1 " : ""}`}>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
          {t("title")}
        </CardTitle>

        {variant === "compact" && (
          <Link href={"/journey"} className="group block z-10 w-fit">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary transition-all duration-300 hover:bg-primary/20 hover:shadow-md group-hover:gap-3">
              <span className="text-sm font-medium">{t("viewDetails")}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <div
          className={`flex flex-col items-center justify-center py-4 space-y-2`}
        >
          {isLoading ? (
            <div className="space-y-3 w-full max-w-[160px]">
              <div className="mx-auto h-16 w-24 rounded-2xl bg-primary/10 animate-pulse" />
              <div className="mx-auto h-4 w-20 rounded-full bg-primary/10 animate-pulse" />
            </div>
          ) : (
            <>
              <div
                className={`${variant === "detailed" ? "text-6xl" : "text-5xl"} font-black text-primary tabular-nums`}
              >
                {stats.currentStreak}
              </div>
              <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                {t("days", { count: stats.currentStreak })}
              </div>
            </>
          )}
        </div>

        {showDetails ? (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/10">
            {items.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-center items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </div>
                <div className="text-lg text-center font-bold tabular-nums">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {showDetails ? (
          <div className="pt-2">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                stats.isReadToday
                  ? "bg-primary/20 text-primary"
                  : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${stats.isReadToday ? "opacity-100" : "opacity-50"}`}
              />
              {stats.isReadToday ? t("readToday") : t("notReadToday")}
            </div>
          </div>
        ) : null}
      </CardContent>

      <div className="absolute -bottom-10 -right-10 opacity-5">
        <Flame className="w-40 h-40" />
      </div>
    </Card>
  );
}
