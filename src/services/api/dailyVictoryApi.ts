import { AxiosResponse } from 'axios';
import { api } from './apiConfig';
import { DailyOutcomeRecord, DailyOutcomeResponse, DailyWinCondition } from '@/types/dailyVictory';

export const dailyVictoryApi = {
  getToday(): Promise<AxiosResponse<DailyOutcomeRecord | DailyOutcomeResponse>> {
    return api.get('/daily-victory/today');
  },

  getHistory(limit: number = 30): Promise<AxiosResponse<DailyOutcomeRecord[]>> {
    return api.get(`/daily-victory/history?limit=${Math.max(1, Math.min(90, limit))}`);
  },

  setTodayWinCondition(payload: DailyWinCondition): Promise<AxiosResponse<DailyOutcomeRecord>> {
    return api.post('/daily-victory/today', payload);
  },

  markTodayResult(
    result: 'win' | 'lose',
    notes?: string,
    score?: number
  ): Promise<AxiosResponse<DailyOutcomeRecord>> {
    return api.patch('/daily-victory/today', { result, notes, score });
  },
};

export default dailyVictoryApi;
