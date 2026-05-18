import { MetadataRoute } from "next";
import surahData from "@/data/all-quran-surah.json";

const BASE_URL = process.env.SITE_URL!

const LOCALES = ["ar", "en"] as const;

interface StaticPage {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
}
const STATIC_PAGES: StaticPage[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/surahs", changeFrequency: "weekly", priority: 0.9 },
  { path: "/reciters", changeFrequency: "weekly", priority: 0.9 },
  { path: "/radios", changeFrequency: "weekly", priority: 0.8 },
  { path: "/hisn-muslim", changeFrequency: "monthly", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const surahs = surahData.data;
  const currentDate = new Date();

  // Static pages for each locale
  const staticPages = LOCALES.flatMap((locale) =>
    STATIC_PAGES.map((page) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: currentDate,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
  );

  // Surah detail pages for each locale
  const surahPages = LOCALES.flatMap((locale) =>
    surahs.map((surah) => ({
      url: `${BASE_URL}/${locale}/surahs/${surah.number}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  );

  return [...staticPages, ...surahPages];
}
