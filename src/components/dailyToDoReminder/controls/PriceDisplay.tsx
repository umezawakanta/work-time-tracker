import React from 'react';

import { PlanType, PlanTerm } from './PremiumPromotion';
import { PremiumPlanService } from './PremiumPlanService';

export interface PromotionData {
  hasPromotion: boolean;
  promoDiscount: number;
  promoCode?: string;
}

export interface ReferralData {
  valid: boolean;
  discountRate: number;
  referrerName?: string;
}

export interface PriceDisplayProps {
  plan: PlanType;
  term: PlanTerm;
  pricingPlans: {
    [term: string]: {
      [plan: string]: number;
    };
  };
  promotionData: PromotionData;
  referralData: ReferralData;
}

/**
 * 譁咎≡陦ｨ遉ｺ繧ｳ繝ｳ繝昴・繝阪Φ繝・
 * 繝励Λ繝ｳ縺ｮ譁咎≡繧定｡ｨ遉ｺ縺励∝牡蠑輔′縺ゅｋ蝣ｴ蜷医・縺昴ｌ繧帝←逕ｨ縺励※陦ｨ遉ｺ縺励∪縺・
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  plan,
  term,
  pricingPlans,
  promotionData,
  referralData,
}) => {
  const _planService = PremiumPlanService.getInstance();

  // 辟｡譁吶・繝ｩ繝ｳ縺ｮ蝣ｴ蜷・
  if (plan === 'free') {
    return (
      <>
        <div className="text-2xl font-bold">ﾂ･0</div>
        <p className="text-xs text-gray-500">蛻ｶ髯蝉ｻ倥″</p>
      </>
    );
  }

  // 繝ｩ繧､繝輔ち繧､繝繝励Λ繝ｳ縺ｮ蜃ｦ逅・
  if (term === 'lifetime') {
    if (pricingPlans.lifetime && pricingPlans.lifetime[plan]) {
      const _price = pricingPlans.lifetime[plan];
      let discountedPrice = _price;
      let showDiscount = false;

      if (promotionData.hasPromotion || referralData.valid) {
        let discountRate = 0;
        if (promotionData.hasPromotion) discountRate += promotionData.promoDiscount;
        if (referralData.valid) discountRate += referralData.discountRate;

        discountedPrice = _planService.calculateDiscountedPrice(_price, discountRate);
        showDiscount = true;
      }

      return (
        <>
          <div className="text-2xl font-bold">
            {showDiscount && (
              <span className="line-through text-gray-400 mr-2 text-lg">
                ﾂ･{_price.toLocaleString()}
              </span>
            )}
            ﾂ･{discountedPrice.toLocaleString()}
            <span className="text-xs text-gray-500 ml-1">・井ｸ蠎ｦ縺阪ｊ・・</span>
          </div>
        </>
      );
    }
    return null;
  }

  // 蟷ｴ髢薙・繝ｩ繝ｳ縺ｮ蜃ｦ逅・
  if (term === 'annual' && pricingPlans.annual[plan]) {
    const _annualPrice = pricingPlans.annual[plan];
    const _monthlyEquivalent = _planService.calculateMonthlyPrice(_annualPrice);

    let discountedPrice = _annualPrice;
    let showDiscount = false;

    if (promotionData.hasPromotion || referralData.valid) {
      let discountRate = 0;
      if (promotionData.hasPromotion) discountRate += promotionData.promoDiscount;
      if (referralData.valid) discountRate += referralData.discountRate;

      discountedPrice = _planService.calculateDiscountedPrice(_annualPrice, discountRate);
      showDiscount = true;
    }

    const _discountedMonthly = _planService.calculateMonthlyPrice(discountedPrice);

    return (
      <>
        <div className="text-2xl font-bold">ﾂ･{_discountedMonthly.toLocaleString()}/譛・</div>
        <p className="text-xs text-gray-500">
          蟷ｴ髢・
          {showDiscount && (
            <span className="line-through mr-1">ﾂ･{_annualPrice.toLocaleString()}</span>
          )}
          ﾂ･{discountedPrice.toLocaleString()} (荳諡ｬ謇輔＞)
        </p>
      </>
    );
  }

  // 譛磯｡阪・繝ｩ繝ｳ縺ｮ蜃ｦ逅・
  if (pricingPlans.monthly[plan]) {
    const _monthlyPrice = pricingPlans.monthly[plan];

    let discountedPrice = _monthlyPrice;
    let showDiscount = false;

    if (promotionData.hasPromotion || referralData.valid) {
      let discountRate = 0;
      if (promotionData.hasPromotion) discountRate += promotionData.promoDiscount;
      if (referralData.valid) discountRate += referralData.discountRate;

      discountedPrice = _planService.calculateDiscountedPrice(_monthlyPrice, discountRate);
      showDiscount = true;
    }

    return (
      <div className="text-2xl font-bold">
        {showDiscount && (
          <span className="line-through text-gray-400 mr-2 text-lg">
            ﾂ･{_monthlyPrice.toLocaleString()}
          </span>
        )}
        ﾂ･{discountedPrice.toLocaleString()}/譛・
      </div>
    );
  }

  return null;
};
