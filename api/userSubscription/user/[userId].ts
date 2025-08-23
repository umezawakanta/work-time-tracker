/**
 * 👤 特定ユーザーのサブスクリプション取得 API
 * /api/userSubscription/user/[userId]
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// デモユーザーのサブスクリプションデータ
const getUserSubscriptionData = (userId: string) => {
  // デモユーザーの場合
  if (userId === 'demo-user') {
    return {
      _id: 'sub-demo-1',
      userId: 'demo-user',
      planId: 'adhd-premium-plan',
      planName: 'ADHD/ASD プレミアムプラン',
      status: 'active',
      price: 1980,
      currency: 'JPY',
      billingCycle: 'monthly',
      currentPeriodStart: new Date('2024-12-01'),
      currentPeriodEnd: new Date('2025-01-01'),
      cancelAtPeriodEnd: false,
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2027,
      },
      features: [
        '🧠 高度認知特性分析 (WEIS相当)',
        '🎯 認知統合パーソナライズ',
        '📋 最適化タスク管理',
        '💰 適応的資産管理',
        '🎨 完全適応UI',
        '⚡ リアルタイム適応',
        '🤖 AI認知コーチング',
        '🤝 ソーシャルサポート',
        '📞 専門家サポート',
        '🔒 プライバシー保護',
      ],
      usage: {
        cognitiveAssessments: 12,
        optimizedTasks: 156,
        adaptiveUIChanges: 1247,
        coachingInteractions: 34,
        supportConnections: 8,
      },
      achievements: [
        {
          id: 'first-assessment',
          name: '初回認知評価完了',
          date: new Date('2024-11-05'),
          description: 'WEIS相当の認知評価を完了し、パーソナライズを開始',
        },
        {
          id: 'task-master',
          name: 'タスクマスター',
          date: new Date('2024-11-20'),
          description: '100個のタスクを最適化システムで完了',
        },
        {
          id: 'ui-adaptor',
          name: 'UI適応者',
          date: new Date('2024-12-01'),
          description: '1000回以上のUI自動適応を体験',
        },
      ],
      nextBillingDate: new Date('2025-01-01'),
      trialDaysRemaining: 0,
      isActive: true,
      canUpgrade: true,
      canDowngrade: false,
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-12-15'),
    };
  }

  // その他のユーザー（基本プラン）
  return {
    _id: `sub-${userId}`,
    userId: userId,
    planId: 'basic-plan',
    planName: 'ベーシックプラン',
    status: 'active',
    price: 980,
    currency: 'JPY',
    billingCycle: 'monthly',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
    cancelAtPeriodEnd: false,
    paymentMethod: null,
    features: ['🧠 基本認知特性分析', '📋 標準タスク管理', '💰 基本資産管理', '🎨 標準UI'],
    usage: {
      cognitiveAssessments: 1,
      optimizedTasks: 0,
      adaptiveUIChanges: 0,
      coachingInteractions: 0,
      supportConnections: 0,
    },
    achievements: [],
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    trialDaysRemaining: 14,
    isActive: true,
    canUpgrade: true,
    canDowngrade: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;

  try {
    if (req.method === 'GET') {
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          message: 'User ID is required and must be a string',
          error: 'INVALID_USER_ID',
        });
      }

      const subscriptionData = getUserSubscriptionData(userId);

      // ユーザーが存在しない場合のシミュレーション
      if (userId.includes('nonexistent') || userId.includes('deleted')) {
        return res.status(404).json({
          message: 'User subscription not found',
          error: 'SUBSCRIPTION_NOT_FOUND',
          userId: userId,
        });
      }

      return res.status(200).json(subscriptionData);
    }

    if (req.method === 'PUT') {
      // サブスクリプション更新
      const currentData = getUserSubscriptionData(userId as string);
      const updatedData = {
        ...currentData,
        ...req.body,
        updatedAt: new Date(),
      };

      return res.status(200).json(updatedData);
    }

    if (req.method === 'DELETE') {
      // サブスクリプション削除/キャンセル
      const subscriptionData = getUserSubscriptionData(userId as string);
      const canceledData = {
        ...subscriptionData,
        status: 'canceled',
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      };

      return res.status(200).json(canceledData);
    }

    return res.status(405).json({
      message: 'Method not allowed',
      allowedMethods: ['GET', 'PUT', 'DELETE'],
    });
  } catch (error) {
    console.error(`UserSubscription API error for user ${userId}:`, error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: userId,
    });
  }
}
