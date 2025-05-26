
/**
 * リファラル（紹介）プログラム関連の情報
 */
export interface ReferralInfo {
  code: string;
  totalInvites: number;
  successfulInvites: number;
  pendingInvites: number;
  earnedMonths: number;
  inviteds: Array<{
    id: string;
    name: string;
    email: string;
    joinedAt: Date;
    status: 'pending' | 'registered' | 'subscribed';
    planType?: string;
  }>;
  personalUrl: string;
}

/**
 * リファラルコードの生成オプション
 */
interface GenerateReferralCodeOptions {
  userId: string;
  length?: number;
  prefix?: string;
  includeNumbers?: boolean;
  includeUppercase?: boolean;
}

/**
 * 紹介したユーザーの概要情報を取得
 */
export const fetchReferralSummary = async (): Promise<ReferralInfo> => {
  try {
    const response = await fetch('/api/user/referrals/summary', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('リファラル情報の取得に失敗しました');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('リファラル情報取得エラー:', error);
    // エラー時はデフォルト値を返す
    return {
      code: '',
      totalInvites: 0,
      successfulInvites: 0,
      pendingInvites: 0,
      earnedMonths: 0,
      inviteds: [],
      personalUrl: ''
    };
  }
};

/**
 * ユーザーのリファラルコードを生成または取得
 */
export const generateReferralCode = async (options: GenerateReferralCodeOptions): Promise<string> => {
  try {
    const response = await fetch('/api/user/referrals/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error('リファラルコードの生成に失敗しました');
    }

    const data = await response.json();
    return data.referralCode;
  } catch (error) {
    console.error('リファラルコード生成エラー:', error);
    
    // エラー時はローカルで一時的なコードを生成（APIが利用できない場合のフォールバック）
    const fallbackCode = generateFallbackReferralCode(options);
    return fallbackCode;
  }
};

/**
 * フォールバック用のローカルリファラルコード生成
 * 注: このコードは一時的なもので、サーバーと同期されません
 */
const generateFallbackReferralCode = (options: GenerateReferralCodeOptions): string => {
  const {
    userId,
    length = 8,
    prefix = 'REF',
    includeNumbers = true,
    includeUppercase = true
  } = options;

  // 文字セットの準備
  let charset = 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) charset += '0123456789';

  // ユーザーIDの最初の数文字を使用
  const userIdPart = userId.substring(0, 4);

  // ランダム部分の生成
  let randomPart = '';
  for (let i = 0; i < length - prefix.length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomPart += charset[randomIndex];
  }

  // プレフィックス + ユーザーID部分 + ランダム部分
  return `${prefix}${userIdPart}${randomPart}`.substring(0, length);
};

/**
 * ユーザーを紹介する（招待メールを送信）
 */
export const invite= async (emails: string[], message?: string): Promise<{
  success: boolean;
  sentCount: number;
  failedEmails?: string[];
  error?: string;
}> => {
  try {
    const response = await fetch('/api/user/referrals/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ emails, message })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '招待の送信に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('招待送信エラー:', error);
    return {
      success: false,
      sentCount: 0,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    };
  }
};

/**
 * リファラル報酬を請求する
 */
export const claimReferralReward = async (): Promise<{
  success: boolean;
  monthsAdded: number;
  newExpiryDate?: string;
  error?: string;
}> => {
  try {
    const response = await fetch('/api/user/referrals/claim-reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '報酬の請求に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('報酬請求エラー:', error);
    return {
      success: false,
      monthsAdded: 0,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    };
  }
};

/**
 * トライアル期間を延長する
 */
export const extendTrialPeriod = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/user/trial/extend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('トライアル期間の延長に失敗しました');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('トライアル延長エラー:', error);
    return false;
  }
};

/**
 * 現在のサブスクリプション情報を取得
 */
export const fetchSubscriptionStatus = async (): Promise<{
  isPremium: boolean;
  planType?: 'basic' | 'professional' | 'enterprise';
  planCycle?: 'monthly' | 'annual' | 'lifetime';
  expiresAt?: string;
  autoRenew: boolean;
  cancelledAt?: string;
  features: string[];
  usageStats: {
    tasksCreated: number;
    tasksCompleted: number;
    storageUsed: number;
    storageLimit: number;
  };
}> => {
  try {
    const response = await fetch('/api/user/subscription', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('サブスクリプション情報の取得に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('サブスクリプション情報取得エラー:', error);
    // エラー時はデフォルト値を返す
    return {
      isPremium: false,
      autoRenew: false,
      features: [],
      usageStats: {
        tasksCreated: 0,
        tasksCompleted: 0,
        storageUsed: 0,
        storageLimit: 1024 // 1MB
      }
    };
  }
};