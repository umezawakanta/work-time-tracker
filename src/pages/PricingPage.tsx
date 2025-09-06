import React, { useState } from 'react';
import { Check, X, Star, Zap, Crown, Shield } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
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
    icon: <Shield className="w-6 h-6" />,
    color: 'text-gray-600',
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
    icon: <Zap className="w-6 h-6" />,
    color: 'text-blue-600',
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
    icon: <Crown className="w-6 h-6" />,
    color: 'text-purple-600',
    ctaText: 'エンタープライズを相談',
    ctaVariant: 'secondary',
  },
];

const PricingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    // ここで実際の購入処理やリダイレクトを行う
    console.log('Selected plan:', planId);
  };

  const getDiscountedPrice = (price: number) => {
    return billingPeriod === 'yearly' ? Math.round(price * 10) : price;
  };

  const getBillingPeriodText = () => {
    return billingPeriod === 'yearly' ? '年' : '月';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            料金プラン
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            あなたの生産性向上に最適なプランを選択してください。
            すべてのプランで30日間の無料トライアルを提供しています。
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span
              className={`text-lg ${billingPeriod === 'monthly' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
            >
              月額
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="請求期間を切替"
              title="請求期間を切替"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-lg ${billingPeriod === 'yearly' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
            >
              年額
            </span>
            {billingPeriod === 'yearly' && (
              <span className="ml-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                2ヶ月無料
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              } ${selectedPlan === plan.id ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    人気
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4 ${plan.color}`}
                >
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ¥{getDiscountedPrice(plan.price).toLocaleString()}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    /{getBillingPeriodText()}
                  </span>
                  {billingPeriod === 'yearly' && plan.price > 0 && (
                    <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                      月額¥{plan.price.toLocaleString()}から
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  含まれる機能
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              {plan.limitations.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    制限事項
                  </h4>
                  <ul className="space-y-3">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <X className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => handlePlanSelect(plan.id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.ctaVariant === 'default'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : plan.ctaVariant === 'secondary'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            よくある質問
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                無料トライアルはありますか？
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                はい、すべてのプランで30日間の無料トライアルを提供しています。クレジットカードの登録は不要です。
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                プランの変更はいつでも可能ですか？
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                はい、いつでもプランをアップグレードまたはダウングレードできます。変更は即座に反映されます。
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                年額プランの割引はありますか？
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                年額プランでは2ヶ月分の料金が無料になります。実質的に17%の割引となります。
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                解約はいつでも可能ですか？
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                はい、いつでも解約できます。解約後も現在の請求期間の終了までサービスをご利用いただけます。
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              カスタムプランが必要ですか？
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              大規模な組織や特別な要件がある場合は、カスタムプランをご提案いたします。
            </p>
            <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              お問い合わせ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
