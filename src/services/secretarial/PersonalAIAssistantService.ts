import { api } from '@/services/api/apiConfig';
import { DailyOutcomeRecord, DailyWinCondition } from '@/types/dailyVictory';

// テスト環境では AI アシスタントを無効化
const AI_ASSISTANT_ENABLED =
  typeof process !== 'undefined' &&
  process.env?.NODE_ENV !== 'test' &&
  import.meta?.env?.VITE_AI_ASSISTANT !== 'false';

export class PersonalAIAssistantService {
  async getTodayOutcome(): Promise<DailyOutcomeRecord | null> {
    if (!AI_ASSISTANT_ENABLED) {
      return null;
    }

    try {
      const resp = await api?.get?.('/daily-victory/today').catch(() => undefined);
      const data = resp?.data ?? null;
      if (!data) {
        return null;
      }
      return (data.data || data) as DailyOutcomeRecord | null;
    } catch (error) {
      console.warn('Failed to get today outcome:', error);
      return null;
    }
  }

  async setTodayWinCondition(input: DailyWinCondition): Promise<DailyOutcomeRecord> {
    if (!AI_ASSISTANT_ENABLED) {
      throw new Error('AI Assistant is disabled in test environment');
    }

    try {
      const resp = await api?.post?.('/daily-victory/today', input).catch(() => undefined);
      const data = resp?.data ?? null;
      if (!data) {
        throw new Error('No data received from API');
      }
      return (data.data || data) as DailyOutcomeRecord;
    } catch (error) {
      console.warn('Failed to set today win condition:', error);
      throw error;
    }
  }

  async markTodayResult(
    result: 'win' | 'lose',
    notes?: string,
    score?: number
  ): Promise<DailyOutcomeRecord> {
    if (!AI_ASSISTANT_ENABLED) {
      throw new Error('AI Assistant is disabled in test environment');
    }

    try {
      const resp = await api
        ?.patch?.('/daily-victory/today', { result, notes, score })
        .catch(() => undefined);
      const data = resp?.data ?? null;
      if (!data) {
        throw new Error('No data received from API');
      }
      return (data.data || data) as DailyOutcomeRecord;
    } catch (error) {
      console.warn('Failed to mark today result:', error);
      throw error;
    }
  }
}

export const personalAIAssistantService = new PersonalAIAssistantService();
