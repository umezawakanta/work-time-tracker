// src/components/todoAnalysis/types/index.ts

/**
 * タスクカテゴリの統計情報
 */
export interface CategoryStats {
  input: number;
  output: number;
  [key: string]: number;
}

/**
 * カテゴリの分布情報（0〜1の割合）
 */
export interface CategoryDistribution {
  input: number;
  output: number;
  [key: string]: number;
}

/**
 * タスク分析のサマリー情報
 */
export interface AnalysisSummary {
  completionRate: number;
  averageTasksPerDay: number;
  mostProductiveDay: string;
  categoryStats: CategoryStats;
  categoryDistribution: CategoryDistribution;
  recommendations: string[];
  lastUpdated: Date;
}

/**
 * 分析データの取得状態
 */
export interface AnalyticsState {
  summary: AnalysisSummary | null;
  isLoading: boolean;
  error: string | null;
}
