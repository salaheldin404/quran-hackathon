"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

import KhatmaReminderSettings from "./KhatmaReminderSettings";
import ProfileHeader from "./ProfileHeader";
import ProfileInformation from "./ProfileInformation";
import QuranReminderSettings from "./QuranReminderSettings";
import SaveSettings from "./SaveSettings";

import type {
  KhatmaReminderForm,
  ProfileSummary,
  QuranReminderForm,
} from "@/types/profile";

import { MAX_QURAN_REMINDERS } from "@/lib/utils/profile";

type ProfilePageClientProps = {
  profile: ProfileSummary;
  initialQuranReminders: QuranReminderForm[];
  initialKhatmaReminder: KhatmaReminderForm;
};

export default function ProfilePageClient({
  profile,
  initialQuranReminders,
  initialKhatmaReminder,
}: ProfilePageClientProps) {
  const t = useTranslations("ProfilePage");
  const { permission, requestPermission } = useNotifications();

  const [quranReminders, setQuranReminders] = useState<QuranReminderForm[]>(
    initialQuranReminders,
  );
  const [khatmaReminder, setKhatmaReminder] = useState<KhatmaReminderForm>(
    initialKhatmaReminder,
  );
  const [baseline, setBaseline] = useState({
    quran: initialQuranReminders,
    khatma: initialKhatmaReminder,
  });
  const [deviceCount, setDeviceCount] = useState(profile.pushDeviceCount);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isDirty = useMemo(() => {
    return (
      JSON.stringify(quranReminders) !== JSON.stringify(baseline.quran) ||
      JSON.stringify(khatmaReminder) !== JSON.stringify(baseline.khatma)
    );
  }, [quranReminders, khatmaReminder, baseline]);

  const reminderCount =
    quranReminders.filter((reminder) => reminder.isEnabled).length +
    Number(khatmaReminder.isEnabled);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (permission === "granted" && deviceCount === 0) {
      requestPermission()
        .then(() => {
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            setDeviceCount(1);
          }
        })
        .catch(() => undefined);
    }
  }, [deviceCount, permission, requestPermission]);

  const handlePermissionRequest = async () => {
    await requestPermission();

    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      setDeviceCount((current) => Math.max(current, 1));
      toast.success(t("permission.enabledToast"));
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (quranReminders.length > MAX_QURAN_REMINDERS) {
      toast.error(t("validation.quranLimit"));
      return;
    }
    if (
      new Set(quranReminders.map((reminder) => reminder.surahId)).size !==
      quranReminders.length
    ) {
      toast.error(t("validation.quranDuplicate"));
      return;
    }
    for (const quranReminder of quranReminders) {
      if (!quranReminder.time) {
        toast.error(t("validation.quranTime"));
        return;
      }
      if (quranReminder.days.length === 0) {
        toast.error(t("validation.days"));
        return;
      }
    }
    if (!khatmaReminder.time) {
      toast.error(t("validation.khatmaTime"));
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/profile/reminders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          quranReminders,
          khatmaReminder,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || t("save.error"));
      }

      setQuranReminders(result.quranReminders);
      setKhatmaReminder(result.khatmaReminder);
      setBaseline({
        quran: result.quranReminders,
        khatma: result.khatmaReminder,
      });
      setSaveMessage(t("save.success"));
      toast.success(t("save.successToast"));

      if (
        (result.quranReminders.some(
          (reminder: QuranReminderForm) => reminder.isEnabled,
        ) ||
          result.khatmaReminder.isEnabled) &&
        permission !== "granted"
      ) {
        toast.message(t("permission.title"), {
          description: t(
            permission === "denied"
              ? "permission.deniedDescription"
              : "permission.defaultDescription",
          ),
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("save.error");
      setSaveMessage(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(212, 234, 223, 0.9), transparent 32%), radial-gradient(circle at bottom right, rgba(245, 232, 213, 0.85), transparent 30%)",
        }}
      />

      <div className="main-container py-8 md:py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <ProfileHeader
            profile={profile}
            deviceCount={deviceCount}
            reminderCount={reminderCount}
          />

          {saveMessage ? (
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm",
                saveMessage === t("save.success")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "border-destructive/20 bg-destructive/10 text-destructive",
              )}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{saveMessage}</span>
            </div>
          ) : null}

          <form
            className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]"
            onSubmit={handleSave}
          >
            <QuranReminderSettings
              quranReminders={quranReminders}
              setQuranReminders={setQuranReminders}
            />

            <div className="space-y-6">
              <ProfileInformation
                profile={profile}
                deviceCount={deviceCount}
                permission={permission}
                onPermissionRequest={handlePermissionRequest}
              />

              <KhatmaReminderSettings
                khatmaReminder={khatmaReminder}
                setKhatmaReminder={setKhatmaReminder}
              />

              <SaveSettings
                quranReminders={quranReminders}
                khatmaReminder={khatmaReminder}
                isSaving={isSaving}
                isDirty={isDirty}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
