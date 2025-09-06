import { api } from './apiConfig';
import {
  DailyTask,
  DailyProgress,
  DailyStats,
  UpdateProgressRequest,
  UpdateProgressResponse,
  FetchTasksResponse,
  FetchProgressResponse,
  FetchStatsResponse,
} from '@/types/daily10';

export const daily10Api = {
  // タスク一覧を取得
  async fetchTasks(): Promise<DailyTask[]> {
    const response = await api.get<FetchTasksResponse>('/daily10/tasks');
    return response.data.data;
  },

  // 特定日の進捗を取得
  async fetchProgress(userId: string, date: string): Promise<DailyProgress> {
    const response = await api.get<FetchProgressResponse>(
      `/daily10/progress?userId=${userId}&date=${date}`
    );
    return response.data.data;
  },

  // 期間別の進捗を取得
  async fetchProgressRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyProgress[]> {
    const response = await api.get<{ success: boolean; data: DailyProgress[] }>(
      `/daily10/progress?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
    );
    return response.data.data;
  },

  // 進捗を更新
  async updateProgress(userId: string, data: UpdateProgressRequest): Promise<DailyProgress> {
    const response = await api.post<UpdateProgressResponse>('/daily10/progress', {
      ...data,
      userId,
    });
    return response.data.data;
  },

  // 統計データを取得
  async fetchStats(userId: string): Promise<DailyStats> {
    const response = await api.get<FetchStatsResponse>(`/daily10/stats?userId=${userId}`);
    return response.data.data;
  },

  // 週別統計を取得
  async fetchWeeklyStats(
    userId: string
  ): Promise<Array<{ week: string; completionRate: number; completedTasks: number }>> {
    const response = await api.get<{
      success: boolean;
      data: Array<{ week: string; completionRate: number; completedTasks: number }>;
    }>(`/daily10/stats?userId=${userId}&type=weekly`);
    return response.data.data;
  },

  // 月別統計を取得
  async fetchMonthlyStats(
    userId: string
  ): Promise<Array<{ month: string; completionRate: number; completedTasks: number }>> {
    const response = await api.get<{
      success: boolean;
      data: Array<{ month: string; completionRate: number; completedTasks: number }>;
    }>(`/daily10/stats?userId=${userId}&type=monthly`);
    return response.data.data;
  },
};
