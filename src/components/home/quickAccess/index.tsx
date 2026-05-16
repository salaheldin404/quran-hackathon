"use client";
import { useTranslations } from "next-intl";
import { useGetCurrentStreakQuery } from "@/lib/store/features/streaksApi";
import { useEffect, useState } from "react";

import QuickRecentlyPlayed from "./QuickRecentlyPlayed";
import LastRead from "./LastRead";
import FavouriteSurahs from "./FavouriteSurahs";
import { KhatmaPlan } from "@/types/khatma";
import KhatmaCardClient from "./KhatmaCardClient";
import KhatmaCardStart from "./KhatmaCardStart";
import { StreakCard } from "@/components/journey/StreakCard";
import { useAppSelector } from "@/lib/store/hooks";
interface QuickAccessProps {
  khatma: KhatmaPlan | null;
}
const QuickAccess = ({ khatma }: QuickAccessProps) => {
  const t = useTranslations("QuickAccess");
  const user = useAppSelector((state) => state.sync.user);
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  const { data: currentStreakData, isLoading: isStreakLoading } =
    useGetCurrentStreakQuery({}, { skip: !user });

  const streakStats = {
    currentStreak: currentStreakData?.days ?? 0,
  };

  return (
    <section className={`py-10 `}>
      <div className="main-container">
        <div className="mb-8">
          <p className="text-gray-500">{t("message")}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <FavouriteSurahs />

          <QuickRecentlyPlayed />

          <LastRead />

          {khatma && !khatma.isCompleted ? (
            <KhatmaCardClient plan={khatma} />
          ) : (
            <KhatmaCardStart />
          )}
          {isHydrated && user && (
            <StreakCard
              stats={streakStats}
              variant="compact"
              isLoading={isStreakLoading}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default QuickAccess;
