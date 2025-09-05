import { CustomPaymentMethodData, UserSubscription } from '@/types';
import { api } from './apiConfig';

// ユーザーサブスクリプション取得関連API
// -----------------------------------------------------

// 特定ユーザーのサブスクリプション情報を取得
export const getUserSubscription = async (userId: string) => {
  try {
    const response = await api.get(`/userSubscription/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw error;
  }
};

// すべてのユーザーサブスクリプションを取得
export const fetchUserSubscriptions = async (): Promise<UserSubscription[]> => {
  try {
    const response = await api.get(`/userSubscription`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    throw error;
  }
};

// 特定の月のユーザーサブスクリプションを取得
export const fetchUserSubscriptionsByMonth = async (
  yearMonth: string
): Promise<UserSubscription[]> => {
  try {
    const response = await api.get(`/userSubscription/month/${yearMonth}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user subscriptions for month ${yearMonth}:`, error);
    throw error;
  }
};

// 特定の種別のユーザーサブスクリプションを取得
export const fetchUserSubscriptionsByType = async (type: string): Promise<UserSubscription[]> => {
  try {
    const response = await api.get(`/userSubscription/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user subscriptions of type ${type}:`, error);
    throw error;
  }
};

// 支払い方法でユーザーサブスクリプションをフィルタリング
export const fetchUserSubscriptionsByPaymentMethod = async (
  paymentMethod: string
): Promise<UserSubscription[]> => {
  try {
    const response = await api.get(`/userSubscription/payment-method/${paymentMethod}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user subscriptions with payment method ${paymentMethod}:`, error);
    throw error;
  }
};

// ユーザーサブスクリプション管理関連API
// -----------------------------------------------------

// ユーザーサブスクリプションを新規追加
export const addUserSubscription = async (
  subscription: Omit<UserSubscription, '_id'>
): Promise<UserSubscription> => {
  try {
    const response = await api.post(`/userSubscription`, subscription);
    return response.data;
  } catch (error) {
    console.error('Error adding user subscription:', error);
    throw error;
  }
};

// ユーザーサブスクリプションを更新
export const updateUserSubscription = async (
  userId: string,
  subscription: Partial<Omit<UserSubscription, '_id'>>
): Promise<UserSubscription> => {
  try {
    if (!userId) throw new Error('userId is required');
    const response = await api.put(`/userSubscription/user/${userId}`, subscription);
    return response.data;
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

// 正しい実装（上の一時的な書き換えを確定）
export const updateUserSubscriptionCorrect = async (
  userId: string,
  subscription: Partial<Omit<UserSubscription, '_id'>>
): Promise<UserSubscription> => {
  try {
    if (!userId) throw new Error('userId is required');
    const response = await api.put(`/userSubscription/user/${userId}`, subscription);
    return response.data;
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

// ユーザーサブスクリプションを削除
export const deleteUserSubscription = async (id: string): Promise<void> => {
  try {
    await api.delete(`/userSubscription/${id}`);
  } catch (error) {
    console.error('Error deleting user subscription:', error);
    throw error;
  }
};

// ユーザーサブスクリプションの確認ステータスを更新
export const updateUserSubscriptionCheckStatus = async (
  id: string,
  month: string,
  checked: boolean
): Promise<UserSubscription> => {
  try {
    const response = await api.patch(`/userSubscription/${id}/check-status`, {
      month,
      checked,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating check status:', error);
    throw error;
  }
};

// プラン管理や決済関連API
// -----------------------------------------------------

// ユーザーサブスクリプションの新規作成
export const createUserSubscription = async (subscriptionData: {
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}) => {
  try {
    const response = await api.post(`/userSubscription`, subscriptionData);
    return response.data;
  } catch (error) {
    console.error('Error creating user subscription:', error);
    throw error;
  }
};

// 自動更新の設定変更
export const updateAutoRenewal = async (userId: string, cancelAtPeriodEnd: boolean) => {
  try {
    const response = await api.put(`/userSubscription/user/${userId}`, { cancelAtPeriodEnd });
    return response.data;
  } catch (error) {
    console.error('Error updating auto renewal:', error);
    throw error;
  }
};

// 支払い情報の更新
export const updatePaymentMethod = async (
  userId: string,
  paymentMethodData: CustomPaymentMethodData
) => {
  try {
    const response = await api.post(`/userSubscription/payment-method`, {
      userId,
      paymentMethod: paymentMethodData,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// 請求履歴の取得
export const getInvoiceHistory = async (userId: string) => {
  try {
    const response = await api.get(`/userSubscription/invoices/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice history:', error);
    throw error;
  }
};

// プランの変更を予約
export const scheduleSubscriptionChange = async (
  id: string,
  newPlanId: string,
  changeDate: Date
) => {
  try {
    const response = await api.post(`/userSubscription/${id}/schedule-change`, {
      newPlanId,
      changeDate,
    });
    return response.data;
  } catch (error) {
    console.error('Error scheduling subscription change:', error);
    throw error;
  }
};

// サブスクリプション解約
export const cancelSubscription = async (userId: string, reason?: string) => {
  try {
    // 即時解約は DELETE エンドポイントを使用
    const response = await api.delete(`/userSubscription/user/${userId}`, {
      data: { reason },
    } as any);
    return response.data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// 解約後の復活
export const reactivateSubscription = async (userId: string) => {
  try {
    const response = await api.put(`/userSubscription/user/${userId}`, {
      status: 'active',
      cancelAtPeriodEnd: false,
      canceledAt: undefined,
    });
    return response.data;
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
};

// デフォルトのエクスポート
const userSubscriptionApi = {
  // 取得系
  getUserSubscription,
  fetchUserSubscriptions,
  fetchUserSubscriptionsByMonth,
  fetchUserSubscriptionsByType,
  fetchUserSubscriptionsByPaymentMethod,

  // 管理系
  addUserSubscription,
  updateUserSubscription,
  deleteUserSubscription,
  updateUserSubscriptionCheckStatus,

  // プラン・決済系
  createUserSubscription,
  updateAutoRenewal,
  updatePaymentMethod,
  getInvoiceHistory,
  scheduleSubscriptionChange,
  cancelSubscription,
  reactivateSubscription,
  // 一時的に互換エイリアス（古い呼び出し箇所のため）
  updateUserSubscriptionCorrect: updateUserSubscription,
};

export default userSubscriptionApi;
