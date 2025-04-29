/**
 * プレミアムステータス関連のユーティリティ関数
 */

// 期限切れ警告の日数閾値
const WARNING_DAYS = 7;

/**
 * プレミアムプランの種類
 */
export type PremiumPlanType = 'basic' | 'professional' | 'enterprise';

/**
 * プレミアムプランのサイクル
 */
export type PremiumPlanCycle = 'monthly' | 'annual' | 'lifetime';

/**
 * プレミアムステータス情報
 */
export interface PremiumStatus {
  isPremium: boolean;
  expiresAt?: string;
  planType?: PremiumPlanType;
  planCycle?: PremiumPlanCycle;
  daysRemaining: number;
  isExpiring: boolean;
  isLifetime: boolean;
  trialDaysLeft: number;
  isInTrial: boolean;
  features: {
    dataExport: boolean;
    priorityAdjustment: boolean;
    advancedStats: boolean;
    unlimitedStorage: boolean;
    unlimitedTasks: boolean;
    referralBonus: boolean;
    prioritySupport: boolean;
  };
}

/**
 * ユーザーのプレミアムステータスを取得する
 * @returns プレミアムステータス情報
 */
export async function fetchPremiumStatus(): Promise<PremiumStatus> {
  try {
    const response = await fetch('/api/user/premium-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('プレミアムステータスの取得に失敗しました');
    }
    
    const data = await response.json();
    
    // APIからのレスポンスをプレミアムステータスに変換
    return processPremiumStatusData(data);
  } catch (error) {
    console.error('プレミアムステータス取得エラー:', error);
    
    // エラー時はデフォルト値を返す
    return {
      isPremium: false,
      daysRemaining: 0,
      isExpiring: false,
      isLifetime: false,
      trialDaysLeft: 0,
      isInTrial: false,
      features: {
        dataExport: false,
        priorityAdjustment: false,
        advancedStats: false,
        unlimitedStorage: false,
        unlimitedTasks: false,
        referralBonus: false,
        prioritySupport: false
      }
    };
  }
}

/**
 * APIからのレスポンスデータをプレミアムステータスに変換する
 * @param data APIからのレスポンスデータ
 * @returns 整形されたプレミアムステータス
 */
function processPremiumStatusData(data: any): PremiumStatus {
  const expiresAt = data.expiresAt;
  const daysRemaining = calculateDaysRemaining(expiresAt);
  const isInTrial = data.isInTrial || false;
  
  return {
    isPremium: data.isPremium || false,
    expiresAt: expiresAt,
    planType: data.planType || undefined,
    planCycle: data.planCycle || undefined,
    daysRemaining,
    isExpiring: daysRemaining <= WARNING_DAYS && daysRemaining !== Infinity,
    isLifetime: data.planCycle === 'lifetime' || daysRemaining === Infinity,
    trialDaysLeft: isInTrial ? daysRemaining : 0,
    isInTrial,
    features: {
      dataExport: data.features?.dataExport || false,
      priorityAdjustment: data.features?.priorityAdjustment || false,
      advancedStats: data.features?.advancedStats || false,
      unlimitedStorage: data.features?.unlimitedStorage || false,
      unlimitedTasks: data.features?.unlimitedTasks || false,
      referralBonus: data.features?.referralBonus || false,
      prioritySupport: data.features?.prioritySupport || false
    }
  };
}

/**
 * 有効期限までの残り日数を計算する
 * @param dateString 有効期限の日付文字列
 * @returns 残り日数（無期限の場合はInfinity）
 */
export function calculateDaysRemaining(dateString?: string): number {
  if (!dateString) return Infinity;
  
  try {
    const expiryDate = new Date(dateString);
    const today = new Date();
    
    // 時間部分をリセットして日付のみで比較
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(diffDays, 0); // 負の値にならないよう調整
  } catch (e) {
    console.error('日付計算エラー:', e);
    return 0;
  }
}

/**
 * 有効期限の日付を整形して表示用にフォーマットする
 * @param dateString 有効期限の日付文字列
 * @returns フォーマットされた日付文字列
 */
export function formatExpiryDate(dateString?: string): string {
  if (!dateString) return '無期限';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (e) {
    console.error('日付形式エラー:', e);
    return '日付エラー';
  }
}

/**
 * プレミアムプランの表示名を取得する
 * @param planType プランタイプ
 * @param planCycle プランサイクル
 * @returns プランの表示名
 */
export function getPlanDisplayName(
  planType?: PremiumPlanType, 
  planCycle?: PremiumPlanCycle
): string {
  let cycleText = '';
  if (planCycle) {
    switch (planCycle) {
      case 'monthly':
        cycleText = '月額';
        break;
      case 'annual':
        cycleText = '年間';
        break;
      case 'lifetime':
        cycleText = '永久';
        break;
    }
  }
  
  let typeText = '';
  if (planType) {
    switch (planType) {
      case 'basic':
        typeText = 'ベーシック';
        break;
      case 'professional':
        typeText = 'プロフェッショナル';
        break;
      case 'enterprise':
        typeText = 'エンタープライズ';
        break;
    }
  }
  
  if (!typeText && !cycleText) return 'プレミアム';
  if (!typeText) return `${cycleText}プラン`;
  if (!cycleText) return typeText;
  
  return `${cycleText}${typeText}`;
}

/**
 * トライアル期間を延長する
 * @returns 延長処理の結果
 */
export async function extendTrialPeriod(): Promise<{
  success: boolean;
  expiresAt?: string;
  message?: string;
}> {
  try {
    const response = await fetch('/api/user/trial/extend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'トライアル期間の延長に失敗しました');
    }
    
    return await response.json();
  } catch (error) {
    console.error('トライアル延長エラー:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '不明なエラーが発生しました'
    };
  }
}