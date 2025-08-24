/**
 * 🎮 ゲームループ式タスク管理サービス
 * レシートプリンター記事のアイデアを実装
 *
 * 参考: https://www.laurieherault.com/articles/a-thermal-receipt-printer-cured-my-procrastination
 */

import { toast } from 'react-hot-toast';
import { gameLoopAutomationIntegration } from './GameLoopAutomationIntegration';

export interface MicroTask {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  parentTaskId?: string;
  order: number;
  completedAt?: string;
  feedbackType: 'sticky_note' | 'printed_ticket' | 'digital';
  category: 'morning_routine' | 'work' | 'personal' | 'maintenance';
}

export interface TaskBreakdown {
  id: string;
  originalTask: string;
  microTasks: MicroTask[];
  createdAt: string;
  completedCount: number;
  totalCount: number;
  category: string;
}

export interface GameLoopStats {
  totalTasksCompleted: number;
  tasksCompletedToday: number;
  currentStreak: number;
  averageTaskTime: number;
  feedbackJarCount: number;
  morningRoutineStreak: number;
}

export interface DailyPrintout {
  id: string;
  date: string;
  morningRoutine: MicroTask[];
  workTasks: MicroTask[];
  personalTasks: MicroTask[];
  maintenanceTasks: MicroTask[];
  totalTasks: number;
}

class GameLoopTaskService {
  private static instance: GameLoopTaskService;
  private taskBreakdowns: Map<string, TaskBreakdown> = new Map();
  private completedTasks: Map<string, MicroTask> = new Map();
  private gameLoopStats: GameLoopStats;
  private dailyPrintouts: Map<string, DailyPrintout> = new Map();

  constructor() {
    this.gameLoopStats = {
      totalTasksCompleted: 0,
      tasksCompletedToday: 0,
      currentStreak: 0,
      averageTaskTime: 3.5,
      feedbackJarCount: 0,
      morningRoutineStreak: 0,
    };
    this.loadFromStorage();
  }

  static getInstance(): GameLoopTaskService {
    if (!GameLoopTaskService.instance) {
      GameLoopTaskService.instance = new GameLoopTaskService();
    }
    return GameLoopTaskService.instance;
  }

  /**
   * 📝 大きなタスクをマイクロタスクに分解
   */
  createTaskBreakdown(
    originalTask: string,
    category: 'morning_routine' | 'work' | 'personal' | 'maintenance' = 'work'
  ): TaskBreakdown {
    const breakdown: TaskBreakdown = {
      id: `breakdown_${Date.now()}`,
      originalTask,
      microTasks: [],
      createdAt: new Date().toISOString(),
      completedCount: 0,
      totalCount: 0,
      category,
    };

    // AI支援による自動分解提案
    const suggestedBreakdown = this.suggestTaskBreakdown(originalTask, category);
    breakdown.microTasks = suggestedBreakdown;
    breakdown.totalCount = suggestedBreakdown.length;

    this.taskBreakdowns.set(breakdown.id, breakdown);
    this.saveToStorage();

    return breakdown;
  }

  /**
   * 🤖 タスク分解提案（AI風アルゴリズム）
   */
  private suggestTaskBreakdown(
    task: string,
    category: 'morning_routine' | 'work' | 'personal' | 'maintenance'
  ): MicroTask[] {
    const microTasks: MicroTask[] = [];
    let order = 1;

    // カテゴリ別の分解パターン
    if (category === 'morning_routine') {
      const routineTasks = [
        'コーヒーを作る',
        'メールを確認する',
        '今日のタスクを確認する',
        '机を整理する',
        '2分間タイピング練習',
      ];

      routineTasks.forEach((title) => {
        microTasks.push({
          id: `micro_${Date.now()}_${order}`,
          title,
          estimatedMinutes: 2,
          isCompleted: false,
          order: order++,
          feedbackType: 'sticky_note',
          category: 'morning_routine',
        });
      });
    } else {
      // 一般的なタスク分解ロジック
      const taskWords = task.toLowerCase();

      if (taskWords.includes('掃除') || taskWords.includes('片付け')) {
        const cleaningTasks = [
          '必要な道具を準備する',
          '1番目のエリアを片付ける',
          '2番目のエリアを片付ける',
          '掃除機をかける',
          '最終確認と片付け',
        ];

        cleaningTasks.forEach((title) => {
          microTasks.push({
            id: `micro_${Date.now()}_${order}`,
            title,
            estimatedMinutes: Math.floor(Math.random() * 10) + 5,
            isCompleted: false,
            order: order++,
            feedbackType: 'sticky_note',
            category,
          });
        });
      } else {
        // デフォルト分解: 5-7個のマイクロタスクに分解
        const defaultSteps = [
          `${task}の準備をする`,
          `${task}の第1段階を実行`,
          `${task}の第2段階を実行`,
          `${task}の仕上げをする`,
          `${task}の結果を確認する`,
        ];

        defaultSteps.forEach((title) => {
          microTasks.push({
            id: `micro_${Date.now()}_${order}`,
            title,
            estimatedMinutes: Math.floor(Math.random() * 15) + 5,
            isCompleted: false,
            order: order++,
            feedbackType: 'sticky_note',
            category,
          });
        });
      }
    }

    return microTasks;
  }

