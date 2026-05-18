import hisnMuslimData from "@/data/hisn-muslim.json";
import MainHeader from "./_components/MainHeader";
import CategoryCard from "./_components/CategoryCard";
import { Hisn } from "@/types/hisn-muslim";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "en" | "ar" }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const isArabic = locale === "ar";

  const title = isArabic
    ? "حصن المسلم - أذكار وأدعية"
    : "Hisn Al Muslim - Athkar & Duas";
  const description = isArabic
    ? "كتاب حصن المسلم - مجموعة كاملة من الأذكار والأدعية الصحيحة من القرآن والسنة. أدعية الصباح والمساء وأذكار اليوم والليلة."
    : "Hisn Al Muslim Book - A complete collection of authentic athkar and duas from the Quran and Sunnah. Morning and evening athkar, daily and nightly remembrances.";
  const keywords = isArabic
    ? [
        "حصن المسلم",
        "أذكار",
        "أدعية",
        "أذكار الصباح",
        "أذكار المساء",
        "أدعية قرآنية",
        "أدعية نبوية",
        "سكينة ستريمز",
      ].join(", ")
    : [
        "Hisn Al Muslim",
        "Athkar",
        "Duas",
        "Morning Athkar",
        "Evening Athkar",
        "Quranic Duas",
        "Prophetic Duas",
        "Sakinah Streams",
      ].join(", ");
  const canonical = `/${locale}/hisn-muslim`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        en: "/en/hisn-muslim",
        ar: "/ar/hisn-muslim",
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Sakinah Streams",
      locale: locale,
      type: "website",
      images: ['/og/hisn-muslim.png'],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ['/og/hisn-muslim.png'],
    },
  };
}

const HisnMuslimPage = async () => {
  const categories = Object.keys(hisnMuslimData) as Array<
    keyof typeof hisnMuslimData
  >;
  const SITE_URL = process.env.SITE_URL!;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "حصن المسلم",
    description:
      "مجموعة كاملة من أقسام حصن المسلم، تشمل الأذكار والأدعية الصحيحة.",
    numberOfItems: categories.length,
    itemListElement: categories.map((key, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: hisnMuslimData[key].categoryName,
      url: `${SITE_URL}/ar/hisn-muslim/${hisnMuslimData[key]}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="py-10">
        <div className="main-container">
          <MainHeader />

          <div className="grid min-[600px]:grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map((item, index) => (
              <CategoryCard
                key={`category-${index}`}
                category={(hisnMuslimData as Record<string, Hisn>)[item]}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HisnMuslimPage;
