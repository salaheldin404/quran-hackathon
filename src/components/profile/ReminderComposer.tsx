"use client";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, Search, Sparkles } from "lucide-react";
import { QuranReminderForm } from "@/types/profile";
import { useDebounce } from "@uidotdev/usehooks";
import { useSurahSearch } from "@/hooks/useSurahSearch";
import quranData from "@/data/all-quran-surah.json";
import { DAY_KEYS, formatTime, sortDays } from "@/lib/utils/profile";
import InputTime from "./InputTime";
interface ReminderComposerProps {
  isEditing: boolean;
  reminderLimitReached: boolean;
  draftReminder: QuranReminderForm;

  onAddReminder: () => void;
  onChange: (reminder: QuranReminderForm) => void;
  onCancel: () => void;
  usedSurahIds: Set<number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, variables?: Record<string, any>) => string;
  dir: "ltr" | "rtl";
}
const SURAHS = quranData.data;
const ReminderComposer = ({
  draftReminder,
  onChange,
  onAddReminder,
  onCancel,
  isEditing,
  reminderLimitReached,
  usedSurahIds,
  dir,
  t,
}: ReminderComposerProps) => {
  const [surahSearch, setSurahSearch] = useState("");
  const [isSurahSelectOpen, setIsSurahSelectOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(surahSearch, 400);
  const normalizedSearchTerm = debouncedSearchTerm.trim().toLowerCase();

  const searchResults = useSurahSearch({
    searchTerm: normalizedSearchTerm,
    surahs: SURAHS,
  });

  const displayedSurahs = normalizedSearchTerm ? searchResults : SURAHS;
  const selectedSurah = SURAHS[draftReminder.surahId - 1 || 0];
  const formattedTime = formatTime(draftReminder.time);
  const quranSummary = `${selectedSurah.shortName} • ${formattedTime}`;

  const handleDraftDayToggle = (day: number) => {
    const nextDays = draftReminder.days.includes(day)
      ? draftReminder.days.filter((d) => d !== day)
      : [...draftReminder.days, day];

    onChange({ ...draftReminder, days: sortDays(nextDays) });
  };
  const handleSurahSelect = (value: string) => {
    onChange({ ...draftReminder, surahId: Number(value) });
    setIsSurahSelectOpen(false);
    setSurahSearch("");
  };

  useEffect(() => {
    if (displayedSurahs.length > 0 && debouncedSearchTerm.length) {
      setIsSurahSelectOpen(true);
    }
  }, [displayedSurahs.length, debouncedSearchTerm.length]);
  return (
    <div className="rounded-[26px] border border-primary/20 bg-gradient-to-br from-white via-primary/5 to-transparent p-5 shadow-sm dark:border-primary/20 dark:from-card dark:via-primary/10 dark:to-transparent">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="font-medium">
              {isEditing
                ? t("quranReminder.editorTitleEdit")
                : t("quranReminder.editorTitleCreate")}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("quranReminder.editorDescription")}
          </p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "rounded-full border px-3 py-1",
            reminderLimitReached
              ? // Keep warning state as Amber/Warning color
                "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
              : // Standard state uses Primary color with opacity
                "border-primary/20 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/10 dark:text-white",
          )}
        >
          {reminderLimitReached
            ? t("quranReminder.limitReachedBadge")
            : t("quranReminder.limitHint")}
        </Badge>
      </div>

      <div className="mt-5 grid gap-5">
        <div className="space-y-3">
          <Label htmlFor="surah-search">{t("quranReminder.searchLabel")}</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="surah-search"
              value={surahSearch}
              onChange={(e) => setSurahSearch(e.target.value)}
              placeholder={t("quranReminder.searchPlaceholder")}
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="surah-select">{t("quranReminder.surahLabel")}</Label>
          <Select
            dir={dir}
            value={String(draftReminder.surahId)}
            onValueChange={handleSurahSelect}
            open={isSurahSelectOpen}
            onOpenChange={setIsSurahSelectOpen}
          >
            <SelectTrigger
              id="surah-select"
              className="h-11 w-full rounded-xl bg-background/80"
            >
              <SelectValue placeholder={t("quranReminder.surahPlaceholder")} />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {displayedSurahs.map((surah) => {
                const isUsed =
                  usedSurahIds.has(surah.number) &&
                  surah.number !== draftReminder.surahId;

                return (
                  <SelectItem
                    key={surah.number}
                    value={String(surah.number)}
                    disabled={isUsed}
                  >
                    {surah.number}. {surah.shortName} - {surah.englishName}
                  </SelectItem>
                );
              })}
              {displayedSurahs.length === 0 ? (
                <SelectItem value="__no-results" disabled>
                  {t("quranReminder.noSearchResults")}
                </SelectItem>
              ) : null}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {t("quranReminder.selectedSurah", {
              surah: `${selectedSurah.shortName} - ${selectedSurah.englishName}`,
            })}
          </p>
        </div>

        <div className="space-y-3">
          <Label>{t("quranReminder.daysLabel")}</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {DAY_KEYS.map((day) => {
              const checked = draftReminder.days.includes(day.value);

              return (
                <label
                  key={day.value}
                  htmlFor={`day-${day.value}`}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                    checked
                      ? // Checked state uses Primary
                        "border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/20 dark:text-white"
                      : // Unchecked state remains neutral
                        "border-border/70 bg-background/80 hover:bg-accent/60",
                  )}
                >
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={checked}
                    onCheckedChange={() => handleDraftDayToggle(day.value)}
                  />
                  <span className="text-sm font-medium">
                    {t(`days.${day.key}`)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <Label htmlFor="quran-time">{t("quranReminder.timeLabel")}</Label>
            <InputTime
              id="quran-time"
              value={draftReminder.time}
              onChange={(value) => onChange({ ...draftReminder, time: value })}
            />
          </div>

          <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-4">
            <p className="text-sm font-medium">
              {t("quranReminder.previewTitle")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("quranReminder.previewBody", {
                summary: quranSummary,
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {isEditing ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="h-11 rounded-xl"
            >
              {t("quranReminder.cancelEdit")}
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={onAddReminder}
            disabled={reminderLimitReached}
            // Save button updated to primary
            className="h-11 rounded-xl bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {isEditing
              ? t("quranReminder.updateAction")
              : t("quranReminder.addAction")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReminderComposer;
