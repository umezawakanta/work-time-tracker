export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sun=0
export type GuardCategory =
  | 'social'
  | 'video'
  | 'shopping'
  | 'porn'
  | 'news'
  | 'games'
  | 'gamble'
  | 'other';

export interface GuardSchedule {
  days: DayOfWeek[]; // [1,2,3,4,5] 平日 など
  start: string; // "22:00"
  end: string; // "07:00" （翌日に跨いでもOK）
  strict?: boolean; // 厳格モード（例外解除をより重く）
}

export interface GuardSettings {
  enabled: boolean;
  timezone?: string;
  schedules: GuardSchedule[];
  blockRoutes: string[]; // path prefix（例: "/feed","/explore"）
  blockCategories: GuardCategory[];
  whitelistDuringFocus: string[]; // フォーカス中のみ許可
  panicUntil?: string | null; // ISO（有効なら最優先で遮断）
}

export interface GuardUnlockRequest {
  code: string;
  reason: string;
  minutes: number; // 一時解除時間（例: 15）
}
