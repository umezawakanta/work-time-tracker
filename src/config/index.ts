// src/config/index.ts

/**
 * アプリケーション設定
 * 環境変数からの読み込みと、デフォルト値の設定
 */

// Firebase設定
export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  
  // アプリケーション情報
  export const appInfo = {
    name: process.env.NEXT_PUBLIC_APP_NAME || '資産/負債管理アプリ',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'あなたの財務状況を分析・管理するためのダッシュボード',
  };
  
  // サブスクリプションプラン設定
  export const subscriptionPlans = {
    premium: {
      monthly: {
        id: process.env.NEXT_PUBLIC_PREMIUM_MONTHLY_PLAN_ID,
        price: 980,
        currency: 'JPY',
        interval: 'month',
        name: 'プレミアム（月額）',
      },
      annual: {
        id: process.env.NEXT_PUBLIC_PREMIUM_ANNUAL_PLAN_ID,
        price: 9800,
        currency: 'JPY',
        interval: 'year',
        name: 'プレミアム（年額）',
      },
    },
    business: {
      id: process.env.NEXT_PUBLIC_BUSINESS_PLAN_ID,
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
    baseUrl: process.env.API_BASE_URL || '',
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
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
    debug: process.env.DEBUG_MODE === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    defaultLocale: process.env.DEFAULT_LOCALE || 'ja',
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