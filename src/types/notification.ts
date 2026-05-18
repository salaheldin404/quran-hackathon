type NotificationUser = {
  id: string;
  pushSubscriptions: {
    id: string;
    token: string;
  }[];
  settings?: {
    language: string;
  } | null;
};

export type ReminderWithUser = {
  id: string;
  surahId: number;
  time: string;
  days: number[];
  timezone: string;
  isEnabled: boolean;
  user: NotificationUser;
};

export type KhatmaReminderWithUser = {
  id: string;
  time: string;
  timezone: string;
  isEnabled: boolean;
  user: NotificationUser;
};

export type NotificationStatus = "sent" | "skipped" | "failed";