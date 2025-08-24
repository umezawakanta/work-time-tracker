import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './TodoProgress.module.css';

interface TodoProgressProps {
  readonly completedCount: number;
  readonly totalCount: number;
  readonly progressPercentage: number;
  readonly inputCount: number;
  readonly outputCount: number;
}

/**
 * Todo Progress Component
 * Displays completion progress and input/output balance
 */
export const TodoProgress: React.FC<TodoProgressProps> = ({
  completedCount,
  totalCount,
  progressPercentage,
  inputCount,
  outputCount,
}) => {
  const getProgressColorClass = (percentage: number): string => {
    if (percentage >= 80) return styles.progressGreen;
    if (percentage >= 60) return styles.progressBlue;
    if (percentage >= 40) return styles.progressYellow;
    return styles.progressRed;
  };

  const getProgressTextColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressMessage = (percentage: number): string => {
    if (percentage === 100) return '🎉 完璧です！';
    if (percentage >= 80) return '💪 素晴らしい進捗です！';
    if (percentage >= 60) return '👍 順調に進んでいます';
    if (percentage >= 40) return '📈 もう少しです';
    if (percentage > 0) return '🚀 頑張りましょう';
    return '📝 タスクを開始しましょう';
  };

  const getBalanceStatus = (): {
    status: 'balanced' | 'input-heavy' | 'output-heavy';
    message: string;
  } => {
    if (inputCount === 0 && outputCount === 0) {
      return { status: 'balanced', message: 'タスクを追加してバランスを確認' };
    }

    const ratio = inputCount / (inputCount + outputCount);

    if (ratio >= 0.4 && ratio <= 0.6) {
      return { status: 'balanced', message: 'バランスが取れています' };
    } else if (ratio > 0.6) {
      return { status: 'input-heavy', message: 'インプット重視' };
    } else {
      return { status: 'output-heavy', message: 'アウトプット重視' };
    }
  };

  // Round progress to nearest 5% for data attribute matching
  const getRoundedProgress = (percentage: number): number => {
    return Math.round(percentage / 5) * 5;
  };

  const balanceStatus = getBalanceStatus();
  const progressTextColorClass = getProgressTextColor(progressPercentage);
  const progressMessage = getProgressMessage(progressPercentage);
  const progressCSSColorClass = getProgressColorClass(progressPercentage);
  const roundedProgress = getRoundedProgress(progressPercentage);

  return (
    <CardContent className="pb-4 pt-2">
      {/* Empty State */}
      {totalCount === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle className={styles.emptyStateIcon} aria-hidden="true" />
          <p className="text-sm">まだタスクがありません</p>
          <p className="text-xs mt-1">タスクを追加して進捗を確認しましょう</p>
        </div>
      ) : (
        /* Progress Content */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className={`h-4 w-4 ${progressTextColorClass}`} aria-hidden="true" />
              <span className="text-sm font-medium">進捗状況</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {completedCount} / {totalCount}
              </span>
              <Badge
                variant="secondary"
                className={`text-xs ${progressTextColorClass} border-current`}
              >
                {progressPercentage}%
              </Badge>
            </div>
          </div>

          <div className={styles.progressContainer}>
            <Progress
              value={progressPercentage}
              className="h-2"
              aria-label={`進捗: ${progressPercentage}%`}
            />
            {/* Custom colored progress overlay */}
            <div
              className={`${styles.progressOverlay} ${progressCSSColorClass}`}
              data-progress={roundedProgress}
              aria-hidden="true"
            />
          </div>

          {/* Progress Message */}
          <div className={styles.progressMessage}>
            <span className={`text-xs font-medium ${progressTextColorClass}`}>
              {progressMessage}
            </span>
          </div>

          {/* Input/Output Balance */}
          <div className={styles.balanceContainer}>
            <div className={styles.balanceItems}>
              <div className={styles.balanceItem}>
                <TrendingDown className="h-3 w-3 text-blue-500" aria-hidden="true" />
                <span>インプット: {inputCount}</span>
              </div>
              <div className={styles.balanceItem}>
                <TrendingUp className="h-3 w-3 text-orange-500" aria-hidden="true" />
                <span>アウトプット: {outputCount}</span>
              </div>
            </div>

            <div className={styles.balanceItem}>
              <Target
                className={`h-3 w-3 ${
                  balanceStatus.status === 'balanced' ? 'text-green-500' : 'text-yellow-500'
                }`}
                aria-hidden="true"
              />
              <span
                className={
                  balanceStatus.status === 'balanced' ? 'text-green-600' : 'text-yellow-600'
                }
              >
                {balanceStatus.message}
              </span>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  );
};
