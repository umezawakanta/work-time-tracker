import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, BarChart, Shield } from "lucide-react";

import { PlanFeaturesComparison } from './PlanFeaturesComparison';
import { usePromotion, useReferralCode, useUpgradePlan } from './usePromotion';
import { KeyFeatureCard } from './KeyFeatureCard';
import { PremiumPlanCard } from './PremiumPlanCard';
import { PriceDisplay } from './PriceDisplay';
import { PremiumPlanService } from './PremiumPlanService';
import { useAnalytics } from '@/lib/analytics';

// 型定義
export type PlanTerm = 'monthly' | 'annual' | 'lifetime';
export type PlanType = 'free' | 'basic' | 'professional' | 'enterprise';

export interface PlanFeature {
  feature: string;
  free: boolean | string;
  basic: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
  tooltip?: string;
}

export interface PremiumPromotionProps {
  onUpgrade?: (plan: PlanType, term: PlanTerm) => void;
  referralCode?: string;
  defaultTerm?: PlanTerm;
  compareFeatureCount?: number;
  showCountdown?: boolean;
  planHighlights?: boolean;
  isPromoActive?: boolean;
}

/**
 * プレミアム機能のプロモーションコンポーネント
 * 無料ユーザーに向けたプレミアム機能の紹介と特典の説明
 */
