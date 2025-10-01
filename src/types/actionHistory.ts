// 行動記録管理システムの型定義

export interface ActionRecord {
  id: string;
  title: string;
  description?: string;
  category: ActionCategory;
  type: 'work' | 'personal' | 'health' | 'learning' | 'social' | 'hobby' | 'other';
  duration?: number; // 分
  location?: string;
  tags: string[];
  mood?: number; // 1-5のスケール
  energy?: number; // 1-5のスケール
  productivity?: number; // 1-5のスケール
  timestamp: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionAnalysis {
  period: {
    start: Date;
    end: Date;
  };
  totalActions: number;
  categoryStats: { [category: string]: { count: number; totalDuration: number; averageDuration: number } };
  timeStats: { [hour: number]: number };
  tagStats: { [tag: string]: number };
  patterns: ActionPattern[];
  productivityScore: number; // 0-100
  insights: ActionInsight[];
  lastUpdated: Date;
}

export interface ActionPattern {
  type: 'time_pattern' | 'category_pattern' | 'continuity_pattern' | 'mood_pattern';
  title: string;
  description: string;
  frequency: number;
  confidence: number; // 0-1
  suggestions: string[];
}

export interface ActionInsight {
  type: 'productivity' | 'pattern' | 'improvement' | 'achievement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export interface ActionTrend {
  date: Date;
  totalActions: number;
  totalDuration: number;
  categories: { [category: string]: number };
  productivityScore: number;
}

export interface ActionGoal {
  id: string;
  title: string;
  description?: string;
  category: ActionCategory;
  type: 'frequency' | 'duration' | 'consistency' | 'quality';
  targetValue: number;
  currentValue: number;
  targetDate: Date;
  isCompleted: boolean;
  userId: string;
  createdAt: Date;
}

export interface ActionAlert {
  id: string;
  type: 'low_activity' | 'low_productivity' | 'goal_achieved' | 'pattern_detected';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  userId: string;
  createdAt: Date;
  isRead: boolean;
}

// 行動カテゴリ
export type ActionCategory = 
  | 'work'
  | 'personal'
  | 'health'
  | 'learning'
  | 'social'
  | 'hobby'
  | 'finance'
  | 'family'
  | 'travel'
  | 'other';

// 行動カテゴリの定義
export const ACTION_CATEGORIES = [
  {
    id: 'work',
    name: '仕事',
    icon: '💼',
    color: '#2196F3',
    description: '仕事関連の活動'
  },
  {
    id: 'personal',
    name: '個人',
    icon: '👤',
    color: '#9C27B0',
    description: '個人的な活動'
  },
  {
    id: 'health',
    name: '健康',
    icon: '🏃',
    color: '#4CAF50',
    description: '健康・フィットネス関連の活動'
  },
  {
    id: 'learning',
    name: '学習',
    icon: '📚',
    color: '#FF9800',
    description: '学習・教育関連の活動'
  },
  {
    id: 'social',
    name: '社交',
    icon: '👥',
    color: '#E91E63',
    description: '社交・コミュニケーション関連の活動'
  },
  {
    id: 'hobby',
    name: '趣味',
    icon: '🎨',
    color: '#607D8B',
    description: '趣味・娯楽関連の活動'
  },
  {
    id: 'finance',
    name: '財務',
    icon: '💰',
    color: '#4CAF50',
    description: '財務・投資関連の活動'
  },
  {
    id: 'family',
    name: '家族',
    icon: '👨‍👩‍👧‍👦',
    color: '#FF5722',
    description: '家族関連の活動'
  },
  {
    id: 'travel',
    name: '旅行',
    icon: '✈️',
    color: '#00BCD4',
    description: '旅行・移動関連の活動'
  },
  {
    id: 'other',
    name: 'その他',
    icon: '📦',
    color: '#795548',
    description: 'その他の活動'
  }
];

// 行動タイプの定義
export const ACTION_TYPES = [
  {
    id: 'work',
    name: '仕事',
    icon: '💼',
    color: '#2196F3'
  },
  {
    id: 'personal',
    name: '個人',
    icon: '👤',
    color: '#9C27B0'
  },
  {
    id: 'health',
    name: '健康',
    icon: '🏃',
    color: '#4CAF50'
  },
  {
    id: 'learning',
    name: '学習',
    icon: '📚',
    color: '#FF9800'
  },
  {
    id: 'social',
    name: '社交',
    icon: '👥',
    color: '#E91E63'
  },
  {
    id: 'hobby',
    name: '趣味',
    icon: '🎨',
    color: '#607D8B'
  },
  {
    id: 'other',
    name: 'その他',
    icon: '📦',
    color: '#795548'
  }
];

// 気分レベルの定義
export const MOOD_LEVELS = [
  { value: 1, label: 'とても悪い', icon: '😢', color: '#F44336' },
  { value: 2, label: '悪い', icon: '😞', color: '#FF9800' },
  { value: 3, label: '普通', icon: '😐', color: '#FFC107' },
  { value: 4, label: '良い', icon: '😊', color: '#4CAF50' },
  { value: 5, label: 'とても良い', icon: '😄', color: '#2196F3' }
];

// エネルギーレベルの定義
export const ENERGY_LEVELS = [
  { value: 1, label: 'とても低い', icon: '🔋', color: '#F44336' },
  { value: 2, label: '低い', icon: '🔋', color: '#FF9800' },
  { value: 3, label: '普通', icon: '🔋', color: '#FFC107' },
  { value: 4, label: '高い', icon: '🔋', color: '#4CAF50' },
  { value: 5, label: 'とても高い', icon: '🔋', color: '#2196F3' }
];

// 生産性レベルの定義
export const PRODUCTIVITY_LEVELS = [
  { value: 1, label: 'とても低い', icon: '📉', color: '#F44336' },
  { value: 2, label: '低い', icon: '📉', color: '#FF9800' },
  { value: 3, label: '普通', icon: '➡️', color: '#FFC107' },
  { value: 4, label: '高い', icon: '📈', color: '#4CAF50' },
  { value: 5, label: 'とても高い', icon: '📈', color: '#2196F3' }
];

// 目標タイプの定義
export const GOAL_TYPES = [
  {
    id: 'frequency',
    name: '頻度',
    description: '一定期間内の活動回数',
    icon: '📊'
  },
  {
    id: 'duration',
    name: '時間',
    description: '一定期間内の活動時間',
    icon: '⏱️'
  },
  {
    id: 'consistency',
    name: '継続性',
    description: '連続した日数の活動',
    icon: '🔥'
  },
  {
    id: 'quality',
    name: '質',
    description: '活動の質の向上',
    icon: '⭐'
  }
];

// アラートタイプの定義
export const ALERT_TYPES = [
  {
    id: 'low_activity',
    name: '活動不足',
    description: '活動記録が少ない',
    icon: '⚠️',
    color: '#FF9800'
  },
  {
    id: 'low_productivity',
    name: '生産性低下',
    description: '生産性スコアが低い',
    icon: '📉',
    color: '#F44336'
  },
  {
    id: 'goal_achieved',
    name: '目標達成',
    description: '設定した目標を達成',
    icon: '🎉',
    color: '#4CAF50'
  },
  {
    id: 'pattern_detected',
    name: 'パターン検出',
    description: '新しい行動パターンを検出',
    icon: '🔍',
    color: '#2196F3'
  }
];

// 生産性スコアの評価基準
export const PRODUCTIVITY_CRITERIA = {
  excellent: { min: 80, label: '優秀', color: '#4CAF50' },
  good: { min: 60, label: '良好', color: '#8BC34A' },
  fair: { min: 40, label: '普通', color: '#FFC107' },
  poor: { min: 20, label: '要改善', color: '#FF9800' },
  critical: { min: 0, label: '危険', color: '#F44336' }
};

// 時間帯の定義
export const TIME_PERIODS = [
  { id: 'morning', name: '朝', start: 6, end: 12, icon: '🌅', color: '#FFC107' },
  { id: 'afternoon', name: '午後', start: 12, end: 18, icon: '☀️', color: '#FF9800' },
  { id: 'evening', name: '夕方', start: 18, end: 22, icon: '🌆', color: '#FF5722' },
  { id: 'night', name: '夜', start: 22, end: 6, icon: '🌙', color: '#3F51B5' }
];
