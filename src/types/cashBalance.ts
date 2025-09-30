// 現金残高管理システムの型定義

export interface CashBalance {
  id: string;
  userId: string;
  amount: number; // 現金残高（円）
  lastUpdated: Date;
  notes?: string; // メモ
  createdAt: Date;
  updatedAt: Date;
}

export interface CashTransaction {
  id: string;
  userId: string;
  type: 'income' | 'expense' | 'adjustment'; // 収入、支出、調整
  amount: number; // 金額（円）
  description: string; // 説明
  category?: string; // カテゴリ
  date: Date;
  balanceAfter: number; // 取引後の残高
  createdAt: Date;
  updatedAt: Date;
}

export interface CashBalanceSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  lastTransactionDate?: Date;
  weeklyChange: number; // 週間変化
  monthlyChange: number; // 月間変化
}

export interface CashBalanceAlert {
  id: string;
  userId: string;
  type: 'low_balance' | 'high_expense' | 'unusual_activity';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  threshold?: number;
  currentValue?: number;
  createdAt: Date;
  isRead: boolean;
}

// 現金残高の設定
export interface CashBalanceSettings {
  userId: string;
  lowBalanceThreshold: number; // 低残高アラートの閾値
  highExpenseThreshold: number; // 高支出アラートの閾値（日次）
  enableAlerts: boolean;
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  createdAt: Date;
  updatedAt: Date;
}

// デフォルト設定
export const DEFAULT_CASH_BALANCE_SETTINGS: Omit<CashBalanceSettings, 'userId' | 'createdAt' | 'updatedAt'> = {
  lowBalanceThreshold: 1000, // 1,000円
  highExpenseThreshold: 5000, // 5,000円
  enableAlerts: true,
  alertFrequency: 'immediate'
};
