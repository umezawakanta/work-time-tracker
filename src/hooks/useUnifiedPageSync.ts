import { useEffect, useCallback, useState } from 'react';
import { DevelopmentBadge } from '@/types/development-badges';
import {
  EXPANDED_BADGES_DATABASE,
  getBadgeStatsSummary,
} from '@/services/development/ExpandedBadgesDatabase';

export interface PageActivity {
  pageName: string;
  activityType: string;
  timestamp: string;
  badgeImpacts: Array<{
    badgeId: string;
    progressDelta: number;
    reason: string;
  }>;
}

export interface UnifiedSyncState {
  isActive: boolean;
  lastSync: string;
  pageActivities: PageActivity[];
  syncedPages: Set<string>;
  totalBadgeProgress: number;
  recentCompletions: DevelopmentBadge[];
}

// ページとバッジカテゴリの関係定義
const PAGE_CATEGORY_MAPPING: Record<string, string[]> = {
  home: ['business', 'analytics', 'management'],
  'integrated-dashboard': ['analytics', 'monitoring', 'business'],
  todos: ['business', 'project_management', 'systematization'],
  'automation-rules': ['automation', 'systematization'],
  'development-badges': ['foundation', 'testing', 'cicd'],
  'badge-prediction': ['analytics', 'ai_ml', 'planning'],
  'badge-showcase': ['achievement', 'social'],
  'wbs-creation': ['project_management', 'planning'],
  'ai-wbs-generation': ['ai_ml', 'automation'],
  gamification: ['engagement', 'motivation'],
  'attendance-management': ['business', 'operations'],
  reports: ['analytics', 'business', 'documentation'],
  'improvement-planning': ['planning', 'optimization'],
  'system-design': ['architecture', 'design'],
  'admin-dashboard': ['management', 'operations'],
  'api-testing': ['testing', 'quality_assurance'],
  'quality-dashboard': ['quality_assurance', 'monitoring'],
  'error-monitoring': ['monitoring', 'reliability'],
  'performance-monitoring': ['performance', 'optimization'],
  profile: ['personal', 'achievement'],
  settings: ['systematization', 'operations'],
  achievements: ['achievement', 'progress'],
};

