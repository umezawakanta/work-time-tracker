import { ExtendedTask, AISuggestion } from '@/types/task';
import { TodoItem } from '@/types';

interface TaskAnalysisRequest {
  tasks: TodoItem[];
  context?: {
    userPreferences?: Record<string, any>;
    workingHours?: { start: string; end: string };
    timezone?: string;
  };
}

interface TaskAnalysisResponse {
  suggestions: TaskSuggestionResponse[];
  insights: TaskInsights;
  recommendations: TaskRecommendation[];
}

interface TaskSuggestionResponse {
  taskId: string;
  suggestions: AISuggestion[];
  smartPriority: number;
  timeEstimate: number;
  breakdown?: string[];
}

interface TaskInsights {
  productivity: {
    score: number;
    trend: 'improving' | 'declining' | 'stable';
    factors: string[];
  };
  timeManagement: {
    averageTaskTime: number;
    overestimationRate: number;
    suggestions: string[];
  };
  prioritization: {
    accuracy: number;
    missedDeadlines: number;
    suggestions: string[];
  };
}

interface TaskRecommendation {
  type: 'schedule' | 'break' | 'focus' | 'delegate';
  content: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

class TaskAnalysisService {
  private readonly API_ENDPOINT =
    process.env.VITE_AI_API_ENDPOINT || 'http://localhost:3001/api/ai';

  async analyzeTasksAdvanced(request: TaskAnalysisRequest): Promise<TaskAnalysisResponse> {
    try {
      // 開発環境ではモックデータを返す
      if (process.env.NODE_ENV === 'development') {
        return this.getMockAnalysis(request.tasks);
      }

      const response = await fetch(`${this.API_ENDPOINT}/analyze-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Task analysis error:', error);
      // フォールバックとしてモックデータを返す
      return this.getMockAnalysis(request.tasks);
    }
  }

  async generateSubtasks(taskTitle: string, description?: string): Promise<string[]> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockSubtasks(taskTitle);
      }

      const response = await fetch(`${this.API_ENDPOINT}/generate-subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ taskTitle, description }),
      });

      if (!response.ok) {
        throw new Error(`Subtask generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.subtasks;
    } catch (error) {
      console.error('Subtask generation error:', error);
      return this.getMockSubtasks(taskTitle);
    }
  }

  async estimateTaskTime(taskTitle: string, description?: string): Promise<number> {
    try {
      if (process.env.NODE_ENV === 'development') {
        // 簡単な推定ロジック
        const baseTime = taskTitle.length * 2; // 文字数ベース
        const complexity = description ? description.length * 0.5 : 0;
        return Math.max(15, Math.min(240, baseTime + complexity)); // 15分-4時間の範囲
      }

      const response = await fetch(`${this.API_ENDPOINT}/estimate-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ taskTitle, description }),
      });

      if (!response.ok) {
        throw new Error(`Time estimation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.estimatedMinutes;
    } catch (error) {
      console.error('Time estimation error:', error);
      return 60; // デフォルト値
    }
  }

  async findSimilarTasks(taskTitle: string, allTasks: TodoItem[]): Promise<TodoItem[]> {
    try {
      // 簡単な類似度計算（開発環境用）
      const normalizedTitle = taskTitle.toLowerCase();
      const similarTasks = allTasks.filter((task) => {
        const similarity = this.calculateSimilarity(normalizedTitle, task.task.toLowerCase());
        return similarity > 0.3 && task.task !== taskTitle;
      });

      return similarTasks.slice(0, 3); // 上位3件
    } catch (error) {
      console.error('Similar task search error:', error);
      return [];
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter((word) => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private getMockAnalysis(tasks: TodoItem[]): TaskAnalysisResponse {
    return {
      suggestions: tasks.slice(0, 5).map((task) => ({
        taskId: task._id,
        suggestions: [
          {
            type: 'priority',
            content: `このタスクは${task.priority > 3 ? '高' : '中'}優先度として設定することをお勧めします`,
            confidence: 0.8,
            createdAt: new Date(),
          },
          {
            type: 'timeEstimate',
            content: `推定作業時間: ${Math.floor(Math.random() * 120) + 30}分`,
            confidence: 0.75,
            createdAt: new Date(),
          },
        ],
        smartPriority: Math.floor(Math.random() * 5) + 1,
        timeEstimate: Math.floor(Math.random() * 120) + 30,
        breakdown:
          task.task.length > 20
            ? [`${task.task}の計画立案`, `${task.task}の実行`, `${task.task}の確認・修正`]
            : undefined,
      })),
      insights: {
        productivity: {
          score: 75,
          trend: 'improving',
          factors: ['タスクの完了率が向上', '平均作業時間が短縮'],
        },
        timeManagement: {
          averageTaskTime: 45,
          overestimationRate: 0.2,
          suggestions: ['短いタスクから始める', '時間ボックス法を試す'],
        },
        prioritization: {
          accuracy: 80,
          missedDeadlines: 2,
          suggestions: ['期限の近いタスクを優先', 'バッファ時間を設ける'],
        },
      },
      recommendations: [
        {
          type: 'schedule',
          content: '午前中に高優先度タスクを配置することをお勧めします',
          priority: 'high',
          actionable: true,
        },
        {
          type: 'break',
          content: '90分ごとに15分の休憩を取りましょう',
          priority: 'medium',
          actionable: true,
        },
      ],
    };
  }

  private getMockSubtasks(taskTitle: string): string[] {
    const commonSubtasks = [
      `${taskTitle}の調査・情報収集`,
      `${taskTitle}の計画立案`,
      `${taskTitle}の実行`,
      `${taskTitle}の確認・テスト`,
      `${taskTitle}の完了・報告`,
    ];

    // タスクの複雑さに応じてサブタスク数を調整
    const complexity = taskTitle.length > 30 ? 5 : taskTitle.length > 15 ? 3 : 2;
    return commonSubtasks.slice(0, complexity);
  }
}

export const taskAnalysisService = new TaskAnalysisService();
export type { TaskAnalysisRequest, TaskAnalysisResponse, TaskInsights, TaskRecommendation };
