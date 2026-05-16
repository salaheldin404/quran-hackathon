import groupBy from "lodash/groupBy";
import { Verse, VerseTiming } from "@/types/verse";

export const groupVersesByPage = (verses: Verse[]) => {
  if (!verses || verses.length === 0) {
    return {};
  }
  const versesData = groupBy(verses, (verse) => verse.page_number);

  return versesData;
};


export const getCurrentVerse = (
  timestamps: VerseTiming[],
  currentTime: number,
) => {
  if (!timestamps.length) return null;

  const currentTimeInMS = currentTime * 1000;
  let low = 0;
  let high = timestamps.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const { timestamp_from, timestamp_to } = timestamps[mid];
    if (timestamp_from <= currentTimeInMS && timestamp_to >= currentTimeInMS) {
      return timestamps[mid];
    } else if (currentTimeInMS < timestamp_from) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return null;
};

export const getVerseByKey = (
  verseKey: string,
  timestamps: Map<string, VerseTiming>,
) => {
  if (!verseKey) return null;
  return timestamps.get(verseKey) || null;
};
