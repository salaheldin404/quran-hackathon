import SurahClientPage from "../_components/SurahClientPage";
import { Metadata } from "next";
import quranData from "@/data/all-quran-surah.json";
import { notFound } from "next/navigation";

export const revalidate = 86400; // 24 hours

export async function generateStaticParams() {
  const locales = ["ar", "en"];

  const ids = quranData.data.map((surah) => surah.number.toString());
  return locales.flatMap((locale) => ids.map((id) => ({ locale, id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "en" | "ar"; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const isArabic = locale === "ar";
  const surah = quranData.data[+id - 1];
  if (!surah) {
    return {
      title: isArabic ? "سورة غير موجودة" : "Surah Not Found",
      description: isArabic
        ? "عذراً، السورة التي تبحث عنها غير موجودة."
        : "Sorry, the surah you are looking for does not exist.",
    };
  }

  const title = isArabic
    ? `سورة ${surah.shortName}`
    : `Surah ${surah.englishName}`;
  const shortDesc = isArabic
    ? `استمع إلى سورة ${surah.shortName} بتلاوة خاشعة وجودة عالية. عدد الآيات: ${surah.numberOfAyahs}.`
    : `Listen to Surah ${surah.englishName} with soulful recitation and high quality. Number of verses: ${surah.numberOfAyahs}.`;

  const longDesc = isArabic
    ? `${shortDesc} تلاوات عالية الجودة مع خيارات الاستماع والتنزيل.`
    : `${shortDesc} High-quality recitations with listening and download options.`;
  const keywords = isArabic
    ? [
        surah.name,
        "سور القرآن",
        "تلاوة",
        "تلاوات قرآنية",
        "استماع للقرآن",
        `${surah.name} تلاوة`,
      ]
    : [
        surah.englishName,
        "Quran Surah",
        "Quran Recitation",
        "Listen to Quran",
        `${surah.englishName} recitation`,
      ];
  const canonical = `/${locale}/surah/${id}`;

  return {
    title,
    description: longDesc,
    keywords,
    alternates: {
      canonical,
      languages: {
        en: `/en/surahs/${id}`,
        ar: `/ar/surahs/${id}`,
      },
    },
    openGraph: {
      title,
      description: longDesc,
      url: canonical,
      siteName: "Sakinah Streams",
      locale: locale,
      type: "article",
    },
  };
}

const SurahPage = async ({
  params,
}: {
  params: Promise<{ locale: "en" | "ar"; id: string }>;
}) => {
  const { id, locale } = await params;

  const surah = quranData.data[+id - 1];
  const isArabic = locale === "ar";
  if (!surah) {
    notFound();
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: isArabic ? `سورة ${surah.shortName}` : `Surah ${surah.englishName}`,
    description: isArabic
      ? `استمع إلى سورة ${surah.shortName} بتلاوة خاشعة وجودة عالية. عدد الآيات: ${surah.numberOfAyahs}.`
      : `Listen to Surah ${surah.englishName} with soulful recitation and high quality. Number of verses: ${surah.numberOfAyahs}.`,
    inLanguage: isArabic ? "ar" : "en",
    mainEntity: {
      "@type": "CreativeWork",
      name: isArabic ? `سورة ${surah.shortName}` : `Surah ${surah.englishName}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SurahClientPage initialSurah={surah} locale={locale} />
    </>
  );
};

export default SurahPage;
