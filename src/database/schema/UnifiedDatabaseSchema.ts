/**
 * 🗄️ 統一データベーススキーマ
 * Work Time Tracker の全データを統合管理する包括的なスキーマ定義
 */

// =============================================================================
// Core Type Definitions
// =============================================================================

export type DatabaseProvider = 'postgresql' | 'mongodb' | 'sqlite' | 'mysql';
export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'inactive' | 'completed' | 'cancelled' | 'archived';

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  syncStatus: SyncStatus;
  lastSyncAt?: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// User Management Schema
// =============================================================================

export interface UserProfile extends BaseEntity {
  // 基本情報
  uid: string; // 認証システムID
  email: string;
  username?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;

  // 認証情報
  provider: 'jwt' | 'firebase' | 'google' | 'github' | 'demo';
  isVerified: boolean;
  role: 'user' | 'admin' | 'manager' | 'guest';
  permissions: string[];

  // 設定
  preferences: UserPreferences;
  settings: UserSettings;

  // 統計
  stats: UserStats;

  // 勤怠情報
  employeeInfo?: EmployeeInfo;

  // 状態
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: string;
  lastActivityAt?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'ja' | 'en' | 'zh' | 'ko';
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
  productivity: ProductivityPreferences;
}

export interface UserSettings {
  privacy: PrivacySettings;
  security: SecuritySettings;
  integrations: IntegrationSettings;
  features: FeatureFlags;
}

export interface UserStats {
  totalWorkHours: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  achievementCount: number;
  badgeCount: number;
  streakDays: number;
  averageProductivity: number;
  joinDate: string;
  lastWeekHours: number;
  lastMonthHours: number;
}

export interface EmployeeInfo {
  employeeId: string;
  department: string;
  position: string;
  manager?: string;
  salary?: number;
  startDate: string;
  contractType: 'full-time' | 'part-time' | 'contract' | 'intern';
  workingHours: {
    start: string;
    end: string;
    breakDuration: number;
  };
}

// =============================================================================
// Work Time Management Schema
// =============================================================================

export interface WorkSession extends BaseEntity {
  userId: string;
  projectId?: string;
  taskId?: string;

  // セッション情報
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number; // milliseconds

  // 分類
  category: 'development' | 'meeting' | 'research' | 'admin' | 'break' | 'other';
  tags: string[];

  // 場所・方法
  location: 'office' | 'home' | 'remote' | 'client';
  device?: string;
  ipAddress?: string;

  // 状態
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  isBreak: boolean;
  isOvertime: boolean;

  // メトリクス
  productivity: ProductivityMetrics;

  // 承認
  approval?: ApprovalInfo;

  // 関連データ
  screenshots?: string[];
  activities?: ActivityLog[];
  notes?: string;
}

export interface ProductivityMetrics {
  focusScore: number; // 0-100
  distractionCount: number;
  appUsage?: AppUsageMetric[];
  keystrokeCount?: number;
  mouseClickCount?: number;
  screenshotCount?: number;
  qualityScore?: number;
}

export interface AppUsageMetric {
  appName: string;
  category: string;
  timeSpent: number;
  isProductive: boolean;
}

export interface ApprovalInfo {
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  comments?: string;
}

// =============================================================================
// Project Management Schema
// =============================================================================

export interface Project extends BaseEntity {
  // 基本情報
  name: string;
  description?: string;
  code?: string; // プロジェクトコード

  // 分類
  category: string;
  type: 'internal' | 'client' | 'personal' | 'training';
  status: Status;
  priority: Priority;

  // 期間
  startDate: string;
  endDate?: string;
  deadline?: string;

  // 予算・工数
  budget?: {
    amount: number;
    currency: string;
    spent: number;
  };
  estimatedHours: number;
  actualHours: number;

  // チーム
  ownerId: string;
  managerId?: string;
  teamMembers: ProjectMember[];

  // 進捗
  progress: number; // 0-100
  milestones: Milestone[];

  // 設定
  settings: ProjectSettings;

  // 関連データ
  tags: string[];
  clientId?: string;
  parentProjectId?: string;
  childProjects: string[];
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'manager' | 'developer' | 'designer' | 'tester' | 'stakeholder';
  permissions: string[];
  hourlyRate?: number;
  joinDate: string;
  isActive: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  progress: number;
  tasks: string[];
}

export interface ProjectSettings {
  isPublic: boolean;
  allowTimeTracking: boolean;
  requireApproval: boolean;
  autoCalculateProgress: boolean;
  timeTrackingGranularity: 'minutes' | 'hours' | 'days';
  budgetAlerts: boolean;
  progressNotifications: boolean;
}

