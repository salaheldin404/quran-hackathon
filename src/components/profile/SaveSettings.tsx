"use client";

import { useMemo } from "react";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";

import quranData from "@/data/all-quran-surah.json";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { KhatmaReminderForm, QuranReminderForm } from "@/types/profile";
import { formatTime } from "@/lib/utils/profile";
import { cn } from "@/lib/utils";

type SaveSettingsProps = {
  quranReminders: QuranReminderForm[];
  khatmaReminder: KhatmaReminderForm;
  isSaving: boolean;
  isDirty?: boolean;
};

const SURAHS = quranData.data;

export default function SaveSettings({
  quranReminders,
  khatmaReminder,
  isSaving,
  isDirty,
}: SaveSettingsProps) {
  const t = useTranslations("ProfilePage");
  const enabledReminders = useMemo(
    () => quranReminders.filter((r) => r.isEnabled),
    [quranReminders],
  );

  const quranSummary = useMemo(() => {
    if (enabledReminders.length === 0) {
      return t("save.noQuranReminders");
    }

    const preview = enabledReminders
      .slice(0, 2)
      .map((r) => `${SURAHS[r.surahId - 1].shortName} • ${formatTime(r.time)}`)
      .join(", ");

    const extraCount = enabledReminders.length - 2;

    return extraCount > 0 ? `${preview} +${extraCount}` : preview;
  }, [enabledReminders, t]);

  const khatmaSummary = formatTime(khatmaReminder.time);

  return (
    <Card
      className={cn(
        "rounded-[28px] border-white/70 bg-white/85 shadow-sm backdrop-blur transition-all duration-300 dark:border-white/10 dark:bg-card/90",
        isDirty && !isSaving && "ring-2 ring-primary/20 shadow-lg border-primary/30",
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t("save.title")}
          {isDirty && !isSaving && (
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground">
          {t("save.summary", {
            quran: quranSummary,
            khatma: khatmaSummary,
          })}
        </div>

        <Button
          type="submit"
          className={cn(
            "h-11 w-full rounded-xl bg-primary text-white transition-all duration-300",
            isDirty && !isSaving && "shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.45)] scale-[1.02]",
          )}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("save.saving")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t("save.action")}
              {isDirty && (
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider opacity-80">
                  ({t("save.unsaved")})
                </span>
              )}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