  /**
   * ✅ マイクロタスク完了処理（フィードバック生成）
   */
  completeTask(taskId: string, breakdownId: string): { success: boolean; feedback: string } {
    const breakdown = this.taskBreakdowns.get(breakdownId);
    if (!breakdown) {
      return { success: false, feedback: 'タスクが見つかりません' };
    }

    const task = breakdown.microTasks.find((t) => t.id === taskId);
    if (!task || task.isCompleted) {
      return { success: false, feedback: 'タスクは既に完了しています' };
    }

    // タスク完了処理
    task.isCompleted = true;
    task.completedAt = new Date().toISOString();

    // 統計更新
    breakdown.completedCount++;
    this.gameLoopStats.totalTasksCompleted++;
    this.gameLoopStats.tasksCompletedToday++;
    this.gameLoopStats.feedbackJarCount++;

    // フィードバック生成
    const feedback = this.generateFeedback(task, breakdown);

    // ストリーク計算
    this.updateStreaks(task);

    this.completedTasks.set(taskId, task);
    this.saveToStorage();

    // 音声フィードバック（サウンド効果）
    this.playCompletionSound(task.feedbackType);

    // 自動化システム連携
    try {
      gameLoopAutomationIntegration.handleTaskCompletion(task, breakdown);

      // ストリークマイルストーンチェック
      if (this.gameLoopStats.currentStreak > 0 && this.gameLoopStats.currentStreak % 5 === 0) {
        gameLoopAutomationIntegration.handleStreakMilestone(this.gameLoopStats.currentStreak);
      }
    } catch (error) {
      console.error('Automation integration failed:', error);
    }

    return { success: true, feedback };
  }

