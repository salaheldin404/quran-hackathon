import { Metadata } from "next";
import FeaturedSurahs from "@/components/home/FeaturedSurahs";
import SalahAlanNabiDialog from "@/components/home/SalahAlanNabiDialog";
import QuickAccess from "@/components/home/quickAccess/index";
import RandomAyah from "@/components/home/RandomAyah";
import RecentlyPlayed from "@/components/home/RecentlyPlayed";
import Reciters from "@/components/home/Reciters";

import { getKhatmaPlan } from "@/server/db/khatmaPlan";
import { KhatmaPlan } from "@/types/khatma";
import NotificationPermissionRequest from "@/components/notifications/NotificationPermissionRequest";
import {  getUserIdFromCookie } from "@/lib/oauth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "en" | "ar" }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const title = isArabic
    ? "الرئيسية - تلاوات قرآنية خاشعة"
    : "Home - Soulful Quran Recitations";

  const description = isArabic
    ? "استمع لتلاوات القرآن الكريم بجودة عالية تبعث السكينة والطمأنينة في قلبك. اختر من بين مجموعة واسعة من القراء والسور."
    : "Listen to high-quality Quran recitations that bring tranquility to your heart. Choose from a wide range of reciters and surahs.";

  const keywords = isArabic
    ? [
        "القرآن الكريم",
        "تلاوات قرآنية",
        "استماع للقرآن",
        "قراء القرآن",
        "سور القرآن",
        "تلاوة خاشعة",
        "سكينة ستريمز",
      ].join(", ")
    : [
        "Holy Quran",
        "Quran Recitations",
        "Listen to Quran",
        "Quran Reciters",
        "Quran Surahs",
        "Soulful Recitation",
        "Sakinah Streams",
      ].join(", ");

  const canonical = isArabic ? "/ar" : "/en";
  const ogLocale = isArabic ? "ar_EG" : "en_US";
  const alternateOgLocale = isArabic ? "en_US" : "ar_EG";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        en: "/en",
        ar: "/ar",
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Sakinah Streams",
      type: "website",
      locale: ogLocale,
      alternateLocale: alternateOgLocale,
      images: ["/og/home.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/home.png"],
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: "en" | "ar" }>;
}) {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const baseUrl = process.env.SITE_URL!

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sakinah Streams",
    alternateName: "Sakinah Streams",
    url: baseUrl,
    description: isArabic
      ? "استمع لتلاوات القرآن الكريم بجودة عالية تبعث السكينة والطمأنينة في قلبك."
      : "Listen to high-quality Quran recitations that bring tranquility to your heart.",
    inLanguage: isArabic ? "ar" : "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/${locale}/surahs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Sakinah Streams",
      url: baseUrl,
    },
    sameAs: [],
  };
  let khatma: KhatmaPlan | null = null;
  const userId = await getUserIdFromCookie();
  if (userId) {
    const plan = await getKhatmaPlan(userId);
    khatma = plan;
  }
  return (
    <div className="bg-ground ">
      <NotificationPermissionRequest />
      <SalahAlanNabiDialog />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="">
        {/* quick access */}
        <QuickAccess khatma={khatma} />
        {/* Random Ayah */}
        <RandomAyah />
        
        {/* Featured Surahs */}
        <FeaturedSurahs />
        <Reciters />
        <RecentlyPlayed />
      </main>
    </div>
  );
}
