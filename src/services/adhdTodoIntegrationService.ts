import { EventEmitter } from 'events';
import adhdService, { FocusSession, ADHDSettings } from './adhdService';

export interface ADHDTask {
  id: string;
  originalTaskId?: string; // 元のTODOのID
  title: string;
  description?: string;
  estimatedMinutes: number; // 推定所要時間（分）
  actualMinutes?: number; // 実際の所要時間
  difficulty: 'very-easy' | 'easy' | 'medium' | 'hard' | 'very-hard';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adhdFriendly: {
    isSubtask: boolean; // サブタスクかどうか
    parentTaskId?: string; // 親タスクのID
    subtasks?: string[]; // サブタスクのIDリスト
    optimizedFor: 'focus' | 'energy' | 'mood'; // 最適化対象
    bestTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    requiredFocusLevel: 1 | 2 | 3 | 4 | 5; // 必要な集中レベル（1=低、5=高）
    breakSuggestion?: string; // 休憩提案
  };
  status: 'pending' | 'in-progress' | 'completed' | 'paused' | 'cancelled';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  focusSessionIds?: string[]; // 関連する集中セッション
}

export interface TaskBreakdownSuggestion {
  originalTask: string;
  suggestedSubtasks: {
    title: string;
    estimatedMinutes: number;
    difficulty: ADHDTask['difficulty'];
    description: string;
    order: number;
  }[];
  totalEstimatedTime: number;
  reasoning: string;
  tips: string[];
}

export interface ADHDTaskRecommendation {
  task: ADHDTask;
  score: number; // 0-100の推奨度
  reasoning: string[];
  warnings?: string[];
  optimizations?: string[];
}

class ADHDTodoIntegrationService extends EventEmitter {
  private static instance: ADHDTodoIntegrationService;
  private readonly STORAGE_KEY = 'adhd-tasks';

  private constructor() {
    super();
  }

  public static getInstance(): ADHDTodoIntegrationService {
    if (!ADHDTodoIntegrationService.instance) {
      ADHDTodoIntegrationService.instance = new ADHDTodoIntegrationService();
    }
    return ADHDTodoIntegrationService.instance;
  }

  /**
   * ===== タスク分析・分割 =====
   */

  /**
   * タスクをADHDフレンドリーに分析
   */
  public analyzeTask(taskTitle: string, description?: string): TaskBreakdownSuggestion {
    const complexity = this.assessComplexity(taskTitle, description);
    const estimatedTime = this.estimateTimeRequired(taskTitle, description);

    if (estimatedTime <= 25 || complexity <= 2) {
      // 既に適切なサイズの場合
      return {
        originalTask: taskTitle,
        suggestedSubtasks: [
          {
            title: taskTitle,
            estimatedMinutes: estimatedTime,
            difficulty: this.mapComplexityToDifficulty(complexity),
            description: description || '',
            order: 1,
          },
        ],
        totalEstimatedTime: estimatedTime,
        reasoning: 'このタスクは既に適切なサイズです。',
        tips: this.getTaskTips(complexity, estimatedTime),
      };
    }

    // 複雑なタスクを分割
    const subtasks = this.breakdownComplexTask(taskTitle, estimatedTime, description);

    return {
      originalTask: taskTitle,
      suggestedSubtasks: subtasks,
      totalEstimatedTime: subtasks.reduce((sum, task) => sum + task.estimatedMinutes, 0),
      reasoning: '大きなタスクを管理しやすい小さなステップに分割しました。',
      tips: [
        '各サブタスクは25分以内で完了できるよう設計されています',
        'ポモドーロテクニックと組み合わせて使用することをお勧めします',
        '疲れを感じたら必ず休憩を取ってください',
        '順番通りに進める必要はありません。今の気分やエネルギーに合わせて選択してください',
      ],
    };
  }

