/**
 * 🎮 統合ゲーミフィケーションサービス
 * ゲーミフィケーション、AI強化ゲーミフィケーション、ToDo管理の完全統合
 */

import {
  aiGamificationService,
  AIGeneratedTask,
  SmartTaskRecommendation,
} from './AIGamificationService';
import { todoApi } from '../api/todoApi';
import { Todo, NewTodo } from '@/types/todo';

export interface PlayerProfile {
  userId: string;
  level: number;
  totalXP: number;
  currentXP: number;
  xpToNextLevel: number;
  streakDays: number;
  totalTasksCompleted: number;
  badges: CompletedBadge[];
  achievements: Achievement[];
  preferences: GamificationPreferences;
  aiPersonality: AIPersonalityInsights;
}

export interface GamificationReward {
  id: string;
  type: 'xp' | 'badge' | 'level_up' | 'streak_bonus' | 'ai_achievement';
  amount: number;
  description: string;
  triggeredBy: string; // task ID, AI analysis, etc.
  timestamp: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  aiEnhanced: boolean;
}

export interface CompletedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  completedAt: string;
  source: 'task_completion' | 'ai_analysis' | 'streak' | 'special';
  relatedTasks?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  xpReward: number;
  category: 'productivity' | 'consistency' | 'learning' | 'ai_integration' | 'social';
}

export interface GamificationPreferences {
  enableNotifications: boolean;
  preferredRewardTypes: string[];
  aiCoachingLevel: 'minimal' | 'moderate' | 'intensive';
  publicProfile: boolean;
  streakGoals: number;
}

export interface AIPersonalityInsights {
  motivationStyle: 'achievement' | 'social' | 'mastery' | 'purpose';
  workPattern: 'morning' | 'afternoon' | 'evening' | 'flexible';
  challengePreference: 'easy' | 'medium' | 'hard' | 'adaptive';
  feedbackStyle: 'immediate' | 'milestone' | 'weekly';
  lastAnalyzed: string;
}

export interface TaskCompletionData {
  taskId: string;
  task: Todo;
  completionTime: number; // seconds
  qualityScore?: number; // 1-10, AI analyzed
  contextualBonus?: number; // based on timing, mood, etc.
  streakContribution: boolean;
}

export interface IntegratedDashboardData {
  player: PlayerProfile;
  todayStats: {
    tasksCompleted: number;
    xpEarned: number;
    streakStatus: boolean;
    aiRecommendationsUsed: number;
  };
  recentRewards: GamificationReward[];
  activeChallenges: Challenge[];
  aiInsights: AIInsight[];
  upcomingMilestones: Milestone[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'ai_generated';
  progress: number;
  maxProgress: number;
  xpReward: number;
  deadline: string;
  isActive: boolean;
  aiGenerated: boolean;
}

export interface AIInsight {
  id: string;
  type: 'productivity' | 'motivation' | 'optimization' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  generatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  xpReward: number;
  category: string;
}

class IntegratedGamificationService {
  private playerProfile: PlayerProfile | null = null;
  private readonly STORAGE_KEY = 'integrated_gamification';

  /**
   * 🎯 プレイヤープロファイルの初期化
   */
  async initializePlayer(userId: string): Promise<PlayerProfile> {
    try {
      // ローカルストレージからデータを読み込み
      const savedProfile = this.loadPlayerProfile(userId);

      if (savedProfile) {
        this.playerProfile = savedProfile;
        return savedProfile;
      }

      // 新規プレイヤーの初期化
      const newProfile: PlayerProfile = {
        userId,
        level: 1,
        totalXP: 0,
        currentXP: 0,
        xpToNextLevel: 100,
        streakDays: 0,
        totalTasksCompleted: 0,
        badges: [],
        achievements: this.generateInitialAchievements(),
        preferences: {
          enableNotifications: true,
          preferredRewardTypes: ['xp', 'badge'],
          aiCoachingLevel: 'moderate',
          publicProfile: false,
          streakGoals: 7,
        },
        aiPersonality: {
          motivationStyle: 'achievement',
          workPattern: 'flexible',
          challengePreference: 'adaptive',
          feedbackStyle: 'immediate',
          lastAnalyzed: new Date().toISOString(),
        },
      };

      this.playerProfile = newProfile;
      this.savePlayerProfile(newProfile);

      return newProfile;
    } catch (error) {
      console.error('Player initialization failed:', error);
      throw error;
    }
  }

