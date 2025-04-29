/**
 * ユーザーアカウント関連のサービス
 */

import { User } from '@/types/user';

/**
 * プレミアムプランの種類
 */
export type PremiumPlanType = 'basic' | 'professional' | 'enterprise';

/**
 * プレミアムプランのサイクル
 */
export type PremiumPlanCycle = 'monthly' | 'annual' | 'lifetime';

/**
 * ユーザープロファイル情報
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: boolean;
    emailNotifications: boolean;
  };
  subscription: {
    isPremium: boolean;
    planType?: PremiumPlanType;
    planCycle?: PremiumPlanCycle;
    expiresAt?: Date;
    autoRenew: boolean;
    cancelledAt?: Date;
  };
  usage: {
    tasksCreated: number;
    tasksCompleted: number;
    storageUsed: number;
    storageLimit: number;
  };
  referral: {
    code: string;
    invitedCount: number;
    invitedSuccessCount: number;
    earnedRewards: number;
  };
}

/**
 * ユーザープロフィール情報を取得
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('プロフィール情報の取得に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    throw error;
  }
};

/**
 * ユーザープロフィールを更新
 */
export const updateUserProfile = async (
  data: Partial<Pick<UserProfile, 'name' | 'preferences'>>
): Promise<UserProfile> => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('プロフィールの更新に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    throw error;
  }
};

/**
 * プロフィール画像をアップロード
 */
export const uploadProfileImage = async (
  file: File
): Promise<{ avatarUrl: string }> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('/api/user/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('プロフィール画像のアップロードに失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('プロフィール画像アップロードエラー:', error);
    throw error;
  }
};

/**
 * プレミアムプランにアップグレード
 */
export const upgradeToPremium = async (
  planType: PremiumPlanType,
  planCycle: PremiumPlanCycle
): Promise<{ success: boolean; redirectUrl: string }> => {
  try {
    const response = await fetch('/api/subscription/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ planType, planCycle })
    });

    if (!response.ok) {
      throw new Error('プレミアムプランへのアップグレードに失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('プレミアムアップグレードエラー:', error);
    throw error;
  }
};

/**
 * サブスクリプションをキャンセル
 */
export const cancelSubscription = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('サブスクリプションのキャンセルに失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('サブスクリプションキャンセルエラー:', error);
    throw error;
  }
};

/**
 * 自動更新の設定を変更
 */
export const toggleAutoRenew = async (
  enable: boolean
): Promise<{ success: boolean; autoRenew: boolean }> => {
  try {
    const response = await fetch('/api/subscription/auto-renew', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ autoRenew: enable })
    });

    if (!response.ok) {
      throw new Error('自動更新設定の変更に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('自動更新設定エラー:', error);
    throw error;
  }
};

/**
 * サブスクリプション履歴を取得
 */
export const fetchSubscriptionHistory = async (): Promise<Array<{
  id: string;
  date: Date;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'refunded';
  description: string;
  planType: PremiumPlanType;
  planCycle: PremiumPlanCycle;
}>> => {
  try {
    const response = await fetch('/api/subscription/history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('サブスクリプション履歴の取得に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('サブスクリプション履歴取得エラー:', error);
    return [];
  }
};

/**
 * プレミアム機能の利用可能状態を確認
 */
export const checkPremiumFeatures = async (): Promise<{
  isPremium: boolean;
  features: Record<string, boolean>;
  expiresAt?: string;
}> => {
  try {
    const response = await fetch('/api/user/premium-features', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('プレミアム機能情報の取得に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('プレミアム機能確認エラー:', error);
    // エラー時はデフォルト値を返す
    return {
      isPremium: false,
      features: {
        dataExport: false,
        autoPriority: false,
        advancedStats: false,
        unlimitedStorage: false
      }
    };
  }
};

/**
 * トライアル期間を延長
 */
export const extendTrialPeriod = async (): Promise<{ 
  success: boolean; 
  expiresAt?: string;
  message?: string;
}> => {
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
};

/**
 * 利用統計データを取得
 */
export const fetchUsageStatistics = async (): Promise<{
  tasks: {
    total: number;
    completed: number;
    overdue: number;
    completion_rate: number;
  };
  storage: {
    used: number;
    limit: number;
    usage_percent: number;
  };
  time: {
    total_tracked: number;
    average_per_task: number;
    most_productive_day: string;
    productivity_by_hour: Record<string, number>;
  };
}> => {
  try {
    const response = await fetch('/api/user/statistics/usage', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('利用統計の取得に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('利用統計取得エラー:', error);
    // エラー時はデフォルト値を返す
    return {
      tasks: {
        total: 0,
        completed: 0,
        overdue: 0,
        completion_rate: 0
      },
      storage: {
        used: 0,
        limit: 1024, // 1MB
        usage_percent: 0
      },
      time: {
        total_tracked: 0,
        average_per_task: 0,
        most_productive_day: '',
        productivity_by_hour: {}
      }
    };
  }
};