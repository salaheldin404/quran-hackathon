import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";

import { getKhatmaPlans } from "@/server/db/khatmaPlan";
import { KhatmaContent } from "@/components/khatma/KhatmaContent";
import { KhatmaPlan } from "@/types/khatma";
import { getUserIdFromCookie } from "@/lib/oauth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "en" | "ar" }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const title = isArabic ? "مخطط الختمة" : "Khatma Planner";

  const description = isArabic
    ? "خطط وتابع رحلتك لإتمام القرآن الكريم. حدد أهداف القراءة اليومية وابقَ متحفزًا لإتمام ختمتك."
    : "Plan and track your journey to complete the Holy Quran. Set daily reading goals and stay motivated to finish your Khatma.";

  const keywords = isArabic
    ? [
        "ختمة القرآن",
        "مخطط الختمة",
        "قراءة القرآن",
        "خطة يومية",
        "إتمام القرآن",
        "سكينة ستريمز",
        "ورد يومي للقرآن",
        "تتبع الختمة",
        "تخطيط ختمة القرآن",
        "تحديد أهداف القراءة اليومية",
        "متابعة التقدم في قراءة القرآن",
        "تنظيم قراءة القرآن اليومية",
      ].join(", ")
    : [
        "Khatma planner",
        "Quran completion",
        "daily reading plan",
        "finish Quran",
        "Khatma tracker",
        "Sakinah Streams",
        "daily Quran reading",
        "Quran completion planning",
        "daily Quran reading goals",
        "track Quran reading progress",
        "organize Quran reading schedule",
      ].join(", ");

  const canonical = `/${locale}/khatma`;
  const ogLocale = isArabic ? "ar_EG" : "en_US";
  const alternateOgLocale = isArabic ? "en_US" : "ar_EG";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        en: "/en/khatma",
        ar: "/ar/khatma",
      },
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Sakinah Streams",
      type: "website",
      locale: ogLocale,
      alternateLocale: alternateOgLocale,
      images: ["/og/khatma.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/khatma.png"],
    },
  };
}

export default async function KhatmaPage({
  params,
}: {
  params: Promise<{ locale: "en" | "ar" }>;
}) {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const userId = await getUserIdFromCookie();
  const t = await getTranslations("Khatma");

  // Get plans only if user is authenticated
  const plans = userId ? await getKhatmaPlans(userId) : ([] as KhatmaPlan[]);
  const baseUrl = process.env.SITE_URL!;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: isArabic ? "مخطط ختمة القرآن" : "Quran Khatma Planner",
    alternateName: isArabic ? "Quran Khatma Planner" : "مخطط ختمة القرآن",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any", // "Any" is the standard Schema.org convention for web apps
    url: `${baseUrl}/${locale}/khatma`,
    description: isArabic
      ? "أداة لمساعدتك على التخطيط لإتمام ختمة القرآن الكريم عبر تحديد أهداف القراءة اليومية ومتابعة التقدم."
      : "A web tool that helps you plan and track your Quran completion with daily reading goals.",
    inLanguage: locale,
    image: "/og/khatma.png",
    publisher: {
      "@type": "Organization",
      name: "Sakinah Streams",
      url: `${baseUrl}`,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: isArabic
      ? [
          "تخطيط ختمة القرآن",
          "تحديد أهداف القراءة اليومية",
          "متابعة التقدم في قراءة القرآن",
          "تنظيم قراءة القرآن اليومية",
        ]
      : [
          "Quran completion planning",
          "Daily Quran reading goals",
          "Track Quran reading progress",
          "Organize Quran reading schedule",
        ],
  };
  return (
    <div className="main-container py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header Section */}
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="p-3 rounded-full bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("description")}
        </p>
      </header>

      {/* Content Section */}
      <KhatmaContent initialPlans={plans} />
    </div>
  );
}
