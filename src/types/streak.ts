export interface Streak {
  id: string;
  startDate: string;
  endDate: string;
  type: "QURAN";
  days: number;
  status: "ACTIVE" | "BROKEN";
}
