export interface DailyWinCondition {
  date: string; // YYYY-MM-DD
  winCondition: string;
  criteria: string[];
}

export type DailyResult = 'win' | 'lose' | 'pending';

export interface DailyOutcomeRecord extends DailyWinCondition {
  result: DailyResult;
  score?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyOutcomeResponse {
  success: boolean;
  data: DailyOutcomeRecord | null;
  degraded?: boolean;
  message?: string;
}

export interface DailyHistoryItem extends DailyOutcomeRecord {}
