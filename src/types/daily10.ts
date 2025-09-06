export interface DailyTask {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'planning' | 'personal' | 'health';
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskProgress {
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface DailyProgress {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  tasks: {
    [taskId: string]: TaskProgress;
  };
  completionRate: number; // 0-100
  streak: number; // 連続実行日数
  createdAt: string;
  updatedAt: string;
}

export interface DailyStats {
  totalDays: number;
  completedDays: number;
  averageCompletionRate: number;
  longestStreak: number;
  currentStreak: number;
  weeklyStats: Array<{
    week: string;
    completionRate: number;
    completedTasks: number;
  }>;
  monthlyStats: Array<{
    month: string;
    completionRate: number;
    completedTasks: number;
  }>;
}

export interface WeeklyStat {
  week: string;
  completionRate: number;
  completedTasks: number;
}

export interface MonthlyStat {
  month: string;
  completionRate: number;
  completedTasks: number;
}

export interface Daily10State {
  tasks: DailyTask[];
  progress: DailyProgress[];
  stats: DailyStats | null;
  currentDate: string;
  isLoading: boolean;
  error: string | null;
}

export interface UpdateProgressRequest {
  date: string;
  taskId: string;
  completed: boolean;
  notes?: string;
}

export interface UpdateProgressResponse {
  success: boolean;
  data: DailyProgress;
}

export interface FetchTasksResponse {
  success: boolean;
  data: DailyTask[];
}

export interface FetchProgressResponse {
  success: boolean;
  data: DailyProgress;
}

export interface FetchStatsResponse {
  success: boolean;
  data: DailyStats;
}