export const PremiumPromotion: React.FC<PremiumPromotionProps> = ({
  onUpgrade,
  referralCode,
  defaultTerm = 'annual',
  compareFeatureCount = 5,
  showCountdown = false,
  planHighlights = true,
  isPromoActive = false
}) => {
  // 状態管理
  const [selectedTerm, setSelectedTerm] = useState<PlanTerm>(defaultTerm);
  const [visitTime, setVisitTime] = useState<Date>(new Date());
  
  // サービスとカスタムフックの利用
  const planService = PremiumPlanService.getInstance();
  const { promotionData } = usePromotion();
  const { referralData } = useReferralCode(referralCode);
  const { upgradeToPlan, upgrading } = useUpgradePlan();
  const { trackEvent, trackPageView } = useAnalytics();
  
  // 訪問時間を記録
  useEffect(() => {
    setVisitTime(new Date());
    trackPageView('/premium-plans', 'プレミアムプラン');
  }, [trackPageView]);
  
  // プラン比較表データの取得
  const planFeatures = planService.getPlanFeatures();
  const pricingPlans = planService.getPricingPlans();
  
  // 主要な特徴
  const keyFeatures = [
    {
      title: "高速化されたワークフロー",
      description: "自動優先度調整と高度な統計により、タスク管理効率が平均40%向上します。",
      icon: <Zap className="h-5 w-5 text-amber-500" />
    },
    {
      title: "詳細な分析ダッシュボード",
      description: "生産性トレンド、目標達成率、時間効率などの詳細な分析により、仕事の進捗を可視化します。",
      icon: <BarChart className="h-5 w-5 text-blue-500" />
    },
    {
      title: "データの安全性",
      description: "エンドツーエンド暗号化により、あなたの大切なタスクとデータを安全に保護します。",
      icon: <Shield className="h-5 w-5 text-green-500" />
    }
  ];

  // プラン選択ハンドラー
  const handlePlanSelect = async (plan: PlanType) => {
    if (onUpgrade) {
      onUpgrade(plan, selectedTerm);
      return;
    }
    
    // 外部からのハンドラが渡されない場合、デフォルト実装を使用
    await upgradeToPlan(plan, selectedTerm, referralData.referralCode);
  };

  // 訪問からの経過時間を取得（分単位）
  const getMinutesSinceVisit = (): number => {
    const now = new Date();
    return Math.floor((now.getTime() - visitTime.getTime()) / (1000 * 60));
  };
  
  // プロモーション特典バッジを表示するかどうか
  const shouldShowPromo = (): boolean => {
    return isPromoActive || promotionData.hasPromotion || referralData.valid;
  };
  
  // プラン詳細の設定（プラン固有の特典を含む）
  const planDetails = {
    free: {
      title: "無料プラン",
      description: "基本的なタスク管理",
      features: [
        "最大100タスク",
        "基本的なタスク管理",
        "基本的なカレンダー表示",
        "簡易なレポート"
      ],
      buttonText: "現在のプラン",
      buttonVariant: "outline" as const,
      disabled: true
    },
    basic: {
      title: "ベーシック",
      description: "個人向け強化機能",
      features: [
        "最大1,000タスク",
        "データエクスポート",
        "自動優先度調整",
        "基本的な統計機能"
      ],
      buttonText: "アップグレード",
      buttonVariant: "default" as const,
      badgeType: shouldShowPromo() ? 'discount' : undefined,
      badgeText: shouldShowPromo() ? '割引中' : undefined
    },
    professional: {
      title: "プロフェッショナル",
      description: "生産性の最大化",
      features: [
        "<strong>無制限</strong>のタスク",
        "高度な統計と予測",
        "優先サポート",
        "最大5人のチーム共有",
        "すべてのプレミアム機能"
      ],
      buttonText: "アップグレード",
      buttonVariant: "default" as const,
      isRecommended: promotionData.hasPromotion || getMinutesSinceVisit() > 2,
      badgeType: shouldShowPromo() ? 'best-value' : 'popular'
    },
    enterprise: {
      title: "エンタープライズ",
      description: "チームと企業向け",
      features: [
        "チーム向け高度な機能",
        "無制限のストレージ",
        "専用サポート",
        "カスタムインテグレーション"
      ],
      buttonText: "お問い合わせ",
      buttonVariant: "outline" as const
    }
  };

  // プラン固有の特別機能とハイライト
  const planSpecificFeatures = planHighlights ? {
    basic: {
      highlightColor: shouldShowPromo() ? 'border-purple-200' : '',
      bonusFeatures: shouldShowPromo() ? ['今なら<strong>3ヶ月無料</strong>'] : [],
      ctaSubtext: '今すぐアップグレードして機能を拡張'
    },
    professional: {
      highlightColor: 'border-blue-200 shadow-md',
      bonusFeatures: shouldShowPromo() 
        ? ['今なら<strong>6ヶ月無料</strong>', '限定テンプレート10種類'] 
        : ['<strong>30日間</strong>の返金保証'],
      ctaSubtext: '7日間の無料トライアルを含む'
    },
    enterprise: {
      highlightColor: '',
      bonusFeatures: ['専任カスタマーサクセスマネージャー'],
      ctaSubtext: '専門家によるカスタム提案'
    }
  } : {};
  
  return (
    <div className="space-y-8">
      {/* ヘッダーセクション */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          <Sparkles className="h-5 w-5 inline mr-2 text-amber-500" />
          プレミアム機能で生産性を最大化
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          高度な分析、自動化機能、無制限のストレージでワークフローを最適化し、より効率的にタスクを管理しましょう。
        </p>
      </div>
      
      {/* 主要特徴セクション */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {keyFeatures.map((feature, index) => (
          <KeyFeatureCard key={index} {...feature} />
        ))}
      </div>
      
      {/* 料金プランセクション */}
      <div>
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold mb-2">料金プラン</h3>
          <Tabs
            defaultValue={selectedTerm}
            onValueChange={(value) => {
              setSelectedTerm(value as PlanTerm);
              trackEvent('term_tab_change', { term: value });
            }}
            className="w-full max-w-md mx-auto"
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="monthly">月額</TabsTrigger>
              <TabsTrigger value="annual">
                年間
                <Badge className="ml-1 bg-green-100 text-green-800 border-0 text-[0.6rem]">
                  お得
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="lifetime">永久</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* プランカード */}
          {(['free', 'basic', 'professional', 'enterprise'] as PlanType[]).map((plan) => {
            const details = planDetails[plan];
            const referralBadge = 
              plan === 'professional' && referralData.valid ? (
                <Badge className="mt-1 bg-green-100 text-green-700 border-0">
                  紹介割引 {referralData.discountRate}%オフ
                </Badge>
              ) : null;
            
            return (
              <PremiumPlanCard
                key={plan}
                plan={plan}
                term={selectedTerm}
                title={details.title}
                description={details.description}
                features={details.features}
                buttonText={details.buttonText}
                buttonVariant={details.buttonVariant}
                disabled={details.disabled}
                isRecommended={details.isRecommended}
                price={
                  <PriceDisplay
                    plan={plan}
                    term={selectedTerm}
                    pricingPlans={pricingPlans}
                    promotionData={promotionData}
                    referralData={referralData}
                  />
                }
                referralBadge={referralBadge}
                upgrading={upgrading}
                onSelectPlan={handlePlanSelect}
                showCountdown={showCountdown && (details.isRecommended || details.badgeType === 'limited')}
                badgeType={details.badgeType}
                badgeText={details.badgeText}
                planSpecificFeatures={planSpecificFeatures}
              />
            );
          })}
        </div>
      </div>
      
      {/* 機能比較表 */}
      <PlanFeaturesComparison 
        features={planFeatures} 
        initialShowCount={compareFeatureCount} 
      />
      
      {/* フッターCTA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">今すぐプレミアム機能を体験</h3>
        <p className="text-gray-600 mb-4">
          7日間の無料トライアルで、すべてのプレミアム機能を試すことができます。
          期間中はいつでもキャンセル可能です。
        </p>
        <Button 
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          onClick={() => handlePlanSelect('professional')}
          disabled={upgrading}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {upgrading ? '処理中...' : '無料トライアルを開始'}
        </Button>
      </div>
    </div>
  );
};