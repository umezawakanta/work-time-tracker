// types.ts - 共通型定義ファイル

import { WorkTimeEntry } from './workTimeEntry';

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
/**
 * 資産エントリーの型定義
 * アプリケーション全体で共通して使用する
 */
export interface AssetEntry {
  _id?: string; // MongoDBなどのデータベースID
  id?: string; // クライアント側で使用されるID
  date: string; // 日付 - ISO文字列形式
  value: number; // 金額
  account: string; // 口座名・資産名
  description?: string; // 説明（オプション）
  category?: string; // 資産カテゴリ
  targetSettings?: TargetSettings; // 目標設定

  // 追加のオプショナルフィールド
  lastUpdated?: string; // 最終更新日
  createdAt?: Date; // 作成日
  type?: string; // 資産タイプ
  isLiquid?: boolean; // 流動性のある資産かどうか
  isInvestment?: boolean; // 投資資産かどうか
  interestRate?: number; // 金利などを保存するプロパティの追加
  notes?: string; // メモや備考を保存するプロパティの追加
  name?: string; // コンポーネントが参照している可能性のあるフィールド
  amount?: number; // コンポーネントが参照している可能性のあるフィールド
}

/**
 * 負債エントリーの型定義
 */
export interface DebtEntry {
  _id?: string; // MongoDBなどのデータベースID
  id?: string; // クライアント側で使用されるID
  date: string; // 日付 - ISO文字列形式
  value: number; // 負債額
  account: string; // 負債名
  category?: string; // 負債カテゴリ
  targetSettings?: TargetSettings; // 目標設定
  description: string;

  // 追加のオプショナルフィールド
  lastUpdated?: string; // 最終更新日
  createdAt?: Date; // 作成日
  type?: string; // 負債タイプ
  interestRate?: number; // 金利
  minimumPayment?: number; // 最低返済額
  dueDate?: string; // 返済期日
  notes?: string; // メモや備考
  name?: string; // コンポーネントが参照している可能性のあるフィールド
  amount?: number; // コンポーネントが参照している可能性のあるフィールド
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
  targetAssets?: number; // 追加: 目標資産額
  targetDebts?: number; // 追加: 目標負債額
  savingsRate?: number;
  debtToIncomeRatio?: number;
  investmentReturns?: number;
  categories?: {
    [category: string]: number;
  };
  debtCategories?: {
    // 追加: 負債カテゴリ
    [category: string]: number;
  };
}

// 目標データの型定義
export interface FinancialGoal {
  id: string;
  title: string;
  type: 'asset' | 'debt' | 'networth';
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
  isProjected?: boolean; // 予測データかどうかを示すフラグを追加
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
  lastLoginAt?: string; // 最終ログイン日時
  uid?: string; // Firebase UID
  displayName?: string; // 表示名
  avatar?: string; // オプショナルプロパティとして avatar を追加
  loginCount?: number;
  subscriptionStatus?: 'active' | 'canceled' | 'expired' | 'none';
  hasActiveSubscription?: boolean; // アクティブなサブスクリプション状態
  isPremium?: boolean; // プレミアムユーザー状態
  trialActivated?: boolean; // トライアル有効化状態
  trialExpiryDate?: string; // トライアル有効期限
  // その他必要なユーザープロパティ
  traits?: {
    iq?: number;
    mbti?: string;
  };
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
  prefecture: string; // null ではなく空文字列を使用
  district: number | null;
  proportionalBlock: string; // null ではなく空文字列を使用
  status?: string;
  imageUrl?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  lastUpdated?: string;
  biography?: string;
  pastExperience?: string[];
  website?: string;
  supportRate?: number;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface CandidateState {
  candidates: Candidate[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastUpdated: string | null; // 最終更新日時を追加
}

export interface UserNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
}

// 一般サブスクリプション（外部サービス）の型定義
export interface SubscriptionService {
  _id: string;
  name: string;
  billingDate: number; // 毎月の引き落とし日
  type: string; // サブスクリプションの種別（'streaming', 'software', 'other' など）
  amount: number; // 金額
  userId?: string; // 所有ユーザーID
  checkStatuses?: Record<string, boolean>; // 月ごとのチェック状態（例: { "2024-01": true, "2024-02": false }）
  paymentMethod?: {
    type: string; // 'credit_card', 'bank_transfer', 'other' など
    lastFour?: string; // カード番号の下4桁（カードの場合）
    expiryDate?: string; // 有効期限（カードの場合）
    cardholderName?: string; // カード所有者名（カードの場合）
    isDefault: boolean; // デフォルトの支払い方法かどうか
  };
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean; // これを追加
  expiresAt: string; // これも追加（SubscriptionManagement.tsx で使用されているため）
  bankAccount?: string; // これも追加
  checkedMonths?: string[]; // 追加
}

// ユーザーサブスクリプション（当サイトの有料プラン）の型定義
export interface UserSubscription {
  _id: string;
  userId: string; // サブスクリプションの所有者ID
  planId: string; // プランID
  status: 'active' | 'canceled' | 'expired'; // サブスクリプションの状態
  currentPeriodEnd: Date; // 現在の期間の終了日
  cancelAtPeriodEnd?: boolean; // 期間終了時に自動更新を停止するかどうか
  canceledAt?: Date; // 解約日時
  cancelReason?: string; // 解約理由
  createdAt?: Date; // 作成日時
  updatedAt?: Date; // 更新日時
  paymentMethod?: {
    type: string; // 支払い方法の種類
    lastFour?: string; // カード番号の下4桁（カードの場合）
    expiryDate?: string; // 有効期限
    cardholderName?: string; // カード所有者名
    isDefault: boolean; // デフォルト支払い方法かどうか
  };
  scheduledChanges?: {
    newPlanId: string; // 変更予定のプランID
    effectiveDate: Date; // 変更適用日
  };
}

// 支払い方法のカスタム型定義
export interface CustomPaymentMethodData {
  type: 'credit_card' | 'bank_transfer';
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
  cvc?: string;
  lastFour?: string;
  isDefault?: boolean;
}

// 請求書/インボイスの型定義
export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'failed';
  periodStart: Date | string;
  periodEnd: Date | string;
  paymentMethod: {
    type: string;
    lastFour: string;
  };
  createdAt: Date | string;
}

export interface PaymentMethodType {
  type: string;
  isDefault?: boolean;
}

// 作業状態のインターフェース
export interface WorkState {
  isWorking: boolean;
  startTime: string;
  projectName: string;
  description: string;
  userId: string;
}

// WorkStateレスポンス用のインターフェース
export interface WorkStateApiResponse {
  message?: string;
  workState: WorkState;
}

export interface WorkTimeApiResponse {
  message: string;
  workTime: WorkTimeEntry;
}

// 型定義を改善したフィルター条件の構築
export interface NotificationFilter {
  userId: string;
  read?: boolean;
  type?: string;
}

export interface TodoItem {
  _id: string;
  task: string;
  completed: boolean;
  priority: number;
  isPrioritized: boolean;
  completedDate: string | null;
  type?: 'input' | 'output';
  createdAt?: string;
  deadline?: string;
  category?: string;
  tags?: string[];
  note?: string;
  estimatedDuration?: number;
}
