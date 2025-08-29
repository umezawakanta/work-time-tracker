import { api } from '@/services/api/apiConfig';

export interface DailyWinCondition {
  date: string; // YYYY-MM-DD
  winCondition: string;
  criteria: string[];
}

export interface DailyOutcomeRecord extends DailyWinCondition {
  result: 'win' | 'lose' | 'pending';
  score?: number;
  notes?: string;
}

export class PersonalAIAssistantService {
  async getTodayOutcome(): Promise<DailyOutcomeRecord | null> {
    const { data } = await api.get('/daily/outcome');
    return (data && (data.data || data)) as DailyOutcomeRecord | null;
  }

  async setTodayWinCondition(input: DailyWinCondition): Promise<DailyOutcomeRecord> {
    const { data } = await api.post('/daily/outcome', input);
    return (data && (data.data || data)) as DailyOutcomeRecord;
  }

  async markTodayResult(
    result: 'win' | 'lose',
    notes?: string,
    score?: number
  ): Promise<DailyOutcomeRecord> {
    const { data } = await api.patch('/daily/outcome', { result, notes, score });
    return (data && (data.data || data)) as DailyOutcomeRecord;
  }
}

export const personalAIAssistantService = new PersonalAIAssistantService();
