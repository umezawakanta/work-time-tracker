import React from 'react';
import { Badge } from "@/components/ui/badge";
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
 * 料金表示コンポーネント
 * プランの料金を表示し、割引がある場合はそれを適用して表示します
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  plan,
  term,
  pricingPlans,
  promotionData,
  referralData
}) => {
  const planService = PremiumPlanService.getInstance();
  
  // 無料プランの場合
  if (plan === 'free') {
    return (
      <>
        <div className="text-2xl font-bold">¥0</div>
        <p className="text-xs text-gray-500">制限付き</p>
      </>
    );
  }

  // ライフタイムプランの処理
  if (term === 'lifetime') {
    if (pricingPlans.lifetime && pricingPlans.lifetime[plan]) {
      const price = pricingPlans.lifetime[plan];
      let discountedPrice = price;
      let showDiscount = false;
      
      if (promotionData.hasPromotion || referralData.valid) {
        let discountRate = 0;
        if (promotionData.hasPromotion) discountRate += promotionData.promoDiscount;
        if (referralData.valid) discountRate += referralData.discountRate;
        
        discountedPrice = planService.calculateDiscountedPrice(price, discountRate);
        showDiscount = true;
      }
      
      return (
        <>
          <div className="text-2xl font-bold">
            {showDiscount && (
              <span className="line-through text-gray-400 mr-2 text-lg">
                ¥{price.toLocaleString()}
              </span>
            )}
            ¥{discountedPrice.toLocaleString()}
            <span className="text-xs text-gray-500 ml-1">（一度きり）</span>
          </div>
        </>
      );
    }
    return null;
  }
  
  // 年間プランの処理
  if (term === 'annual' && pricingPlans.annual[plan]) {
    const annualPrice = pricingPlans.annual[plan];
    const monthlyEquivalent = planService.calculateMonthlyPrice(annualPrice);
    
    let discountedPrice = annualPrice;
    let showDiscount = false;
    
    if (promotionData.hasPromotion || referralData.valid) {
      let discountRate = 0;
      if (promotionData.hasPromotion) discountRate += promotionData.promoDiscount;
      if (referralData.valid) discountRate += referralData.discountRate;
      
      discountedPrice = planService.calculateDiscountedPrice(annualPrice, discountRate);
      showDiscount = true;
    }
    
    const discountedMonthly = planService.calculateMonthlyPrice(discountedPrice);
    
    return (
      <>
        <div className="text-2xl font-bold">
          ¥{discountedMonthly.toLocaleString()}/月
        </div>
        <p className="text-xs text-gray-500">
          年間 
          {showDiscount && (
            <span className="line-through mr-1">¥{annualPrice.toLocaleString()}</span>
          )}
          ¥{discountedPrice.toLocaleString()} (一括払い)
        </p>
      </>
    );
  } 
  
  // 月額プランの処理
  if (pricingPlans.monthly[plan]) {
    const monthlyPrice = pricingPlans.monthly[plan];
    
    let discountedPrice = monthlyPrice;
    let showDiscount = false;
    
    if (promotionData.hasPromotion || referralData.valid) {
      let discountRate = 0;
      if (promotionData.hasPromotion) discountRate += promotionData.promoDiscount;
      if (referralData.valid) discountRate += referralData.discountRate;
      
      discountedPrice = planService.calculateDiscountedPrice(monthlyPrice, discountRate);
      showDiscount = true;
    }
    
    return (
      <div className="text-2xl font-bold">
        {showDiscount && (
          <span className="line-through text-gray-400 mr-2 text-lg">
            ¥{monthlyPrice.toLocaleString()}
          </span>
        )}
        ¥{discountedPrice.toLocaleString()}/月
      </div>
    );
  }
  
  return null;
};