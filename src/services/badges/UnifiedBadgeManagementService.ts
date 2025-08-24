/**
 * 🏆 統一バッジ管理サービス
 * 開発バッジシステム、バッジ完了予測システム、開発バッジ実績の3つのページ間のデータ同期を管理
 */

import { EventEmitter } from '@/lib/EventEmitter';
import { DevelopmentBadge, DEVELOPMENT_BADGES } from '@/types/development-badges';
import {
  CYBERSECURITY_SPECIALIST_BADGE,
  SECURITY_BADGES_COLLECTION,
  SecurityBadge,
} from '@/types/cybersecurity-badges';
import {
  COMPREHENSIVE_BADGE_CATEGORIES,
  ComprehensiveBadge,
} from '@/types/comprehensive-badge-categories';
import { ALL_COMPREHENSIVE_BADGES_EXTENDED } from '@/types/comprehensive-badges-extended';
import { weeklyWorkPlanningService } from '@/services/planning/WeeklyWorkPlanningService';
import { comprehensivePageSyncSystem } from '@/services/integration/ComprehensivePageSyncSystem';

// 統一バッジインターフェース（全てのバッジタイプに対応）
export interface UnifiedBadge {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: string;
  isUnlocked: boolean;
  progress: number;
  points?: number;
  rewards?: string[];
  nextMilestone?: string;
  prerequisites?: string[];
  unlockedAt?: string;
  completedAt?: string;
  estimatedHours?: number;
  requirements?: any[]; // バッジタイプによって要件が異なるためany[]
  type: 'development' | 'security' | 'comprehensive';
}

export interface BadgeProgress {
  badgeId: string;
  progress: number;
  isUnlocked: boolean;
  lastUpdated: Date;
  source: 'development' | 'prediction' | 'showcase';
}

export interface BadgeSyncData {
  developmentDashboard: {
    totalBadges: number;
    completedBadges: number;
    inProgress: number;
    lastSync: Date;
  };
  predictionSystem: {
    weeklyProgress: number;
    estimatedCompletions: number;
    accuracyRate: number;
    lastSync: Date;
  };
  showcaseView: {
    recentAchievements: number;
    totalProgress: number;
    displayedBadges: number;
    lastSync: Date;
  };
}

class UnifiedBadgeManagementService extends EventEmitter {
  private static instance: UnifiedBadgeManagementService | null = null;
  private badgeData: Map<string, UnifiedBadge> = new Map();
  private progressCache: Map<string, BadgeProgress> = new Map();
  private syncInterval: number | null = null;
  private lastSyncTimestamp: Date = new Date();

  private constructor() {
    super();
    this.initializeBadgeData();
    this.setupEventListeners();
    this.startSyncProcess();
  }

  public static getInstance(): UnifiedBadgeManagementService {
    if (!UnifiedBadgeManagementService.instance) {
      UnifiedBadgeManagementService.instance = new UnifiedBadgeManagementService();
    }
    return UnifiedBadgeManagementService.instance;
  }

