import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Award, 
  Crown, 
  Gift, 
  Clock, 
  TrendingUp, 
  Tag, 
  Heart 
} from "lucide-react";

export type BadgeType = 
  | 'recommended' 
  | 'popular' 
  | 'limited' 
  | 'new' 
  | 'discount' 
  | 'best-value' 
  | 'trending' 
  | 'reward';

export interface PlanBadgeProps {
  type: BadgeType;
  text?: string;
  className?: string;
}

/**
 * プランカード用のバッジコンポーネント
 * 様々なバッジタイプに対応し、アイコンと色を自動で設定します
 */
export const PlanBadge: React.FC<PlanBadgeProps> = ({ 
  type, 
  text, 
  className = '' 
}) => {
  // バッジの見た目の設定
  const getBadgeConfig = (type: BadgeType) => {
    switch (type) {
      case 'recommended':
        return {
          icon: <Sparkles className="h-3 w-3 mr-1" />,
          text: text || 'おすすめプラン',
          colors: 'bg-blue-500 hover:bg-blue-600'
        };
      case 'popular':
        return {
          icon: <Crown className="h-3 w-3 mr-1" />,
          text: text || '人気',
          colors: 'bg-amber-100 text-amber-800 border-0'
        };
      case 'limited':
        return {
          icon: <Clock className="h-3 w-3 mr-1" />,
          text: text || '期間限定',
          colors: 'bg-red-100 text-red-800 border-0'
        };
      case 'new':
        return {
          icon: <Gift className="h-3 w-3 mr-1" />,
          text: text || '新機能',
          colors: 'bg-green-100 text-green-800 border-0'
        };
      case 'discount':
        return {
          icon: <Tag className="h-3 w-3 mr-1" />,
          text: text || '割引中',
          colors: 'bg-purple-100 text-purple-800 border-0'
        };
      case 'best-value':
        return {
          icon: <Award className="h-3 w-3 mr-1" />,
          text: text || 'ベストバリュー',
          colors: 'bg-teal-100 text-teal-800 border-0'
        };
      case 'trending':
        return {
          icon: <TrendingUp className="h-3 w-3 mr-1" />,
          text: text || '注目プラン',
          colors: 'bg-indigo-100 text-indigo-800 border-0'
        };
      case 'reward':
        return {
          icon: <Heart className="h-3 w-3 mr-1" />,
          text: text || '特典付き',
          colors: 'bg-pink-100 text-pink-800 border-0'
        };
      default:
        return {
          icon: <Sparkles className="h-3 w-3 mr-1" />,
          text: text || 'おすすめ',
          colors: 'bg-gray-100 text-gray-800 border-0'
        };
    }
  };

  const { icon, text: badgeText, colors } = getBadgeConfig(type);

  // 位置指定が含まれている場合（absolute、fixed等）
  const isPositioning = className.includes('absolute') || className.includes('fixed');

  return (
    <Badge className={`${colors} ${isPositioning ? '' : 'inline-flex'} items-center ${className}`}>
      {icon}
      {badgeText}
    </Badge>
  );
};

// おすすめプランバッジの便利なコンポーネント
export const RecommendedBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute -top-3 left-0 right-0 flex justify-center ${className}`}>
    <PlanBadge type="recommended" />
  </div>
);