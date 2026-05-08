"use client";

import { useTranslations } from "next-intl";
import { Link as IntlLink } from "@/i18n/navigation";
import Link from "next/link";
import { FaHome, FaUserCircle } from "react-icons/fa";

const SignInPage = () => {
  const t = useTranslations("SignIn");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          {/* Logo / Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-8 h-8 text-primary"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
          {/* QF Button */}
          <Link
            href="/api/auth/login"
            prefetch={false}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-background hover:bg-secondary font-medium transition-colors cursor-pointer"
          >
            <FaUserCircle className="w-5 h-5 text-primary" />
            Sign in with Quran Foundation
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          {/* <p className="text-xs text-gray-400 dark:text-gray-500">
            {t("terms")}
          </p> */}
          <IntlLink
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <FaHome className="w-3.5 h-3.5" />
            {t("back-home")}
          </IntlLink>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
