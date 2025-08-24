import React from 'react';
import { renderMonthlyMetrics } from './MonthlyOverviewView_Metrics';
import { renderCategoryProgress } from './MonthlyOverviewView_Categories';
import { renderTrendAnalysis } from './MonthlyOverviewView_Trends';
import { renderMonthlyAchievements } from './MonthlyOverviewView_Achievements';
import { renderWeeklyBreakdown } from './MonthlyOverviewView_WeeklyBreakdown';
import { renderNextMonthPredictions } from './MonthlyOverviewView_Predictions';

// 完全な月次概要ビューレンダリング関数
const renderMonthlyView = () => {
  const monthlyData = generateMonthlyOverviewData();

  return (
    <div className="space-y-6">
      {/* メトリクス表示 */}
      {renderMonthlyMetrics(monthlyData.metrics)}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* カテゴリ別進捗 */}
        {renderCategoryProgress(monthlyData.categories)}

        {/* トレンド分析 */}
        {renderTrendAnalysis(monthlyData.trends)}
      </div>

      {/* 達成バッジ */}
      {renderMonthlyAchievements(monthlyData.achievements)}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 週次内訳 */}
        {renderWeeklyBreakdown(monthlyData.weeklyBreakdown)}

        {/* 来月予測 */}
        {renderNextMonthPredictions(monthlyData.predictions)}
      </div>
    </div>
  );
};

const generateMonthlyOverviewData = () => {
  return {
    metrics: {
      month: 'July',
      year: 2025,
      totalBadges: 15,
      completedBadges: 8,
      inProgressBadges: 5,
      plannedHours: 120,
      actualHours: 95,
      efficiency: 85,
      completionRate: 53,
      averageConfidence: 78,
      streakDays: 12,
      topPerformingCategory: 'セキュリティ',
    },
    categories: [],
    trends: [],
    achievements: [],
    weeklyBreakdown: [],
    predictions: {
      nextMonthBadges: 12,
      nextMonthHours: 150,
      recommendedFocus: ['AI・機械学習', 'プロジェクト管理', 'デザイン・UX'],
    },
  };
};