// =============================================================================
// Task Management Schema
// =============================================================================

export interface Task extends BaseEntity {
  // 基本情報
  title: string;
  description?: string;

  // 分類
  projectId?: string;
  parentTaskId?: string;
  subtasks: string[];
  type: 'feature' | 'bug' | 'improvement' | 'research' | 'meeting' | 'admin';

  // 状態
  status: 'todo' | 'in-progress' | 'review' | 'testing' | 'done' | 'cancelled';
  priority: Priority;

  // 期間・工数
  startDate?: string;
  dueDate?: string;
  estimatedHours: number;
  actualHours: number;
  progress: number; // 0-100

  // 担当
  assigneeId?: string;
  reviewerId?: string;
  reporterId: string;

  // 詳細
  tags: string[];
  labels: TaskLabel[];
  dependencies: TaskDependency[];
  attachments: Attachment[];

  // チェックリスト
  checklist: ChecklistItem[];

  // 時間記録
  timeEntries: TimeEntry[];

  // コメント・変更履歴
  comments: TaskComment[];
  history: TaskHistory[];
}

export interface TaskLabel {
  name: string;
  color: string;
  category?: string;
}

export interface TaskDependency {
  taskId: string;
  type: 'blocks' | 'blocked_by' | 'related';
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  assigneeId?: string;
}

export interface TimeEntry {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  description?: string;
  billable: boolean;
  rate?: number;
}

export interface TaskComment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  mentions: string[];
  attachments: Attachment[];
}

export interface TaskHistory {
  id: string;
  userId: string;
  action: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}

// =============================================================================
// Todo Management Schema
// =============================================================================

export interface Todo extends BaseEntity {
  // 基本情報
  title: string;
  description?: string;

  // 分類
  category: 'personal' | 'work' | 'project' | 'learning' | 'health';
  type: 'task' | 'reminder' | 'goal' | 'habit';

  // 状態
  completed: boolean;
  completedAt?: string;
  priority: Priority;

  // 期間
  dueDate?: string;
  reminderDate?: string;

  // 関連
  userId: string;
  projectId?: string;
  taskId?: string;
  parentTodoId?: string;
  subtodos: string[];

  // 詳細
  tags: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;

  // 繰り返し
  recurring?: RecurringPattern;

  // 場所・コンテキスト
  location?: string;
  context?: string[];

  // メタデータ
  source: 'manual' | 'imported' | 'generated' | 'ai_suggested';
  sourceId?: string;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  maxOccurrences?: number;
}

// =============================================================================
// Gamification Schema
// =============================================================================

export interface Achievement extends BaseEntity {
  // 基本情報
  name: string;
  description: string;
  icon: string;
  category: string;

  // 条件
  type: 'milestone' | 'streak' | 'total' | 'rate' | 'special';
  criteria: AchievementCriteria;

  // 報酬
  points: number;
  badgeId?: string;
  unlocks?: string[];

  // 状態
  isActive: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';

  // メタデータ
  order: number;
  isHidden: boolean;
  seasonId?: string;
}

export interface AchievementCriteria {
  metric: string;
  operator: '>' | '>=' | '=' | '<=' | '<';
  value: number;
  timeframe?: 'day' | 'week' | 'month' | 'year' | 'total';
  conditions?: Record<string, any>;
}

export interface Badge extends BaseEntity {
  // 基本情報
  name: string;
  description: string;
  icon: string;
  category: string;

  // レベル
  level: number;
  maxLevel: number;
  nextLevelRequirement?: AchievementCriteria;

  // 報酬
  points: number;
  benefits?: BadgeBenefit[];

  // 状態
  isActive: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';

  // メタデータ
  order: number;
  isHidden: boolean;
  categoryColor: string;
}

export interface BadgeBenefit {
  type: 'feature_unlock' | 'discount' | 'priority' | 'cosmetic';
  description: string;
  value?: any;
}

export interface UserAchievement extends BaseEntity {
  userId: string;
  achievementId: string;
  unlockedAt: string;
  progress: number;
  isVisible: boolean;
  shareCount: number;
}

export interface UserBadge extends BaseEntity {
  userId: string;
  badgeId: string;
  level: number;
  progress: number;
  unlockedAt: string;
  lastLevelUpAt?: string;
  isVisible: boolean;
  isPinned: boolean;
}

// =============================================================================
// Analytics & Reporting Schema
// =============================================================================

export interface ActivityLog extends BaseEntity {
  // 基本情報
  userId: string;
  action: string;
  entity: string;
  entityId?: string;

  // 詳細
  description?: string;
  data?: Record<string, any>;

