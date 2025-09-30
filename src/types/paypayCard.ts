// PayPayカード負債管理システムの型定義

export interface PayPayCard {
  id: string;
  userId: string;
  cardName: string; // カード名
  cardType: 'paypay_card' | 'paypay_bank_card' | 'paypay_credit_card'; // カード種別
  cardNumber: string; // カード番号（マスク表示用）
  cardHolderName: string; // カード名義人
  currentBalance: number; // 現在の残高（円）
  creditLimit: number; // 利用可能枠（円）
  availableCredit: number; // 利用可能残高（円）
  minimumPayment: number; // 最低支払額（円）
  interestRate: number; // 金利（年利%）
  paymentDueDate?: Date; // 支払期日
  lastPaymentDate?: Date; // 最終支払日
  lastUpdated: Date; // 最終更新日時
  notes?: string; // メモ
  isActive: boolean; // アクティブかどうか
  createdAt: Date;
  updatedAt: Date;
}

export interface PayPayCardTransaction {
  id: string;
  userId: string;
  paypayCardId: string; // PayPayカードID
  type: 'purchase' | 'payment' | 'cashback' | 'refund' | 'adjustment' | 'interest_charge'; // 購入、支払い、キャッシュバック、返金、調整、利息課金
  amount: number; // 金額（円）
  description: string; // 説明
  category?: string; // カテゴリ
  merchant?: string; // 加盟店名
  transactionDate: Date; // 取引日
  balanceAfter: number; // 取引後の残高
  cashbackAmount?: number; // キャッシュバック額
  referenceNumber?: string; // 取引番号・参照番号
  createdAt: Date;
  updatedAt: Date;
}

export interface PayPayCardSummary {
  totalDebt: number; // 総負債額
  totalCreditLimit: number; // 総利用可能枠
  totalAvailableCredit: number; // 総利用可能残高
  cardCount: number; // カード数
  totalPurchases: number; // 総購入額
  totalPayments: number; // 総支払額
  totalCashback: number; // 総キャッシュバック額
  averageInterestRate: number; // 平均金利
  nextPaymentDate?: Date; // 次回支払期日
  cards: {
    cardId: string;
    cardName: string;
    cardType: string;
    balance: number;
    creditLimit: number;
    availableCredit: number;
    interestRate: number;
    paymentDueDate?: Date;
  }[];
}

export interface PayPayCardAlert {
  id: string;
  userId: string;
  paypayCardId: string;
  type: 'high_balance' | 'payment_due' | 'overdue' | 'credit_limit_exceeded' | 'card_updated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  threshold?: number;
  currentValue?: number;
  dueDate?: Date;
  createdAt: Date;
  isRead: boolean;
}

export interface PayPayCardSettings {
  userId: string;
  highBalanceThreshold: number; // 高残高アラートの閾値
  paymentDueDays: number; // 支払期日までの日数（アラート用）
  creditLimitThreshold: number; // 利用枠超過アラートの閾値
  enableAlerts: boolean;
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  autoCalculateInterest: boolean; // 利息の自動計算
  createdAt: Date;
  updatedAt: Date;
}

// PayPayカードのデフォルト設定
export const DEFAULT_PAYPAY_CARD: Omit<PayPayCard, 'id' | 'userId' | 'currentBalance' | 'creditLimit' | 'availableCredit' | 'lastUpdated' | 'createdAt' | 'updatedAt'> = {
  cardName: 'PayPayカード',
  cardType: 'paypay_card',
  cardNumber: '', // ユーザーが入力
  cardHolderName: '', // ユーザーが入力
  minimumPayment: 0, // ユーザーが設定
  interestRate: 18.0, // 18%（一般的なクレジットカードの金利）
  notes: 'PayPayカードの負債管理',
  isActive: true
};

export const DEFAULT_PAYPAY_CARD_SETTINGS: Omit<PayPayCardSettings, 'userId' | 'createdAt' | 'updatedAt'> = {
  highBalanceThreshold: 500000, // 500,000円
  paymentDueDays: 3, // 3日前
  creditLimitThreshold: 0.9, // 90%
  enableAlerts: true,
  alertFrequency: 'immediate',
  autoCalculateInterest: true
};

// カード種別
export const PAYPAY_CARD_TYPES = [
  { value: 'paypay_card', label: 'PayPayカード', icon: '💳', color: '#ff6b35' },
  { value: 'paypay_bank_card', label: 'PayPay銀行カード', icon: '🏦', color: '#4a90e2' },
  { value: 'paypay_credit_card', label: 'PayPayクレジットカード', icon: '💎', color: '#7b68ee' }
] as const;

// 取引の種類
export const PAYPAY_CARD_TRANSACTION_TYPES = [
  { value: 'purchase', label: '購入', icon: '🛒', color: '#f44336' },
  { value: 'payment', label: '支払い', icon: '💰', color: '#4caf50' },
  { value: 'cashback', label: 'キャッシュバック', icon: '🎁', color: '#ff9800' },
  { value: 'refund', label: '返金', icon: '↩️', color: '#2196f3' },
  { value: 'adjustment', label: '調整', icon: '🔄', color: '#9c27b0' },
  { value: 'interest_charge', label: '利息課金', icon: '📊', color: '#795548' }
] as const;

// カテゴリ
export const PAYPAY_CARD_CATEGORIES = [
  '食費', '交通費', '娯楽', 'ショッピング', '医療費', '光熱費', '通信費', 
  '教育費', '保険', 'その他'
] as const;

// 利息の計算
export interface PayPayInterestCalculation {
  principal: number; // 元本
  interestRate: number; // 年利（%）
  days: number; // 日数
  interestAmount: number; // 利息額
}

// 支払いシミュレーション
export interface PayPayPaymentSimulation {
  monthlyPayment: number; // 月々の支払額
  totalMonths: number; // 完済までの月数
  totalInterest: number; // 総利息額
  totalAmount: number; // 総支払額
  schedule: {
    month: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}
