// ATM取引の型定義

export interface ATMTransaction {
  id: string;
  userId: string;
  bankAccountId: string; // 銀行口座ID
  transactionDate: Date;
  transactionType: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'fee' | 'interest';
  amount: number;
  balance: number; // 取引後の残高
  atmLocation: string; // ATMの場所
  atmBranch: string; // ATMの支店名
  description?: string; // 取引の説明
  referenceNumber?: string; // 取引番号
  fees?: number; // 手数料
  notes?: string; // メモ
  createdAt: Date;
  updatedAt: Date;
}

export interface ATMTransactionSummary {
  totalDeposits: number; // 総入金額
  totalWithdrawals: number; // 総出金額
  totalFees: number; // 総手数料
  netAmount: number; // 純額（入金 - 出金 - 手数料）
  transactionCount: number; // 取引回数
  lastTransactionDate?: Date; // 最後の取引日
  mostUsedATM: string; // 最も利用したATM
  averageTransactionAmount: number; // 平均取引金額
}

export interface ATMTransactionAnalysis {
  monthlyTrend: Array<{
    month: string;
    deposits: number;
    withdrawals: number;
    fees: number;
    netAmount: number;
  }>;
  atmUsage: Array<{
    location: string;
    branch: string;
    transactionCount: number;
    totalAmount: number;
  }>;
  transactionTypeDistribution: Array<{
    type: string;
    count: number;
    totalAmount: number;
    percentage: number;
  }>;
  spendingPattern: 'conservative' | 'moderate' | 'frequent' | 'heavy';
}

export const ATM_TRANSACTION_TYPES = [
  { value: 'deposit', label: '入金' },
  { value: 'withdrawal', label: '出金' },
  { value: 'transfer_in', label: '振込入金' },
  { value: 'transfer_out', label: '振込出金' },
  { value: 'fee', label: '手数料' },
  { value: 'interest', label: '利息' }
] as const;

export type ATMTransactionType = typeof ATM_TRANSACTION_TYPES[number]['value'];
