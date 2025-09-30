// 財務統合管理システムの型定義

export interface FinancialOverview {
  userId: string;
  totalAssets: number; // 総資産
  totalLiabilities: number; // 総負債
  netWorth: number; // 純資産（資産 - 負債）
  cashBalance: number; // 現金残高
  bankAccountBalance: number; // 銀行口座残高
  cardLoanDebt: number; // カードローン負債
  paypayCardDebt: number; // PayPayカード負債
  lastUpdated: Date; // 最終更新日時
}

export interface MonthlyFinancialData {
  year: number;
  month: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  cashBalance: number;
  bankAccountBalance: number;
  cardLoanDebt: number;
  paypayCardDebt: number;
  date: Date;
}

export interface FinancialTrend {
  period: '1M' | '3M' | '6M' | '1Y' | 'ALL';
  data: MonthlyFinancialData[];
  totalChange: {
    assets: number;
    liabilities: number;
    netWorth: number;
  };
  percentageChange: {
    assets: number;
    liabilities: number;
    netWorth: number;
  };
  averageMonthlyChange: {
    assets: number;
    liabilities: number;
    netWorth: number;
  };
}

export interface FinancialAlert {
  id: string;
  userId: string;
  type: 'low_cash' | 'high_debt' | 'negative_net_worth' | 'debt_increase' | 'asset_decrease';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  currentValue: number;
  threshold?: number;
  previousValue?: number;
  createdAt: Date;
  isRead: boolean;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  type: 'net_worth' | 'debt_reduction' | 'savings' | 'emergency_fund';
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  isAchieved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialCategory {
  name: string;
  type: 'asset' | 'liability';
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface FinancialSummary {
  overview: FinancialOverview;
  trend: FinancialTrend;
  categories: FinancialCategory[];
  alerts: FinancialAlert[];
  goals: FinancialGoal[];
  monthlyData: MonthlyFinancialData[];
}

// デフォルト設定
export const DEFAULT_FINANCIAL_ALERTS = {
  low_cash: 50000, // 5万円
  high_debt: 1000000, // 100万円
  debt_ratio: 0.5, // 負債比率50%
  emergency_fund_months: 3 // 3ヶ月分の生活費
};

export const FINANCIAL_CATEGORIES = [
  { name: '現金', type: 'asset' as const, color: '#4caf50', icon: '💰' },
  { name: '銀行口座', type: 'asset' as const, color: '#2196f3', icon: '🏦' },
  { name: 'カードローン', type: 'liability' as const, color: '#f44336', icon: '💳' },
  { name: 'PayPayカード', type: 'liability' as const, color: '#ff6b35', icon: '💎' }
] as const;

export const TREND_PERIODS = [
  { value: '1M', label: '1ヶ月', months: 1 },
  { value: '3M', label: '3ヶ月', months: 3 },
  { value: '6M', label: '6ヶ月', months: 6 },
  { value: '1Y', label: '1年', months: 12 },
  { value: 'ALL', label: 'すべて', months: 0 }
] as const;

// グラフの色設定
export const CHART_COLORS = {
  assets: '#4caf50',
  liabilities: '#f44336',
  netWorth: '#2196f3',
  cash: '#4caf50',
  bankAccount: '#2196f3',
  cardLoan: '#f44336',
  paypayCard: '#ff6b35',
  positive: '#4caf50',
  negative: '#f44336',
  neutral: '#9e9e9e'
} as const;

// 財務状況の評価
export interface FinancialHealthScore {
  score: number; // 0-100点
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    debtToAssetRatio: number;
    emergencyFundRatio: number;
    monthlySavingsRate: number;
    debtServiceRatio: number;
  };
  recommendations: string[];
}

// 月次データの集計
export interface MonthlyAggregation {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  debtPayments: number;
  assetGrowth: number;
  liabilityChange: number;
}
