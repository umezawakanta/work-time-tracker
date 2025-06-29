/**
 * タスク統計情報の型定義
 */

// 基本的なタスク統計
export interface TodoStats {
  // 基本カウント
  totalTasks: number; // 総タスク数
  completedTasks: number; // 完了済みタスク数
  completionRate: number; // 完了率（%）

  // タイプ別
  inputTasks: number; // インプットタスク数
  outputTasks: number; // アウトプットタスク数
  inputOutputRatio: number; // インプット/アウトプット比率

  // 時間管理
  averageCompletionTime: number; // 平均完了時間（分）
  tasksCompletedBeforeDeadline: number; // 期限内に完了したタスク数
  tasksCompletedAfterDeadline: number; // 期限を過ぎて完了したタスク数
  deadlineMeetRate: number; // 期限内完了率（%）

  // 継続性
  streakDays: number; // 現在の連続達成日数
  longestStreak: number; // 最長連続達成記録
}

// 詳細な日次統計
export interface DailyTodoStats {
  date: string; // 日付（YYYY-MM-DD）
  tasksCompleted: number; // その日に完了したタスク数
  tasksCreated: number; // その日に作成されたタスク数
  inputTasksCompleted: number; // その日に完了したインプットタスク数
  outputTasksCompleted: number; // その日に完了したアウトプットタスク数
  totalTimeSpent: number; // その日のタスク所要時間合計（分）
  deadlineMet: number; // その日に期限内に完了したタスク数
  deadlineMissed: number; // その日に期限を過ぎて完了したタスク数
}

// 詳細な時間帯別統計
export interface HourlyStats {
  hour: number; // 時間帯（0-23）
  tasksCompleted: number; // その時間帯に完了したタスク数
  productivityScore: number; // 生産性スコア（0-100）
}

// タスク完了の傾向分析
export interface CompletionTrends {
  weekdayCompletion: Record<string, number>; // 曜日別完了タスク数
  hourlyCompletion: Record<number, number>; // 時間帯別完了タスク数
  mostProductiveDay: string; // 最も生産的な曜日
  mostProductiveTime: string; // 最も生産的な時間帯
  leastProductiveDay: string; // 最も生産的でない曜日
  leastProductiveTime: string; // 最も生産的でない時間帯
}

// タグ統計
export interface TagStats {
  tagName: string; // タグ名
  count: number; // タスク数
  completionRate: number; // そのタグの完了率
  averageCompletionTime: number; // そのタグの平均完了時間
}

// 総合分析
export interface AnalysisSummary {
  productivityTrend: 'increasing' | 'stable' | 'decreasing'; // 生産性トレンド
  focusScore: number; // 集中力スコア（0-100）
  consistencyScore: number; // 一貫性スコア（0-100）
  balanceScore: number; // インプット/アウトプットバランススコア（0-100）
  suggestions: string[]; // 改善提案
}

// 詳細タスク統計レポート（プレミアム機能）
export interface DetailedTodoReport {
  basicStats: TodoStats;
  dailyStats: DailyTodoStats[];
  hourlyStats: HourlyStats[];
  trends: CompletionTrends;
  tagStats: TagStats[];
  analysis: AnalysisSummary;
  generatedAt: string; // レポート生成日時
}

// エクスポート形式オプション
export type ExportFormat = 'csv' | 'json' | 'ical' | 'xlsx' | 'pdf';

// インポート形式オプション
export type ImportFormat = 'csv' | 'json' | 'auto' | 'unknown';
