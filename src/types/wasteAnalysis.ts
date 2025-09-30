// 無駄遣い分析システムの型定義

export interface WasteCategory {
  id: string;
  name: string;
  type: 'money' | 'time' | 'effort';
  description: string;
  icon: string;
  color: string;
}

export interface WasteRecord {
  id: string;
  categoryId: string;
  type: 'money' | 'time' | 'effort';
  amount: number; // 金額、時間（分）、労力（ポイント）
  description: string;
  date: Date;
  tags: string[];
  isWasteful: boolean; // 無駄かどうかの判定
  wasteReason: string; // 無駄な理由
  improvementSuggestion?: string; // 改善提案
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WasteAnalysis {
  period: {
    start: Date;
    end: Date;
  };
  totalWaste: {
    money: number;
    time: number; // 分
    effort: number; // ポイント
  };
  wasteByCategory: {
    [categoryId: string]: {
      money: number;
      time: number;
      effort: number;
      count: number;
    };
  };
  wasteTrends: {
    daily: WasteTrend[];
    weekly: WasteTrend[];
    monthly: WasteTrend[];
  };
  topWasteSources: WasteSource[];
  improvementSuggestions: ImprovementSuggestion[];
  wasteScore: number; // 0-100（低いほど良い）
}

export interface WasteTrend {
  date: Date;
  money: number;
  time: number;
  effort: number;
  wasteScore: number;
}

export interface WasteSource {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  count: number;
  averageAmount: number;
  wastePercentage: number; // 全体に占める割合
}

export interface ImprovementSuggestion {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  type: 'money' | 'time' | 'effort';
  priority: 'low' | 'medium' | 'high';
  potentialSavings: {
    money?: number;
    time?: number;
    effort?: number;
  };
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  estimatedImpact: number; // 1-10
  actionSteps: string[];
  relatedWasteRecords: string[];
}

export interface WasteAlert {
  id: string;
  type: 'threshold_exceeded' | 'pattern_detected' | 'improvement_opportunity';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  categoryId?: string;
  suggestedAction?: string;
  createdAt: Date;
  isRead: boolean;
}

export interface WasteGoal {
  id: string;
  title: string;
  description: string;
  type: 'money' | 'time' | 'effort';
  targetAmount: number;
  currentAmount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  progress: number; // 0-100
  userId: string;
}

// 無駄遣いカテゴリの定義
export const WASTE_CATEGORIES: WasteCategory[] = [
  // お金の無駄遣い
  {
    id: 'impulse_purchases',
    name: '衝動買い',
    type: 'money',
    description: '計画していない衝動的な買い物',
    icon: '🛍️',
    color: '#ff6b6b'
  },
  {
    id: 'subscription_services',
    name: 'サブスクリプション',
    type: 'money',
    description: '使っていないサブスクリプションサービス',
    icon: '📱',
    color: '#4ecdc4'
  },
  {
    id: 'food_waste',
    name: '食品ロス',
    type: 'money',
    description: '食べ残しや期限切れによる食品の無駄',
    icon: '🍎',
    color: '#45b7d1'
  },
  {
    id: 'energy_waste',
    name: 'エネルギー無駄',
    type: 'money',
    description: '電気、ガス、水道の無駄遣い',
    icon: '⚡',
    color: '#f9ca24'
  },
  {
    id: 'transportation',
    name: '交通費',
    type: 'money',
    description: '非効率な交通手段やルート',
    icon: '🚗',
    color: '#6c5ce7'
  },

  // 時間の無駄遣い
  {
    id: 'social_media',
    name: 'SNS',
    type: 'time',
    description: 'SNSの過度な使用',
    icon: '📱',
    color: '#fd79a8'
  },
  {
    id: 'procrastination',
    name: '先延ばし',
    type: 'time',
    description: 'やるべきことを先延ばしにすること',
    icon: '⏰',
    color: '#fdcb6e'
  },
  {
    id: 'inefficient_work',
    name: '非効率な作業',
    type: 'time',
    description: '効率の悪い作業方法',
    icon: '⚙️',
    color: '#a29bfe'
  },
  {
    id: 'meetings',
    name: '無駄な会議',
    type: 'time',
    description: '生産性の低い会議',
    icon: '👥',
    color: '#74b9ff'
  },
  {
    id: 'distractions',
    name: '集中力の散漫',
    type: 'time',
    description: '集中を妨げる要因',
    icon: '🎯',
    color: '#fd79a8'
  },

  // 労力の無駄遣い
  {
    id: 'redundant_tasks',
    name: '重複作業',
    type: 'effort',
    description: '同じ作業を複数回行うこと',
    icon: '🔄',
    color: '#e17055'
  },
  {
    id: 'perfectionism',
    name: '完璧主義',
    type: 'effort',
    description: '過度な完璧主義による労力の無駄',
    icon: '✨',
    color: '#00b894'
  },
  {
    id: 'overthinking',
    name: '考えすぎ',
    type: 'effort',
    description: '必要以上に考え込むこと',
    icon: '🧠',
    color: '#6c5ce7'
  },
  {
    id: 'manual_processes',
    name: '手動処理',
    type: 'effort',
    description: '自動化できる手動処理',
    icon: '🤖',
    color: '#00cec9'
  },
  {
    id: 'context_switching',
    name: 'コンテキスト切り替え',
    type: 'effort',
    description: '頻繁なタスク切り替えによる労力の無駄',
    icon: '🔄',
    color: '#fdcb6e'
  }
];
