import { useState, useEffect, useCallback } from 'react';
import {
  universalPageSyncService,
  UniversalPageState,
  SyncMetrics,
} from '@/services/integration/UniversalPageSyncService';

export interface UseUniversalPageSyncResult {
  pageState: UniversalPageState | null;
  allPageStates: UniversalPageState[];
  syncMetrics: SyncMetrics;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 🔄 ユニバーサルページ同期フック
 * 全23ページ間のリアルタイム同期を提供
 */
export const useUniversalPageSync = (currentPageId: string): UseUniversalPageSyncResult => {
  const [pageState, setPageState] = useState<UniversalPageState | null>(null);
  const [allPageStates, setAllPageStates] = useState<UniversalPageState[]>([]);
  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics>({
    totalPages: 0,
    activeSyncs: 0,
    syncSuccessRate: 0,
    averageSyncTime: 0,
    pendingUpdates: 0,
    errorCount: 0,
    lastFullSync: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      const currentState = universalPageSyncService.getPageState(currentPageId);
      const allStates = universalPageSyncService.getAllPageStates();
      const metrics = universalPageSyncService.getSyncMetrics();

      setPageState(currentState || null);
      setAllPageStates(allStates);
      setSyncMetrics(metrics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '同期エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [currentPageId]);

  useEffect(() => {
    // 初期データ取得
    refresh();

    // 定期更新
    const interval = setInterval(refresh, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [refresh]);

  return {
    pageState,
    allPageStates,
    syncMetrics,
    isLoading,
    error,
    refresh,
  };
};

/**
 * 🏆 バッジ進捗監視フック
 * ページ間のバッジ進捗同期を監視
 */
export const useBadgeSync = (pageId: string) => {
  const { pageState } = useUniversalPageSync(pageId);

  return {
    badgeProgress: pageState?.badgeProgress || {},
    totalBadges: Object.keys(pageState?.badgeProgress || {}).length,
    completedBadges: Object.values(pageState?.badgeProgress || {}).filter(
      (progress) => progress >= 100
    ).length,
    averageProgress:
      Object.values(pageState?.badgeProgress || {}).reduce((sum, progress) => sum + progress, 0) /
      Math.max(1, Object.keys(pageState?.badgeProgress || {}).length),
  };
};

/**
 * 📊 ページメトリクス監視フック
 * リアルタイムメトリクス更新を提供
 */
export const usePageMetrics = (pageId: string) => {
  const { pageState } = useUniversalPageSync(pageId);

  return {
    metrics: pageState?.metrics || {},
    isActive: pageState?.isActive || false,
    lastUpdated: pageState?.lastUpdated || '',
    syncStatus: pageState?.syncStatus || 'idle',
    pendingUpdates: pageState?.pendingUpdates || 0,
    connections: pageState?.connections || [],
  };
};
