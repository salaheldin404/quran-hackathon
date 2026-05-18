import { Metadata } from "next";
import SurahsClientPage from "./_components/SurahsClientPage";

import quranData from "@/data/all-quran-surah.json";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "en" | "ar" }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const title = isArabic ? "سور القرآن الكريم" : "All Quran Surahs";
  const description = isArabic
    ? "استعرض جميع سور القرآن الكريم مع إمكانية البحث والتصفية بسهولة."
    : "Browse all Quran surahs with easy search and filtering options.";
  const keywords = isArabic
    ? [
        "سور القرآن",
        "تلاوات قرآنية",
        "بحث في القرآن",
        "القرآن الكريم",
        "استماع للقرآن",
        "تلاوة عالية الجودة",
        "قراءة القرآن",
        "المصحف",
      ].join(", ")
    : [
        "Quran Surahs",
        "Quran Recitations",
        "Search Quran",
        "Holy Quran",
        "Listen to Quran",
        "High-Quality Recitation",
        "Quran Reading",
        "Mushaf",
      ].join(", ");

  const canonical = `/${locale}/surahs`;
  const ogLocale = isArabic ? "ar_EG" : "en_US";
  const alternateOgLocale = isArabic ? "en_US" : "ar_EG";
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        en: `/en/surahs`,
        ar: `/ar/surahs`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "Sakinah Streams",
      images: ["/og/surahs.png"],
      locale: ogLocale,
      alternateLocale: alternateOgLocale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/surahs.png"],
    },
  };
}

const SurahsPage = async ({
  params,
}: {
  params: Promise<{ locale: "en" | "ar" }>;
}) => {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const surahs = quranData.data;
  const SITE_URL = process.env.SITE_URL!;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isArabic ? "سور القرآن الكريم" : "All Quran Surahs",
    description: isArabic
      ? "استعرض جميع سور القرآن الكريم مع إمكانية البحث والتصفية بسهولة."
      : "Browse all Quran surahs with easy search and filtering options.",
    numberOfItems: 114,
    itemListElement: surahs.map((surah, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: isArabic
          ? `سورة ${surah.shortName}`
          : `Surah ${surah.englishName}`,
        url: `${SITE_URL}/${locale}/surahs/${surah.number}`,
        description: isArabic
          ? `تلاوة سورة ${surah.shortName} مع ${surah.numberOfAyahs} آيات.`
          : `Recitation of Surah ${surah.englishName} with ${surah.numberOfAyahs} verses.`,
      },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SurahsClientPage />
    </>
  );
};

export default SurahsPage;
