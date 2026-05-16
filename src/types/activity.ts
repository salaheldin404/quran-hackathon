export interface Activity {
  id: string;
  date: string;
  progress: number;
  type: "QURAN";
  secondsRead: number;
  ranges: string[];
  pagesRead: number;
  verseRead: number;
  mushafId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 11 | 19;
}
export interface ActivityDayInput {
  seconds: number;
  ranges: string[];
  mushafId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 11 | 19;
  type: "QURAN";
  date?: string;
}