  /**
   * 🚀 バッジデータ初期化
   */
  private initializeBadgeData(): void {
    // 開発バッジデータを統一フォーマットに変換
    DEVELOPMENT_BADGES.forEach((badge) => {
      const unifiedBadge: UnifiedBadge = {
        ...badge,
        category: badge.category as string,
        type: 'development',
      };
      this.badgeData.set(badge.id, unifiedBadge);
      this.progressCache.set(badge.id, {
        badgeId: badge.id,
        progress: badge.progress,
        isUnlocked: badge.isUnlocked,
        lastUpdated: new Date(),
        source: 'development',
      });
    });

    // サイバーセキュリティバッジの追加
    SECURITY_BADGES_COLLECTION.forEach((badge) => {
      const unifiedBadge: UnifiedBadge = {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        difficulty: badge.difficulty,
        icon: badge.icon,
        isUnlocked: badge.isUnlocked,
        progress: badge.progress,
        points: badge.points,
        rewards: badge.rewards,
        nextMilestone: badge.nextMilestone,
        prerequisites: badge.prerequisites,
        estimatedHours: badge.estimatedHours,
        requirements: badge.requirements,
        type: 'security',
      };
      this.badgeData.set(badge.id, unifiedBadge);
      this.progressCache.set(badge.id, {
        badgeId: badge.id,
        progress: badge.progress,
        isUnlocked: badge.isUnlocked,
        lastUpdated: new Date(),
        source: 'development',
      });
    });

    // 包括的バッジの追加（ComprehensiveBadgeCategoryからUnifiedBadgeへのマッピング）
    COMPREHENSIVE_BADGE_CATEGORIES.forEach((badgeCategory) => {
      // difficultyのマッピング
      const difficultyMapping: Record<
        string,
        'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary'
      > = {
        beginner: 'bronze',
        intermediate: 'silver',
        advanced: 'gold',
        expert: 'platinum',
        master: 'legendary',
      };

      const unifiedBadge: UnifiedBadge = {
        id: badgeCategory.id,
        name: badgeCategory.name,
        description: badgeCategory.description,
        category: badgeCategory.id, // categoryとして使用
        difficulty: difficultyMapping[badgeCategory.difficulty] || 'bronze',
        icon: badgeCategory.icon,
        isUnlocked: false, // デフォルト値
        progress: 0, // デフォルト値
        points: Math.round(badgeCategory.estimatedHours * 2), // 時間ベースでポイント計算
        rewards: badgeCategory.requiredSkills, // スキルを報酬として使用
        nextMilestone: `${badgeCategory.estimatedHours}時間の学習完了`,
        prerequisites: badgeCategory.prerequisites,
        estimatedHours: badgeCategory.estimatedHours,
        requirements: [
          {
            type: 'time_spent' as any,
            target: badgeCategory.estimatedHours,
            current: 0,
            description: `${badgeCategory.estimatedHours}時間の学習完了`,
            progress: 0,
            isCompleted: false,
          },
        ],
        type: 'comprehensive',
      };
      this.badgeData.set(badgeCategory.id, unifiedBadge);
      this.progressCache.set(badgeCategory.id, {
        badgeId: badgeCategory.id,
        progress: 0,
        isUnlocked: false,
        lastUpdated: new Date(),
        source: 'development',
      });
    });

    // 拡張バッジシステムの追加
    ALL_COMPREHENSIVE_BADGES_EXTENDED.forEach((badge) => {
      const unifiedBadge: UnifiedBadge = {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        difficulty: badge.difficulty,
        icon: badge.icon,
        isUnlocked: badge.isUnlocked,
        progress: badge.progress,
        points: badge.points,
        rewards: badge.rewards,
        nextMilestone: badge.nextMilestone,
        prerequisites: badge.prerequisites,
        estimatedHours: badge.estimatedHours,
        requirements: badge.requirements,
        type: 'comprehensive',
      };
      this.badgeData.set(badge.id, unifiedBadge);
      this.progressCache.set(badge.id, {
        badgeId: badge.id,
        progress: badge.progress,
        isUnlocked: badge.isUnlocked,
        lastUpdated: new Date(),
        source: 'development',
      });
    });

    console.log('🏆 統一バッジ管理サービス初期化完了:', this.badgeData.size, 'バッジ');
  }

