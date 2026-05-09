export type ProfileSummary = {
  name: string | null;
  email: string;
  image?: string | null;
  createdAt: string;
  pushDeviceCount: number;
};


export type QuranReminderForm = {
  id?: string;
  surahId: number;
  days: number[];
  time: string;
  timezone?: string;
  isEnabled: boolean;
};


export type KhatmaReminderForm = {
  id?: string;
  time: string;
  timezone?: string;
  isEnabled: boolean;
};
