import surahData from "@/data/all-quran-surah.json";

const quranData = surahData.data;

export interface VerseContent {
  text: string;
  surahName: string;
  surahNumber: number;
  tafsir?: string;
}

/**
 * Fetches authentic Quran text and translation from the trusted Quran Foundation API.
 */
const baseUrl = process.env.SITE_URL || "http://localhost:3000";
export async function fetchVerseContent(
  surah: number,
  ayah: number,
): Promise<VerseContent> {
  // 2. Fetch Verse Data
  const verseKey = `${surah}:${ayah}`;

  const res = await fetch(
    `${baseUrl}/api/v4/verses/by_key/${verseKey}?fields=text_uthmani,text_qpc_hafs&tafsirs=16`,
  );

  if (!res.ok) throw new Error(`Failed to fetch verse ${verseKey}`);
  const data = await res.json();
  const verse = data.verse;
  return {
    text: verse.text_qpc_hafs || verse.text_uthmani,
    surahName: quranData[surah - 1]?.name || `Surah ${surah}`,
    tafsir: verse.tafsirs.length ? verse.tafsirs[0].text : "",
    surahNumber: surah,
  };
}

/**
 * Batch fetch verses to improve performance.
 */
export async function fetchBatchVerses(
  references: { surahNumber: number; ayahNumber: number }[],
): Promise<(VerseContent & { surahNumber: number; ayahNumber: number })[]> {
  const result = await Promise.allSettled(
    references.map(async (ref) => {
      const content = await fetchVerseContent(ref.surahNumber, ref.ayahNumber);
      return { ...content, ...ref };
    }),
  );
  return result
    .filter(
      (
        r,
      ): r is PromiseFulfilledResult<
        VerseContent & { surahNumber: number; ayahNumber: number }
      > => r.status === "fulfilled",
    )
    .map((r) => r.value);
}