  /**
   * 🔗 イベントリスナー設定
   */
  private setupEventListeners(): void {
    // 週次計画サービスからの進捗更新
    weeklyWorkPlanningService.on('progress-updated', (data: any) => {
      this.handleWeeklyProgressUpdate(data);
    });

    // ページ同期システムからの更新
    comprehensivePageSyncSystem.on('badge-progress-updated', (data: any) => {
      this.handlePageSyncUpdate(data);
    });

    // ブラウザ可視性変更時の同期
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.forceSyncAll();
        }
      });
    }
  }

  /**
   * 🔄 同期プロセス開始
   */
  private startSyncProcess(): void {
    this.syncInterval = setInterval(() => {
      this.performPeriodicSync();
    }, 10000) as unknown as number; // 10秒ごと

    console.log('🔄 統一バッジ同期プロセス開始');
  }

  /**
   * 📊 週次進捗更新処理
   */
  private handleWeeklyProgressUpdate(data: any): void {
    const { weekId, progress, badgeIds } = data;

    badgeIds?.forEach((badgeId: string) => {
      const badge = this.badgeData.get(badgeId);
      const cachedProgress = this.progressCache.get(badgeId);

      if (badge && cachedProgress) {
        const newProgress = Math.min(100, cachedProgress.progress + (progress || 0));

        this.updateBadgeProgress(badgeId, newProgress, 'prediction');
      }
    });

    this.emit('weekly-progress-synced', {
      weekId,
      updatedBadges: badgeIds?.length || 0,
      timestamp: new Date(),
    });
  }

  /**
   * 🔗 ページ同期更新処理
   */
  private handlePageSyncUpdate(data: any): void {
    const { badgeId, progress, unlocked } = data;

    this.updateBadgeProgress(badgeId, progress, 'development');

    if (unlocked) {
      this.unlockBadge(badgeId);
    }
  }

  /**
   * 📈 バッジ進捗更新
   */
  public updateBadgeProgress(
    badgeId: string,
    newProgress: number,
    source: 'development' | 'prediction' | 'showcase'
  ): void {
    const badge = this.badgeData.get(badgeId);
    const cachedProgress = this.progressCache.get(badgeId);

    if (!badge || !cachedProgress) return;

    // 進捗値の検証と更新
    const validatedProgress = Math.max(0, Math.min(100, newProgress));
    const hasChanged = Math.abs(cachedProgress.progress - validatedProgress) >= 1;

    if (hasChanged) {
      // バッジデータ更新
      badge.progress = validatedProgress;

      // キャッシュ更新
      cachedProgress.progress = validatedProgress;
      cachedProgress.lastUpdated = new Date();
      cachedProgress.source = source;

      // 100%達成時は自動アンロック
      if (validatedProgress >= 100 && !badge.isUnlocked) {
        this.unlockBadge(badgeId);
      }

      // 全ページに同期通知
      this.emit('badge-progress-updated', {
        badgeId,
        progress: validatedProgress,
        source,
        timestamp: new Date(),
      });

      console.log(`🏆 バッジ進捗更新: ${badge.name} -> ${validatedProgress}% (${source})`);
    }
  }

  /**
   * 🔓 バッジアンロック
   */
  public unlockBadge(badgeId: string): void {
    const badge = this.badgeData.get(badgeId);
    const cachedProgress = this.progressCache.get(badgeId);

    if (!badge || !cachedProgress) return;

    if (!badge.isUnlocked) {
      badge.isUnlocked = true;
      badge.progress = 100;
      badge.unlockedAt = new Date().toISOString();

      cachedProgress.isUnlocked = true;
      cachedProgress.progress = 100;
      cachedProgress.lastUpdated = new Date();

      // 全ページに通知
      this.emit('badge-unlocked', {
        badgeId,
        badge,
        timestamp: new Date(),
      });

      console.log(`🎉 バッジアンロック: ${badge.name}`);
    }
  }

  /**
   * 🔄 定期同期処理
   */
  private performPeriodicSync(): void {
    this.lastSyncTimestamp = new Date();

    // 同期データ生成
    const syncData = this.generateSyncData();

    // 全ページに同期データ送信
    this.emit('sync-data-updated', syncData);

    // 予測システムとの同期
    this.syncWithPredictionSystem();
  }

  /**
   * 🔮 予測システムとの同期
   */
  private syncWithPredictionSystem(): void {
    const currentWeekPlan = weeklyWorkPlanningService.getCurrentWeekPlan();
    const weeklyProgress = weeklyWorkPlanningService.getWeeklyProgress(1);

    if (weeklyProgress && currentWeekPlan) {
      // サイバーセキュリティバッジの同期
      const cyberBadge = this.badgeData.get('cybersecurity-specialist');
      if (cyberBadge) {
        this.updateBadgeProgress(
          'cybersecurity-specialist',
          weeklyProgress.progressPercentage,
          'prediction'
        );
      }

      // その他進行中バッジの同期
      const inProgressBadges = Array.from(this.badgeData.values()).filter(
        (badge) => badge.progress > 0 && badge.progress < 100
      );

      inProgressBadges.forEach((badge) => {
        const estimatedProgress = Math.min(
          100,
          badge.progress + weeklyProgress.progressPercentage / 20 // 改訂された計算式
        );
        this.updateBadgeProgress(badge.id, estimatedProgress, 'prediction');
      });
    }
  }

  /**
   * 📊 同期データ生成
   */
  private generateSyncData(): BadgeSyncData {
    const badges = Array.from(this.badgeData.values());
    const completedBadges = badges.filter((b) => b.isUnlocked);
    const inProgressBadges = badges.filter((b) => b.progress > 0 && !b.isUnlocked);

    return {
      developmentDashboard: {
        totalBadges: badges.length,
        completedBadges: completedBadges.length,
        inProgress: inProgressBadges.length,
        lastSync: new Date(),
      },
      predictionSystem: {
        weeklyProgress: weeklyWorkPlanningService.getWeeklyProgress(1)?.progressPercentage || 0,
        estimatedCompletions: this.calculateEstimatedCompletions(),
        accuracyRate: 85, // 固定値（実装時は実際の精度を計算）
        lastSync: new Date(),
      },
      showcaseView: {
        recentAchievements: this.getRecentAchievements().length,
        totalProgress: this.calculateOverallProgress(),
        displayedBadges: badges.filter((b) => b.isUnlocked || b.progress > 0).length,
        lastSync: new Date(),
      },
    };
  }

  /**
   * 🎯 完了予測計算
   */
  private calculateEstimatedCompletions(): number {
    const inProgressBadges = Array.from(this.badgeData.values()).filter(
      (badge) => badge.progress > 0 && badge.progress < 100
    );

    return inProgressBadges.filter((badge) => badge.progress > 70).length;
  }

  /**
   * 📈 全体進捗計算
   */
  private calculateOverallProgress(): number {
    const badges = Array.from(this.badgeData.values());
    const totalProgress = badges.reduce((sum, badge) => sum + badge.progress, 0);
    return Math.round(totalProgress / badges.length);
  }

  /**
   * 🆕 最近の達成バッジ取得
   */
  private getRecentAchievements(): DevelopmentBadge[] {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return Array.from(this.badgeData.values())
      .filter((badge) => {
        if (!badge.isUnlocked || !badge.unlockedAt) return false;
        return new Date(badge.unlockedAt) > thirtyDaysAgo;
      })
      .map((badge) => this.convertToDevBadge(badge));
  }

  /**
   * 🔄 強制同期
   */
  public forceSyncAll(): void {
    console.log('🔄 強制同期実行中...');
    this.performPeriodicSync();
    this.emit('force-sync-completed', { timestamp: new Date() });
  }

  /**
   * 📊 バッジデータ取得（読み取り専用）
   * UnifiedBadgeからDevelopmentBadgeに変換して返す
   */
  public getBadgeData(): DevelopmentBadge[] {
    return Array.from(this.badgeData.values()).map((badge) => this.convertToDevBadge(badge));
  }

  /**
   * 🎯 特定バッジ取得
   * UnifiedBadgeからDevelopmentBadgeに変換して返す
   */
  public getBadge(badgeId: string): DevelopmentBadge | null {
    const badge = this.badgeData.get(badgeId);
    return badge ? this.convertToDevBadge(badge) : null;
  }

  /**
   * 🔄 統一バッジから開発バッジへの変換
   */
  private convertToDevBadge(unifiedBadge: UnifiedBadge): DevelopmentBadge {
    return {
      id: unifiedBadge.id,
      name: unifiedBadge.name,
      description: unifiedBadge.description,
      category: unifiedBadge.category as any, // 型変換
      difficulty: unifiedBadge.difficulty,
      icon: unifiedBadge.icon,
      requirements: unifiedBadge.requirements || [],
      isUnlocked: unifiedBadge.isUnlocked,
      unlockedAt: unifiedBadge.unlockedAt,
      progress: unifiedBadge.progress,
      nextMilestone: unifiedBadge.nextMilestone,
      prerequisites: unifiedBadge.prerequisites,
      isCompleted: unifiedBadge.progress >= 100,
      completedAt: unifiedBadge.completedAt,
      points: unifiedBadge.points,
      rewards: unifiedBadge.rewards,
    };
  }

  /**
   * 🏆 統一バッジデータ取得（統一フォーマット）
   */
  public getUnifiedBadgeData(): UnifiedBadge[] {
    return Array.from(this.badgeData.values()).map((badge) => ({ ...badge }));
  }

  /**
   * 📈 進捗状況取得
   */
  public getProgressData(): BadgeProgress[] {
    return Array.from(this.progressCache.values()).map((progress) => ({ ...progress }));
  }

  /**
   * 🧹 リソース解放
   */
  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.removeAllListeners();
  }
}

// シングルトンインスタンス
export const unifiedBadgeManagementService = UnifiedBadgeManagementService.getInstance();