  /**
   * 🏆 タスク完了時の報酬計算とゲーミフィケーション処理
   */
  async processTaskCompletion(completionData: TaskCompletionData): Promise<GamificationReward[]> {
    if (!this.playerProfile) {
      throw new Error('Player profile not initialized');
    }

    const rewards: GamificationReward[] = [];
    const task = completionData.task;

    // 基本XP計算
    const baseXP = this.calculateBaseXP(task);

    // AI強化ボーナス計算
    const aiBonus = await this.calculateAIBonus(completionData);

    // ストリークボーナス
    const streakBonus = this.calculateStreakBonus();

    // タイミングボーナス（朝型、夜型など）
    const timingBonus = this.calculateTimingBonus(task);

    const totalXP = baseXP + aiBonus + streakBonus + timingBonus;

    // XP報酬を追加
    rewards.push({
      id: `xp_${Date.now()}`,
      type: 'xp',
      amount: totalXP,
      description: `タスク「${task.task}」完了`,
      triggeredBy: task._id,
      timestamp: new Date().toISOString(),
      rarity: this.determineRewardRarity(totalXP),
      aiEnhanced: aiBonus > 0,
    });

    // プレイヤー統計を更新
    this.playerProfile.totalXP += totalXP;
    this.playerProfile.currentXP += totalXP;
    this.playerProfile.totalTasksCompleted += 1;

    // レベルアップチェック
    const levelUpRewards = this.checkLevelUp();
    rewards.push(...levelUpRewards);

    // ストリーク更新
    if (completionData.streakContribution) {
      this.playerProfile.streakDays += 1;

      if (this.playerProfile.streakDays % 7 === 0) {
        rewards.push({
          id: `streak_${Date.now()}`,
          type: 'streak_bonus',
          amount: this.playerProfile.streakDays * 10,
          description: `${this.playerProfile.streakDays}日連続ストリーク達成！`,
          triggeredBy: task._id,
          timestamp: new Date().toISOString(),
          rarity: 'epic',
          aiEnhanced: false,
        });
      }
    }

    // バッジチェック
    const badgeRewards = this.checkBadgeUnlocks(task);
    rewards.push(...badgeRewards);

    // AI分析による追加報酬
    const aiRewards = await this.generateAIRewards(completionData);
    rewards.push(...aiRewards);

    // プロファイルを保存
    this.savePlayerProfile(this.playerProfile);

    return rewards;
  }

  /**
   * 🤖 AI生成タスクの統合処理
   */
  async integrateAIGeneratedTasks(recommendation: SmartTaskRecommendation): Promise<Todo[]> {
    if (!this.playerProfile) {
      throw new Error('Player profile not initialized');
    }

    const integratedTasks: Todo[] = [];

    for (const aiTask of recommendation.tasks) {
      try {
        // AIタスクをゲーミフィケーション値で強化
        const enhancedTask = this.enhanceTaskWithGamification(aiTask);

        // TodoAPIでタスクを作成
        const response = await todoApi.create(
          enhancedTask.title,
          enhancedTask.priority,
          enhancedTask.priority >= 4,
          'input',
          enhancedTask.suggestedDeadline
        );

        if (response.data && response.data.todo) {
          const todoItem = response.data.todo;
          const todo: Todo = {
            _id: todoItem._id,
            task: todoItem.task,
            type: 'input',
            completed: todoItem.completed,
            priority: todoItem.priority,
            isPrioritized: todoItem.isPrioritized,
            createdAt: todoItem.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedDate: todoItem.completedDate,
            deadline: todoItem.deadline,
            note: `${enhancedTask.description}\n\n[AI生成] ${enhancedTask.reasoningBehind}\n予想XP: ${enhancedTask.estimatedXP}`,
            tags: [...enhancedTask.tags, 'AI生成', 'ゲーミフィケーション'],
          };

          integratedTasks.push(todo);
        }
      } catch (error) {
        console.error(`Failed to integrate AI task: ${aiTask.title}`, error);
      }
    }

    // AI統合の実績解除
    this.unlockAIIntegrationAchievements(integratedTasks.length);

    return integratedTasks;
  }