  // コンテキスト
  sessionId?: string;
  deviceInfo?: DeviceInfo;
  location?: GeolocationInfo;

  // 分類
  category: 'work' | 'system' | 'auth' | 'gamification' | 'social';
  level: 'debug' | 'info' | 'warn' | 'error';

  // メトリクス
  duration?: number;
  success: boolean;
  errorMessage?: string;
}

export interface PerformanceMetric extends BaseEntity {
  // 基本情報
  userId: string;
  date: string; // YYYY-MM-DD

  // 時間メトリクス
  totalWorkTime: number;
  effectiveWorkTime: number;
  breakTime: number;
  overtimeHours: number;

  // 生産性メトリクス
  tasksCompleted: number;
  focusScore: number;
  distractionCount: number;
  qualityScore: number;

  // プロジェクトメトリクス
  projectsWorked: number;
  averageTaskDuration: number;
  deadlinesMet: number;
  deadlinesMissed: number;

  // ゲーミフィケーションメトリクス
  pointsEarned: number;
  achievementsUnlocked: number;
  streakDays: number;

  // システムメトリクス
  loginCount: number;
  appUsageTime: number;
  errorCount: number;

  // 集計レベル
  aggregationLevel: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Report extends BaseEntity {
  // 基本情報
  name: string;
  description?: string;
  type: 'productivity' | 'timesheet' | 'project' | 'team' | 'financial';

  // 生成情報
  createdBy: string;
  generatedAt: string;

  // パラメータ
  parameters: ReportParameters;

  // データ
  data: ReportData;
  summary: ReportSummary;

  // 設定
  isPublic: boolean;
  isTemplate: boolean;
  autoGenerate: boolean;
  schedule?: ScheduleConfig;

  // 出力
  format: 'json' | 'csv' | 'pdf' | 'excel';
  downloadUrl?: string;
  emailRecipients: string[];
}

export interface ReportParameters {
  dateRange: {
    start: string;
    end: string;
  };
  users?: string[];
  projects?: string[];
  categories?: string[];
  filters?: Record<string, any>;
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportData {
  headers: string[];
  rows: any[][];
  charts?: ChartData[];
  totals?: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface ReportSummary {
  totalRecords: number;
  totalHours: number;
  totalProjects: number;
  totalUsers: number;
  averageProductivity: number;
  insights: string[];
  recommendations: string[];
}

// =============================================================================
// System Configuration Schema
// =============================================================================

export interface SystemSetting extends BaseEntity {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category: 'general' | 'security' | 'features' | 'integrations' | 'ui';
  description?: string;
  isPublic: boolean;
  isRequired: boolean;
  validation?: ValidationRule[];
}

export interface Notification extends BaseEntity {
  // 基本情報
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';

  // 対象
  userId?: string; // null = all users
  role?: string;

  // 設定
  priority: Priority;
  category: string;

  // 状態
  isRead: boolean;
  readAt?: string;
  isArchived: boolean;

  // 期限
  expiresAt?: string;

  // アクション
  actionUrl?: string;
  actionLabel?: string;

  // 配信
  channels: NotificationChannel[];
  deliveryStatus: Record<string, 'pending' | 'sent' | 'failed'>;
}

export interface SyncState extends BaseEntity {
  entity: string;
  entityId: string;
  lastSyncAt: string;
  syncVersion: number;
  checksum: string;
  conflictData?: ConflictData;
  retryCount: number;
  maxRetries: number;
  nextSyncAt?: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export interface ConflictData {
  localVersion: any;
  remoteVersion: any;
  conflictType: 'update' | 'delete' | 'create';
  resolutionStrategy: 'manual' | 'local_wins' | 'remote_wins' | 'merge';
  resolvedAt?: string;
  resolvedBy?: string;
}

// =============================================================================
// Integration & External Services Schema
// =============================================================================

export interface Integration extends BaseEntity {
  name: string;
  type: 'oauth' | 'api_key' | 'webhook' | 'file_sync';
  provider: string;

  // 設定
  config: IntegrationConfig;
  credentials: EncryptedCredentials;

  // 状態
  isActive: boolean;
  isConnected: boolean;
  lastConnectedAt?: string;
  lastSyncAt?: string;

  // 統計
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastError?: string;

  // ユーザー
  userId: string;
  sharedWith: string[];
}

export interface WebhookEndpoint extends BaseEntity {
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;

  // 統計
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastCalledAt?: string;
  lastError?: string;

  // 設定
  retryConfig: RetryConfig;
  headers?: Record<string, string>;
  timeout: number;
}

// =============================================================================
// Supporting Type Definitions
// =============================================================================

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  digest: 'none' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface DashboardPreferences {
  layout: 'compact' | 'comfortable' | 'spacious';
  defaultView: string;
  widgets: DashboardWidget[];
  refreshInterval: number;
  showWelcome: boolean;
}

export interface DashboardWidget {
  id: string;
  type: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  isVisible: boolean;
}

export interface ProductivityPreferences {
  pomodoroEnabled: boolean;
  pomodoroMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  autoStartBreaks: boolean;
  focusMode: boolean;
  distractionBlocking: boolean;
  goalSetting: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  activityVisibility: 'public' | 'team' | 'private';
  allowDataSharing: boolean;
  allowAnalytics: boolean;
  allowMarketing: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  allowMultipleSessions: boolean;
  ipWhitelist: string[];
  deviceTrust: boolean;
  loginNotifications: boolean;
}

export interface IntegrationSettings {
  enabledProviders: string[];
  autoSync: boolean;
  syncFrequency: number;
  dataMapping: Record<string, any>;
  conflictResolution: 'manual' | 'auto';
}

export interface FeatureFlags {
  betaFeatures: boolean;
  experimentalFeatures: boolean;
  aiFeatures: boolean;
  advancedAnalytics: boolean;
  teamFeatures: boolean;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenResolution: string;
  language: string;
  timezone: string;
}

export interface GeolocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
  timezone?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: any[];
  config?: Record<string, any>;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface NotificationChannel {
  type: 'email' | 'push' | 'sms' | 'webhook';
  address: string;
  enabled: boolean;
}

export interface IntegrationConfig {
  baseUrl?: string;
  version?: string;
  rateLimit?: number;
  timeout?: number;
  retries?: number;
  customSettings?: Record<string, any>;
}

export interface EncryptedCredentials {
  data: string; // encrypted JSON
  algorithm: string;
  keyId: string;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  baseDelay: number;
  maxDelay: number;
}

export interface ScheduleConfig {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timezone: string;
}

// =============================================================================
// Database Schema Registry
// =============================================================================

export interface DatabaseSchema {
  version: string;
  provider: DatabaseProvider;
  tables: SchemaTable[];
  indexes: SchemaIndex[];
  relationships: SchemaRelationship[];
  migrations: SchemaMigration[];
}

export interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
  primaryKey: string[];
  constraints: SchemaConstraint[];
}

export interface SchemaConstraint {
  name: string;
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check' | 'not_null';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  checkExpression?: string;
}

export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  default?: any;
  unique: boolean;
  index: boolean;
}

export interface SchemaIndex {
  name: string;
  table: string;
  columns: string[];
  unique: boolean;
  type?: 'btree' | 'hash' | 'gin' | 'gist';
}

export interface SchemaRelationship {
  name: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  onDelete: 'cascade' | 'set-null' | 'restrict';
  onUpdate: 'cascade' | 'set-null' | 'restrict';
}

export interface SchemaMigration {
  version: string;
  description: string;
  sql: string;
  rollback: string;
  appliedAt?: string;
}

// =============================================================================
// Type Guards and Utilities
// =============================================================================

export const isValidEntity = (obj: any): obj is BaseEntity => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string' &&
    typeof obj.version === 'number' &&
    ['synced', 'pending', 'conflict', 'error'].includes(obj.syncStatus)
  );
};

