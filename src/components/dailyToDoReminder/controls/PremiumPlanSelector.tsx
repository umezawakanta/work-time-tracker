import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// 料金プランの情報型
export interface PremiumPlanInfo {
  name: string;
  price: {
    monthly: number;
    annual: number;
    lifetime?: number;
  };
  features: string[];
  isPopular?: boolean;
  discount?: number; // 割引率（%）
}

interface PremiumPlanSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planType: string, planCycle: 'monthly' | 'annual' | 'lifetime') => void;
  initialCycle?: 'monthly' | 'annual' | 'lifetime';
  plans: PremiumPlanInfo[];
}

/**
 * プレミアムプラン選択コンポーネント
 * ユーザーが料金プランと支払いサイクルを選択するダイアログ
 */
export const PremiumPlanSelector: React.FC<PremiumPlanSelectorProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  initialCycle = 'monthly',
  plans,
}) => {
  // 選択されているプランサイクル
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'annual' | 'lifetime'>(
    initialCycle
  );

  // 価格表示とフォーマット
  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  // 月額換算価格の計算（年間プラン用）
  const calculateMonthlyPrice = (annualPrice: number): number => {
    return Math.round(annualPrice / 12);
  };

  // 割引前の価格を計算
  const calculateOriginalPrice = (annualPrice: number, discountPercent: number): number => {
    return Math.round(annualPrice / (1 - discountPercent / 100) / 12);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>プレミアムプランを選択</DialogTitle>
          <DialogDescription>
            あなたのニーズに合わせて最適なプランをお選びください
          </DialogDescription>
        </DialogHeader>

        {/* プランサイクル選択 */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 p-1 rounded-full flex">
            <Button
              variant={selectedCycle === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs rounded-full"
              onClick={() => setSelectedCycle('monthly')}
            >
              月額
            </Button>
            <Button
              variant={selectedCycle === 'annual' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs rounded-full"
              onClick={() => setSelectedCycle('annual')}
            >
              年間
              <Badge className="ml-1 bg-green-100 text-green-800 border-0">お得</Badge>
            </Button>
            <Button
              variant={selectedCycle === 'lifetime' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs rounded-full"
              onClick={() => setSelectedCycle('lifetime')}
            >
              永久ライセンス
            </Button>
          </div>
        </div>

        {/* プラン比較表示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, index) => {
            const currentPrice =
              selectedCycle === 'lifetime' && plan.price.lifetime
                ? plan.price.lifetime
                : selectedCycle === 'annual'
                  ? plan.price.annual
                  : plan.price.monthly;

            const hasDiscount = selectedCycle === 'annual' && plan.discount;
            const originalPrice = hasDiscount
              ? calculateOriginalPrice(plan.price.annual, plan.discount!)
              : undefined;

            const isLifetimeAvailable = selectedCycle === 'lifetime' && plan.price.lifetime;

            return (
              <div
                key={index}
                className={`border rounded-lg overflow-hidden ${
                  plan.isPopular ? 'border-blue-300 shadow-md relative' : 'border-gray-200'
                }`}
              >
                {plan.isPopular && (
                  <div className="bg-blue-500 text-white text-xs font-medium py-1 text-center">
                    人気プラン
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-medium">{plan.name}</h3>

                  <div className="mt-2 mb-4">
                    {selectedCycle === 'monthly' && (
                      <div className="flex items-end">
                        <span className="text-2xl font-bold">¥{formatPrice(currentPrice)}</span>
                        <span className="text-gray-500 text-xs ml-1">/ 月</span>
                      </div>
                    )}

                    {selectedCycle === 'annual' && (
                      <div>
                        <div className="flex items-end">
                          <span className="text-2xl font-bold">
                            ¥{formatPrice(calculateMonthlyPrice(currentPrice))}
                          </span>
                          <span className="text-gray-500 text-xs ml-1">/ 月</span>

                          {hasDiscount && originalPrice && (
                            <span className="text-gray-400 text-xs ml-2 line-through">
                              ¥{formatPrice(originalPrice)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          年間 ¥{formatPrice(currentPrice)} (一括払い)
                        </div>
                      </div>
                    )}

                    {selectedCycle === 'lifetime' && (
                      <div className="flex items-end">
                        {isLifetimeAvailable ? (
                          <>
                            <span className="text-2xl font-bold">¥{formatPrice(currentPrice)}</span>
                            <span className="text-gray-500 text-xs ml-1">/ 永久</span>
                          </>
                        ) : (
                          <div className="text-gray-500">このプランでは利用できません</div>
                        )}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start text-sm">
                        <div className="text-green-500 mr-2 mt-0.5">✓</div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.isPopular ? 'default' : 'outline'}
                    disabled={selectedCycle === 'lifetime' && !isLifetimeAvailable}
                    onClick={() => onSelectPlan(plan.name.toLowerCase(), selectedCycle)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    選択する
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center">
          <p className="text-xs text-gray-500 mb-2 sm:mb-0">
            <Shield className="h-3 w-3 inline mr-1" />
            安全な決済システムで処理されます。いつでもキャンセル可能です。
          </p>
          <Button variant="ghost" size="sm" onClick={onClose}>
            キャンセル
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
