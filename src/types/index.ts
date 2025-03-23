// types.ts - 共通型定義ファイル

/**
 * 目標設定の型定義
 */
export interface TargetSettings {
    autoUpdate: boolean;
    updateFrequency: string;
    targetValue: number;
    targetDate: string;
}

/**
 * 資産エントリーの型定義
 * アプリケーション全体で共通して使用する
 */
export interface AssetEntry {
    _id?: string;        // MongoDBなどのデータベースID
    id?: string;         // クライアント側で使用されるID
    date: string;        // 日付 - ISO文字列形式
    value: number;       // 金額
    account: string;     // 口座名・資産名
    category?: string;   // 資産カテゴリ
    targetSettings?: TargetSettings; // 目標設定

    // 追加のオプショナルフィールド
    lastUpdated?: string;  // 最終更新日
    createdAt?: Date;      // 作成日
    type?: string;         // 資産タイプ
    isLiquid?: boolean;    // 流動性のある資産かどうか
    isInvestment?: boolean;// 投資資産かどうか
}

/**
 * 負債エントリーの型定義
 */
export interface DebtEntry {
    _id?: string;        // MongoDBなどのデータベースID
    id?: string;         // クライアント側で使用されるID
    date: string;        // 日付 - ISO文字列形式
    value: number;       // 負債額
    account: string;     // 負債名
    category?: string;   // 負債カテゴリ
    targetSettings?: TargetSettings; // 目標設定

    // 追加のオプショナルフィールド
    lastUpdated?: string;   // 最終更新日
    createdAt?: Date;       // 作成日
    type?: string;          // 負債タイプ
    interestRate?: number;  // 金利
    minimumPayment?: number;// 最低返済額
    dueDate?: string;       // 返済期日
}

/**
 * 結合されたデータポイントの型定義
 */
export interface CombinedDataPoint {
    date: string;
    value: number;
    type: 'asset' | 'debt' | 'netWorth';
    account?: string;
}

/**
 * 財務指標の型定義
 */
export interface FinancialMetrics {
    totalAssets: number;
    totalDebts: number;
    netWorth: number;
    debtToAssetRatio: number;
    assetGrowthRate: number;
    monthlyNetWorthChange: number;
    emergencyFundRatio: number;
    projectedNetWorth: number;
    investmentAllocation: number;
    liquidityRatio: number;
}

// 財務データ型定義
export interface FinancialData {
    date: string;
    assets: number;
    debts: number;
    netWorth: number;
    cashFlow?: number;
    targetNetWorth?: number;
    targetAssets?: number;  // 追加: 目標資産額
    targetDebts?: number;   // 追加: 目標負債額
    savingsRate?: number;
    debtToIncomeRatio?: number;
    investmentReturns?: number;
    categories?: {
      [category: string]: number;
    };
    debtCategories?: {     // 追加: 負債カテゴリ
      [category: string]: number;
    };
  }