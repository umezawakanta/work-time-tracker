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

// 目標データの型定義
export interface FinancialGoal {
    id: string;
    title: string;
    type: "asset" | "debt" | "networth";
    category?: string;
    startValue: number;
    currentValue: number;
    targetValue: number;
    startDate: string;
    targetDate: string;
    period: string;
    account?: string;
    autoUpdate: boolean;
    milestones?: Array<{
        value: number;
        date: string;
        achieved: boolean;
    }>;
    history: Array<{
        date: string;
        value: number;
    }>;
}

// 定義する型
export interface LongTermDataPoint {
    date: string;
    assets: number;
    debts: number;
    netWorth: number;
    savingsRate?: number;
    categories: {
        [key: string]: number;
    };
}

export interface DiaryEntry {
    id: string;
    date: string;
    achievement: string;
    mood: string;
    tags: string[];
    difficulty: number;
    isImportant: boolean;
}

export interface Goal {
    id: string;
    description: string;
    completed: boolean;
    createdAt: string;
    targetDate?: string;
    category: string;
}

export interface Streak {
    currentStreak: number;
    longestStreak: number;
    lastEntryDate: string | null;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    earned: boolean;
    date?: string;
    icon: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    _id: string;
    username: string;
    isAdmin: boolean;
    // その他必要なユーザープロパティ
}

// UserState インターフェースを拡張
export interface UserState {
    id: string | null;
    name: string;
    email: string;
    isLoading: boolean;
    error: string | null;
    lastReminderDate: string | null;
    isLoggedIn: boolean; // ログイン状態を追加
    hasActiveSubscription: boolean; // サブスクリプション状態を追加
    trialActivated: boolean; // トライアル状態を追加
    trialExpiryDate: string | null; // トライアル期限を追加
}
export interface UserSettings {
    reminderEnabled: boolean;
    reminderTime: string;
    darkMode: boolean;
    language: string;
    showTips: boolean;
}

export interface TagOption {
    value: string;
    label: string;
}

export interface GoalCategory {
    value: string;
    label: string;
}

export interface MotivationDataPoint {
    date: string;
    value: number;
    difficulty: number;
    hasEntry: boolean;
}

export interface MonthlyStats {
    entryCount: number;
    moodCounts: Record<string, number>;
    tagCounts: Record<string, number>;
    avgDifficulty: number;
    importantCount: number;
    weeklyAchievements: Record<number, number>;
    highDifficultyCount: number;
    completedGoalsThisMonth: number;
}

export interface Candidate {
    _id?: string;
    name: string;
    party: string;
    prefecture: string | null;
    district: number | null;
    proportionalBlock: string | null;
    status?: string;
    imageUrl?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    lastUpdated?: string;
    biography?: string;
    pastExperience?: string[];
    website?: string;
    supportRate?: number; // 支持率を追加
    socialMedia?: {
        twitter?: string;
        facebook?: string;
        instagram?: string;
    };
}

export interface CandidateState {
    candidates: Candidate[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    lastUpdated: string | null; // 最終更新日時を追加
}