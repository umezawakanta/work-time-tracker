import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { resetTodoList, fetchTodoHistory, fetchDailyTodoHistory } from '@/store/todoSlice';
import { AppDispatch } from '@/store';
import StreakDisplay from '../sections/StreakDisplay';
import { PremiumBadge } from './PremiumBadge';
import { ResetConfirmDialog } from './ResetConfirmDialog';
import { TodoHeaderMetrics } from './TodoHeaderMetrics';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

interface TodoHeaderProps {
  readonly hasPremium: boolean;
  readonly streakCount: number;
  readonly completedToday?: number;
  readonly totalToday?: number;
  readonly productivityScore?: number;
}

/**
 * TodoHeader Component
 * エンタープライズグレードのタスク管理ヘッダー
 * パフォーマンス最適化とアクセシビリティを考慮した設計
 */
export const TodoHeader: React.FC<TodoHeaderProps> = React.memo(
  ({ hasPremium, streakCount, completedToday = 0, totalToday = 0, productivityScore = 0 }) => {
    const dispatch = useDispatch<AppDispatch>();
    const analytics = useAnalytics();
    const performanceMonitor = usePerformanceMonitor('TodoHeader');

    const [showResetDialog, setShowResetDialog] = React.useState(false);
    const [isResetting, setIsResetting] = React.useState(false);

    // パフォーマンス最適化されたリセットハンドラー
    const handleResetTodos = useCallback(async (): Promise<void> => {
      performanceMonitor.startMeasurement('resetTodos');
      setIsResetting(true);

      try {
        // Analytics tracking
        analytics.track('todo_reset_initiated', {
          streakCount,
          completedToday,
          totalToday,
          productivityScore,
        });

        await dispatch(resetTodoList()).unwrap();

        // 並列実行でパフォーマンス向上
        await Promise.all([
          dispatch(fetchTodoHistory()).unwrap(),
          dispatch(fetchDailyTodoHistory()).unwrap(),
        ]);

        toast.success('新しい日の準備ができました。今日も頑張りましょう！', {
          duration: 4000,
          position: 'top-center',
          icon: '🎯',
        });

        analytics.track('todo_reset_completed', {
          success: true,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '不明なエラー';

        console.error('Reset error:', err);

        toast.error(`エラーが発生しました: ${errorMessage}`, {
          duration: 5000,
          position: 'top-center',
        });

        analytics.track('todo_reset_failed', {
          error: errorMessage,
        });
      } finally {
        setIsResetting(false);
        performanceMonitor.endMeasurement('resetTodos');
      }
    }, [
      dispatch,
      analytics,
      performanceMonitor,
      streakCount,
      completedToday,
      totalToday,
      productivityScore,
    ]);

    // メトリクスデータの最適化
    const metricsData = useMemo(
      () => ({
        completedToday,
        totalToday,
        productivityScore,
        completionRate: totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0,
      }),
      [completedToday, totalToday, productivityScore]
    );

    return (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="todo-header-info flex-1">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              本日のToDoリスト
            </CardTitle>
            <CardDescription className="text-sm">
              登録したことは必ずやり遂げましょう
            </CardDescription>
            {hasPremium && totalToday > 0 && <TodoHeaderMetrics {...metricsData} />}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {hasPremium && <PremiumBadge variant="compact" />}

            <StreakDisplay streakCount={streakCount} />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              disabled={isResetting}
              className="reset-button transition-all hover:scale-105"
              aria-label="1日を締める"
            >
              <RefreshCcw
                className={`h-4 w-4 mr-1 ${isResetting ? 'animate-spin' : ''}`}
                size={16}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">{isResetting ? '処理中...' : '1日を締める'}</span>
            </Button>

            {hasPremium && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  /* AI提案モーダルを開く */
                }}
                className="transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">AI提案</span>
              </Button>
            )}
          </div>
        </div>

        <ResetConfirmDialog
          open={showResetDialog}
          onOpenChange={setShowResetDialog}
          onConfirm={handleResetTodos}
          isLoading={isResetting}
          stats={{
            completedCount: completedToday,
            totalCount: totalToday,
            streakCount,
          }}
        />
      </>
    );
  }
);

TodoHeader.displayName = 'TodoHeader';
