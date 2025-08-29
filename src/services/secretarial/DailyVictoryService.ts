import { personalAIAssistantService } from './PersonalAIAssistantService';
import { DailyOutcomeRecord, DailyWinCondition } from '@/types/dailyVictory';
import { workTimeApi } from '@/services/api/workTimeApi';

export class DailyVictoryService {
  async decideTodayWinCondition(): Promise<DailyWinCondition> {
    // Simple heuristic: if there are any due tasks today, set finishing one high-priority task as win.
    // Otherwise, default to 60 minutes focused work.
    const today = new Date().toISOString().slice(0, 10);
    try {
      // Try reading tasks; fall back to generic condition if API fails
      const resp = await workTimeApi.getAll().catch(() => null);
      const hasTasks = Array.isArray(resp?.data) && resp!.data.length > 0;
      const winCondition = hasTasks
        ? '今日の最重要タスクを1件完了する'
        : '60分の集中作業を達成する';
      const criteria = hasTasks
        ? ['高優先度タスクを選ぶ', '完了として記録する']
        : ['25+25+10分の集中', '休憩も記録'];
      return { date: today, winCondition, criteria };
    } catch {
      return {
        date: today,
        winCondition: '60分の集中作業を達成する',
        criteria: ['25+25+10分の集中', '休憩も記録'],
      };
    }
  }

  async ensureTodayWinCondition(): Promise<DailyOutcomeRecord> {
    const existing = await personalAIAssistantService.getTodayOutcome();
    if (existing) return existing;
    const decided = await this.decideTodayWinCondition();
    return personalAIAssistantService.setTodayWinCondition(decided);
  }

  async markResult(
    result: 'win' | 'lose',
    notes?: string,
    score?: number
  ): Promise<DailyOutcomeRecord> {
    return personalAIAssistantService.markTodayResult(result, notes, score);
  }
}

export const dailyVictoryService = new DailyVictoryService();
