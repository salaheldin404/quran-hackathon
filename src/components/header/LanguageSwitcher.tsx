"use client";
import { Button } from "@/components/ui/button";

import { LuGlobe } from "react-icons/lu";

import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setLanguage } from "@/lib/store/slices/language-slice";

const LanguageSwitcher = () => {
  const locale = useLocale();
  const tSettings = useTranslations("Settings");
  const dispatch = useAppDispatch();

  const handleLanguageSwitch = useCallback(() => {
    const nextLocale = locale === "ar" ? "en" : "ar";
    dispatch(setLanguage(nextLocale));
  }, [locale, dispatch]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {tSettings("language")}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 cursor-pointer"
        onClick={handleLanguageSwitch}
      >
        <LuGlobe className="h-4 w-4" />
        {locale === "ar" ? "English" : "عربي"}
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
