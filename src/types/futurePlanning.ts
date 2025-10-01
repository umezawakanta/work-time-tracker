// 将来計画管理システムの型定義

export interface FuturePlan {
  id: string;
  title: string;
  description?: string;
  category: PlanCategory;
  priority: PlanPriority; // 1-5 (1が最高優先度)
  status: PlanStatus;
  startDate: Date;
  targetDate: Date;
  progress: number; // 0-100
  milestones: PlanMilestone[];
  tags: string[];
  estimatedCost?: number;
  actualCost?: number;
  resources?: string[];
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanMilestone {
  id: string;
  title: string;
  description?: string;
  targetDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  progress: number; // 0-100
  dependencies?: string[]; // 他のマイルストーンのID
}

export interface PlanAnalysis {
  totalPlans: number;
  completedPlans: number;
  inProgressPlans: number;
  overduePlans: number;
  thisMonthPlans: number;
  categoryStats: { [category: string]: { count: number; completed: number; averageProgress: number } };
  statusStats: { [status: string]: number };
  priorityStats: { [priority: string]: number };
  progressStats: {
    notStarted: number;
    inProgress: number;
    almostComplete: number;
    completed: number;
  };
  completionRate: number; // 0-100
  averageProgress: number; // 0-100
  lastUpdated: Date;
}

export interface PlanRecommendation {
  type: 'completion_rate' | 'overdue_plans' | 'low_progress' | 'too_many_plans' | 'deadline_approaching';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export interface PlanAlert {
  id: string;
  type: 'overdue' | 'deadline_approaching' | 'plan_completed' | 'milestone_completed' | 'budget_exceeded';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  planId: string;
  userId: string;
  createdAt: Date;
  isRead: boolean;
}

// 計画カテゴリ
export type PlanCategory = 
  | 'career'
  | 'education'
  | 'health'
  | 'finance'
  | 'personal'
  | 'family'
  | 'travel'
  | 'hobby'
  | 'business'
  | 'other';

// 計画ステータス
export type PlanStatus = 
  | 'not_started'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

// 計画優先度
export type PlanPriority = 1 | 2 | 3 | 4 | 5;

// 計画カテゴリの定義
export const PLAN_CATEGORIES = [
  {
    id: 'career',
    name: 'キャリア',
    icon: '💼',
    color: '#2196F3',
    description: '仕事・キャリア関連の計画'
  },
  {
    id: 'education',
    name: '教育・学習',
    icon: '📚',
    color: '#FF9800',
    description: '学習・スキルアップ関連の計画'
  },
  {
    id: 'health',
    name: '健康・フィットネス',
    icon: '🏃',
    color: '#4CAF50',
    description: '健康・運動関連の計画'
  },
  {
    id: 'finance',
    name: '財務・投資',
    icon: '💰',
    color: '#4CAF50',
    description: 'お金・投資関連の計画'
  },
  {
    id: 'personal',
    name: '個人・自己啓発',
    icon: '👤',
    color: '#9C27B0',
    description: '個人的な成長・自己啓発の計画'
  },
  {
    id: 'family',
    name: '家族・人間関係',
    icon: '👨‍👩‍👧‍👦',
    color: '#FF5722',
    description: '家族・人間関係関連の計画'
  },
  {
    id: 'travel',
    name: '旅行・レジャー',
    icon: '✈️',
    color: '#00BCD4',
    description: '旅行・レジャー関連の計画'
  },
  {
    id: 'hobby',
    name: '趣味・娯楽',
    icon: '🎨',
    color: '#607D8B',
    description: '趣味・娯楽関連の計画'
  },
  {
    id: 'business',
    name: 'ビジネス・起業',
    icon: '🚀',
    color: '#E91E63',
    description: 'ビジネス・起業関連の計画'
  },
  {
    id: 'other',
    name: 'その他',
    icon: '📦',
    color: '#795548',
    description: 'その他の計画'
  }
];

// 計画ステータスの定義
export const PLAN_STATUSES = [
  {
    id: 'not_started',
    name: '未開始',
    icon: '⏸️',
    color: '#9E9E9E',
    description: 'まだ開始していない計画'
  },
  {
    id: 'in_progress',
    name: '進行中',
    icon: '▶️',
    color: '#2196F3',
    description: '現在進行中の計画'
  },
  {
    id: 'on_hold',
    name: '保留中',
    icon: '⏸️',
    color: '#FF9800',
    description: '一時的に保留中の計画'
  },
  {
    id: 'completed',
    name: '完了',
    icon: '✅',
    color: '#4CAF50',
    description: '完了した計画'
  },
  {
    id: 'cancelled',
    name: 'キャンセル',
    icon: '❌',
    color: '#F44336',
    description: 'キャンセルした計画'
  }
];

// 計画優先度の定義
export const PLAN_PRIORITIES = [
  {
    value: 1,
    name: '最高',
    icon: '🔴',
    color: '#F44336',
    description: '最優先で取り組む計画'
  },
  {
    value: 2,
    name: '高',
    icon: '🟠',
    color: '#FF9800',
    description: '優先度の高い計画'
  },
  {
    value: 3,
    name: '中',
    icon: '🟡',
    color: '#FFC107',
    description: '中程度の優先度の計画'
  },
  {
    value: 4,
    name: '低',
    icon: '🟢',
    color: '#4CAF50',
    description: '優先度の低い計画'
  },
  {
    value: 5,
    name: '最低',
    icon: '🔵',
    color: '#2196F3',
    description: '最低優先度の計画'
  }
];

// アラートタイプの定義
export const PLAN_ALERT_TYPES = [
  {
    id: 'overdue',
    name: '期限切れ',
    icon: '⚠️',
    color: '#F44336',
    description: '期限が過ぎた計画'
  },
  {
    id: 'deadline_approaching',
    name: '期限接近',
    icon: '⏰',
    color: '#FF9800',
    description: '期限が近づいている計画'
  },
  {
    id: 'plan_completed',
    name: '計画完了',
    icon: '🎉',
    color: '#4CAF50',
    description: '計画が完了した'
  },
  {
    id: 'milestone_completed',
    name: 'マイルストーン完了',
    icon: '🏆',
    color: '#2196F3',
    description: 'マイルストーンが完了した'
  },
  {
    id: 'budget_exceeded',
    name: '予算超過',
    icon: '💸',
    color: '#F44336',
    description: '予算を超過した計画'
  }
];

// 進捗レベルの定義
export const PROGRESS_LEVELS = [
  { min: 0, max: 0, label: '未開始', color: '#9E9E9E', icon: '⏸️' },
  { min: 1, max: 25, label: '開始', color: '#F44336', icon: '🟢' },
  { min: 26, max: 50, label: '進行中', color: '#FF9800', icon: '🟡' },
  { min: 51, max: 75, label: '順調', color: '#2196F3', icon: '🔵' },
  { min: 76, max: 99, label: 'ほぼ完了', color: '#4CAF50', icon: '🟢' },
  { min: 100, max: 100, label: '完了', color: '#4CAF50', icon: '✅' }
];

// 計画の複雑度レベル
export const PLAN_COMPLEXITY_LEVELS = [
  {
    id: 'simple',
    name: 'シンプル',
    description: '1-3個のマイルストーン、短期間',
    icon: '🟢',
    color: '#4CAF50'
  },
  {
    id: 'moderate',
    name: '中程度',
    description: '4-7個のマイルストーン、中期間',
    icon: '🟡',
    color: '#FFC107'
  },
  {
    id: 'complex',
    name: '複雑',
    description: '8個以上のマイルストーン、長期間',
    icon: '🔴',
    color: '#F44336'
  }
];

// 計画の成功要因
export const SUCCESS_FACTORS = [
  {
    id: 'clear_goals',
    name: '明確な目標',
    description: '具体的で測定可能な目標設定',
    icon: '🎯'
  },
  {
    id: 'realistic_timeline',
    name: '現実的な期限',
    description: '達成可能な期限設定',
    icon: '⏰'
  },
  {
    id: 'regular_review',
    name: '定期的な見直し',
    description: '定期的な進捗確認と調整',
    icon: '📊'
  },
  {
    id: 'resource_planning',
    name: 'リソース計画',
    description: '必要なリソースの事前計画',
    icon: '📋'
  },
  {
    id: 'milestone_tracking',
    name: 'マイルストーン追跡',
    description: '小さな目標の設定と追跡',
    icon: '🏆'
  }
];
