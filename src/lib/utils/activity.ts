import { Activity } from "@/types/activity";
import { DateTime } from "luxon";
import { THEMES } from "./galaxy";
import { Verse } from "@/types/verse";
import { Pagination } from "@/types/paginate";

export interface JourneyStats {
  currentStreak: number;
  longestStreak: number;
  totalReadingDays: number;
  totalPagesRead: number;
  totalSecondsRead: number;
  consistencyPercentage: number;
  isReadToday: boolean;
  heatmapData: {
    date: string;
    count: number;
    pages: number;
    minutes: number;
  }[];
  achievements: {
    id: string;
    isUnlocked: boolean;
    progress: number;
  }[];
  insights: {
    mostReadSurahId: number | null;
    mostReadThemeId: string | null;
  };
}

// export function calculateJourneyStats(activities: Activity[]): JourneyStats {
//   if (!activities || activities.length === 0) {
//     return {
//       currentStreak: 0,
//       longestStreak: 0,
//       totalReadingDays: 0,
//       totalPagesRead: 0,
//       totalVersesRead: 0,
//       totalSecondsRead: 0,
//       consistencyPercentage: 0,
//       isReadToday: false,
//       heatmapData: [],
//       achievements: [],
//       insights: {
//         mostReadSurahId: null,
//         mostReadThemeId: null,
//       },
//     };
//   }

//   const today = DateTime.now().startOf("day");
//   const yesterday = today.minus({ days: 1 });

//   let currentStreak = 0;
//   let longestStreak = 0;
//   let tempStreak = 0;
//   let totalPagesRead = 0;
//   let totalVersesRead = 0;
//   let totalSecondsRead = 0;

//   const activityDates = new Set(
//     activities.map((a) => DateTime.fromISO(a.date).toISODate())
//   );

//   const surahCounts: Record<number, number> = {};

//   // Calculate stats
//   activities.forEach((a) => {
//     totalPagesRead += a.pagesRead || 0;
//     totalVersesRead += a.verseRead || 0;
//     totalSecondsRead += a.secondsRead || 0;

//     // Extract surah IDs from ranges (e.g., "1:1-1:2")
//     a.ranges?.forEach((range) => {
//       const surahId = parseInt(range.split(":")[0]);
//       if (!isNaN(surahId)) {
//         surahCounts[surahId] = (surahCounts[surahId] || 0) + 1;
//       }
//     });
//   });

//   // Most read surah
//   let mostReadSurahId = null;
//   let maxSurahCount = 0;
//   Object.entries(surahCounts).forEach(([id, count]) => {
//     if (count > maxSurahCount) {
//       maxSurahCount = count;
//       mostReadSurahId = parseInt(id);
//     }
//   });

//   // Most read theme
//   const THEMES_MOCK = [
//     { id: "prophets", surahIds: [2, 3, 6, 7, 10, 11, 12, 14, 15, 19, 20, 21, 26, 27, 28, 37, 38, 71] },
//     { id: "afterlife", surahIds: [22, 36, 39, 50, 55, 56, 67, 69, 75, 78, 81, 82, 83, 84, 99, 101] },
//     { id: "aqeedah", surahIds: [1, 6, 13, 16, 25, 31, 35, 40, 41, 42, 50, 51, 52, 53, 87, 112, 113, 114] },
//     { id: "ethics", surahIds: [17, 23, 24, 49, 60, 68, 80, 83, 90, 103, 107] },
//     { id: "legislation", surahIds: [2, 4, 5, 8, 9, 24, 33, 60, 65] },
//   ];

//   const themeCounts: Record<string, number> = {};
//   Object.entries(surahCounts).forEach(([surahId, count]) => {
//     const sId = parseInt(surahId);
//     THEMES_MOCK.forEach(theme => {
//       if (theme.surahIds.includes(sId)) {
//         themeCounts[theme.id] = (themeCounts[theme.id] || 0) + count;
//       }
//     });
//   });

//   let mostReadThemeId = null;
//   let maxThemeCount = 0;
//   Object.entries(themeCounts).forEach(([id, count]) => {
//     if (count > maxThemeCount) {
//       maxThemeCount = count;
//       mostReadThemeId = id;
//     }
//   });

//   // Calculate current streak
//   let checkDate = today;
//   if (!activityDates.has(today.toISODate())) {
//     checkDate = yesterday;
//   }

//   while (activityDates.has(checkDate.toISODate())) {
//     currentStreak++;
//     checkDate = checkDate.minus({ days: 1 });
//   }

//   // Calculate longest streak
//   const sortedUniqueDates = Array.from(activityDates)
//     .map((d) => DateTime.fromISO(d!))
//     .sort((a, b) => a.toMillis() - b.toMillis());

