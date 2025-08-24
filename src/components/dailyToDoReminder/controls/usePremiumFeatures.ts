import { useState, useEffect, useCallback } from 'react';
import {
  _checkPremiumFeatures as checkPremiumFeatures,
  _upgradeToPremium as upgradeToPremium,
  PremiumPlanType,
  PremiumPlanCycle,
  _extendTrialPeriod as extendTrialPeriod,
} from '@/services/userAccountService';
import { fetchReferralSummary } from '@/services/referralService';
import { useAuth } from '@/hooks/useAuth';

/**
 * プレミアム機能の管理用カスタムフック
 */
export function usePremiumFeatures() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumFeatures, setPremiumFeatures] = useState<Record<string, boolean>>({});
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [premiumPlan, setPremiumPlan] = useState<PremiumPlanCycle>('monthly');
  const [referralCode, setReferralCode] = useState<string | undefined>(undefined);

  // 使用状況データ
  const [usageStats, setUsageStats] = useState<
    | {
        tasksCreated: number;
        tasksCompleted: number;
        storageUsed: number;
        storageLimit: number;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    const checkStatus = async () => {
      // 特定のユーザーをPremiumとして扱う（開発用）
      // uid の有無に関わらず最優先で判定する
      const email = user?.email?.trim().toLowerCase();
      if (email === 'kanta13jp@gmail.com') {
        setIsPremium(true);
        setPremiumFeatures({
          dataExport: true,
          priorityAdjustment: true,
          advancedStats: true,
          unlimitedStorage: true,
          unlimitedTasks: true,
          referralBonus: true,
          prioritySupport: true,
        });
        setExpiresAt(new Date('2025-12-31')); // 2025年末まで有効
        setLoading(false);
        console.log('✅ kanta13jp@gmail.com をPremiumユーザーとして設定しました');
        return;
      }

      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const status = await checkPremiumFeatures(user.uid);
        setIsPremium(status.isPremium);
        setPremiumFeatures(status.features);
        setExpiresAt(status.expiresAt ? new Date(status.expiresAt) : null);

        // リファラル情報の取得
        try {
          const referralInfo = await fetchReferralSummary();
          if (referralInfo?.code) {
            setReferralCode(referralInfo.code);
          }
        } catch (referralError) {
          console.error('リファラル情報取得エラー:', referralError);
        }
      } catch (error) {
        console.error('プレミアム機能確認エラー:', error);
        setError('プレミアム機能の情報取得に失敗しました');
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user?.uid, user?.email]);

  const upgrade = async (planType: PremiumPlanType) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      await upgradeToPremium(user.uid, planType);
      // Note: The function returns void, so we'll handle success differently
      setIsPremium(true);
      return { success: true };
    } catch (error) {
      console.error('Upgrade failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const extendTrial = async (days: number = 7) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      await extendTrialPeriod(user.uid, days);
      // Note: The function returns void, so we'll handle success differently
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + days);
      setExpiresAt(newExpiryDate);
      return { success: true, expiresAt: newExpiryDate };
    } catch (error) {
      console.error('Trial extension failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // プレミアム機能が利用可能かチェック
  const hasFeature = useCallback(
    (featureName: string): boolean => {
      if (!isPremium) return false;
      return !!premiumFeatures[featureName];
    },
    [isPremium, premiumFeatures]
  );

  // 機能制限の確認（例: ストレージ上限など）
  const checkLimit = useCallback(
    (limitType: string): number => {
      switch (limitType) {
        case 'storage':
          return isPremium
            ? hasFeature('unlimitedStorage')
              ? Infinity
              : 1024 * 1024 // 1GB
            : 50 * 1024; // 50MB
        case 'tasks':
          return isPremium ? (hasFeature('unlimitedTasks') ? Infinity : 1000) : 100;
        case 'exports':
          return isPremium ? Infinity : 3; // 無料ユーザーは月3回まで
        default:
          return 0;
      }
    },
    [isPremium, hasFeature]
  );

  return {
    isPremium,
    features: premiumFeatures,
    expiresAt,
    loading,
    error,
    premiumPlan,
    setPremiumPlan,
    referralCode,
    usageStats,
    setUsageStats,
    hasFeature,
    checkLimit,
    upgrade,
    extendTrial,
  };
}
