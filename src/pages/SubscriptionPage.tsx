// src/pages/SubscriptionPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CreditCard,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Gift,
  Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import EnhancedSubscriptionForm from '@/components/subscription/EnhancedSubscriptionForm';
import { formatPrice } from '@/config/stripe';
import { toast } from 'react-hot-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    workHours: number;
    projects: number;
    tasks: number;
    reports: number;
    apiCalls: number;
    storage: number;
    teamMembers: number;
  };
  isPopular?: boolean;
  trialDays?: number;
  originalPrice?: number; // 年額プランの場合の月額換算元値
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'フリープラン',
    description: '基本的な機能で勤怠管理を始めましょう',
    price: 0,
    currency: 'jpy',
    billingCycle: 'monthly',
    features: [
      '作業時間記録',
      '基本レポート',
      'Todoリスト',
      '4象限分析（月10回）',
      'データエクスポート',
      'コミュニティサポート',
    ],
    limits: {
      workHours: 160,
      projects: 3,
      tasks: 50,
      reports: 5,
      apiCalls: 100,
      storage: 100, // MB
      teamMembers: 1,
    },
    trialDays: 0,
  },
  {
    id: 'basic-monthly',
    name: 'ベーシックプラン',
    description: '個人利用に最適な機能セット',
    price: 980,
    currency: 'jpy',
    billingCycle: 'monthly',
    features: [
      'フリープランの全機能',
      '詳細レポート・分析',
      'AI象限分析（無制限）',
      'カスタムダッシュボード',
      'データ自動バックアップ',
      'メールサポート',
      'スケジュール管理',
      'モバイルアプリ同期',
    ],
    limits: {
      workHours: -1, // 無制限
      projects: 10,
      tasks: 500,
      reports: 50,
      apiCalls: 5000,
      storage: 1000, // MB
      teamMembers: 1,
    },
    trialDays: 14,
    isPopular: true,
  },
  {
    id: 'basic-yearly',
    name: 'ベーシックプラン（年額）',
    description: '年額払いで2ヶ月分お得',
    price: 9800,
    originalPrice: 11760, // 月額980円 × 12ヶ月
    currency: 'jpy',
    billingCycle: 'yearly',
    features: ['ベーシックプランの全機能', '年額払いで2ヶ月分お得', '優先サポート'],
    limits: {
      workHours: -1,
      projects: 10,
      tasks: 500,
      reports: 50,
      apiCalls: 5000,
      storage: 1000,
      teamMembers: 1,
    },
    trialDays: 30,
  },
  {
    id: 'premium-monthly',
    name: 'プレミアムプラン',
    description: 'チーム・企業利用に最適',
    price: 2980,
    currency: 'jpy',
    billingCycle: 'monthly',
    features: [
      'ベーシックプランの全機能',
      'チーム管理機能',
      '高度な分析・予測',
      'API統合',
      'カスタム通知',
      'ブランディング設定',
      '電話サポート',
      'オンライン研修',
    ],
    limits: {
      workHours: -1,
      projects: 50,
      tasks: 5000,
      reports: -1,
      apiCalls: 50000,
      storage: 10000,
      teamMembers: 10,
    },
    trialDays: 14,
  },
  {
    id: 'premium-yearly',
    name: 'プレミアムプラン（年額）',
    description: '年額払いで2ヶ月分お得',
    price: 29800,
    originalPrice: 35760, // 月額2980円 × 12ヶ月
    currency: 'jpy',
    billingCycle: 'yearly',
    features: [
      'プレミアムプランの全機能',
      '年額払いで2ヶ月分お得',
      '専任サポート',
      'カスタム開発相談',
    ],
    limits: {
      workHours: -1,
      projects: 50,
      tasks: 5000,
      reports: -1,
      apiCalls: 50000,
      storage: 10000,
      teamMembers: 10,
    },
    trialDays: 30,
  },
];

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  // 現在のプランに基づいてフィルタリング
  const currentPlans = subscriptionPlans.filter((plan) => plan.billingCycle === billingCycle);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (plan.id === 'free') {
      toast.success('フリープランが選択されました');
      return;
    }

    // プレミアムプランの場合は決済ページへ
    navigate('/subscription-upgrade', {
      state: { selectedPlan: plan },
    });
  };

  const renderFeatureList = (features: string[]) => (
    <ul className="space-y-2 text-sm">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );

  const renderLimits = (limits: SubscriptionPlan['limits']) => (
    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-4">
      <div>プロジェクト: {limits.projects === -1 ? '無制限' : `${limits.projects}個`}</div>
      <div>タスク: {limits.tasks === -1 ? '無制限' : `${limits.tasks}個`}</div>
      <div>ストレージ: {limits.storage === -1 ? '無制限' : `${limits.storage}MB`}</div>
      <div>チームメンバー: {limits.teamMembers === -1 ? '無制限' : `${limits.teamMembers}人`}</div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヘッダー */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          <Zap className="inline-block w-8 h-8 mr-2 text-blue-600" />
          料金プラン
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          あなたのワークフローに最適なプランを選択してください。
          14日間の無料トライアルですべての機能をお試しいただけます。
        </p>
      </div>

      {/* 請求サイクル選択 */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            月額払い
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            年額払い
            <Badge className="ml-2 bg-green-100 text-green-800">2ヶ月分お得</Badge>
          </button>
        </div>
      </div>

      {/* プランカード */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {currentPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative transition-all duration-200 hover:shadow-lg ${
              plan.isPopular ? 'ring-2 ring-blue-500 scale-105' : ''
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  人気プラン
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-gray-600 mt-2">{plan.description}</CardDescription>

              <div className="mt-6">
                {plan.originalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(plan.originalPrice, plan.currency)}
                  </div>
                )}
                <div className="text-4xl font-bold text-gray-900">
                  {plan.price === 0 ? (
                    '無料'
                  ) : (
                    <>
                      {formatPrice(plan.price, plan.currency)}
                      <span className="text-lg font-normal text-gray-600">
                        /{plan.billingCycle === 'monthly' ? '月' : '年'}
                      </span>
                    </>
                  )}
                </div>
                {plan.billingCycle === 'yearly' && plan.originalPrice && (
                  <div className="text-sm text-green-600 font-medium mt-1">
                    月額換算 {formatPrice(Math.floor(plan.price / 12), plan.currency)}
                  </div>
                )}
              </div>

              {plan.trialDays > 0 && (
                <Badge variant="outline" className="mt-3">
                  <Gift className="w-3 h-3 mr-1" />
                  {plan.trialDays}日間無料トライアル
                </Badge>
              )}
            </CardHeader>

            <CardContent>
              {renderFeatureList(plan.features)}
              {renderLimits(plan.limits)}

              <Button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full mt-6 ${
                  plan.isPopular
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : plan.id === 'free'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-gray-800 hover:bg-gray-900'
                }`}
                disabled={isLoading}
              >
                {plan.id === 'free' ? (
                  '無料で始める'
                ) : (
                  <>
                    {plan.trialDays > 0 ? '無料トライアル開始' : '今すぐ始める'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 追加情報 */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>安全な決済</AlertTitle>
          <AlertDescription>Stripe社の業界最高水準のセキュリティで決済情報を保護</AlertDescription>
        </Alert>

        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>いつでもキャンセル</AlertTitle>
          <AlertDescription>
            月額プランはいつでもキャンセル可能。年額プランは30日間返金保証
          </AlertDescription>
        </Alert>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>24/7サポート</AlertTitle>
          <AlertDescription>
            プレミアムプランでは電話サポートを含む包括的なサポートを提供
          </AlertDescription>
        </Alert>
      </div>

      {/* よくある質問セクション */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">よくある質問</h2>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">無料トライアルは本当に無料ですか？</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                はい、クレジットカード情報のご登録は必要ですが、トライアル期間中に料金が発生することはありません。
                トライアル期間終了前にキャンセルすれば、一切料金はかかりません。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">プランの変更は可能ですか？</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                はい、いつでもプランの変更が可能です。アップグレードは即座に反映され、
                ダウングレードは次の請求期間から適用されます。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">データの移行はサポートされますか？</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                はい、他の勤怠管理システムからのデータ移行をサポートしています。
                プレミアムプランでは専任スタッフがサポートいたします。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          まだ決められませんか？フリープランで基本機能をお試しください
        </p>
        <Button
          variant="outline"
          onClick={() => handlePlanSelect(currentPlans.find((p) => p.id === 'free')!)}
        >
          フリープランで始める
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPage;
