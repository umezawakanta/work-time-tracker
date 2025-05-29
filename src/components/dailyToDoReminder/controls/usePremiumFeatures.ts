import { useState, useEffect, useCallback } from 'react';
import {
  _checkPremiumFeatures as checkPremiumFeatures,
  _upgradeToPremium as upgradeToPremium,
  PremiumPlanType,
  PremiumPlanCycle,
  _extendTrialPeriod as extendTrialPeriod,
} from '@/services/userAccountService';
import { fetchReferralSummary } from '@/services/referralService';

/**
 * プレミアム機能の管理用カスタムフック
 */
export function usePremiumFeatures() {
  // プレミアム状態
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumFeatures, setPremiumFeatures] = useState<Record<string, boolean>>({});
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);
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

  // プレミアム機能の情報を初期ロード
  useEffect(() => {
    const loadPremiumStatus = async () => {
      setLoading(true);
      try {
        // プレミアム機能の状態を取得
        const status = await checkPremiumFeatures();
        setIsPremium(status.isPremium);
        setPremiumFeatures(status.features);
        setExpiresAt(status.expiresAt);

        // リファラル情報の取得
        try {
          const referralInfo = await fetchReferralSummary();
          if (referralInfo?.code) {
            setReferralCode(referralInfo.code);
          }
        } catch (referralError) {
          console.error('リファラル情報取得エラー:', referralError);
        }
      } catch (err) {
        console.error('プレミアム機能確認エラー:', err);
        setError('プレミアム機能の情報取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadPremiumStatus();
  }, []);

  // プレミアムへのアップグレード処理
  const upgradeToPremiumPlan = useCallback(
    async (planType: PremiumPlanType, planCycle: PremiumPlanCycle) => {
      try {
        const result = await upgradeToPremium(planType, planCycle);
        if (result.success && result.redirectUrl) {
          window.location.href = result.redirectUrl;
          return true;
        }
        return false;
      } catch (err) {
        console.error('アップグレードエラー:', err);
        setError('プレミアムプランへのアップグレードに失敗しました');
        return false;
      }
    },
    []
  );

  // トライアル延長処理
  const extendTrial = useCallback(async () => {
    try {
      const result = await extendTrialPeriod();
      if (result.success && result.expiresAt) {
        setExpiresAt(result.expiresAt);
        return true;
      }
      return false;
    } catch (err) {
      console.error('トライアル延長エラー:', err);
      setError('トライアル期間の延長に失敗しました');
      return false;
    }
  }, []);

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
    upgradeToPremiumPlan,
    extendTrial,
  };
}
