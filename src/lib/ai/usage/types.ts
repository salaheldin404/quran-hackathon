export type UserType = 'authenticated' ;

export interface AIUsageLimit {
  daily: number;
  cooldownSeconds: number;
}

export interface AIUsageStatus {
  canGenerate: boolean;
  remaining: number;
  totalLimit: number;
  resetAt: Date;
  reason?: 'limit_reached' | 'cooldown_active';
}

export interface TrackOptions {
  userId: string;
  identifier: string;
  provider: string;
  model: string;
  cached?: boolean;
}
