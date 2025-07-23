/**
 * 🔗 ゲームループ × 自動化統合サービス
 *
 * 既存の自動化システムとゲームループタスクシステムを連携
 * 記事のアイデア + 既存システムの自動化機能
 */

import { gameLoopTaskService, TaskBreakdown, MicroTask } from './GameLoopTaskService';
import {
  integratedAutomationService,
  AutomationRule,
} from '@/services/automation/IntegratedAutomationService';
import { toast } from 'react-hot-toast';

export interface GameLoopAutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'task_completion' | 'time_based' | 'streak_milestone' | 'task_overdue';
    config: {
      taskCategory?: string;
      streakCount?: number;
      schedule?: string;
      overdueMinutes?: number;
    };
  };
  actions: {
    type: 'auto_breakdown' | 'motivation_boost' | 'task_reminder' | 'reward_unlock';
    config: {
      message?: string;
      breakdownRules?: string[];
      rewardType?: string;
    };
  }[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface GameLoopAutomationStats {
  totalRules: number;
  activeRules: number;
  todayTriggers: number;
  autoBreakdownsCreated: number;
  motivationBoostsDelivered: number;
  tasksAutoScheduled: number;
}

class GameLoopAutomationIntegration {
  private static instance: GameLoopAutomationIntegration;
  private automationRules: Map<string, GameLoopAutomationRule> = new Map();
  private stats: GameLoopAutomationStats;

  constructor() {
    this.stats = {
      totalRules: 0,
      activeRules: 0,
      todayTriggers: 0,
      autoBreakdownsCreated: 0,
      motivationBoostsDelivered: 0,
      tasksAutoScheduled: 0,
    };
    this.loadFromStorage();
    this.initializeDefaultRules();
  }

  static getInstance(): GameLoopAutomationIntegration {
    if (!GameLoopAutomationIntegration.instance) {
      GameLoopAutomationIntegration.instance = new GameLoopAutomationIntegration();
    }
    return GameLoopAutomationIntegration.instance;
  }

  /**
   * 🚀 初期自動化ルール設定
   */
  private initializeDefaultRules(): void {
    const defaultRules: Omit<GameLoopAutomationRule, 'id' | 'createdAt' | 'triggerCount'>[] = [
      {
        name: '朝のルーチン自動生成',
        description: '毎朝6時にモーニングルーチンタスクを自動生成',
        trigger: {
          type: 'time_based',
          config: {
            schedule: '0 6 * * *', // 毎朝6時
          },
        },
        actions: [
          {
            type: 'auto_breakdown',
            config: {
              breakdownRules: ['morning_routine'],
              message: '🌅 新しい一日の始まり！モーニングルーチンを実行しましょう！',
            },
          },
        ],
        isActive: true,
        lastTriggered: undefined,
      },
      {
        name: 'プロシージネーション警告',
        description: 'タスクが30分以上未着手の場合にモチベーション支援',
        trigger: {
          type: 'task_overdue',
          config: {
            overdueMinutes: 30,
          },
        },
        actions: [
          {
            type: 'motivation_boost',
            config: {
              message:
                '💪 大丈夫！たった2分から始めてみませんか？小さな一歩が大きな変化を生みます！',
            },
          },
          {
            type: 'auto_breakdown',
            config: {
              breakdownRules: ['micro_tasks'],
              message: '🎯 タスクをより小さな単位に分解しました！',
            },
          },
        ],
        isActive: true,
        lastTriggered: undefined,
      },
      {
        name: 'ストリーク祝福システム',
        description: '連続完了ストリークでご褒美アンロック',
        trigger: {
          type: 'streak_milestone',
          config: {
            streakCount: 5,
          },
        },
        actions: [
          {
            type: 'reward_unlock',
            config: {
              rewardType: 'achievement_badge',
              message: '🏆 素晴らしい！5連続完了達成！あなたはゲームループマスターです！',
            },
          },
          {
            type: 'motivation_boost',
            config: {
              message: '🔥 この勢いで次のレベルも突破しましょう！',
            },
          },
        ],
        isActive: true,
        lastTriggered: undefined,
      },
      {
        name: '仕事モード自動分解',
        description: '仕事カテゴリのタスク完了時に次のタスクを自動分解',
        trigger: {
          type: 'task_completion',
          config: {
            taskCategory: 'work',
          },
        },
        actions: [
          {
            type: 'auto_breakdown',
            config: {
              breakdownRules: ['work_flow_optimization'],
              message: '🚀 フロー状態継続！次のタスクも準備完了です！',
            },
          },
        ],
        isActive: true,
        lastTriggered: undefined,
      },
    ];

    defaultRules.forEach((rule) => {
      if (!this.findRuleByName(rule.name)) {
        this.createRule(rule);
      }
    });
  }

  /**
   * 📝 新しい自動化ルール作成
   */
  createRule(ruleData: Omit<GameLoopAutomationRule, 'id' | 'createdAt' | 'triggerCount'>): string {
    const rule: GameLoopAutomationRule = {
      ...ruleData,
      id: `gameloop_rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      triggerCount: 0,
    };

    this.automationRules.set(rule.id, rule);
    this.updateStats();
    this.saveToStorage();

    console.log('🔗 Game Loop Automation Rule created:', rule.name);
    return rule.id;
  }

  /**
   * ⚡ タスク完了イベント処理
   */
  handleTaskCompletion(task: MicroTask, breakdown: TaskBreakdown): void {
    const applicableRules = Array.from(this.automationRules.values()).filter(
      (rule) =>
        rule.isActive &&
        rule.trigger.type === 'task_completion' &&
        (!rule.trigger.config.taskCategory ||
          breakdown.category === rule.trigger.config.taskCategory)
    );

    applicableRules.forEach((rule) => {
      this.executeRule(rule, { task, breakdown });
    });
  }

  /**
   * 🕒 ストリーク達成イベント処理
   */
  handleStreakMilestone(streakCount: number): void {
    const applicableRules = Array.from(this.automationRules.values()).filter(
      (rule) =>
        rule.isActive &&
        rule.trigger.type === 'streak_milestone' &&
        rule.trigger.config.streakCount === streakCount
    );

    applicableRules.forEach((rule) => {
      this.executeRule(rule, { streakCount });
    });
  }

  /**
   * ⏰ 期限超過タスクチェック
   */
  checkOverdueTasks(): void {
    const allBreakdowns = gameLoopTaskService.getAllTaskBreakdowns();

    allBreakdowns.forEach((breakdown) => {
      breakdown.microTasks.forEach((task) => {
        if (!task.isCompleted) {
          const createdTime = new Date(breakdown.createdAt).getTime();
          const now = new Date().getTime();
          const overdueMinutes = (now - createdTime) / (1000 * 60);

          const applicableRules = Array.from(this.automationRules.values()).filter(
            (rule) =>
              rule.isActive &&
              rule.trigger.type === 'task_overdue' &&
              overdueMinutes >= (rule.trigger.config.overdueMinutes || 30)
          );

          applicableRules.forEach((rule) => {
            this.executeRule(rule, { task, breakdown, overdueMinutes });
          });
        }
      });
    });
  }

  /**
   * 🎬 ルール実行エンジン
   */
  private executeRule(rule: GameLoopAutomationRule, context: any): void {
    try {
      rule.actions.forEach((action) => {
        switch (action.type) {
          case 'auto_breakdown':
            this.executeAutoBreakdown(action, context);
            break;
          case 'motivation_boost':
            this.executeMotivationBoost(action, context);
            break;
          case 'task_reminder':
            this.executeTaskReminder(action, context);
            break;
          case 'reward_unlock':
            this.executeRewardUnlock(action, context);
            break;
          default:
            console.warn('Unknown action type:', action.type);
        }
      });

      // ルール実行統計更新
      rule.triggerCount++;
      rule.lastTriggered = new Date().toISOString();
      this.stats.todayTriggers++;
      this.saveToStorage();

      console.log(`🎯 Game Loop Rule executed: ${rule.name}`);
    } catch (error) {
      console.error('Rule execution failed:', error);
    }
  }

  /**
   * 🤖 自動タスク分解
   */
  private executeAutoBreakdown(action: any, context: any): void {
    if (context.task && context.breakdown) {
      // 関連タスクの自動生成
      const suggestedTask = this.generateContextualTask(context.breakdown.category);
      if (suggestedTask) {
        gameLoopTaskService.createTaskBreakdown(suggestedTask, context.breakdown.category);
        this.stats.autoBreakdownsCreated++;

        toast.success(action.config.message || '🤖 関連タスクを自動生成しました！', {
          icon: '🎯',
          duration: 3000,
        });
      }
    }
  }

  /**
   * 💪 モチベーション強化
   */
  private executeMotivationBoost(action: any, context: any): void {
    const encouragements = [
      '🚀 あなたは既に素晴らしい進歩を遂げています！',
      '💪 小さな一歩が大きな変化を生みます！',
      '⭐ 継続は力なり！今日も頑張りましょう！',
      '🔥 フロー状態に入っています！この調子で！',
      '🎯 目標に向かって着実に進んでいます！',
    ];

    const message =
      action.config.message || encouragements[Math.floor(Math.random() * encouragements.length)];

    toast.success(message, {
      icon: '💪',
      duration: 4000,
      style: {
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        color: 'white',
        fontWeight: 'bold',
      },
    });

    this.stats.motivationBoostsDelivered++;
  }

  /**
   * 🏆 報酬アンロック
   */
  private executeRewardUnlock(action: any, context: any): void {
    const rewardMessage = action.config.message || '🎉 新しい報酬がアンロックされました！';

    toast.success(rewardMessage, {
      icon: '🏆',
      duration: 5000,
      style: {
        background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
        color: '#000',
        fontWeight: 'bold',
        border: '2px solid #ffd700',
      },
    });

    // 報酬効果音
    this.playRewardSound();
  }

  /**
   * 📝 タスクリマインダー
   */
  private executeTaskReminder(action: any, context: any): void {
    const message = action.config.message || '⏰ 未完了のタスクがあります！';

    toast(message, {
      icon: '⏰',
      duration: 3000,
    });
  }

  /**
   * 🎵 報酬効果音
   */
  private playRewardSound(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // 勝利のファンファーレ風サウンド
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + index * 0.2);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + index * 0.2 + 0.3
        );

        oscillator.start(audioContext.currentTime + index * 0.2);
        oscillator.stop(audioContext.currentTime + index * 0.2 + 0.3);
      });
    } catch (error) {
      console.log('Reward sound not available');
    }
  }

  /**
   * 🧠 コンテキスト依存タスク生成
   */
  private generateContextualTask(category: string): string | null {
    const taskSuggestions: { [key: string]: string[] } = {
      work: [
        '次の会議の準備',
        'メール返信タスク',
        'プロジェクト進捗確認',
        'ドキュメント整理',
        '週次レポート作成',
      ],
      personal: [
        '健康習慣の見直し',
        '読書時間の確保',
        '家族との時間設定',
        'スキルアップ学習',
        'リラックス時間の確保',
      ],
      maintenance: [
        '部屋の整理整頓',
        '設備点検',
        '在庫確認',
        'システムバックアップ',
        '定期メンテナンス',
      ],
      morning_routine: [
        '瞑想・深呼吸',
        '今日の目標設定',
        '感謝の記録',
        '体調チェック',
        'エネルギー充電',
      ],
    };

    const suggestions = taskSuggestions[category];
    if (suggestions && suggestions.length > 0) {
      return suggestions[Math.floor(Math.random() * suggestions.length)];
    }
    return null;
  }

  /**
   * 📊 統計情報更新
   */
  private updateStats(): void {
    const allRules = Array.from(this.automationRules.values());
    this.stats.totalRules = allRules.length;
    this.stats.activeRules = allRules.filter((rule) => rule.isActive).length;
  }

  /**
   * 📈 統計情報取得
   */
  getStats(): GameLoopAutomationStats {
    return { ...this.stats };
  }

  /**
   * 🔍 ルール検索
   */
  private findRuleByName(name: string): GameLoopAutomationRule | undefined {
    return Array.from(this.automationRules.values()).find((rule) => rule.name === name);
  }

  /**
   * 📋 全ルール取得
   */
  getAllRules(): GameLoopAutomationRule[] {
    return Array.from(this.automationRules.values());
  }

  /**
   * 💾 ストレージ保存
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(
        'gameloop_automation_rules',
        JSON.stringify(Array.from(this.automationRules.entries()))
      );
      localStorage.setItem('gameloop_automation_stats', JSON.stringify(this.stats));
    } catch (error) {
      console.error('Failed to save automation data:', error);
    }
  }

  /**
   * 📖 ストレージ読み込み
   */
  private loadFromStorage(): void {
    try {
      const rulesData = localStorage.getItem('gameloop_automation_rules');
      const statsData = localStorage.getItem('gameloop_automation_stats');

      if (rulesData) {
        this.automationRules = new Map(JSON.parse(rulesData));
      }
      if (statsData) {
        this.stats = { ...this.stats, ...JSON.parse(statsData) };
      }
    } catch (error) {
      console.error('Failed to load automation data:', error);
    }
  }

  /**
   * 🚀 定期実行開始
   */
  startPeriodicChecks(): void {
    // 5分ごとに期限超過チェック
    setInterval(
      () => {
        this.checkOverdueTasks();
      },
      5 * 60 * 1000
    );

    console.log('🔗 Game Loop Automation Integration started');
  }
}

export const gameLoopAutomationIntegration = GameLoopAutomationIntegration.getInstance();
