// 銀行口座残高管理システムの型定義

export interface BankAccount {
  id: string;
  userId: string;
  bankName: string; // 銀行名
  branchName: string; // 支店名
  accountType: '普通' | '当座' | '貯蓄' | '定期'; // 口座種別
  accountNumber: string; // 口座番号
  accountHolderName: string; // 口座名義人
  currentBalance: number; // 現在の残高（円）
  lastUpdated: Date; // 最終更新日時
  notes?: string; // メモ
  isActive: boolean; // アクティブかどうか
  createdAt: Date;
  updatedAt: Date;
}

export interface BankTransaction {
  id: string;
  userId: string;
  bankAccountId: string; // 銀行口座ID
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'adjustment'; // 入金、出金、振込入金、振込出金、調整
  amount: number; // 金額（円）
  description: string; // 説明
  category?: string; // カテゴリ
  counterparty?: string; // 取引先
  transactionDate: Date; // 取引日
  balanceAfter: number; // 取引後の残高
  referenceNumber?: string; // 取引番号・参照番号
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccountSummary {
  totalBalance: number; // 総残高
  accountCount: number; // 口座数
  totalDeposits: number; // 総入金額
  totalWithdrawals: number; // 総出金額
  monthlyChange: number; // 月間変化
  lastTransactionDate?: Date; // 最終取引日
  accounts: {
    accountId: string;
    bankName: string;
    branchName: string;
    accountType: string;
    balance: number;
    lastUpdated: Date;
  }[];
}

export interface BankAccountAlert {
  id: string;
  userId: string;
  bankAccountId: string;
  type: 'low_balance' | 'high_withdrawal' | 'unusual_activity' | 'account_updated';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  threshold?: number;
  currentValue?: number;
  createdAt: Date;
  isRead: boolean;
}

export interface BankAccountSettings {
  userId: string;
  lowBalanceThreshold: number; // 低残高アラートの閾値
  highWithdrawalThreshold: number; // 高出金アラートの閾値（日次）
  enableAlerts: boolean;
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  autoSyncEnabled: boolean; // 自動同期（将来の機能）
  createdAt: Date;
  updatedAt: Date;
}

// 三井住友銀行大塚支店のデフォルト設定
export const DEFAULT_BANK_ACCOUNT: Omit<BankAccount, 'id' | 'userId' | 'currentBalance' | 'lastUpdated' | 'createdAt' | 'updatedAt'> = {
  bankName: '三井住友銀行',
  branchName: '大塚支店',
  accountType: '普通',
  accountNumber: '', // ユーザーが入力
  accountHolderName: '', // ユーザーが入力
  notes: '三井住友銀行大塚支店の普通預金口座',
  isActive: true
};

export const DEFAULT_BANK_ACCOUNT_SETTINGS: Omit<BankAccountSettings, 'userId' | 'createdAt' | 'updatedAt'> = {
  lowBalanceThreshold: 50000, // 50,000円
  highWithdrawalThreshold: 100000, // 100,000円
  enableAlerts: true,
  alertFrequency: 'immediate',
  autoSyncEnabled: false
};

// 銀行口座の種類
export const BANK_ACCOUNT_TYPES = [
  { value: '普通', label: '普通預金', icon: '🏦' },
  { value: '当座', label: '当座預金', icon: '💼' },
  { value: '貯蓄', label: '貯蓄預金', icon: '💰' },
  { value: '定期', label: '定期預金', icon: '📅' }
] as const;

// 取引の種類
export const TRANSACTION_TYPES = [
  { value: 'deposit', label: '入金', icon: '📈', color: '#4caf50' },
  { value: 'withdrawal', label: '出金', icon: '📉', color: '#f44336' },
  { value: 'transfer_in', label: '振込入金', icon: '↗️', color: '#2196f3' },
  { value: 'transfer_out', label: '振込出金', icon: '↘️', color: '#ff9800' },
  { value: 'adjustment', label: '調整', icon: '🔄', color: '#9c27b0' }
] as const;
