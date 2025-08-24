import React from 'react';
import { TrendingUp, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoHeaderMetricsProps {
  completedToday: number;
  totalToday: number;
  productivityScore: number;
  completionRate: number;
}

/**
 * TodoHeaderMetrics Component
 * リアルタイムのパフォーマンスメトリクスを表示
 */
export const TodoHeaderMetrics: React.FC<TodoHeaderMetricsProps> = React.memo(
  ({ completedToday, totalToday, productivityScore, completionRate }) => {
    const getScoreColor = (score: number): string => {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getCompletionColor = (rate: number): string => {
      if (rate >= 80) return 'text-green-600';
      if (rate >= 50) return 'text-yellow-600';
      return 'text-gray-600';
    };

    return (
      <div className="flex items-center gap-4 mt-2">
        {/* 完了率 */}
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs text-gray-600">
            完了:
            <span className={cn('font-semibold ml-1', getCompletionColor(completionRate))}>
              {completedToday}/{totalToday}
            </span>
          </span>
        </div>

        {/* 生産性スコア */}
        {productivityScore > 0 && (
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs text-gray-600">
              スコア:
              <span className={cn('font-semibold ml-1', getScoreColor(productivityScore))}>
                {productivityScore}%
              </span>
            </span>
          </div>
        )}

        {/* トレンド表示 */}
        {completionRate >= 80 && (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs text-green-600 font-medium">好調</span>
          </div>
        )}
      </div>
    );
  }
);

TodoHeaderMetrics.displayName = 'TodoHeaderMetrics';
