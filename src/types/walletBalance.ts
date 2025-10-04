// 財布の残高管理の型定義

export interface WalletBalance {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  lastUpdated: Date;
  notes?: string;
  tags?: string[];
}

export interface WalletTransaction {
  id: string;
  userId: string;
  walletId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Date;
  tags?: string[];
}

export interface WalletBalanceSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  lastTransactionDate?: Date;
  averageDailyExpense: number;
  averageDailyIncome: number;
}

export interface WalletBalanceAnalysis {
  balance: WalletBalanceSummary;
  trends: {
    daily: Array<{
      date: string;
      balance: number;
      income: number;
      expense: number;
    }>;
    weekly: Array<{
      week: string;
      balance: number;
      income: number;
      expense: number;
    }>;
    monthly: Array<{
      month: string;
      balance: number;
      income: number;
      expense: number;
    }>;
  };
  insights: Array<{
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
    action?: string;
  }>;
}

export const WALLET_CATEGORIES = [
  { id: 'food', name: '食費', icon: '🍽️' },
  { id: 'transport', name: '交通費', icon: '🚗' },
  { id: 'shopping', name: '買い物', icon: '🛍️' },
  { id: 'entertainment', name: '娯楽', icon: '🎮' },
  { id: 'health', name: '健康・医療', icon: '🏥' },
  { id: 'education', name: '教育・学習', icon: '📚' },
  { id: 'utilities', name: '光熱費', icon: '⚡' },
  { id: 'other', name: 'その他', icon: '📝' },
] as const;

export const WALLET_INSIGHTS = [
  {
    type: 'warning' as const,
    title: '残高不足',
    description: '残高が少なくなっています。支出を見直しましょう。',
    action: '支出を確認'
  },
  {
    type: 'info' as const,
    title: '支出パターン',
    description: '今月の支出は前月比で増加しています。',
    action: '詳細を確認'
  },
  {
    type: 'success' as const,
    title: '節約成功',
    description: '今月は目標より支出を抑えることができました。',
    action: '成果を確認'
  }
] as const;
