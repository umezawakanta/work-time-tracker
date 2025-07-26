/**
 * 💰 ユーザーサブスクリプション API エンドポイント
 * ADHD/ASD生活支援サイトのサブスクリプション管理
 */

import { NextApiRequest, NextApiResponse } from 'next';

// サンプルサブスクリプションデータ
const sampleSubscriptions = [
  {
    _id: 'sub-demo-1',
    userId: 'demo-user',
    planId: 'basic-plan',
    planName: 'ベーシックプラン',
    status: 'active',
    price: 980,
    currency: 'JPY',
    billingCycle: 'monthly',
    currentPeriodStart: new Date('2024-12-01'),
    currentPeriodEnd: new Date('2025-01-01'),
    cancelAtPeriodEnd: false,
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'visa',
    },
    features: ['認知特性分析', 'タスク管理最適化', '基本的な適応UI', 'メール支援'],
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-01'),
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // すべてのサブスクリプションを取得
      return res.status(200).json(sampleSubscriptions);
    }

    if (req.method === 'POST') {
      // 新しいサブスクリプションを作成
      const newSubscription = {
        _id: `sub-${Date.now()}`,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      sampleSubscriptions.push(newSubscription);
      return res.status(201).json(newSubscription);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('UserSubscription API error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
