"use client";

import { useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAppSelector } from "@/lib/store/hooks";

export default function LanguageRouteSync() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const preferredLanguage = useAppSelector((state) => state.language.language);

  useEffect(() => {
    if (preferredLanguage && preferredLanguage !== currentLocale) {
      startTransition(() => {
        router.replace(pathname, { locale: preferredLanguage as "ar" | "en" });
      });
    }
  }, [preferredLanguage, currentLocale, pathname, router]);

  return null;
}
