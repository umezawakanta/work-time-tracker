import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { SubscriptionPlanModel } from '../../src/server/models/Subscription';

// Plan data (can be stored in database or environment variables)
const defaultPlans = [
  {
    name: 'フリープラン',
    description: '個人利用に最適な基本機能',
    stripePriceId: 'price_free',
    stripeProductId: 'prod_free',
    price: 0,
    currency: 'jpy',
    billingCycle: 'monthly',
    limits: {
      workHours: 100,
      projects: 3,
      tasks: 50,
      reports: 5,
      apiCalls: 1000,
      storage: 104857600, // 100MB
      teamMembers: 1,
      integrations: 2,
      advancedFeatures: false,
      prioritySupport: false,
      customBranding: false,
    },
    features: [
      { name: '基本的な時間追跡', description: '月100時間まで', included: true, category: 'core' },
      {
        name: 'プロジェクト管理',
        description: '3プロジェクトまで',
        included: true,
        category: 'core',
      },
      { name: 'タスク管理', description: '50タスクまで', included: true, category: 'core' },
      { name: 'レポート作成', description: '月5件まで', included: true, category: 'core' },
      { name: 'データエクスポート', description: 'CSV形式', included: true, category: 'core' },
      { name: 'チーム機能', description: '利用不可', included: false, category: 'advanced' },
      { name: 'AI機能', description: '利用不可', included: false, category: 'advanced' },
      {
        name: 'API アクセス',
        description: '基本的なアクセス',
        included: true,
        category: 'integration',
      },
      {
        name: 'サポート',
        description: 'コミュニティサポート',
        included: true,
        category: 'support',
      },
    ],
    isActive: true,
    isPopular: false,
    sortOrder: 1,
    trialDays: 30,
    target: 'individual',
    maxUsers: 1,
  },
  {
    name: 'ベーシックプラン',
    description: '小規模チーム向けの機能拡張',
    stripePriceId: 'price_basic_monthly',
    stripeProductId: 'prod_basic',
    price: 980,
    currency: 'jpy',
    billingCycle: 'monthly',
    limits: {
      workHours: 500,
      projects: 15,
      tasks: 200,
      reports: 25,
      apiCalls: 5000,
      storage: 1073741824, // 1GB
      teamMembers: 5,
      integrations: 5,
      advancedFeatures: true,
      prioritySupport: false,
      customBranding: false,
    },
    features: [
      { name: '拡張時間追跡', description: '月500時間まで', included: true, category: 'core' },
      {
        name: 'プロジェクト管理',
        description: '15プロジェクトまで',
        included: true,
        category: 'core',
      },
      { name: 'タスク管理', description: '200タスクまで', included: true, category: 'core' },
      { name: 'レポート作成', description: '月25件まで', included: true, category: 'core' },
      { name: 'チーム機能', description: '5名まで', included: true, category: 'advanced' },
      { name: 'AI機能', description: '基本的なAI提案', included: true, category: 'advanced' },
      {
        name: 'API アクセス',
        description: '拡張アクセス',
        included: true,
        category: 'integration',
      },
      { name: 'サポート', description: 'メールサポート', included: true, category: 'support' },
    ],
    isActive: true,
    isPopular: true,
    sortOrder: 2,
    trialDays: 14,
    target: 'team',
    maxUsers: 5,
  },
  {
    name: 'プレミアムプラン',
    description: '大規模組織向けの完全機能',
    stripePriceId: 'price_premium_monthly',
    stripeProductId: 'prod_premium',
    price: 2980,
    currency: 'jpy',
    billingCycle: 'monthly',
    limits: {
      workHours: -1, // unlimited
      projects: -1,
      tasks: -1,
      reports: -1,
      apiCalls: -1,
      storage: 10737418240, // 10GB
      teamMembers: 50,
      integrations: -1,
      advancedFeatures: true,
      prioritySupport: true,
      customBranding: true,
    },
    features: [
      { name: '無制限時間追跡', description: '制限なし', included: true, category: 'core' },
      { name: 'プロジェクト管理', description: '無制限', included: true, category: 'core' },
      { name: 'タスク管理', description: '無制限', included: true, category: 'core' },
      { name: 'レポート作成', description: '無制限', included: true, category: 'core' },
      { name: 'チーム機能', description: '50名まで', included: true, category: 'advanced' },
      { name: 'AI機能', description: '全AI機能', included: true, category: 'advanced' },
      {
        name: 'カスタムブランディング',
        description: '利用可能',
        included: true,
        category: 'advanced',
      },
      { name: 'API アクセス', description: '無制限', included: true, category: 'integration' },
      { name: 'サポート', description: '優先サポート', included: true, category: 'support' },
    ],
    isActive: true,
    isPopular: false,
    sortOrder: 3,
    trialDays: 14,
    target: 'enterprise',
    maxUsers: 50,
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-5d9q.vercel.app'];

  const isVercelPreview =
    origin && origin.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {
    console.log('🔍 Fetching subscription plans');

    // Connect to database
    await connectDB();

    // Try to get plans from database first
    let plans = await SubscriptionPlanModel.find({ isActive: true }).sort({ sortOrder: 1 });

    // If no plans in database, use default plans
    if (plans.length === 0) {
      console.log('📝 Using default plans (database empty)');

      // Optionally seed the database with default plans
      try {
        const now = new Date().toISOString();
        const planDocuments = defaultPlans.map((plan) => ({
          ...plan,
          version: 1,
          syncStatus: 'synced',
          metadata: {
            source: 'default',
            createdAt: now,
          },
        }));

        await SubscriptionPlanModel.insertMany(planDocuments);
        plans = await SubscriptionPlanModel.find({ isActive: true }).sort({ sortOrder: 1 });
        console.log('✅ Default plans seeded to database');
      } catch (seedError) {
        console.warn('⚠️ Failed to seed plans to database, using default data:', seedError);
        // Return default plans if database seeding fails
        res.status(200).json({
          success: true,
          data: defaultPlans,
          message: 'サブスクリプションプランを取得しました（デフォルトデータ）',
        });
        return;
      }
    }

    console.log('✅ Subscription plans retrieved:', {
      total: plans.length,
      active: plans.filter((p) => p.isActive).length,
    });

    res.status(200).json({
      success: true,
      data: plans,
      message: 'サブスクリプションプランを取得しました',
    });
  } catch (error) {
    console.error('❌ Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'プランの取得中にエラーが発生しました',
    });
  }
}
