"use client";

import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { BookOpen } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  createDefaultQuranReminder,
  MAX_QURAN_REMINDERS,
  sortDays,
} from "@/lib/utils/profile";
import type { QuranReminderForm } from "@/types/profile";
import ReminderCard from "./ReminderCard";
import ReminderComposer from "./ReminderComposer";

type QuranReminderSettingsProps = {
  quranReminders: QuranReminderForm[];
  setQuranReminders: Dispatch<SetStateAction<QuranReminderForm[]>>;
};

function createClientReminderId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `reminder-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function QuranReminderSettings({
  quranReminders,
  setQuranReminders,
}: QuranReminderSettingsProps) {
  const t = useTranslations("ProfilePage");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const headerRef = useRef<HTMLDivElement>(null);
  const [draftReminder, setDraftReminder] = useState<QuranReminderForm>(() =>
    createDefaultQuranReminder(),
  );
  const [editingReminderId, setEditingReminderId] = useState<string | null>(
    null,
  );

  const isEditing = editingReminderId !== null;
  const activeReminderCount = quranReminders.filter(
    (reminder) => reminder.isEnabled,
  ).length;
  const reminderLimitReached =
    quranReminders.length >= MAX_QURAN_REMINDERS && !isEditing;
  const usedSurahIds = useMemo(
    () =>
      new Set(
        quranReminders
          .filter((reminder) => reminder.id !== editingReminderId)
          .map((reminder) => reminder.surahId),
      ),
    [editingReminderId, quranReminders],
  );

  const resetComposer = () => {
    setDraftReminder(createDefaultQuranReminder());
    setEditingReminderId(null);
  };

  const handleAddReminder = () => {
    if (reminderLimitReached) {
      toast.error(t("quranReminder.limitReached"));
      return;
    }
    if (!draftReminder.time) {
      toast.error(t("quranReminder.timeRequired"));
      return;
    }
    if (draftReminder.days.length === 0) {
      toast.error(t("quranReminder.daysRequired"));
      return;
    }
    if (usedSurahIds.has(draftReminder.surahId)) {
      toast.error(t("quranReminder.duplicateSurah"));
      return;
    }

    const nextReminder = {
      ...draftReminder,
      id: draftReminder.id ?? createClientReminderId(),
      days: sortDays(draftReminder.days),
    };

    setQuranReminders((current) => {
      if (editingReminderId) {
        return current.map((reminder) =>
          reminder.id === editingReminderId ? nextReminder : reminder,
        );
      }

      return [...current, nextReminder];
    });

    resetComposer();
  };

  const handleEditReminder = (reminder: QuranReminderForm) => {
    setDraftReminder({
      ...reminder,
      days: sortDays(reminder.days),
    });
    setEditingReminderId(reminder.id ?? null);

    // Scroll to the composer area
    headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRemoveReminder = (reminderId?: string) => {
    setQuranReminders((current) =>
      current.filter((reminder) => reminder.id !== reminderId),
    );

    if (editingReminderId && editingReminderId === reminderId) {
      resetComposer();
    }
  };

  const handleToggleReminder = (
    reminderId: string | undefined,
    checked: boolean,
  ) => {
    setQuranReminders((current) =>
      current.map((reminder) =>
        reminder.id === reminderId
          ? {
              ...reminder,
              isEnabled: checked,
            }
          : reminder,
      ),
    );
  };

  return (
    <Card className="pt-0 overflow-hidden rounded-[28px] border-white/70 bg-white/85 shadow-sm backdrop-blur dark:border-white/10 dark:bg-card/90">
      <CardHeader
        ref={headerRef}
        className="py-6 border-b border-border/60 bg-gradient-to-r from-primary/10 via-white to-primary/5 dark:from-primary/10 dark:via-card dark:to-primary/5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-primary" />
              {t("quranReminder.title")}
            </CardTitle>
            <CardDescription>{t("quranReminder.description")}</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-primary px-3 py-1 text-white ">
              {t("quranReminder.activeCount", {
                count: activeReminderCount,
              })}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 border-primary/20 text-foreground dark:border-primary/30"
            >
              {t("quranReminder.limitCount", {
                count: quranReminders.length,
                max: MAX_QURAN_REMINDERS,
              })}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <ReminderComposer
          dir={dir}
          draftReminder={draftReminder}
          isEditing={isEditing}
          onAddReminder={handleAddReminder}
          onChange={setDraftReminder}
          onCancel={resetComposer}
          usedSurahIds={usedSurahIds}
          t={t}
          reminderLimitReached={reminderLimitReached}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("quranReminder.remindersTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("quranReminder.remindersDescription")}
              </p>
            </div>
          </div>

          {quranReminders.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-border/70 bg-background/60 px-5 py-8 text-center">
              <p className="font-medium">{t("quranReminder.emptyTitle")}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("quranReminder.emptyDescription")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 ">
              {quranReminders.map((reminder, index) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  index={index}
                  dir={dir}
                  onEdit={handleEditReminder}
                  onToggle={handleToggleReminder}
                  onRemove={handleRemoveReminder}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
