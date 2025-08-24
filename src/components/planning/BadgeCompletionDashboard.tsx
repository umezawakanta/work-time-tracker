import React from 'react';
import BadgeCompletionPredictionSystem from '@/components/badges/BadgeCompletionPredictionSystem';

interface BadgeCompletionDashboardProps {
  className?: string;
}

/**
 * 🎯 バッジ完了予測ダッシュボード - 12週間詳細予測システム
 * ユーザー要求の具体的な日付ベース予測（2025年6月28日〜8月22日）とリアルタイム実績管理
 */
export const BadgeCompletionDashboard: React.FC<BadgeCompletionDashboardProps> = ({
  className,
}) => {
  return (
    <div className={className}>
      <BadgeCompletionPredictionSystem />
    </div>
  );
};
