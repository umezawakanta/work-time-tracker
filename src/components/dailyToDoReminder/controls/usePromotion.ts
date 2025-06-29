import { useState, useEffect } from 'react';
import { PlanType, PlanTerm } from './PremiumPromotion';
import { PremiumPlanService } from './PremiumPlanService';
import { useToast } from '@/components/ui/use-toast';

/**
 * プロモーション情報を取得・管理するフック
 */
export const usePromotion = () => {
  const [promotionData, setPromotionData] = useState({
    hasPromotion: false,
    promoDiscount: 0,
    promoCode: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const planService = PremiumPlanService.getInstance();

  // URLからプロモーションコードを取得
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const promoCode = queryParams.get('promo');

    if (promoCode) {
      validatePromoCode(promoCode);
    }
  }, []);

  // プロモーションコードの検証
  const validatePromoCode = async (code: string) => {
    if (!code) return;

    setLoading(true);
    try {
      const result = await planService.validatePromoCode(code);

      if (result.valid && result.discount) {
        setPromotionData({
          hasPromotion: true,
          promoDiscount: result.discount,
          promoCode: code,
        });

        if (result.message) {
          toast({
            title: 'プロモーション適用',
            description: result.message,
            variant: 'default',
          });
        }
      } else {
        if (result.message) {
          toast({
            title: 'プロモーションエラー',
            description: result.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('プロモーション検証エラー:', error);
      toast({
        title: 'エラー',
        description: 'プロモーションコードの検証中にエラーが発生しました。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    promotionData,
    loading,
    validatePromoCode,
  };
};

/**
 * 紹介コードを検証・管理するフック
 */
export const useReferralCode = (initialCode?: string) => {
  const [referralData, setReferralData] = useState({
    valid: false,
    discountRate: 0,
    referrerName: '',
    referralCode: initialCode || '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const planService = PremiumPlanService.getInstance();

  // 初期コードがある場合、検証を実行
  useEffect(() => {
    if (initialCode) {
      validateReferralCode(initialCode);
    } else {
      // URLから紹介コードがあるか確認
      const queryParams = new URLSearchParams(window.location.search);
      const refCode = queryParams.get('ref');

      if (refCode) {
        validateReferralCode(refCode);
      }
    }
  }, [initialCode]);

  // 紹介コードの検証
  const validateReferralCode = async (code: string) => {
    if (!code) return;

    setLoading(true);
    try {
      const result = await planService.validateReferralCode(code);

      if (result.valid && result.discount) {
        setReferralData({
          valid: true,
          discountRate: result.discount,
          referrerName: result.referrerName || '',
          referralCode: code,
        });

        if (result.message) {
          toast({
            title: '紹介割引適用',
            description: result.message,
            variant: 'default',
          });
        }
      } else {
        setReferralData({
          ...referralData,
          valid: false,
          referralCode: code,
        });

        if (result.message) {
          toast({
            title: '紹介コードエラー',
            description: result.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('紹介コード検証エラー:', error);
      toast({
        title: 'エラー',
        description: '紹介コードの検証中にエラーが発生しました。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    referralData,
    loading,
    validateReferralCode,
  };
};

/**
 * プランアップグレード処理を管理するフック
 */
export const useUpgradePlan = () => {
  const [upgrading, setUpgrading] = useState(false);
  const { toast } = useToast();
  const planService = PremiumPlanService.getInstance();

  // プランアップグレード処理
  const upgradeToPlan = async (plan: PlanType, term: PlanTerm, referralCode?: string) => {
    if (plan === 'free') return;

    setUpgrading(true);
    try {
      const result = await planService.upgradePlan(plan, term, referralCode);

      if (result.success) {
        toast({
          title: 'アップグレード',
          description: result.message || 'アップグレード処理を開始します。',
          variant: 'default',
        });

        // エンタープライズプランまたは決済ページへリダイレクト
        if (result.redirectUrl) {
          setTimeout(() => {
            window.location.href = result.redirectUrl as string;
          }, 1000);
        }
      } else {
        toast({
          title: 'エラー',
          description: result.message || 'アップグレード処理中にエラーが発生しました。',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('アップグレードエラー:', error);
      toast({
        title: 'エラー',
        description: '予期せぬエラーが発生しました。後でもう一度お試しください。',
        variant: 'destructive',
      });
    } finally {
      setUpgrading(false);
    }
  };

  return {
    upgrading,
    upgradeToPlan,
  };
};