//   if (sortedUniqueDates.length > 0) {
//     tempStreak = 1;
//     longestStreak = 1;
//     for (let i = 1; i < sortedUniqueDates.length; i++) {
//       const diff = sortedUniqueDates[i].diff(sortedUniqueDates[i - 1], "days").days;
//       if (diff === 1) {
//         tempStreak++;
//       } else {
//         tempStreak = 1;
//       }
//       longestStreak = Math.max(longestStreak, tempStreak);
//     }
//   }

//   const firstActivityDate = sortedUniqueDates[0] || today;
//   const daysSinceStart = Math.max(1, today.diff(firstActivityDate, "days").days + 1);
//   const consistencyPercentage = Math.round((activityDates.size / daysSinceStart) * 100);

//   const heatmapData = activities.map((a) => ({
//     date: a.date.replace(/-/g, "/"), // react-heat-map expects yyyy/mm/dd
//     count: Math.ceil(a.pagesRead || 0),
//     pages: a.pagesRead || 0,
//     minutes: Math.round((a.secondsRead || 0) / 60),
//   }));

//   const achievements = [
//     {
//       id: "firstDay",
//       isUnlocked: activityDates.size >= 1,
//       progress: Math.min(activityDates.size, 1),
//     },
//     {
//       id: "streak7",
//       isUnlocked: longestStreak >= 7,
//       progress: Math.min((longestStreak / 7) * 100, 100),
//     },
//     {
//       id: "streak30",
//       isUnlocked: longestStreak >= 30,
//       progress: Math.min((longestStreak / 30) * 100, 100),
//     },
//     {
//       id: "pages100",
//       isUnlocked: totalPagesRead >= 100,
//       progress: Math.min((totalPagesRead / 100) * 100, 100),
//     },
//   ];

//   return {
//     currentStreak,
//     longestStreak,
//     totalReadingDays: activityDates.size,
//     totalPagesRead,
//     totalVersesRead,
//     totalSecondsRead,
//     consistencyPercentage,
//     isReadToday: activityDates.has(today.toISODate()),
//     heatmapData,
//     achievements,
//     insights: {
//       mostReadSurahId,
//       mostReadThemeId,
//     },
//   };
// }

const EMPTY_JOURNEY_STATS: JourneyStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalReadingDays: 0,
  totalPagesRead: 0,
  totalSecondsRead: 0,
  consistencyPercentage: 0,
  isReadToday: false,
  heatmapData: [],
  achievements: [],
  insights: {
    mostReadSurahId: null,
    mostReadThemeId: null,
  },
};

const SURAH_THEME_MAP = THEMES.reduce<Record<number, string[]>>(
  (acc, theme) => {
    theme.surahIds.forEach((surahId) => {
      if (!acc[surahId]) {
        acc[surahId] = [];
      }

      acc[surahId].push(theme.id);
    });

    return acc;
  },
  {},
);

const getMostFrequentKey = <T extends string | number>(
  record: Record<string, number>,
): T | null => {
  let result: T | null = null;
  let max = 0;

  for (const [key, value] of Object.entries(record)) {
    if (value > max) {
      max = value;
      result = key as T;
    }
  }

  return result;
};

const calculateLongestStreak = (sortedDates: DateTime[]) => {
  if (sortedDates.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const previous = sortedDates[i - 1];

    const currentDate = sortedDates[i];

    const diff = currentDate.diff(previous, "days").days;

    current = diff === 1 ? current + 1 : 1;

    longest = Math.max(longest, current);
  }

  return longest;
};

function buildAchievements(
  totalReadingDays: number,
  longestStreak: number,
  totalPagesRead: number,
): JourneyStats["achievements"] {
  return [
    {
      id: "firstDay",
      isUnlocked: totalReadingDays >= 1,
      progress: Math.min(totalReadingDays, 1),
    },
    {
      id: "streak7",
      isUnlocked: longestStreak >= 7,
      progress: Math.min((longestStreak / 7) * 100, 100),
    },
    {
      id: "streak30",
      isUnlocked: longestStreak >= 30,
      progress: Math.min((longestStreak / 30) * 100, 100),
    },
    {
      id: "pages100",
      isUnlocked: totalPagesRead >= 100,
      progress: Math.min((totalPagesRead / 100) * 100, 100),
    },
  ];
}

