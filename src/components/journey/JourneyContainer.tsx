"use client";

import { useLazyGetActivityDaysQuery } from "@/lib/store/features/activityApi";
import {
  calculateJourneyStats,
  fetchAllActivityDaysForYear,
} from "@/lib/utils/activity";
import { useTranslations } from "next-intl";
import { HeroSection } from "./HeroSection";
import { StreakCard } from "./StreakCard";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { StatsGrid } from "./StatsGrid";
import { Achievements } from "./Achievements";
import { InsightsSection } from "./InsightsSection";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useGetCurrentStreakQuery } from "@/lib/store/features/streaksApi";
import { useEffect, useMemo, useState } from "react";
import { Activity } from "@/types/activity";
import { useAppSelector } from "@/lib/store/hooks";
import Loading from "./Loading";

export function JourneyContainer() {
  const t = useTranslations("Journey");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAppSelector((state) => state.sync.user);
  const [getActivityDays] = useLazyGetActivityDaysQuery();
  const { data: currentStreakData } = useGetCurrentStreakQuery({});
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      try {
        setIsLoading(true);

        const result = await fetchAllActivityDaysForYear({

          year: selectedYear,

          fetchActivityDays: async (params) => {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value === undefined || value === null) return;
              if (Array.isArray(value)) {
                value.forEach((v) => searchParams.append(key, String(v)));
              } else {
                searchParams.set(key, String(value));
              }
            });
            const queryParams = searchParams.toString();
            const response = await getActivityDays(queryParams).unwrap();

            return response;
          },
        });

        if (mounted) {
          setActivities(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [selectedYear, getActivityDays, user?.id]);

  const stats = useMemo(() => {
    return calculateJourneyStats(activities, currentStreakData?.days || 0);
  }, [activities, currentStreakData?.days]);
  if (isLoading) {
    return <Loading />;
  }

  if (!activities.length && !isLoading) {
    return (
      <div className="main-container  pt-10 min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md space-y-4"
        >
          <div className="text-6xl">📖</div>
          <h1 className="text-3xl font-bold">{t("empty.title")}</h1>
          <p className="text-muted-foreground">{t("empty.subtitle")}</p>
          <Button
            size="lg"
            className="rounded-full px-8"
            onClick={() => router.push("/surahs")}
          >
            {t("empty.cta")}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="main-container space-y-10 pt-10 pb-20">
      <div className="">
        <HeroSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <StreakCard stats={stats} />
        </div>
        <div className="lg:col-span-8">
          <ActivityHeatmap
            stats={stats}
            yearSetting={{ selectedYear, setSelectedYear }}
          />
        </div>
      </div>

      <StatsGrid stats={stats} />

      <InsightsSection stats={stats} />

      <Achievements stats={stats} />
    </div>
  );
}
