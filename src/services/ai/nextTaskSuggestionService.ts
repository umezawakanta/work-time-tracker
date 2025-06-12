import { TodoItem } from '@/types';

export interface TaskPriority {
  taskId: string;
  task: string;
  priority: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration?: number;
  deadline?: Date;
  dependencies?: string[];
}

export interface NextTaskSuggestion {
  mainTask: TaskPriority;
  alternativeTasks: TaskPriority[];
  insights: {
    totalPendingTasks: number;
    overdueCount: number;
    timeBlocking: {
      morning: TaskPriority[];
      afternoon: TaskPriority[];
      evening: TaskPriority[];
    };
    productivity: {
      score: number;
      trend: 'improving' | 'declining' | 'stable';
      recommendations: string[];
    };
  };
  schedule: {
    nextHour: TaskPriority | null;
    today: TaskPriority[];
    thisWeek: TaskPriority[];
  };
}

interface TaskContext {
  todos: TodoItem[];
  currentTime: Date;
  workingHours: { start: number; end: number };
  userPreferences?: {
    focusTime?: number; // 集中できる時間（分）
    breakInterval?: number; // 休憩間隔（分）
    preferredTaskTypes?: ('input' | 'output')[];
  };
}

class NextTaskSuggestionService {
  async generateSuggestions(context: TaskContext): Promise<NextTaskSuggestion> {
    try {
      // 開発環境ではモック実装
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockSuggestions(context);
      }

      // 実際のAPI呼び出し
      const response = await fetch('/api/ai/next-task-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        throw new Error('Failed to get task suggestions');
      }

      return await response.json();
    } catch (error) {
      console.error('Task suggestion error:', error);
      return this.generateMockSuggestions(context);
    }
  }

  private generateMockSuggestions(context: TaskContext): NextTaskSuggestion {
    const { todos, currentTime, workingHours } = context;

    // 未完了タスクをフィルタリング
    const pendingTasks = todos.filter((todo) => !todo.completed);

    // 期限切れタスクの計算
    const overdueTasks = pendingTasks.filter((todo) => {
      if (!todo.deadline) return false;
      return new Date(todo.deadline) < currentTime;
    });

    // タスクを優先度でソート
    const prioritizedTasks = this.prioritizeTasks(pendingTasks, currentTime);

    // 時間帯別にタスクを分類
    const timeBlocking = this.categorizeTasksByTime(prioritizedTasks);

    // 今日と今週のスケジュール
    const todayTasks = this.getTasksForToday(prioritizedTasks, currentTime);
    const weekTasks = this.getTasksForWeek(prioritizedTasks, currentTime);

    return {
      mainTask: prioritizedTasks[0] || this.createDefaultTask(),
      alternativeTasks: prioritizedTasks.slice(1, 4),
      insights: {
        totalPendingTasks: pendingTasks.length,
        overdueCount: overdueTasks.length,
        timeBlocking,
        productivity: {
          score: this.calculateProductivityScore(todos),
          trend: 'improving',
          recommendations: this.generateRecommendations(todos, overdueTasks.length),
        },
      },
      schedule: {
        nextHour: this.getNextHourTask(prioritizedTasks, currentTime),
        today: todayTasks,
        thisWeek: weekTasks,
      },
    };
  }

  private prioritizeTasks(tasks: TodoItem[], currentTime: Date): TaskPriority[] {
    return tasks
      .map((task) => {
        let priority = task.priority || 1;
        let urgency: TaskPriority['urgency'] = 'low';
        let reason = 'タスクリストより';

        // 期限による優先度調整
        if (task.deadline) {
          const deadline = new Date(task.deadline);
          const timeDiff = deadline.getTime() - currentTime.getTime();
          const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

          if (daysDiff < 0) {
            priority += 50;
            urgency = 'critical';
            reason = '期限超過のため緊急対応が必要';
          } else if (daysDiff < 1) {
            priority += 30;
            urgency = 'high';
            reason = '今日が期限のため高優先度';
          } else if (daysDiff < 3) {
            priority += 20;
            urgency = 'medium';
            reason = '期限が近いため中優先度';
          }
        }

        // 優先化フラグによる調整
        if (task.isPrioritized) {
          priority += 15;
          reason += '（優先マーク付き）';
        }

        // タスクタイプによる調整（現在時刻に基づく）
        const currentHour = currentTime.getHours();
        if (task.type === 'output' && currentHour >= 9 && currentHour <= 12) {
          priority += 10;
          reason += '（午前中はアウトプットタスクに最適）';
        } else if (task.type === 'input' && currentHour >= 14 && currentHour <= 16) {
          priority += 5;
          reason += '（午後はインプットタスクに適している）';
        }

        return {
          taskId: task._id,
          task: task.task,
          priority,
          reason,
          urgency,
          estimatedDuration: task.estimatedDuration || this.estimateTaskDuration(task.task),
          deadline: task.deadline ? new Date(task.deadline) : undefined,
        };
      })
      .sort((a, b) => b.priority - a.priority);
  }

  private categorizeTasksByTime(tasks: TaskPriority[]) {
    return {
      morning: tasks
        .filter(
          (task) =>
            task.urgency === 'critical' ||
            task.task.includes('会議') ||
            task.task.includes('レビュー')
        )
        .slice(0, 3),
      afternoon: tasks
        .filter(
          (task) =>
            task.task.includes('開発') || task.task.includes('実装') || task.task.includes('作成')
        )
        .slice(0, 3),
      evening: tasks
        .filter(
          (task) =>
            task.task.includes('整理') || task.task.includes('まとめ') || task.task.includes('報告')
        )
        .slice(0, 2),
    };
  }

  private getTasksForToday(tasks: TaskPriority[], currentTime: Date): TaskPriority[] {
    const today = currentTime.toDateString();
    return tasks
      .filter((task) => {
        if (!task.deadline) return false;
        return task.deadline.toDateString() === today;
      })
      .slice(0, 5);
  }

  private getTasksForWeek(tasks: TaskPriority[], currentTime: Date): TaskPriority[] {
    const oneWeekFromNow = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000);
    return tasks
      .filter((task) => {
        if (!task.deadline) return false;
        return task.deadline <= oneWeekFromNow;
      })
      .slice(0, 10);
  }

  private getNextHourTask(tasks: TaskPriority[], currentTime: Date): TaskPriority | null {
    // 次の1時間で取り組むべき最適なタスクを選択
    const shortTasks = tasks.filter(
      (task) => (task.estimatedDuration || 60) <= 60 && task.urgency !== 'low'
    );
    return shortTasks[0] || null;
  }

  private calculateProductivityScore(todos: TodoItem[]): number {
    const totalTasks = todos.length;
    const completedTasks = todos.filter((todo) => todo.completed).length;

    if (totalTasks === 0) return 0;

    const completionRate = (completedTasks / totalTasks) * 100;

    // 期限内完了率も考慮
    const tasksWithDeadlines = todos.filter((todo) => todo.deadline && todo.completed);
    const onTimeCompletion = tasksWithDeadlines.filter((todo) => {
      if (!todo.completedDate || !todo.deadline) return false;
      return new Date(todo.completedDate) <= new Date(todo.deadline);
    }).length;

    const onTimeRate =
      tasksWithDeadlines.length > 0 ? (onTimeCompletion / tasksWithDeadlines.length) * 100 : 100;

    return Math.round(completionRate * 0.7 + onTimeRate * 0.3);
  }

  private generateRecommendations(todos: TodoItem[], overdueCount: number): string[] {
    const recommendations: string[] = [];

    if (overdueCount > 0) {
      recommendations.push(`${overdueCount}件の期限切れタスクがあります。最優先で対応しましょう。`);
    }

    const inputTasks = todos.filter((todo) => todo.type === 'input' && !todo.completed).length;
    const outputTasks = todos.filter((todo) => todo.type === 'output' && !todo.completed).length;

    if (inputTasks > outputTasks * 2) {
      recommendations.push(
        'インプットタスクが多めです。アウトプットを意識してバランスを取りましょう。'
      );
    } else if (outputTasks > inputTasks * 2) {
      recommendations.push('アウトプットタスクが多めです。情報収集の時間も確保しましょう。');
    }

    const currentHour = new Date().getHours();
    if (currentHour >= 9 && currentHour <= 11) {
      recommendations.push('午前中は集中力が高い時間帯です。重要なタスクに取り組みましょう。');
    } else if (currentHour >= 14 && currentHour <= 16) {
      recommendations.push('午後の時間帯です。ルーチンワークや整理作業に適しています。');
    }

    return recommendations;
  }

  private estimateTaskDuration(taskText: string): number {
    // 簡単な時間推定ロジック
    const baseTime = 30; // 基本30分
    const complexKeywords = ['設計', '開発', '実装', '作成', 'レビュー'];
    const quickKeywords = ['確認', '連絡', '返信', '整理'];

    if (complexKeywords.some((keyword) => taskText.includes(keyword))) {
      return baseTime * 2; // 60分
    } else if (quickKeywords.some((keyword) => taskText.includes(keyword))) {
      return baseTime / 2; // 15分
    }

    return baseTime;
  }

  private createDefaultTask(): TaskPriority {
    return {
      taskId: 'default-task',
      task: '新しいタスクを追加しましょう',
      priority: 1,
      reason: 'タスクが登録されていません',
      urgency: 'low',
      estimatedDuration: 15,
    };
  }
}

export const nextTaskSuggestionService = new NextTaskSuggestionService();
