export interface Subtask {
  id: string;
  name: string;
  estimatedMinutes: number;
  steps?: string[];
}

export interface SubtaskProgress {
  subtaskId: string;
  completed: boolean;
  completedAt?: string;
  estimatedMinutes: number;
}

export interface DailyTask {
  id: string;
  name: string;
  category: 'finance' | 'planning' | 'personal' | 'hobby' | 'household' | 'work';
  priority: 'low' | 'medium' | 'high';
  subtasks: Subtask[];
}

export interface TaskProgress {
  taskId: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  subtasks: SubtaskProgress[];
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  tasks: TaskProgress[];
  completionRate: number; // 0-100
  streak: number; // 連続実行日数
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
  subtaskId?: string;
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