export const useUnifiedPageSync = (currentPage?: string) => {
  const [syncState, setSyncState] = useState<UnifiedSyncState>({
    isActive: false,
    lastSync: '',
    pageActivities: [],
    syncedPages: new Set(),
    totalBadgeProgress: 0,
    recentCompletions: [],
  });

  /**
   * ページアクティビティを記録
   */
  const recordActivity = useCallback(
    (pageName: string, activityType: string, metadata?: Record<string, any>) => {
      const timestamp = new Date().toISOString();
      const badgeImpacts = calculateBadgeImpact(pageName, activityType);

      const activity: PageActivity = {
        pageName,
        activityType,
        timestamp,
        badgeImpacts,
      };

      // バッジ進捗を実際に更新
      updateBadgeProgress(badgeImpacts);

      setSyncState((prev) => ({
        ...prev,
        pageActivities: [...prev.pageActivities.slice(-49), activity], // 最新50件を保持
        syncedPages: new Set([...prev.syncedPages, pageName]),
        lastSync: timestamp,
      }));

      console.log(`🔄 Page Sync: ${pageName} - ${activityType}`, { badgeImpacts, metadata });
    },
    []
  );

  /**
   * バッジ進捗への影響を計算
   */
  const calculateBadgeImpact = useCallback((pageName: string, activityType: string) => {
    const relevantCategories = PAGE_CATEGORY_MAPPING[pageName] || [];
    const impacts: Array<{ badgeId: string; progressDelta: number; reason: string }> = [];

    EXPANDED_BADGES_DATABASE.forEach((badge) => {
      if (badge.isCompleted || !relevantCategories.includes(badge.category)) return;

      let progressDelta = 0;
      let reason = '';

      // アクティビティタイプごとの進捗計算
      switch (activityType) {
        case 'page_visit':
          progressDelta = 0.5;
          reason = `${pageName}への訪問`;
          break;
        case 'task_completed':
          if (badge.category === 'business') {
            progressDelta = 3;
            reason = 'タスク完了による生産性向上';
          }
          break;
        case 'automation_created':
          if (badge.category === 'automation') {
            progressDelta = 5;
            reason = '自動化ルール作成';
          }
          break;
        case 'badge_reviewed':
          if (badge.category === 'foundation') {
            progressDelta = 2;
            reason = 'バッジ進捗レビュー';
          }
          break;
        case 'report_generated':
          if (badge.category === 'analytics') {
            progressDelta = 4;
            reason = 'レポート作成・分析';
          }
          break;
        case 'test_executed':
          if (badge.category === 'testing') {
            progressDelta = 4;
            reason = 'テスト実行・品質向上';
          }
          break;
        case 'monitoring_configured':
          if (badge.category === 'monitoring') {
            progressDelta = 3;
            reason = '監視・アラート設定';
          }
          break;
        case 'wbs_created':
          if (badge.category === 'project_management') {
            progressDelta = 5;
            reason = 'WBS作成・プロジェクト管理';
          }
          break;
        case 'ai_feature_used':
          if (badge.category === 'ai_ml') {
            progressDelta = 4;
            reason = 'AI機能活用';
          }
          break;
        case 'performance_optimized':
          if (badge.category === 'performance') {
            progressDelta = 3;
            reason = 'パフォーマンス最適化';
          }
          break;
        default:
          // 一般的なアクティビティ
          progressDelta = 1;
          reason = `${pageName}でのアクティビティ`;
      }

      if (progressDelta > 0) {
        impacts.push({ badgeId: badge.id, progressDelta, reason });
      }
    });

    return impacts;
  }, []);

  /**
   * バッジ進捗を実際に更新
   */
  const updateBadgeProgress = useCallback(
    (impacts: Array<{ badgeId: string; progressDelta: number; reason: string }>) => {
      const newCompletions: DevelopmentBadge[] = [];

      impacts.forEach((impact) => {
        const badge = EXPANDED_BADGES_DATABASE.find((b) => b.id === impact.badgeId);
        if (badge && !badge.isCompleted) {
          const newProgress = Math.min(100, badge.progress + impact.progressDelta);
          badge.progress = newProgress;

          if (newProgress >= 100) {
            badge.isCompleted = true;
            badge.completedAt = new Date().toISOString();
            newCompletions.push(badge);

            // バッジ完了通知
            console.log(`🏆 バッジ完了: ${badge.name} (${badge.points}pt)`);
          }
        }
      });

      if (newCompletions.length > 0) {
        setSyncState((prev) => ({
          ...prev,
          recentCompletions: [...prev.recentCompletions, ...newCompletions].slice(-10),
        }));
      }
    },
    []
  );

  /**
   * 現在のページに関連するバッジを取得
   */
  const getPageRelevantBadges = useCallback((pageName: string): DevelopmentBadge[] => {
    const relevantCategories = PAGE_CATEGORY_MAPPING[pageName] || [];
    return EXPANDED_BADGES_DATABASE.filter((badge) => relevantCategories.includes(badge.category));
  }, []);

  /**
   * ページの推奨アクションを生成
   */
  const getRecommendedActions = useCallback(
    (pageName: string) => {
      const relevantBadges = getPageRelevantBadges(pageName);
      const nearCompletionBadges = relevantBadges
        .filter((badge) => !badge.isCompleted && badge.progress >= 70)
        .sort((a, b) => b.progress - a.progress);

      const actions = nearCompletionBadges.slice(0, 3).map((badge) => ({
        badgeId: badge.id,
        badgeName: badge.name,
        currentProgress: badge.progress,
        remainingProgress: 100 - badge.progress,
        recommendedAction: generateActionForBadge(badge, pageName),
        priority: badge.progress,
      }));

      return actions;
    },
    [getPageRelevantBadges]
  );

  /**
   * バッジに対する推奨アクションを生成
   */
  const generateActionForBadge = (badge: DevelopmentBadge, pageName: string): string => {
    const actionMap: Record<string, Record<string, string>> = {
      business: {
        todos: 'さらにタスクを完了して生産性を向上させましょう',
        default: 'タスク管理を活用して生産性を高めましょう',
      },
      automation: {
        'automation-rules': '自動化ルールを追加作成しましょう',
        default: '自動化機能を活用してワークフローを改善しましょう',
      },
      testing: {
        'api-testing': 'API品質テストを実行しましょう',
        default: 'テスト機能を活用して品質を向上させましょう',
      },
      analytics: {
        reports: 'レポートを作成して分析を深めましょう',
        default: 'データ分析機能を活用してインサイトを得ましょう',
      },
      monitoring: {
        'error-monitoring': 'エラー監視を設定して信頼性を向上させましょう',
        'performance-monitoring': 'パフォーマンス監視を活用しましょう',
        default: '監視機能を設定してシステムの安定性を向上させましょう',
      },
    };

    const categoryActions = actionMap[badge.category];
    if (categoryActions) {
      return categoryActions[pageName] || categoryActions['default'];
    }

    return `${badge.name}の達成に向けて${pageName}の機能を活用しましょう`;
  };

  /**
   * 統合ダッシュボード用の統計を取得
   */
  const getUnifiedStats = useCallback(() => {
    const stats = getBadgeStatsSummary();
    const recentActivities = syncState.pageActivities.slice(-10);
    const activePagesCount = syncState.syncedPages.size;

    return {
      totalBadges: stats.totalBadges,
      completedBadges: stats.completedBadges,
      inProgressBadges: stats.inProgressBadges,
      completionRate: stats.completionRate,
      totalPoints: stats.totalPoints,
      activePagesCount,
      recentActivitiesCount: recentActivities.length,
      recentCompletions: syncState.recentCompletions,
      syncStatus: {
        isActive: syncState.isActive,
        lastSync: syncState.lastSync,
        syncedPages: Array.from(syncState.syncedPages),
      },
    };
  }, [syncState]);

  /**
   * 同期を開始
   */
  const startSync = useCallback(() => {
    setSyncState((prev) => ({
      ...prev,
      isActive: true,
      lastSync: new Date().toISOString(),
    }));

    // 現在のページの初期訪問を記録
    if (currentPage) {
      recordActivity(currentPage, 'page_visit');
    }
  }, [currentPage, recordActivity]);

  /**
   * 同期を停止
   */
  const stopSync = useCallback(() => {
    setSyncState((prev) => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  // 自動同期開始
  useEffect(() => {
    startSync();

    // 定期的な統計更新
    const interval = setInterval(() => {
      setSyncState((prev) => ({
        ...prev,
        totalBadgeProgress: getBadgeStatsSummary().completionRate,
        lastSync: new Date().toISOString(),
      }));
    }, 5000);

    return () => {
      clearInterval(interval);
      stopSync();
    };
  }, [startSync, stopSync]);

  return {
    syncState,
    recordActivity,
    getPageRelevantBadges,
    getRecommendedActions,
    getUnifiedStats,
    startSync,
    stopSync,
  };
};

export default useUnifiedPageSync;
