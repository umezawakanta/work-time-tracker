// カードローン負債管理システムの型定義

export interface CardLoan {
  id: string;
  userId: string;
  bankName: string; // 銀行名
  branchName: string; // 支店名
  loanType: 'card_loan' | 'personal_loan' | 'housing_loan' | 'education_loan'; // ローン種別
  loanName: string; // ローン名
  accountNumber: string; // 口座番号
  accountHolderName: string; // 口座名義人
  currentBalance: number; // 現在の残高（円）
  originalAmount: number; // 当初借入額（円）
  interestRate: number; // 金利（年利%）
  monthlyPayment: number; // 月々の返済額（円）
  lastPaymentDate?: Date; // 最終返済日
  nextPaymentDate?: Date; // 次回返済予定日
  lastUpdated: Date; // 最終更新日時
  notes?: string; // メモ
  isActive: boolean; // アクティブかどうか
  createdAt: Date;
  updatedAt: Date;
}

export interface CardLoanTransaction {
  id: string;
  userId: string;
  cardLoanId: string; // カードローンID
  type: 'borrowing' | 'repayment' | 'interest_payment' | 'adjustment' | 'refinancing'; // 借入、返済、利息支払い、調整、借り換え
  amount: number; // 金額（円）
  description: string; // 説明
  category?: string; // カテゴリ
  transactionDate: Date; // 取引日
  balanceAfter: number; // 取引後の残高
  interestAmount?: number; // 利息額（返済の場合）
  principalAmount?: number; // 元本額（返済の場合）
  referenceNumber?: string; // 取引番号・参照番号
  createdAt: Date;
  updatedAt: Date;
}

export interface CardLoanSummary {
  totalDebt: number; // 総負債額
  loanCount: number; // ローン数
  totalBorrowed: number; // 総借入額
  totalRepaid: number; // 総返済額
  monthlyTotalPayment: number; // 月々の総返済額
  averageInterestRate: number; // 平均金利
  nextPaymentDate?: Date; // 次回返済予定日
  loans: {
    loanId: string;
    bankName: string;
    branchName: string;
    loanType: string;
    loanName: string;
    balance: number;
    monthlyPayment: number;
    interestRate: number;
    nextPaymentDate?: Date;
  }[];
}

export interface CardLoanAlert {
  id: string;
  userId: string;
  cardLoanId: string;
  type: 'high_debt' | 'payment_due' | 'overdue' | 'interest_rate_change' | 'loan_updated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  threshold?: number;
  currentValue?: number;
  dueDate?: Date;
  createdAt: Date;
  isRead: boolean;
}

export interface CardLoanSettings {
  userId: string;
  highDebtThreshold: number; // 高負債アラートの閾値
  paymentDueDays: number; // 返済日までの日数（アラート用）
  enableAlerts: boolean;
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  autoCalculateInterest: boolean; // 利息の自動計算
  createdAt: Date;
  updatedAt: Date;
}

// 三井住友銀行大塚支店のカードローンデフォルト設定
export const DEFAULT_CARD_LOAN: Omit<CardLoan, 'id' | 'userId' | 'currentBalance' | 'originalAmount' | 'lastUpdated' | 'createdAt' | 'updatedAt'> = {
  bankName: '三井住友銀行',
  branchName: '大塚支店',
  loanType: 'card_loan',
  loanName: 'カードローン',
  accountNumber: '', // ユーザーが入力
  accountHolderName: '', // ユーザーが入力
  interestRate: 14.0, // 14%（一般的なカードローンの金利）
  monthlyPayment: 0, // ユーザーが設定
  notes: '三井住友銀行大塚支店のカードローン',
  isActive: true
};

export const DEFAULT_CARD_LOAN_SETTINGS: Omit<CardLoanSettings, 'userId' | 'createdAt' | 'updatedAt'> = {
  highDebtThreshold: 1000000, // 1,000,000円
  paymentDueDays: 3, // 3日前
  enableAlerts: true,
  alertFrequency: 'immediate',
  autoCalculateInterest: true
};

// ローン種別
export const LOAN_TYPES = [
  { value: 'card_loan', label: 'カードローン', icon: '💳', color: '#e91e63' },
  { value: 'personal_loan', label: '個人ローン', icon: '👤', color: '#9c27b0' },
  { value: 'housing_loan', label: '住宅ローン', icon: '🏠', color: '#3f51b5' },
  { value: 'education_loan', label: '教育ローン', icon: '🎓', color: '#ff9800' }
] as const;

// 取引の種類
export const CARD_LOAN_TRANSACTION_TYPES = [
  { value: 'borrowing', label: '借入', icon: '📈', color: '#f44336' },
  { value: 'repayment', label: '返済', icon: '📉', color: '#4caf50' },
  { value: 'interest_payment', label: '利息支払い', icon: '💰', color: '#ff9800' },
  { value: 'adjustment', label: '調整', icon: '🔄', color: '#9c27b0' },
  { value: 'refinancing', label: '借り換え', icon: '🔄', color: '#2196f3' }
] as const;

// 金利の計算
export interface InterestCalculation {
  principal: number; // 元本
  interestRate: number; // 年利（%）
  days: number; // 日数
  interestAmount: number; // 利息額
}

// 返済シミュレーション
export interface RepaymentSimulation {
  monthlyPayment: number; // 月々の返済額
  totalMonths: number; // 完済までの月数
  totalInterest: number; // 総利息額
  totalAmount: number; // 総返済額
  schedule: {
    month: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}
