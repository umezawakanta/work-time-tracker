/**
 * ToDoリストで使用される型定義
 */

// タスクのタイプ
export type TaskType = 'input' | 'output';

// ソートオプション
export type SortOption = 'priority' | 'newest' | 'deadline' | 'type';

// フィルタータイプ
export type FilterType = 'status' | 'category' | 'tag' | 'priority' | 'date' | 'search';

// クイックフィルター
export type QuickFilterOption = 'none' | 'today' | 'important' | 'inputOnly' | 'outputOnly';

// 優先度
export type PriorityLevel = 'high' | 'medium' | 'low' | 'none';

// タグ型
export interface TagInfo {
  id: string;
  name: string;
  color?: string;
}

// タスクの基本情報
export interface Todo {
  id: string; // プライマリID
  _id?: string; // MongoDBのユニークID (オプショナル)
  task: string; // タスク内容
  completed: boolean; // 完了状態
  priority: number; // 優先度 (1-5、5が最高)
  isPrioritized: boolean; // 優先タスクかどうか
  type: 'input' | 'output'; // タスクタイプ
  category?: string; // カテゴリ
  tags?: string[]; // タグ
  userId?: string; // ユーザーID
  createdAt?: Date | string; // 作成日時
  updatedAt?: Date | string; // 更新日時
  dueDate?: Date | string; // 期限
  estimatedTime?: number; // 予想作業時間（分）
  actualTime?: number; // 実際の作業時間（分）
  notes?: string; // メモ
  
  // 拡張プロパティ（後方互換性）
  priorityLevel?: PriorityLevel; // 優先度レベル
  completedDate?: string | null; // 完了日時 (ISO文字列)
  completedAt?: string; // 互換性のため
  deadline?: string; // 期限 (ISO文字列) - 互換性のため
  note?: string; // メモ - 互換性のため
  text?: string; // 互換性のため
  efficiency?: TodoEfficiency; // タスク効率分析（プレミアム機能）
  recurrence?: TodoRecurrence; // 繰り返し設定（プレミアム機能）
  reminders?: TodoReminder[]; // リマインダー（プレミアム機能）
  attachments?: TodoAttachment[]; // 添付ファイル（プレミアム機能）
  visibility?: 'private' | 'public' | 'shared'; // タスクの公開設定（プレミアム機能）
  sharedWith?: string[]; // 共有ユーザー（プレミアム機能）
}

// タスク更新用の型
export interface TodoUpdate {
  _id: string;
  updates: Partial<Omit<Todo, '_id'>>;
}

// 新規タスク作成用の型
export interface NewTodo {
  task: string;
  type: TaskType;
  priority?: number;
  priorityLevel?: PriorityLevel;
  deadline?: string;
  isPrioritized?: boolean;
  note?: string;
  tags?: string[];
  recurrence?: TodoRecurrence;
  reminders?: TodoReminder[];
  attachments?: TodoAttachment[];
}

// タスク効率分析（プレミアム機能）
export interface TodoEfficiency {
  completionTime?: number; // 完了までの時間（分）
  beforeDeadline?: boolean; // 期限内に完了したか
  similarTasksAvgTime?: number; // 同様のタスクの平均完了時間
  productiveTimeOfDay?: string; // 最も生産的な時間帯
  recommendedPriority?: number; // 推奨される優先度
  efficiencyScore?: number; // 効率スコア (0-100)
  suggestion?: string; // AI提案
}

// タスク履歴エントリ
export interface TodoHistoryEntry {
  date: string; // 日付 (YYYY-MM-DD)
  count: number; // 完了タスク数
  inputCount?: number; // インプットタスク数
  outputCount?: number; // アウトプットタスク数
  averageTime?: number; // 平均完了時間（分）
  totalTime?: number; // 総作業時間（分）
}

// タスク分析サマリー（プレミアム機能）
export interface TodoAnalysisSummary {
  totalCompleted: number; // 合計完了タスク数
  averageCompletionTime: number; // 平均完了時間（分）
  inputOutputRatio: number; // インプット/アウトプット比率
  mostProductiveDay: string; // 最も生産的な曜日
  mostProductiveTime: string; // 最も生産的な時間帯
  completionRate: number; // 完了率（%）
  deadlineMeetRate: number; // 期限内完了率（%）
  streakDays: number; // 連続達成日数
  recommendations: string[]; // 改善提案
  focusTime?: number; // 集中時間（分）
  distracted?: number; // 気が散った回数
  taskSwitches?: number; // タスク切り替え回数
}

// フィルタリング条件
export interface TodoFilter {
  completed?: boolean;
  type?: TaskType;
  hasDeadline?: boolean;
  isPrioritized?: boolean;
  priorityLevel?: PriorityLevel;
  tags?: string[];
  searchQuery?: string;
  dateRange?: [Date | null, Date | null];
  quickFilter?: QuickFilterOption;
}

// 繰り返し設定（プレミアム機能）
export interface TodoRecurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  weekdays?: number[];
  monthDay?: number;
  endDate?: string;
  endCount?: number;
}

// リマインダー（プレミアム機能）
export interface TodoReminder {
  id: string;
  time: string;
  type: 'push' | 'email' | 'both';
  message?: string;
  sent: boolean;
}

// 添付ファイル（プレミアム機能）
export interface TodoAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// タスク統計（プレミアム機能）
export interface TodoStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  inputTasks: number;
  outputTasks: number;
  inputOutputRatio: number;
  tasksCompletedBeforeDeadline: number;
  tasksCompletedAfterDeadline: number;
  deadlineMeetRate: number;
  streakDays: number;
  longestStreak: number;
}

// インポート/エクスポート設定（プレミアム機能）
export interface ImportExportOptions {
  format: 'csv' | 'json' | 'excel';
  includeCompleted: boolean;
  includeHistory: boolean;
  dateRange?: [Date, Date];
  fields?: Array<keyof Todo>;
}

// 表示設定
export interface ViewSettings {
  sortOption: SortOption;
  groupBy?: 'none' | 'date' | 'priority' | 'type' | 'tag';
  showCompleted: boolean;
  compactView: boolean;
  darkMode: boolean;
  language: string;
  timezone: string;
}

// ユーザー設定（プレミアム機能）
export interface UserSettings {
  name: string;
  email: string;
  isPremium: boolean;
  premiumUntil?: string;
  viewSettings: ViewSettings;
  notifications: {
    email: boolean;
    push: boolean;
    reminderTime: number; // 分単位
  };
  integrations: {
    calendar: boolean;
    email: boolean;
    slack: boolean;
  };
}
