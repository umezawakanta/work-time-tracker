// 仮想通貨システムの型定義

export interface VirtualCurrency {
  id: string;
  name: string;
  symbol: string;
  description: string;
  icon: string;
  exchangeRate: number; // 1円 = exchangeRate通貨
}

export interface UserCurrency {
  userId: string;
  currencyId: string;
  amount: number;
  lastUpdated: Date;
}

export interface CurrencyTransaction {
  id: string;
  userId: string;
  currencyId: string;
  amount: number;
  type: 'earn' | 'spend' | 'reward' | 'purchase' | 'refund';
  source: 'bug_report' | 'feature_request' | 'character_purchase' | 'item_purchase' | 'daily_bonus' | 'achievement' | 'admin';
  description: string;
  timestamp: Date;
  metadata?: {
    bugReportId?: string;
    characterId?: string;
    itemId?: string;
    achievementId?: string;
  };
}

export interface CurrencyReward {
  currencyId: string;
  amount: number;
  reason: string;
  source: string;
}

// デフォルト通貨
export const DEFAULT_CURRENCY: VirtualCurrency = {
  id: 'work_coins',
  name: 'ワークコイン',
  symbol: 'WC',
  description: 'Work Time Trackerで使用できる仮想通貨',
  icon: '🪙',
  exchangeRate: 1 // 1円 = 1ワークコイン
};

// 通貨の定数
export const CURRENCIES = {
  work_coins: DEFAULT_CURRENCY
} as const;

export type CurrencyId = keyof typeof CURRENCIES;
