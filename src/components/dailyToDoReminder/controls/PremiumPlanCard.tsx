import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock } from 'lucide-react';
import { PlanType, PlanTerm } from './PremiumPromotion';
import { useAnalytics } from '@/lib/analytics';
import { PlanBadge, RecommendedBadge, BadgeType } from './PlanBadge';

export interface PlanCardProps {
  plan: PlanType;
  term: PlanTerm;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'destructive' | 'ghost' | 'link' | 'secondary';
  disabled?: boolean;
  isRecommended?: boolean;
  price: React.ReactNode;
  referralBadge?: React.ReactNode;
  upgrading: boolean;
  onSelectPlan: (plan: PlanType) => void;
  showCountdown?: boolean;
  badgeType?: BadgeType;
  badgeText?: string;
  planSpecificFeatures?: {
    [key in PlanType]?: {
      highlightColor?: string;
      bonusFeatures?: string[];
      ctaSubtext?: string;
    };
  };
}

/**
 * プレミアムプランカードコンポーネント
 * 各プランの詳細と料金を表示し、アップグレードボタンを提供します
 */
export const PremiumPlanCard: React.FC<PlanCardProps> = ({
  plan,
  term,
  title,
  description,
  features,
  buttonText,
  buttonVariant,
  disabled = false,
  isRecommended = false,
  price,
  referralBadge,
  upgrading,
  onSelectPlan,
  showCountdown = false,
  badgeType,
  badgeText,
  planSpecificFeatures = {},
}) => {
  const { trackEvent } = useAnalytics();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // 実際のバッジタイプを決定
  const actualBadgeType = badgeType || (isRecommended ? 'recommended' : undefined);

  // プラン固有の設定を取得
  const planSpecific = planSpecificFeatures[plan];
  const highlightColor = planSpecific?.highlightColor || (isRecommended ? 'border-blue-200' : '');
  const bonusFeatures = planSpecific?.bonusFeatures || [];
  const ctaSubtext = planSpecific?.ctaSubtext;

  // カードのインプレッションをトラッキング
  useEffect(() => {
    trackEvent('plan_card_view', {
      plan_type: plan,
      plan_term: term,
      is_recommended: isRecommended,
    });
  }, [plan, term, isRecommended, trackEvent]);

  // セールの期限がある場合にカウントダウンを表示
  useEffect(() => {
    if (showCountdown && (isRecommended || actualBadgeType === 'limited')) {
      // 24時間のカウントダウン（実際の実装ではAPIから取得）
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + 24);

      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((endTime.getTime() - now.getTime()) / 1000);

        if (diff <= 0) {
          setCountdown(null);
          clearInterval(interval);
        } else {
          setCountdown(diff);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showCountdown, isRecommended, actualBadgeType]);

  // カウントダウンの表示フォーマット
  const formatCountdown = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // プラン選択時のイベント追跡
  const handleSelectPlan = () => {
    trackEvent('plan_selected', {
      plan_type: plan,
      plan_term: term,
      is_recommended: isRecommended,
      button_text: buttonText,
    });

    onSelectPlan(plan);
  };

  // 全機能リスト（通常機能 + ボーナス機能）
  const allFeatures = [...features, ...bonusFeatures];

  return (
    <Card
      className={`${highlightColor} relative transition-all duration-300 hover:shadow-lg ${isHovered ? 'scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* バッジの表示 */}
      {actualBadgeType &&
        (actualBadgeType === 'recommended' ? (
          <RecommendedBadge />
        ) : (
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <PlanBadge type={actualBadgeType} text={badgeText} />
          </div>
        ))}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {plan === 'professional' && !actualBadgeType && <PlanBadge type="popular" />}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-2">
          {price}
          {referralBadge}

          {countdown && (
            <div className="mt-2 flex items-center text-xs text-red-600 font-medium">
              <Clock className="h-3 w-3 mr-1" />
              <span>この価格は期間限定: {formatCountdown(countdown)}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <ul className="space-y-2 text-sm">
          {allFeatures.map((feature, idx) => {
            const isBonus = idx >= features.length;
            return (
              <li key={idx} className="flex items-start">
                <span className={`${isBonus ? 'text-amber-500' : 'text-green-500'} mr-2`}>
                  {isBonus ? '★' : '✓'}
                </span>
                <span
                  className={isBonus ? 'font-medium text-amber-700' : ''}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              </li>
            );
          })}
        </ul>
      </CardContent>

      <CardFooter className="flex flex-col">
        <Button
          variant={buttonVariant}
          className={`w-full ${isRecommended ? 'bg-blue-600 hover:bg-blue-700' : ''} transition-all duration-300`}
          onClick={handleSelectPlan}
          disabled={disabled || upgrading}
        >
          {isRecommended && <Sparkles className="h-4 w-4 mr-1" />}
          {upgrading && plan !== 'free' ? '処理中...' : buttonText}
        </Button>

        {ctaSubtext && <p className="text-xs text-gray-500 mt-2 text-center">{ctaSubtext}</p>}
      </CardFooter>
    </Card>
  );
};