  private assessComplexity(title: string, description?: string): number {
    let complexity = 1;
    const text = (title + ' ' + (description || '')).toLowerCase();

    // キーワードベースの複雑度判定
    const complexityIndicators = {
      高: ['設計', '計画', '戦略', '分析', '調査', '研究', '学習'],
      中: ['作成', '修正', '更新', '整理', '確認', '連絡', '報告'],
      低: ['削除', '送信', '保存', '印刷', '読む', '見る', '聞く'],
    };

    Object.entries(complexityIndicators).forEach(([level, keywords]) => {
      const score = level === '高' ? 3 : level === '中' ? 2 : 1;
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          complexity = Math.max(complexity, score);
        }
      });
    });

    // 文字数による調整
    if (text.length > 100) complexity += 1;
    if (text.length > 200) complexity += 1;

    return Math.min(complexity, 5);
  }

  private estimateTimeRequired(title: string, description?: string): number {
    const text = (title + ' ' + (description || '')).toLowerCase();
    let baseTime = 15; // 基本15分

    // タスクタイプ別の時間推定
    const timeIndicators = {
      120: ['プレゼン', '資料作成', '企画書', '提案書'],
      90: ['設計', '計画', '分析', '調査'],
      60: ['作成', '開発', '実装', 'テスト'],
      30: ['修正', '更新', '確認', '整理'],
      15: ['送信', '連絡', '削除', '保存'],
    };

    Object.entries(timeIndicators).forEach(([time, keywords]) => {
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          baseTime = Math.max(baseTime, parseInt(time));
        }
      });
    });

    return baseTime;
  }

  private breakdownComplexTask(
    title: string,
    totalTime: number,
    description?: string
  ): TaskBreakdownSuggestion['suggestedSubtasks'] {
    const subtasks: TaskBreakdownSuggestion['suggestedSubtasks'] = [];
    const text = (title + ' ' + (description || '')).toLowerCase();

    // 一般的な作業フローに基づく分割
    const commonPatterns = [
      {
        pattern: ['資料', '作成', '企画'],
        steps: ['情報収集', '構成検討', '下書き作成', '内容充実', '仕上げ・確認'],
      },
      {
        pattern: ['開発', '実装'],
        steps: ['要件整理', '設計検討', '基本実装', 'テスト', '修正・完成'],
      },
      {
        pattern: ['学習', '勉強'],
        steps: ['概要把握', '重要ポイント抽出', '詳細学習', '理解確認', '復習'],
      },
      {
        pattern: ['整理', '掃除'],
        steps: ['現状確認', '分類・仕分け', '不要物除去', '配置最適化', '最終確認'],
      },
    ];

    let selectedPattern: string[] | null = null;
    for (const { pattern, steps } of commonPatterns) {
      if (pattern.some((keyword) => text.includes(keyword))) {
        selectedPattern = steps;
        break;
      }
    }

    if (!selectedPattern) {
      // デフォルトの分割パターン
      const numSubtasks = Math.ceil(totalTime / 20);
      selectedPattern = Array.from({ length: numSubtasks }, (_, i) => `ステップ${i + 1}`);
    }

    const timePerSubtask = Math.floor(totalTime / selectedPattern.length);
    const remainingTime = totalTime % selectedPattern.length;

    selectedPattern.forEach((step, index) => {
      const stepTime = timePerSubtask + (index < remainingTime ? 1 : 0);
      subtasks.push({
        title: `${title} - ${step}`,
        estimatedMinutes: Math.min(stepTime, 25), // 最大25分に制限
        difficulty: this.mapComplexityToDifficulty(2 + Math.floor(index / 2)),
        description: `${step}の段階です。焦らず一歩ずつ進めましょう。`,
        order: index + 1,
      });
    });

    return subtasks;
  }

  private mapComplexityToDifficulty(complexity: number): ADHDTask['difficulty'] {
    if (complexity <= 1) return 'very-easy';
    if (complexity <= 2) return 'easy';
    if (complexity <= 3) return 'medium';
    if (complexity <= 4) return 'hard';
    return 'very-hard';
  }

  private getTaskTips(complexity: number, estimatedTime: number): string[] {
    const tips: string[] = [];

    if (complexity >= 4) {
      tips.push('複雑なタスクです。集中できる時間帯に取り組みましょう');
      tips.push('必要に応じて更に小さなステップに分けることを検討してください');
    }

    if (estimatedTime >= 45) {
      tips.push('長時間のタスクです。途中で休憩を挟むことを強くお勧めします');
    }

    tips.push('完璧を求めず、「まずは始める」ことを意識してください');
    tips.push('集中が切れたら無理せず休憩しましょう');

    return tips;
  }

  /**
   * ===== タスク推奨システム =====
   */

  /**
   * 現在の状態に基づいて最適なタスクを推奨
   */
  public getTaskRecommendations(
    availableTasks: ADHDTask[],
    currentMood?: 'very-low' | 'low' | 'normal' | 'good' | 'excellent',
    currentEnergy?: 'very-low' | 'low' | 'normal' | 'high' | 'very-high',
    availableMinutes?: number
  ): ADHDTaskRecommendation[] {
    const settings = adhdService.getSettings();
    const progress = adhdService.getProgress();
    const thoughtPattern = adhdService.analyzeThoughtPattern('daily');

    const recommendations = availableTasks
      .filter((task) => task.status === 'pending')
      .map((task) =>
        this.scoreTask(task, {
          mood: currentMood || 'normal',
          energy: currentEnergy || 'normal',
          availableMinutes: availableMinutes || 30,
          settings,
          progress,
          thoughtPattern,
        })
      )
      .sort((a, b) => b.score - a.score);

    return recommendations.slice(0, 5); // 上位5つを返す
  }

  private scoreTask(
    task: ADHDTask,
    context: {
      mood: string;
      energy: string;
      availableMinutes: number;
      settings: any;
      progress: any;
      thoughtPattern: any;
    }
  ): ADHDTaskRecommendation {
    let score = 50; // ベーススコア
    const reasoning: string[] = [];
    const warnings: string[] = [];
    const optimizations: string[] = [];

    // 時間適合性
    if (task.estimatedMinutes <= context.availableMinutes) {
      score += 20;
      reasoning.push('利用可能時間内で完了可能');
    } else {
      score -= 15;
      warnings.push('完了に必要な時間が不足している可能性があります');
    }

    // エネルギーレベルとタスク難易度の適合性
    const energyScore = this.getEnergyDifficultyMatch(context.energy, task.difficulty);
    score += energyScore;
    if (energyScore > 0) {
      reasoning.push('現在のエネルギーレベルに適している');
    } else {
      warnings.push('現在のエネルギーレベルには難しすぎる可能性があります');
    }

    // 気分とタスクタイプの適合性
    const moodScore = this.getMoodTaskMatch(context.mood, task);
    score += moodScore;
    if (moodScore > 0) {
      reasoning.push('現在の気分に適したタスク');
    }

    // 集中レベルの要求度
    if (
      context.thoughtPattern.averageRealityScore < 6 &&
      task.adhdFriendly.requiredFocusLevel >= 4
    ) {
      score -= 20;
      warnings.push(
        '高い集中力が必要ですが、現在の思考パターンから判断すると難しい可能性があります'
      );
      optimizations.push('まず軽い現実チェックエクササイズを行うことをお勧めします');
    }

    // 優先度
    const priorityBonus = {
      urgent: 30,
      high: 20,
      medium: 10,
      low: 0,
    };
    score += priorityBonus[task.priority];
    if (task.priority === 'urgent' || task.priority === 'high') {
      reasoning.push('高優先度のタスク');
    }

    // サブタスクの場合のボーナス
    if (task.adhdFriendly.isSubtask) {
      score += 10;
      reasoning.push('管理しやすいサイズのサブタスク');
    }

    // 時間帯の適合性
    const currentHour = new Date().getHours();
    const timeOfDay = this.getTimeOfDay(currentHour);
    if (task.adhdFriendly.bestTimeOfDay === timeOfDay) {
      score += 15;
      reasoning.push('最適な時間帯');
    }

    return {
      task,
      score: Math.max(0, Math.min(100, score)),
      reasoning,
      warnings,
      optimizations,
    };
  }

  private getEnergyDifficultyMatch(energy: string, difficulty: ADHDTask['difficulty']): number {
    const energyLevel =
      {
        'very-low': 1,
        low: 2,
        normal: 3,
        high: 4,
        'very-high': 5,
      }[energy] || 3;

    const difficultyLevel = {
      'very-easy': 1,
      easy: 2,
      medium: 3,
      hard: 4,
      'very-hard': 5,
    }[difficulty];

    const match = 5 - Math.abs(energyLevel - difficultyLevel);
    return match * 4; // -20 to +20 range
  }

  private getMoodTaskMatch(mood: string, task: ADHDTask): number {
    const moodLevel =
      {
        'very-low': 1,
        low: 2,
        normal: 3,
        good: 4,
        excellent: 5,
      }[mood] || 3;

    // 気分が低い時は簡単なタスクを、高い時は挑戦的なタスクを推奨
    if (moodLevel <= 2 && ['very-easy', 'easy'].includes(task.difficulty)) {
      return 10;
    }
    if (moodLevel >= 4 && ['medium', 'hard', 'very-hard'].includes(task.difficulty)) {
      return 10;
    }
    if (moodLevel === 3) {
      return 5; // 普通の気分は何でもOK
    }

    return 0;
  }

  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * ===== 集中セッション連携 =====
   */

  /**
   * タスクから集中セッションを開始
   */
  public startTaskFocusSession(task: ADHDTask): FocusSession {
    const session = adhdService.startSession(`タスク: ${task.title}`);

    // タスクにセッションIDを関連付け
    this.linkTaskToSession(task.id, session.id);

    this.emit('taskSessionStarted', { task, session });
    return session;
  }

  /**
   * セッション完了時にタスクの進捗を更新
   */
  public handleSessionCompletion(session: FocusSession, taskId?: string): void {
    if (!taskId) return;

    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // 実際の所要時間を記録
    if (session.endTime) {
      const actualMinutes = Math.round(
        (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
      );

      task.actualMinutes = (task.actualMinutes || 0) + actualMinutes;
      task.updatedAt = new Date();

      // セッションの質に基づいてタスクの難易度を調整
      if (session.realityScore >= 8 && session.thoughtsChecked <= 2) {
        // 高品質セッション：このタスクは適切な難易度
        this.emit('taskDifficultyConfirmed', { task, session });
      } else if (session.realityScore < 6 || session.thoughtsChecked > 5) {
        // 困難セッション：タスクが難しすぎる可能性
        this.emit('taskTooHard', { task, session });
      }
    }

    this.saveTasks(tasks);
    this.emit('taskProgressUpdated', { task, session });
  }

  /**
   * ===== データ管理 =====
   */

  public getTasks(): ADHDTask[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const tasks = stored ? JSON.parse(stored) : [];

      // Date オブジェクトに変換
      tasks.forEach((task: any) => {
        task.createdAt = new Date(task.createdAt);
        task.updatedAt = new Date(task.updatedAt);
        if (task.completedAt) {
          task.completedAt = new Date(task.completedAt);
        }
      });

      return tasks;
    } catch (error) {
      console.error('ADHDタスクの読み込みエラー:', error);
      return [];
    }
  }

  public saveTasks(tasks: ADHDTask[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    this.emit('tasksUpdated', tasks);
  }

  public createTask(taskData: Omit<ADHDTask, 'id' | 'createdAt' | 'updatedAt'>): ADHDTask {
    const tasks = this.getTasks();
    const newTask: ADHDTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tasks.unshift(newTask);
    this.saveTasks(tasks);
    this.emit('taskCreated', newTask);

    return newTask;
  }

  public updateTask(taskId: string, updates: Partial<ADHDTask>): ADHDTask | null {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) return null;

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };

    if (updates.status === 'completed' && !tasks[taskIndex].completedAt) {
      tasks[taskIndex].completedAt = new Date();
    }

    this.saveTasks(tasks);
    this.emit('taskUpdated', tasks[taskIndex]);

    return tasks[taskIndex];
  }

  private linkTaskToSession(taskId: string, sessionId: string): void {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
      task.focusSessionIds = task.focusSessionIds || [];
      task.focusSessionIds.push(sessionId);
      task.updatedAt = new Date();
      this.saveTasks(tasks);
    }
  }

  /**
   * ===== 統計とインサイト =====
   */

  public getTaskStats(): any {
    const tasks = this.getTasks();
    const completedTasks = tasks.filter((t) => t.status === 'completed');

    return {
      total: tasks.length,
      completed: completedTasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      averageCompletionTime:
        completedTasks.length > 0
          ? completedTasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0) /
            completedTasks.length
          : 0,
      difficultyDistribution: tasks.reduce(
        (acc, task) => {
          acc[task.difficulty] = (acc[task.difficulty] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }
}

export const adhdTodoIntegration = ADHDTodoIntegrationService.getInstance();
export default adhdTodoIntegration;
