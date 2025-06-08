// AI Task Suggestion Service - Phase 2実装の基盤
// 現在はモックデータとプレースホルダー機能を提供

import { TodoItem } from '@/types';

export interface TaskSuggestion {
  id: string;
  type: 'priority' | 'scheduling' | 'breakdown' | 'optimization';
  title: string;
  description: string;
  confidence: number; // 0-100
  suggestedAction: {
    action: 'update_priority' | 'reschedule' | 'split_task' | 'merge_tasks' | 'add_subtask';
    targetTaskId?: string;
    newValues?: Record<string, any>;
    suggestedDate?: string;
  };
  reasoning: string;
  estimatedTimeImpact: number; // minutes saved/added
}

export interface TaskAnalysis {
  overallProductivity: number; // 0-100
  timeManagement: number; // 0-100
  prioritization: number; // 0-100
  workloadBalance: number; // 0-100
  suggestions: TaskSuggestion[];
  insights: {
    busyDays: string[];
    lightDays: string[];
    averageTasksPerDay: number;
    completionRate: number;
    overdueRate: number;
  };
}

export interface TaskPrediction {
  taskId: string;
  estimatedDuration: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  optimalTimeSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
    score: number; // 0-100, how optimal this slot is
    reasoning: string;
  }>;
  dependencies: string[]; // other task IDs
  prerequisites: string[];
}

class TaskSuggestionService {
  private isAIEnabled = false; // Phase 2で有効化

  /**
   * タスクの優先度を分析し、AI提案を生成
   * Phase 2: 実際のAIモデル（OpenAI GPT-4, Claude等）を使用
   */
  async analyzePriority(tasks: TodoItem[]): Promise<TaskSuggestion[]> {
    // Phase 2実装予定: AI分析
    // - タスクの内容、期限、カテゴリを分析
    // - ユーザーの過去の行動パターンを学習
    // - 緊急度・重要度マトリックスでの最適配置提案

    return this.generateMockPrioritySuggestions(tasks);
  }

  /**
   * タスクの完了時間を予測
   * Phase 2: 機械学習モデルで予測精度向上
   */
  async predictTaskDuration(task: TodoItem): Promise<TaskPrediction> {
    // Phase 2実装予定:
    // - 過去の類似タスクデータから学習
    // - テキスト分析で複雑さを評価
    // - ユーザーの作業効率パターンを考慮

    return this.generateMockPrediction(task);
  }

  /**
   * スケジュール最適化提案
   * Phase 2: カレンダー統合 & AI最適化
   */
  async optimizeSchedule(tasks: TodoItem[]): Promise<TaskAnalysis> {
    // Phase 2実装予定:
    // - カレンダーAPI連携
    // - エネルギーレベル、集中力パターン分析
    // - 最適なタスク配置アルゴリズム

    return this.generateMockAnalysis(tasks);
  }

  /**
   * 大きなタスクの分割提案
   * Phase 2: NLP（自然言語処理）で自動分割
   */
  async suggestTaskBreakdown(task: TodoItem): Promise<TaskSuggestion[]> {
    // Phase 2実装予定:
    // - NLPでタスク内容を分析
    // - 実行可能な小タスクに自動分割
    // - 依存関係の自動検出

    return this.generateMockBreakdownSuggestions(task);
  }

  /**
   * パフォーマンス分析とインサイト
   * Phase 2: 詳細な分析とパーソナライズ
   */
  async generateInsights(tasks: TodoItem[]): Promise<TaskAnalysis> {
    const completedTasks = tasks.filter((t) => t.completed);
    const overdueTasks = tasks.filter((t) => {
      if (!t.deadline || t.completed) return false;
      return new Date(t.deadline) < new Date();
    });

    // 基本的な統計分析（現在実装済み）
    const basicAnalysis: TaskAnalysis = {
      overallProductivity: this.calculateProductivity(tasks),
      timeManagement: this.calculateTimeManagement(tasks),
      prioritization: this.calculatePrioritization(tasks),
      workloadBalance: this.calculateWorkloadBalance(tasks),
      suggestions: await this.analyzePriority(tasks),
      insights: {
        busyDays: this.identifyBusyDays(tasks),
        lightDays: this.identifyLightDays(tasks),
        averageTasksPerDay: this.calculateAverageTasksPerDay(tasks),
        completionRate: (completedTasks.length / tasks.length) * 100,
        overdueRate: (overdueTasks.length / tasks.length) * 100,
      },
    };

    return basicAnalysis;
  }

