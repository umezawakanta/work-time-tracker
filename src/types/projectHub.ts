/**
 * サイト改善計画、WBS、ToDoリストを統合するプロジェクトハブの型定義
 */

import { Todo as _Todo, PriorityLevel } from './todo';
import { WBSNode as _WBSNode, WBSProject as _WBSProject } from './wbs';

// 統合プロジェクトの状態
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';

// 統合プロジェクトタイプ
export type ProjectType = 'improvement' | 'feature' | 'maintenance' | 'research';

// 統合プロジェクト
export interface ProjectHubProject {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: PriorityLevel;
  phase: string; // phase0, phase1, etc.

  // タイムライン
  startDate: string;
  endDate: string;
  estimatedDays: number;
  actualDays?: number;

  // 進捗管理
  progress: number; // 0-100
  milestones: ProjectMilestone[];

  // 関連リソース
  improvementItemId?: string; // サイト改善計画のアイテムID
  wbsProjectId?: string; // WBSプロジェクトID
  wbsNodes: string[]; // 関連するWBSノードID
  todoIds: string[]; // 関連するToDoアイテムID

  // メタデータ
  category: string;
  tags: string[];
  assignees: string[];
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// プロジェクトマイルストーン
export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  dependencies: string[];
  deliverables: string[];
}

// 統合タスク（ToDoとWBSノードを統合）
export interface IntegratedTask {
  id: string;
  projectId: string;

  // 基本情報
  title: string;
  description: string;
  type: 'todo' | 'wbs-node' | 'milestone';

  // 状態管理
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'deferred';
  priority: PriorityLevel;
  progress: number;

  // タイムライン
  startDate?: string;
  endDate?: string;
  deadline?: string;
  estimatedHours: number;
  actualHours: number;

  // 関係性
  parentId?: string; // 親タスク
  dependencies: string[];
  children: string[];

  // ソースデータ
  sourceType: 'improvement' | 'wbs' | 'todo';
  sourceId: string;

  // 同期情報
  lastSyncAt: string;
  syncStatus: 'synced' | 'pending' | 'error';

  // 追加情報
  assignees: string[];
  tags: string[];
  checklist: TaskChecklistItem[];
}

// タスクチェックリストアイテム
export interface TaskChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  assignee?: string;
  completedAt?: string;
}

// プロジェクト進捗サマリー
export interface ProjectProgressSummary {
  projectId: string;

  // 全体進捗
  overallProgress: number;
  completedTasks: number;
  totalTasks: number;

  // タイプ別進捗
  improvementProgress: number;
  wbsProgress: number;
  todoProgress: number;

  // 時間管理
  estimatedHours: number;
  actualHours: number;
  remainingHours: number;

  // 期限管理
  onTrack: boolean;
  daysRemaining: number;
  overdueTasksCount: number;

  // パフォーマンス指標
  velocityScore: number; // 完了速度
  qualityScore: number; // 品質スコア
  teamEfficiency: number; // チーム効率

  // アラート
  alerts: ProjectAlert[];
  recommendations: string[];
}

// プロジェクトアラート
export interface ProjectAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  relatedTaskIds: string[];
  actionRequired: boolean;
  dueDate?: string;
}

// 同期設定
export interface SyncConfiguration {
  autoSync: boolean;
  syncInterval: number; // 分単位
  conflictResolution: 'manual' | 'auto-improvement' | 'auto-wbs' | 'auto-todo';
  lastSyncAt: string;
  syncHistory: SyncEvent[];
}

// 同期イベント
export interface SyncEvent {
  id: string;
  timestamp: string;
  type: 'full-sync' | 'partial-sync' | 'conflict-resolution';
  status: 'success' | 'error' | 'partial';
  changesCount: number;
  conflicts: SyncConflict[];
  duration: number; // ミリ秒
}

// 同期コンフリクト
export interface SyncConflict {
  id: string;
  type: 'data-mismatch' | 'deletion-conflict' | 'dependency-conflict';
  sourceType: 'improvement' | 'wbs' | 'todo';
  sourceId: string;
  conflictData: {
    improvement?: Record<string, unknown>;
    wbs?: Record<string, unknown>;
    todo?: Record<string, unknown>;
  };
  resolution?: 'keep-improvement' | 'keep-wbs' | 'keep-todo' | 'manual';
  resolvedAt?: string;
  resolvedBy?: string;
}

// ダッシュボード設定
export interface DashboardConfiguration {
  userId: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval: number;
  notifications: NotificationSettings;
}

// ダッシュボードレイアウト
export interface DashboardLayout {
  type: 'grid' | 'list' | 'kanban';
  columns: number;
  compactMode: boolean;
  showSidebar: boolean;
  theme: 'light' | 'dark' | 'auto';
}

// ダッシュボードウィジェット
export interface DashboardWidget {
  id: string;
  type: 'progress-overview' | 'task-list' | 'timeline' | 'alerts' | 'metrics';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  configuration: {
    'progress-overview'?: { showPercentage: boolean; showTrend: boolean };
    'task-list'?: { sortBy: string; filterStatus: string[] };
    timeline?: { startDate: string; endDate: string };
    alerts?: { severity: string[] };
    metrics?: { metrics: string[] };
  };
  visible: boolean;
}

// ダッシュボードフィルター
export interface DashboardFilter {
  type: 'project' | 'status' | 'priority' | 'assignee' | 'tag' | 'date';
  value: string | string[] | { start: string; end: string };
  active: boolean;
}

// 通知設定
export interface NotificationSettings {
  projectUpdates: boolean;
  taskDeadlines: boolean;
  milestoneAlerts: boolean;
  syncErrors: boolean;
  dailyDigest: boolean;
  digestTime: string; // HH:MM形式
}

// レポート設定
export interface ReportConfiguration {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  includedProjects: string[];
  metrics: ReportMetric[];
  format: 'pdf' | 'excel' | 'json';
  recipients: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    timezone: string;
  };
}

// レポートメトリクス
export interface ReportMetric {
  id: string;
  name: string;
  type: 'progress' | 'time' | 'quality' | 'efficiency';
  enabled: boolean;
  threshold?: number;
}