  /**
   * 📊 統合ダッシュボードデータの取得
   */
  async getDashboardData(): Promise<IntegratedDashboardData> {
    if (!this.playerProfile) {
      throw new Error('Player profile not initialized');
    }

    // 今日の統計を計算
    const todayStats = await this.calculateTodayStats();

    // 最近の報酬を取得
    const recentRewards = this.getRecentRewards();

    // アクティブなチャレンジ
    const activeChallenges = this.getActiveChallenges();

    // AI洞察を生成
    const aiInsights = await this.generateAIInsights();

    // 今後のマイルストーン
    const upcomingMilestones = this.getUpcomingMilestones();

    return {
      player: this.playerProfile,
      todayStats,
      recentRewards,
      activeChallenges,
      aiInsights,
      upcomingMilestones,
    };
  }

  /**
   * 🎯 基本XP計算
   */
  private calculateBaseXP(task: Todo): number {
    let baseXP = 10; // 基本値

    // 優先度による倍率
    const priorityMultiplier = {
      1: 0.5,
      2: 0.75,
      3: 1.0,
      4: 1.25,
      5: 1.5,
    };

    baseXP *= (priorityMultiplier as any)[task.priority] || 1.0;

    // タスクタイプによる調整
    if (task.type === 'output') {
      baseXP *= 1.2; // アウトプットタスクは20%ボーナス
    }

    // 期限がある場合のボーナス
    if (task.deadline) {
      baseXP *= 1.1;
    }

    return Math.round(baseXP);
  }

  /**
   * 🤖 AI強化ボーナス計算
   */
  private async calculateAIBonus(completionData: TaskCompletionData): Promise<number> {
    try {
      if (!completionData.qualityScore) return 0;

      // 品質スコアに基づくボーナス
      const qualityBonus = Math.round((completionData.qualityScore - 5) * 2);

      // コンテキストボーナス
      const contextBonus = completionData.contextualBonus || 0;

      return Math.max(0, qualityBonus + contextBonus);
    } catch (error) {
      console.error('AI bonus calculation failed:', error);
      return 0;
    }
  }

  /**
   * 🔥 ストリークボーナス計算
   */
  private calculateStreakBonus(): number {
    if (!this.playerProfile) return 0;

    const streakDays = this.playerProfile.streakDays;

    if (streakDays >= 30) return 20;
    if (streakDays >= 14) return 15;
    if (streakDays >= 7) return 10;
    if (streakDays >= 3) return 5;

    return 0;
  }

  /**
   * 🕒 タイミングボーナス計算
   */
  private calculateTimingBonus(task: Todo): number {
    const now = new Date();
    const hour = now.getHours();

    // プレイヤーの作業パターンに基づく
    if (!this.playerProfile) return 0;

    const pattern = this.playerProfile.aiPersonality.workPattern;

    if (pattern === 'morning' && hour >= 6 && hour <= 10) return 5;
    if (pattern === 'afternoon' && hour >= 13 && hour <= 17) return 5;
    if (pattern === 'evening' && hour >= 18 && hour <= 22) return 5;

    return 0;
  }

  /**
   * ⬆️ レベルアップチェック
   */
  private checkLevelUp(): GamificationReward[] {
    if (!this.playerProfile) return [];

    const rewards: GamificationReward[] = [];

    while (this.playerProfile.currentXP >= this.playerProfile.xpToNextLevel) {
      this.playerProfile.currentXP -= this.playerProfile.xpToNextLevel;
      this.playerProfile.level += 1;
      this.playerProfile.xpToNextLevel = Math.round(this.playerProfile.xpToNextLevel * 1.2);

      rewards.push({
        id: `levelup_${Date.now()}_${this.playerProfile.level}`,
        type: 'level_up',
        amount: this.playerProfile.level * 50,
        description: `レベル${this.playerProfile.level}に昇格！`,
        triggeredBy: 'level_system',
        timestamp: new Date().toISOString(),
        rarity: 'legendary',
        aiEnhanced: false,
      });
    }

    return rewards;
  }

