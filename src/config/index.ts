// src/config/index.ts

/**
 * アプリケーション設定
 * 環境変数からの読み込みと、デフォルト値の設定
 */

// 環境変数を安全に取得するユーティリティ関数
const getEnvVar = (key: string): string | undefined => {
  // Jest環境ではprocess.envを優先
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  // Vite環境でのimport.meta.env（安全にアクセス）
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).import?.meta?.env) {
      return (globalThis as any).import.meta.env[key];
    }
  } catch (e) {
    // import.metaが利用できない場合は無視
  }

  return undefined;
};

const isDev = () => {
  return (
    getEnvVar('NODE_ENV') === 'development' ||
    getEnvVar('DEV') === 'true' ||
    getEnvVar('MODE') === 'development'
  );
};

// デバッグ用の設定確認
if (isDev()) {
  console.log('🔧 Firebase Config Check:', {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY') ? 'Set' : 'Missing',
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') ? 'Set' : 'Missing',
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') ? 'Set' : 'Missing',
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') ? 'Set' : 'Missing',
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') ? 'Set' : 'Missing',
    appId: getEnvVar('VITE_FIREBASE_APP_ID') ? 'Set' : 'Missing',
  });
}

// Firebase設定をデバッグ情報と共にエクスポート
const firebaseEnvVars = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
};

// 開発環境でのデバッグ情報
if (isDev()) {
  const configStatus = Object.entries(firebaseEnvVars).reduce(
    (acc, [key, value]) => {
      acc[key] = value ? 'Set' : 'Missing';
      return acc;
    },
    {} as Record<string, string>
  );

  console.log('🔧 Firebase Config Status:', configStatus);

  // 設定が不完全な場合の案内
  const missingConfigs = Object.entries(configStatus)
    .filter(([_, status]) => status === 'Missing')
    .map(([key]) => key);

  if (missingConfigs.length > 0) {
    console.warn(`
🚧 Firebase設定が不完全です。以下の環境変数を.env.localファイルに追加してください:

${missingConfigs.map((key) => `VITE_FIREBASE_${key.toUpperCase()}=your_${key}_here`).join('\n')}

現在は開発モードでモック機能が使用されます。
    `);
  }
}

export const firebaseConfig = firebaseEnvVars;

// アプリケーション情報
export const appInfo = {
  name: getEnvVar('VITE_APP_NAME') || '資産/負債管理アプリ',
  version: getEnvVar('VITE_APP_VERSION') || '1.0.0',
  description:
    getEnvVar('VITE_APP_DESCRIPTION') || 'あなたの財務状況を分析・管理するためのダッシュボード',
};

// サブスクリプションプラン設定
export const subscriptionPlans = {
  premium: {
    monthly: {
      id: getEnvVar('VITE_PREMIUM_MONTHLY_PLAN_ID'),
      price: 980,
      currency: 'JPY',
      interval: 'month',
      name: 'プレミアム（月額）',
    },
    annual: {
      id: getEnvVar('VITE_PREMIUM_ANNUAL_PLAN_ID'),
      price: 9800,
      currency: 'JPY',
      interval: 'year',
      name: 'プレミアム（年額）',
    },
  },
  business: {
    id: getEnvVar('VITE_BUSINESS_PLAN_ID'),
    price: 2980,
    currency: 'JPY',
    interval: 'month',
    name: 'ビジネス',
  },
};

// プレミアム機能リスト
export const premiumFeatures = [
  {
    id: 'category-analysis',
    name: '資産カテゴリ分析',
    description: 'アセットタイプ別の資産配分を詳細に分析',
    icon: 'PieChart',
  },
  {
    id: 'trend-analysis',
    name: '長期トレンド分析',
    description: '最大5年間の資産・負債・純資産の推移分析',
    icon: 'LineChart',
  },
  {
    id: 'goal-tracking',
    name: '目標設定と進捗管理',
    description: '財務目標の設定とリアルタイム進捗追跡',
    icon: 'Target',
  },
  {
    id: 'data-export',
    name: 'データエクスポート',
    description: 'CSV/PDF形式でのデータエクスポート',
    icon: 'FileDown',
  },
  {
    id: 'report-sharing',
    name: 'レポート共有',
    description: '安全な共有リンクでのレポート共有',
    icon: 'Share2',
  },
];

// API設定
export const apiConfig = {
  baseURL: getEnvVar('VITE_API_BASE_URL') || 'http://localhost:3001/api',
  timeout: 10000,
};

// フィードバックタイプ
export const feedbackTypes = [
  { id: 'bug', label: 'バグ報告' },
  { id: 'feature', label: '機能リクエスト' },
  { id: 'improvement', label: '改善提案' },
  { id: 'other', label: 'その他' },
];

// 設定
export const appConfig = {
  debug: getEnvVar('VITE_DEBUG_MODE') === 'true',
  enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS') !== 'false',
  defaultLocale: getEnvVar('VITE_DEFAULT_LOCALE') || 'ja',
  supportedLocales: ['ja', 'en'],
  defaultCurrency: 'JPY',
  supportedCurrencies: ['JPY', 'USD', 'EUR'],
  defaultTheme: 'system',
  updateFrequencies: [
    { id: 'daily', label: '毎日' },
    { id: 'weekly', label: '毎週' },
    { id: 'monthly', label: '毎月' },
  ],
  defaultTimeRanges: [
    { id: 'month', label: '1ヶ月' },
    { id: 'quarter', label: '3ヶ月' },
    { id: 'year', label: '1年' },
    { id: 'all', label: '全期間' },
  ],
};

// 資産カテゴリ
export const assetCategories = [
  { id: 'cash-savings', label: '現金・預金', icon: 'Wallet' },
  { id: 'investment', label: '投資', icon: 'TrendingUp' },
  { id: 'real-estate', label: '不動産', icon: 'Home' },
  { id: 'pension-insurance', label: '年金・保険', icon: 'Shield' },
  { id: 'other', label: 'その他', icon: 'Package' },
];

// 負債カテゴリ
export const debtCategories = [
  { id: 'mortgage', label: '住宅ローン', icon: 'Home' },
  { id: 'car-loan', label: '自動車ローン', icon: 'Car' },
  { id: 'education-loan', label: '教育ローン', icon: 'BookOpen' },
  { id: 'credit-card', label: 'クレジットカード', icon: 'CreditCard' },
  { id: 'other', label: 'その他', icon: 'FileText' },
];

export default {
  firebaseConfig,
  appInfo,
  subscriptionPlans,
  premiumFeatures,
  apiConfig,
  feedbackTypes,
  appConfig,
  assetCategories,
  debtCategories,
};
