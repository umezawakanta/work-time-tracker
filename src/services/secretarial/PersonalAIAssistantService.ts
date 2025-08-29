import { api } from '@/services/api/apiConfig';
import { DailyOutcomeRecord, DailyWinCondition } from '@/types/dailyVictory';

export class PersonalAIAssistantService {
  async getTodayOutcome(): Promise<DailyOutcomeRecord | null> {
    const { data } = await api.get('/daily-victory/today');
    return (data && (data.data || data)) as DailyOutcomeRecord | null;
  }

  async setTodayWinCondition(input: DailyWinCondition): Promise<DailyOutcomeRecord> {
    const { data } = await api.post('/daily-victory/today', input);
    return (data && (data.data || data)) as DailyOutcomeRecord;
  }

  async markTodayResult(
    result: 'win' | 'lose',
    notes?: string,
    score?: number
  ): Promise<DailyOutcomeRecord> {
    const { data } = await api.patch('/daily-victory/today', { result, notes, score });
    return (data && (data.data || data)) as DailyOutcomeRecord;
  }
}

export const personalAIAssistantService = new PersonalAIAssistantService();