  /**
   * 🏅 バッジ解除チェック
   */
  private checkBadgeUnlocks(task: Todo): GamificationReward[] {
    const rewards: GamificationReward[] = [];

    // 実装例：完了タスク数に基づくバッジ
    if (this.playerProfile && this.playerProfile.totalTasksCompleted === 10) {
      const badge: CompletedBadge = {
        id: 'first_ten',
        name: '初心者卒業',
        description: '10個のタスクを完了',
        icon: '🎯',
        rarity: 'common',
        completedAt: new Date().toISOString(),
        source: 'task_completion',
        relatedTasks: [task._id],
      };

      this.playerProfile.badges.push(badge);

      rewards.push({
        id: `badge_${Date.now()}`,
        type: 'badge',
        amount: 50,
        description: `バッジ「${badge.name}」を獲得！`,
        triggeredBy: task._id,
        timestamp: new Date().toISOString(),
        rarity: 'rare',
        aiEnhanced: false,
      });
    }

    return rewards;
  }

  /**
   * 💾 プレイヤープロファイルの保存・読み込み
   */
  private savePlayerProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY}_${profile.userId}`, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save player profile:', error);
    }
  }

  private loadPlayerProfile(userId: string): PlayerProfile | null {
    try {
      const saved = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load player profile:', error);
      return null;
    }
  }

  // 以下、ヘルパーメソッド群
  private generateInitialAchievements(): Achievement[] {
    return [
      {
        id: 'first_task',
        title: '最初の一歩',
        description: '初めてのタスクを完了する',
        progress: 0,
        maxProgress: 1,
        isCompleted: false,
        xpReward: 25,
        category: 'productivity',
      },
      {
        id: 'week_streak',
        title: '継続は力なり',
        description: '7日連続でタスクを完了する',
        progress: 0,
        maxProgress: 7,
        isCompleted: false,
        xpReward: 100,
        category: 'consistency',
      },
      {
        id: 'ai_integration',
        title: 'AIパートナー',
        description: 'AI生成タスクを5個完了する',
        progress: 0,
        maxProgress: 5,
        isCompleted: false,
        xpReward: 150,
        category: 'ai_integration',
      },
    ];
  }

  private enhanceTaskWithGamification(
    aiTask: AIGeneratedTask
  ): AIGeneratedTask & { estimatedXP: number } {
    const estimatedXP = Math.round(
      aiTask.estimatedMinutes / 5 + aiTask.priority * 10 + aiTask.aiConfidence * 20
    );

    return {
      ...aiTask,
      estimatedXP,
      tags: [...aiTask.tags, `XP:${estimatedXP}`],
    };
  }

  private determineRewardRarity(xp: number): 'common' | 'rare' | 'epic' | 'legendary' {
    if (xp >= 100) return 'legendary';
    if (xp >= 50) return 'epic';
    if (xp >= 25) return 'rare';
    return 'common';
  }

  // モック実装（実際のプロジェクトでは具体的に実装）
  private async generateAIRewards(
    completionData: TaskCompletionData
  ): Promise<GamificationReward[]> {
    return [];
  }

  private unlockAIIntegrationAchievements(taskCount: number): void {
    // AI統合関連の実績解除ロジック
  }

  private async calculateTodayStats(): Promise<any> {
    return {
      tasksCompleted: 0,
      xpEarned: 0,
      streakStatus: false,
      aiRecommendationsUsed: 0,
    };
  }

  private getRecentRewards(): GamificationReward[] {
    return [];
  }

  private getActiveChallenges(): Challenge[] {
    return [];
  }

  private async generateAIInsights(): Promise<AIInsight[]> {
    return [];
  }

  private getUpcomingMilestones(): Milestone[] {
    return [];
  }
}

export const integratedGamificationService = new IntegratedGamificationService();
