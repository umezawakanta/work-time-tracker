// 資産・負債管理システムの型定義

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  type: 'cash' | 'bank_account' | 'investment' | 'real_estate' | 'vehicle' | 'other';
  currentValue: number;
  purchasePrice?: number;
  purchaseDate?: Date;
  description?: string;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Liability {
  id: string;
  name: string;
  category: LiabilityCategory;
  type: 'credit_card' | 'loan' | 'mortgage' | 'paypay_card' | 'other';
  currentBalance: number;
  originalAmount: number;
  interestRate: number;
  monthlyPayment: number;
  dueDate?: Date;
  description?: string;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetLiabilitySummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetBreakdown: {
    cash: number;
    bankAccounts: number;
    investments: number;
    realEstate: number;
    other: number;
  };
  liabilityBreakdown: {
    cardLoans: number;
    paypayCards: number;
    mortgages: number;
    personalLoans: number;
    other: number;
  };
  lastUpdated: Date;
}

export interface AssetLiabilityAlert {
  id: string;
  type: 'high_debt_ratio' | 'insufficient_emergency_fund' | 'declining_net_worth' | 'payment_due' | 'goal_achieved';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  userId: string;
  createdAt: Date;
  isRead: boolean;
}

export interface AssetLiabilityGoal {
  id: string;
  title: string;
  type: 'net_worth' | 'asset_value' | 'debt_reduction' | 'emergency_fund' | 'investment';
  targetValue: number;
  currentValue: number;
  targetDate: Date;
  description?: string;
  userId: string;
  createdAt: Date;
}

export interface NetWorthTrend {
  date: Date;
  netWorth: number;
  assets: number;
  liabilities: number;
}

export interface AssetLiabilityAnalysis {
  netWorthChange: number; // 純資産の変化率（%）
  assetDiversificationScore: number; // 資産の多様性スコア（0-100）
  debtToAssetRatio: number; // 負債比率（%）
  emergencyFundCoverage: number; // 緊急資金カバレッジ比率
  financialHealthScore: number; // 財務健全性スコア（0-100）
  recommendations: string[]; // 改善提案
  riskAssessment: 'low' | 'medium' | 'high'; // リスク評価
}

// 資産カテゴリ
export type AssetCategory = 
  | 'cash'
  | 'bank_account'
  | 'investment'
  | 'real_estate'
  | 'vehicle'
  | 'precious_metals'
  | 'collectibles'
  | 'other';

// 負債カテゴリ
export type LiabilityCategory = 
  | 'credit_card'
  | 'personal_loan'
  | 'mortgage'
  | 'car_loan'
  | 'student_loan'
  | 'paypay_card'
  | 'other';

// 資産カテゴリの定義
export const ASSET_CATEGORIES = [
  {
    id: 'cash',
    name: '現金',
    icon: '💵',
    color: '#4CAF50'
  },
  {
    id: 'bank_account',
    name: '銀行口座',
    icon: '🏦',
    color: '#2196F3'
  },
  {
    id: 'investment',
    name: '投資',
    icon: '📈',
    color: '#FF9800'
  },
  {
    id: 'real_estate',
    name: '不動産',
    icon: '🏠',
    color: '#9C27B0'
  },
  {
    id: 'vehicle',
    name: '車両',
    icon: '🚗',
    color: '#607D8B'
  },
  {
    id: 'precious_metals',
    name: '貴金属',
    icon: '🥇',
    color: '#FFD700'
  },
  {
    id: 'collectibles',
    name: 'コレクション',
    icon: '🎨',
    color: '#E91E63'
  },
  {
    id: 'other',
    name: 'その他',
    icon: '📦',
    color: '#795548'
  }
];

// 負債カテゴリの定義
export const LIABILITY_CATEGORIES = [
  {
    id: 'credit_card',
    name: 'クレジットカード',
    icon: '💳',
    color: '#F44336'
  },
  {
    id: 'personal_loan',
    name: '個人ローン',
    icon: '💰',
    color: '#FF5722'
  },
  {
    id: 'mortgage',
    name: '住宅ローン',
    icon: '🏠',
    color: '#9C27B0'
  },
  {
    id: 'car_loan',
    name: '自動車ローン',
    icon: '🚗',
    color: '#607D8B'
  },
  {
    id: 'student_loan',
    name: '教育ローン',
    icon: '🎓',
    color: '#3F51B5'
  },
  {
    id: 'paypay_card',
    name: 'PayPayカード',
    icon: '📱',
    color: '#00BCD4'
  },
  {
    id: 'other',
    name: 'その他',
    icon: '📦',
    color: '#795548'
  }
];

// 財務健全性スコアの評価基準
export const FINANCIAL_HEALTH_CRITERIA = {
  excellent: { min: 80, label: '優秀', color: '#4CAF50' },
  good: { min: 60, label: '良好', color: '#8BC34A' },
  fair: { min: 40, label: '普通', color: '#FFC107' },
  poor: { min: 20, label: '要改善', color: '#FF9800' },
  critical: { min: 0, label: '危険', color: '#F44336' }
};

// リスクレベルの定義
export const RISK_LEVELS = {
  low: { label: '低リスク', color: '#4CAF50', description: '財務状況は安定しています' },
  medium: { label: '中リスク', color: '#FFC107', description: '注意が必要です' },
  high: { label: '高リスク', color: '#F44336', description: '早急な改善が必要です' }
};
