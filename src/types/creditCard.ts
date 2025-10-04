// クレジットカードの型定義

export interface CreditCard {
  id: string;
  userId: string;
  cardName: string; // カード名（例：Visa Gold、JCB Platinum）
  cardType: 'visa' | 'mastercard' | 'jcb' | 'amex' | 'diners' | 'discover' | 'other';
  cardNumber: string; // マスクされたカード番号（例：****-****-****-1234）
  lastFourDigits: string; // 下4桁
  expiryMonth: number; // 有効期限月（1-12）
  expiryYear: number; // 有効期限年
  cardHolderName: string; // カード名義人
  issuer: string; // 発行会社（例：三井住友カード、楽天カード）
  creditLimit: number; // 利用限度額
  currentBalance: number; // 現在の残高
  availableCredit: number; // 利用可能枠
  minimumPayment: number; // 最低支払額
  paymentDueDate: Date; // 支払日
  interestRate: number; // 金利（年率）
  annualFee: number; // 年会費
  rewardProgram: string; // ポイント・マイルプログラム
  isActive: boolean; // アクティブかどうか
  isPrimary: boolean; // メインカードかどうか
  notes?: string; // メモ
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditCardSummary {
  totalCards: number; // 総カード数
  totalCreditLimit: number; // 総利用限度額
  totalCurrentBalance: number; // 総現在残高
  totalAvailableCredit: number; // 総利用可能枠
  totalAnnualFees: number; // 総年会費
  averageUtilizationRate: number; // 平均利用率
  totalMinimumPayments: number; // 総最低支払額
  nextPaymentDue?: Date; // 次回支払日
  cardsNearLimit: number; // 限度額に近いカード数
  activeCards: number; // アクティブカード数
}

export interface CreditCardAnalysis {
  utilizationTrend: Array<{
    month: string;
    totalBalance: number;
    totalLimit: number;
    utilizationRate: number;
  }>;
  cardTypeDistribution: Array<{
    type: string;
    count: number;
    totalLimit: number;
    percentage: number;
  }>;
  issuerDistribution: Array<{
    issuer: string;
    count: number;
    totalLimit: number;
    averageRate: number;
  }>;
  paymentBehavior: 'excellent' | 'good' | 'fair' | 'poor';
  creditHealthScore: number; // 1-100
  recommendations: string[];
}

export const CREDIT_CARD_TYPES = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'jcb', label: 'JCB' },
  { value: 'amex', label: 'American Express' },
  { value: 'diners', label: 'Diners Club' },
  { value: 'discover', label: 'Discover' },
  { value: 'other', label: 'その他' }
] as const;

export type CreditCardType = typeof CREDIT_CARD_TYPES[number]['value'];

export const CARD_ISSUERS = [
  '三井住友カード',
  '楽天カード',
  'JCBカード',
  '三菱UFJニコス',
  'オリコ',
  'イオンカード',
  'セディナ',
  'ライフカード',
  'エポスカード',
  'セブンカード',
  'その他'
] as const;

export type CardIssuer = typeof CARD_ISSUERS[number];