  /**
   * 🎵 完了音効果
   */
  private playCompletionSound(feedbackType: string): void {
    try {
      // Web Audio API を使用した簡単な完了音
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // フィードバックタイプによって音を変える
      if (feedbackType === 'sticky_note') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      } else if (feedbackType === 'printed_ticket') {
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.1);
      }

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio feedback not available');
    }
  }

  /**
   * 💬 ゲーミフィケーション風フィードバック生成
   */
  private generateFeedback(task: MicroTask, breakdown: TaskBreakdown): string {
    const completionRate = (breakdown.completedCount / breakdown.totalCount) * 100;
    const encouragements = [
      '🎉 素晴らしい！',
      '⚡ 完璧な実行！',
      '🔥 勢いが止まらない！',
      '💪 その調子！',
      '🚀 ロケットスタート！',
      '⭐ エクセレント！',
    ];

    const feedback = encouragements[Math.floor(Math.random() * encouragements.length)];

    if (completionRate === 100) {
      return `${feedback} 全タスク完了！ 🏆 フローゾーンに入っています！`;
    } else if (completionRate >= 75) {
      return `${feedback} あと少しで完了！ (${Math.round(completionRate)}%)`;
    } else if (completionRate >= 50) {
      return `${feedback} 中間地点通過！ 順調です！`;
    } else {
      return `${feedback} 良いスタート！ 継続は力なり！`;
    }
  }

  /**
   * 📅 日次印刷用データ生成（レシートプリンター風）
   */
  generateDailyPrintout(date: string = new Date().toISOString().split('T')[0]): DailyPrintout {
    const morningRoutine = this.generateMorningRoutine();
    const workTasks = this.getPendingTasksByCategory('work');
    const personalTasks = this.getPendingTasksByCategory('personal');
    const maintenanceTasks = this.getPendingTasksByCategory('maintenance');

    const printout: DailyPrintout = {
      id: `printout_${date}`,
      date,
      morningRoutine,
      workTasks,
      personalTasks,
      maintenanceTasks,
      totalTasks:
        morningRoutine.length + workTasks.length + personalTasks.length + maintenanceTasks.length,
    };

    this.dailyPrintouts.set(date, printout);
    this.saveToStorage();

    return printout;
  }

  /**
   * 🌅 モーニングルーチン生成
   */
  private generateMorningRoutine(): MicroTask[] {
    const routineTasks = [
      { title: 'コーヒーを作る', minutes: 3 },
      { title: '今日の天気を確認', minutes: 1 },
      { title: 'メール受信ボックスをチェック', minutes: 2 },
      { title: '今日のタスクリストを確認', minutes: 2 },
      { title: '机を整理する', minutes: 2 },
      { title: 'タイピング練習 (2分)', minutes: 2 },
      { title: 'キーボードショートカット練習', minutes: 1 },
      { title: 'ポモドーロタイマーをセット', minutes: 1 },
    ];

    return routineTasks.map((task, index) => ({
      id: `morning_${Date.now()}_${index}`,
      title: task.title,
      estimatedMinutes: task.minutes,
      isCompleted: false,
      order: index + 1,
      feedbackType: 'printed_ticket' as const,
      category: 'morning_routine' as const,
    }));
  }

  /**
   * 📊 統計情報取得
   */
  getGameLoopStats(): GameLoopStats {
    return { ...this.gameLoopStats };
  }

  /**
   * 📈 ストリーク更新
   */
  private updateStreaks(completedTask: MicroTask): void {
    if (completedTask.category === 'morning_routine') {
      this.gameLoopStats.morningRoutineStreak++;
    }

    // 連続完了ストリーク計算
    const today = new Date().toISOString().split('T')[0];
    const todayCompletions = Array.from(this.completedTasks.values()).filter((task) =>
      task.completedAt?.startsWith(today)
    );

    if (todayCompletions.length > 0) {
      this.gameLoopStats.currentStreak = todayCompletions.length;
    }
  }

  /**
   * 🗂️ カテゴリ別未完了タスク取得
   */
  private getPendingTasksByCategory(category: string): MicroTask[] {
    const pendingTasks: MicroTask[] = [];

    this.taskBreakdowns.forEach((breakdown) => {
      if (breakdown.category === category) {
        const pending = breakdown.microTasks.filter((task) => !task.isCompleted);
        pendingTasks.push(...pending);
      }
    });

    return pendingTasks.sort((a, b) => a.order - b.order);
  }

  /**
   * 💾 ローカルストレージ保存
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(
        'gameloop_task_breakdowns',
        JSON.stringify(Array.from(this.taskBreakdowns.entries()))
      );
      localStorage.setItem(
        'gameloop_completed_tasks',
        JSON.stringify(Array.from(this.completedTasks.entries()))
      );
      localStorage.setItem('gameloop_stats', JSON.stringify(this.gameLoopStats));
      localStorage.setItem(
        'gameloop_daily_printouts',
        JSON.stringify(Array.from(this.dailyPrintouts.entries()))
      );
    } catch (error) {
      console.error('Failed to save game loop data:', error);
    }
  }

  /**
   * 📖 ローカルストレージ読み込み
   */
  private loadFromStorage(): void {
    try {
      const breakdowns = localStorage.getItem('gameloop_task_breakdowns');
      const completed = localStorage.getItem('gameloop_completed_tasks');
      const stats = localStorage.getItem('gameloop_stats');
      const printouts = localStorage.getItem('gameloop_daily_printouts');

      if (breakdowns) {
        this.taskBreakdowns = new Map(JSON.parse(breakdowns));
      }
      if (completed) {
        this.completedTasks = new Map(JSON.parse(completed));
      }
      if (stats) {
        this.gameLoopStats = { ...this.gameLoopStats, ...JSON.parse(stats) };
      }
      if (printouts) {
        this.dailyPrintouts = new Map(JSON.parse(printouts));
      }
    } catch (error) {
      console.error('Failed to load game loop data:', error);
    }
  }

  /**
   * 🔄 日次リセット
   */
  resetDailyStats(): void {
    this.gameLoopStats.tasksCompletedToday = 0;
    this.saveToStorage();
  }

  /**
   * 📋 全タスク取得
   */
  getAllTaskBreakdowns(): TaskBreakdown[] {
    return Array.from(this.taskBreakdowns.values());
  }

  /**
   * 🗑️ タスク削除
   */
  deleteTaskBreakdown(breakdownId: string): boolean {
    const deleted = this.taskBreakdowns.delete(breakdownId);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }
}

export const gameLoopTaskService = GameLoopTaskService.getInstance();
