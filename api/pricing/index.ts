import { NextApiRequest, NextApiResponse } from 'next';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
  ctaText: string;
  ctaVariant: 'default' | 'secondary' | 'outline';
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'フリープラン',
    description: '個人利用に最適な基本機能',
    price: 0,
    period: '月',
    features: [
      '基本的なタスク管理',
      '勤怠記録（月10回まで）',
      'シンプルなレポート',
      'メールサポート',
      'モバイルアプリ利用',
    ],
    limitations: ['高度な分析機能は制限あり', 'チーム機能は利用不可', 'カスタマイズ機能は制限あり'],
    ctaText: '無料で始める',
    ctaVariant: 'outline',
  },
  {
    id: 'pro',
    name: 'プロプラン',
    description: '本格的な生産性向上を目指す方に',
    price: 980,
    period: '月',
    features: [
      '無制限のタスク管理',
      '無制限の勤怠記録',
      '高度な分析・レポート',
      'AI秘書機能',
      '優先サポート',
      'カスタマイズ機能',
      'データエクスポート',
      'チーム機能（最大5名）',
    ],
    limitations: [],
    popular: true,
    ctaText: 'プロプランを試す',
    ctaVariant: 'default',
  },
  {
    id: 'enterprise',
    name: 'エンタープライズ',
    description: '大規模チーム・組織向け',
    price: 2980,
    period: '月',
    features: [
      'プロプランの全機能',
      '無制限のチームメンバー',
      '高度な権限管理',
      'SSO連携',
      '専任サポート',
      'カスタム統合',
      '詳細な監査ログ',
      'SLA保証',
    ],
    limitations: [],
    ctaText: 'エンタープライズを相談',
    ctaVariant: 'secondary',
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // 料金プラン一覧を返す
      res.status(200).json({
        success: true,
        data: {
          plans: pricingPlans,
          billingPeriods: ['monthly', 'yearly'],
          features: {
            freeTrial: {
              duration: 30,
              description: 'すべてのプランで30日間の無料トライアルを提供',
            },
            yearlyDiscount: {
              percentage: 17,
              description: '年額プランでは2ヶ月分の料金が無料',
            },
            cancellation: {
              description: 'いつでも解約可能、現在の請求期間の終了まで利用可能',
            },
          },
        },
      });
    } catch (error) {
      console.error('Pricing plans fetch error:', error);
      res.status(500).json({
        success: false,
        message: '料金プランの取得に失敗しました',
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { planId, billingPeriod, userEmail } = req.body;

      if (!planId || !billingPeriod || !userEmail) {
        return res.status(400).json({
          success: false,
          message: '必須パラメータが不足しています',
        });
      }

      // プラン選択の処理（実際の実装では決済処理などを行う）
      const selectedPlan = pricingPlans.find((plan) => plan.id === planId);

      if (!selectedPlan) {
        return res.status(404).json({
          success: false,
          message: '指定されたプランが見つかりません',
        });
      }

      // ここで実際の決済処理やサブスクリプション作成を行う
      // 現在はモック実装
      const subscription = {
        id: `sub_${Date.now()}`,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        billingPeriod,
        price: selectedPlan.price,
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      res.status(201).json({
        success: true,
        message: 'プランが正常に選択されました',
        data: {
          subscription,
          nextSteps: [
            '無料トライアルが開始されました',
            '30日間すべての機能をお試しいただけます',
            'トライアル終了前にプランを変更できます',
          ],
        },
      });
    } catch (error) {
      console.error('Plan selection error:', error);
      res.status(500).json({
        success: false,
        message: 'プランの選択に失敗しました',
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }
}