export const createEntityId = (prefix: string = 'entity'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createTimestamp = (): string => {
  return new Date().toISOString();
};

export const updateEntityVersion = <T extends BaseEntity>(entity: T): T => {
  return {
    ...entity,
    version: entity.version + 1,
    updatedAt: createTimestamp(),
  };
};

// Export all schema entity names for easy access
export const SCHEMA_ENTITY_NAMES = [
  'UserProfile',
  'WorkSession',
  'Project',
  'Task',
  'Todo',
  'Achievement',
  'Badge',
  'UserAchievement',
  'UserBadge',
  'ActivityLog',
  'PerformanceMetric',
  'Report',
  'SystemSetting',
  'Notification',
  'SyncState',
  'Integration',
  'WebhookEndpoint',
] as const;

export type SchemaEntity = (typeof SCHEMA_ENTITY_NAMES)[number];

// Default schema configuration
export const DEFAULT_SCHEMA_CONFIG = {
  version: '1.0.0',
  provider: 'postgresql' as DatabaseProvider,
  enableSoftDelete: true,
  enableAuditLog: true,
  enableEncryption: true,
  enableCompression: false,
  defaultBatchSize: 1000,
  maxConnectionPool: 20,
  queryTimeout: 30000,
  enableCache: true,
  cacheTimeout: 300000,
} as const;