  // ====== MOCK IMPLEMENTATIONS (Phase 1) ======

  private generateMockPrioritySuggestions(tasks: TodoItem[]): TaskSuggestion[] {
    const suggestions: TaskSuggestion[] = [];

    // 期限切れタスクの優先度上げ提案
    const overdueTasks = tasks.filter((t) => {
      if (!t.deadline || t.completed) return false;
      return new Date(t.deadline) < new Date();
    });

    overdueTasks.forEach((task) => {
      if (task.priority < 4) {
        suggestions.push({
          id: `priority-${task._id}`,
          type: 'priority',
          title: '期限切れタスクの優先度を上げる',
          description: `「${task.task}」は期限切れです。優先度を「高」に設定することをお勧めします。`,
          confidence: 95,
          suggestedAction: {
            action: 'update_priority',
            targetTaskId: task._id,
            newValues: { priority: 4 },
          },
          reasoning: '期限を過ぎたタスクは緊急対応が必要です',
          estimatedTimeImpact: -15, // 15分の遅延回避
        });
      }
    });

    // 長期間未完了タスクの見直し提案
    const staleTasks = tasks.filter((t) => {
      if (t.completed || !t.createdAt) return false;
      const daysSinceCreation =
        (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation > 14; // 2週間以上
    });

    staleTasks.slice(0, 2).forEach((task) => {
      suggestions.push({
        id: `stale-${task._id}`,
        type: 'optimization',
        title: '長期未完了タスクの見直し',
        description: `「${task.task}」は2週間以上未完了です。分割または削除を検討してください。`,
        confidence: 80,
        suggestedAction: {
          action: 'split_task',
          targetTaskId: task._id,
        },
        reasoning: '長期間放置されたタスクは分割すると進捗しやすくなります',
        estimatedTimeImpact: 30, // 30分の効率化
      });
    });

    return suggestions.slice(0, 5); // 最大5件の提案
  }

  private generateMockPrediction(task: TodoItem): TaskPrediction {
    // タスクの複雑さを文字数とキーワードで簡易判定
    const complexity = this.estimateComplexity(task.task);
    const baseTime = task.estimatedDuration || 60;

    let estimatedDuration: number;
    let difficulty: 'easy' | 'medium' | 'hard';

    if (complexity < 0.3) {
      estimatedDuration = Math.max(baseTime * 0.8, 15);
      difficulty = 'easy';
    } else if (complexity < 0.7) {
      estimatedDuration = baseTime;
      difficulty = 'medium';
    } else {
      estimatedDuration = baseTime * 1.5;
      difficulty = 'hard';
    }

    // 最適な時間スロット提案（簡易版）
    const optimalTimeSlots = this.generateOptimalTimeSlots(task, estimatedDuration);

    return {
      taskId: task._id,
      estimatedDuration: Math.round(estimatedDuration),
      difficulty,
      optimalTimeSlots,
      dependencies: [],
      prerequisites: [],
    };
  }

  private generateMockAnalysis(tasks: TodoItem[]): TaskAnalysis {
    return {
      overallProductivity: this.calculateProductivity(tasks),
      timeManagement: this.calculateTimeManagement(tasks),
      prioritization: this.calculatePrioritization(tasks),
      workloadBalance: this.calculateWorkloadBalance(tasks),
      suggestions: this.generateMockPrioritySuggestions(tasks),
      insights: {
        busyDays: this.identifyBusyDays(tasks),
        lightDays: this.identifyLightDays(tasks),
        averageTasksPerDay: this.calculateAverageTasksPerDay(tasks),
        completionRate: (tasks.filter((t) => t.completed).length / tasks.length) * 100,
        overdueRate:
          (tasks.filter((t) => !t.completed && t.deadline && new Date(t.deadline) < new Date())
            .length /
            tasks.length) *
          100,
      },
    };
  }

  private generateMockBreakdownSuggestions(task: TodoItem): TaskSuggestion[] {
    // 長いタスクタイトルを持つタスクの分割提案
    if (task.task.length > 50) {
      return [
        {
          id: `breakdown-${task._id}`,
          type: 'breakdown',
          title: 'タスクの分割提案',
          description: `「${task.task}」は複雑そうです。より小さなタスクに分割することをお勧めします。`,
          confidence: 75,
          suggestedAction: {
            action: 'split_task',
            targetTaskId: task._id,
          },
          reasoning: '大きなタスクは小さく分けると取り組みやすくなります',
          estimatedTimeImpact: 20,
        },
      ];
    }
    return [];
  }

  // ====== HELPER METHODS ======

  private estimateComplexity(taskText: string): number {
    const complexWords = ['分析', '設計', '実装', '調査', '検討', '作成', '開発', '構築'];
    const wordCount = taskText.length;
    const complexWordCount = complexWords.filter((word) => taskText.includes(word)).length;

    return Math.min(wordCount / 100 + complexWordCount * 0.2, 1);
  }

  private generateOptimalTimeSlots(task: TodoItem, duration: number) {
    const today = new Date();
    const slots = [];

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // 午前と午後の時間スロットを提案
      slots.push({
        date: date.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: `${9 + Math.ceil(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
        score: Math.floor(Math.random() * 30) + 70,
        reasoning: '集中力が高い午前中の時間帯',
      });

      if (duration <= 120) {
        // 2時間以下のタスク
        slots.push({
          date: date.toISOString().split('T')[0],
          startTime: '14:00',
          endTime: `${14 + Math.ceil(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
          score: Math.floor(Math.random() * 20) + 60,
          reasoning: '午後の落ち着いた時間帯',
        });
      }
    }

    return slots.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private calculateProductivity(tasks: TodoItem[]): number {
    const completedTasks = tasks.filter((t) => t.completed);
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  }

  private calculateTimeManagement(tasks: TodoItem[]): number {
    const tasksWithDeadlines = tasks.filter((t) => t.deadline);
    if (tasksWithDeadlines.length === 0) return 50;

    const onTimeTasks = tasksWithDeadlines.filter((t) => {
      if (!t.completed) return true; // 未完了は判定保留
      return t.deadline && new Date(t.deadline) >= new Date();
    });

    return Math.round((onTimeTasks.length / tasksWithDeadlines.length) * 100);
  }

  private calculatePrioritization(tasks: TodoItem[]): number {
    const highPriorityTasks = tasks.filter((t) => t.priority >= 4);
    const completedHighPriority = highPriorityTasks.filter((t) => t.completed);

    if (highPriorityTasks.length === 0) return 70;
    return Math.round((completedHighPriority.length / highPriorityTasks.length) * 100);
  }

  private calculateWorkloadBalance(tasks: TodoItem[]): number {
    const tasksWithDeadlines = tasks.filter((t) => t.deadline && !t.completed);
    const deadlineDays = tasksWithDeadlines.map((t) => new Date(t.deadline!).toDateString());
    const uniqueDays = new Set(deadlineDays);
    const maxTasksPerDay = Math.max(
      ...Array.from(uniqueDays).map((day) => deadlineDays.filter((d) => d === day).length)
    );

    // 1日あたり3タスク以下が理想
    if (maxTasksPerDay <= 3) return 100;
    if (maxTasksPerDay <= 5) return 80;
    if (maxTasksPerDay <= 7) return 60;
    return 40;
  }

  private identifyBusyDays(tasks: TodoItem[]): string[] {
    const deadlineCounts: Record<string, number> = {};

    tasks
      .filter((t) => t.deadline && !t.completed)
      .forEach((task) => {
        const dateKey = new Date(task.deadline!).toDateString();
        deadlineCounts[dateKey] = (deadlineCounts[dateKey] || 0) + 1;
      });

    return Object.entries(deadlineCounts)
      .filter(([_, count]) => count >= 4)
      .map(([date, _]) => date)
      .slice(0, 3);
  }

  private identifyLightDays(tasks: TodoItem[]): string[] {
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return date.toDateString();
    });

    const busyDates = this.identifyBusyDays(tasks);

    return next7Days.filter((date) => !busyDates.includes(date)).slice(0, 3);
  }

  private calculateAverageTasksPerDay(tasks: TodoItem[]): number {
    const next30Days = 30;
    const tasksWithDeadlines = tasks.filter((t) => t.deadline && !t.completed);
    return Math.round((tasksWithDeadlines.length / next30Days) * 10) / 10;
  }
}

export const taskSuggestionService = new TaskSuggestionService();
