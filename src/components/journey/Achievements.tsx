"use client";

import { JourneyStats } from "@/lib/utils/activity";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  BookMarked,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Crown,
  Flame,
  FlameKindling,
  Gem,
  Library,
  Lock,
  Medal,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Star,
  Stars,
  Trophy,
} from "lucide-react";

interface AchievementsProps {
  stats: JourneyStats;
}

export function Achievements({ stats }: AchievementsProps) {
  const t = useTranslations("Journey.achievements");
  const badges = [
    // ===== Reading Days =====
    {
      id: "firstDay",
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      id: "readingDays7",
      icon: CalendarDays,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    {
      id: "readingDays30",
      icon: CalendarCheck,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      id: "readingDays100",
      icon: Crown,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },

    // ===== Streaks =====
    {
      id: "streak3",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      id: "streak7",
      icon: Sparkles,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: "streak14",
      icon: FlameKindling,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      id: "streak30",
      icon: Trophy,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      id: "streak90",
      icon: Gem,
      color: "text-fuchsia-500",
      bg: "bg-fuchsia-500/10",
    },

    // ===== Pages Read =====
    {
      id: "pages10",
      icon: BookOpen,
      color: "text-teal-500",
      bg: "bg-teal-500/10",
    },
    {
      id: "pages50",
      icon: Library,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      id: "pages100",
      icon: Medal,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      id: "pages500",
      icon: Award,
      color: "text-lime-500",
      bg: "bg-lime-500/10",
    },
    {
      id: "pages604",
      icon: ShieldCheck,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    // ===== Khatma =====
    {
      id: "khatma1",
      icon: MoonStar,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      id: "khatma3",
      icon: BookMarked,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      id: "khatma5",
      icon: Stars,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((badge, index) => {
          const achievement = stats.achievements.find((a) => a.id === badge.id);
          const isUnlocked = achievement?.isUnlocked || false;
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.8 }}
              className={`relative group p-6 rounded-3xl border transition-all duration-300 ${
                isUnlocked
                  ? "bg-background border-primary/20 shadow-lg shadow-primary/5" 
                  : "bg-white/50 dark:bg-muted/50 border-transparent grayscale opacity-60"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div
                  className={`p-4 rounded-full ${isUnlocked ? badge.bg : "bg-muted"}`}
                >
                  {isUnlocked ? (
                    <badge.icon className={`w-8 h-8 ${badge.color}`} />
                  ) : (
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{t(badge.id)}</h3>
                  <p className="text-sm text-muted-foreground leading-snug">
                    {t(`${badge.id}Desc`)}
                  </p>
                </div>

                {!isUnlocked && (
                  <div className="w-full space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{Math.round(achievement?.progress || 0)}%</span>
                    </div>
                    <Progress value={achievement?.progress} className="h-1.5" />
                  </div>
                )}

                {isUnlocked && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                      {t("unlocked")}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
