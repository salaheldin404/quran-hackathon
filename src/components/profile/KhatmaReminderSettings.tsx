"use client";

import type { Dispatch, SetStateAction } from "react";
import { Clock3 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import type { KhatmaReminderForm } from "@/types/profile";
import { formatTime } from "@/lib/utils/profile";
import InputTime from "./InputTime";

type KhatmaReminderSettingsProps = {
  khatmaReminder: KhatmaReminderForm;
  setKhatmaReminder: Dispatch<SetStateAction<KhatmaReminderForm>>;
};

export default function KhatmaReminderSettings({
  khatmaReminder,
  setKhatmaReminder,
}: KhatmaReminderSettingsProps) {
  const t = useTranslations("ProfilePage");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const khatmaSummary = formatTime(khatmaReminder.time);

  return (
    <Card className="rounded-[28px] border-white/70 bg-white/85 shadow-sm backdrop-blur dark:border-white/10 dark:bg-card/90">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock3 className="h-5 w-5 text-sky-700 dark:text-sky-300" />
          {t("khatmaReminder.title")}
        </CardTitle>
        <CardDescription>{t("khatmaReminder.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-4">
          <div>
            <p className="font-medium">{t("khatmaReminder.enableTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {khatmaReminder.isEnabled
                ? t("khatmaReminder.enabledHint")
                : t("khatmaReminder.disabledHint")}
            </p>
          </div>
          <Switch
            checked={khatmaReminder.isEnabled}
            dir={dir}
            onCheckedChange={(checked) =>
              setKhatmaReminder((current) => ({
                ...current,
                isEnabled: checked,
              }))
            }
            aria-label={t("khatmaReminder.enableTitle")}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="khatma-time">{t("khatmaReminder.timeLabel")}</Label>
          <InputTime
            id="khatma-time"
            value={khatmaReminder.time}
            onChange={(value) =>
              setKhatmaReminder((current) => ({ ...current, time: value }))
            }
          />
        </div>

        <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-4">
          <p className="text-sm font-medium">
            {t("khatmaReminder.previewTitle")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("khatmaReminder.previewBody", {
              time: khatmaSummary,
            })}
          </p>
        </div>

        <Link
          href="/khatma"
          className="inline-flex items-center text-sm font-medium  transition-colors text-primary hover:text-primary/80 dark:text-primary/90 dark:hover:text-primary/70"
        >
          {t("khatmaReminder.link")}
        </Link>
      </CardContent>
    </Card>
  );
}