export function calculateJourneyStats(
  activities: Activity[],
  currentStreak: number,
): JourneyStats {
  if (!activities?.length) {
    return EMPTY_JOURNEY_STATS;
  }

  const today = DateTime.now().startOf("day");

  const activityDates = new Set<string>();

  const surahCounts: Record<number, number> = {};

  const themeCounts: Record<string, number> = {};

  let totalPagesRead = 0;
  let totalSecondsRead = 0;

  const heatmapByDate = new Map<
    string,
    {
      date: string;
      count: number;
      pages: number;
      seconds: number;
    }
  >();

  activities.forEach((activity) => {
    const {
      date,
      pagesRead,

      secondsRead,
      ranges,
    } = activity;

    const normalizedDate = DateTime.fromISO(date).toISODate() ?? date;

    activityDates.add(normalizedDate);
    totalPagesRead += pagesRead;

    totalSecondsRead += secondsRead;

    const existing = heatmapByDate.get(normalizedDate) ?? {
      date: DateTime.fromISO(normalizedDate).toFormat("yyyy/M/d"),
      count: 0,
      pages: 0,
      seconds: 0,
    };

    existing.pages += pagesRead;
    existing.seconds += secondsRead;
    existing.count = Math.ceil(existing.pages);

    heatmapByDate.set(normalizedDate, existing);

    ranges?.forEach((range) => {
      const surahId = Number(range.split(":")[0]);

      if (Number.isNaN(surahId)) {
        return;
      }

      surahCounts[surahId] = (surahCounts[surahId] || 0) + 1;

      const themes = SURAH_THEME_MAP[surahId];

      themes?.forEach((themeId) => {
        themeCounts[themeId] = (themeCounts[themeId] || 0) + 1;
      });
    });
  });

  const heatmapData = Array.from(heatmapByDate.values())
    .sort(
      (a, b) =>
        DateTime.fromFormat(a.date, "yyyy/M/d").toMillis() -
        DateTime.fromFormat(b.date, "yyyy/M/d").toMillis(),
    )
    .map(({ seconds, ...rest }) => ({
      ...rest,
      minutes: Math.round(seconds / 60),
    }));

  const sortedDates = Array.from(activityDates)
    .map((date) => DateTime.fromISO(date))
    .sort((a, b) => a.toMillis() - b.toMillis());

  const longestStreak = calculateLongestStreak(sortedDates);

  const firstActivityDate = sortedDates[0] ?? today;

  const daysSinceStart = Math.max(
    1,
    today.diff(firstActivityDate, "days").days + 1,
  );

  const consistencyPercentage = Math.round(
    (activityDates.size / daysSinceStart) * 100,
  );

  const mostReadSurahId = getMostFrequentKey<number>(surahCounts);

  const mostReadThemeId = getMostFrequentKey<string>(themeCounts);
  return {
    currentStreak,

    longestStreak,

    totalReadingDays: activityDates.size,

    totalPagesRead,

    totalSecondsRead,

    consistencyPercentage,

    isReadToday: activityDates.has(today.toISODate()),

    heatmapData,

    achievements: buildAchievements(
      activityDates.size,
      longestStreak,
      totalPagesRead,
    ),

    insights: {
      mostReadSurahId,

      mostReadThemeId,
    },
  };
}

export const generateJourneyYears = (createdAt: string) => {
  const startYear = DateTime.fromISO(createdAt).year;

  const currentYear = DateTime.now().year;

  const years: number[] = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }

  return years;
};

export const getYearDateRange = (year: number) => {
  return {
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  };
};

export const formatActivityRanges = (data: Verse[]) => {
  const firstVerse = data[0];
  const lastVerse = data[data.length - 1];

  if (!firstVerse || !lastVerse) return null;

  const startingVerseKey = firstVerse.verse_key;
  const endingVerseKey = lastVerse.verse_key;

  return `${startingVerseKey}-${endingVerseKey}`;
};

// fetch all activity days for a given year

const journeyYearCache = new Map<string, Activity[]>();

// const createJourneyCacheKey = (userId: string, year: number) =>
//   `${userId}-${year}`;

type ActivityDaysResponse = {
  data: Activity[];
  pagination: Pagination;
};

type FetchActivityDaysParams = {
  first: number;

  after?: string;

  from: string;

  to: string;
};

type FetchActivityDaysFn = (
  params: FetchActivityDaysParams,
) => Promise<ActivityDaysResponse>;

interface FetchActivityParams {
  year: number;
  fetchActivityDays: FetchActivityDaysFn;
}
export const fetchAllActivityDaysForYear = async ({
  year,
  fetchActivityDays,
}: FetchActivityParams) => {
  // const cacheKey = createJourneyCacheKey(userId, year);
  // const cached = journeyYearCache.get(cacheKey);
  // if (cached) {
  //   return cached;
  // }
  const { from, to } = getYearDateRange(year);
  let hasNext = true;
  let after: string | undefined;
  const allActivities: Activity[] = [];

  while (hasNext) {
    const { data, pagination } = await fetchActivityDays({
      first: 20,
      ...(after ? { after } : {}),
      from,
      to,
    });
    allActivities.push(...data);
    hasNext = pagination.hasNextPage;
    after = pagination.endCursor || undefined;
  }

  // journeyYearCache.set(cacheKey, allActivities);
  return allActivities;
};

export const clearJourneyYearCache = (userId?: string) => {
  if (!userId) {
    journeyYearCache.clear();
    return;
  }

  Array.from(journeyYearCache.keys()).forEach((key) => {
    if (key.startsWith(userId)) {
      journeyYearCache.delete(key);
    }
  });
};
