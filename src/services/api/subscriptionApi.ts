// 一般サブスクリプション（外部サービス）用のクライアントAPI
import { SubscriptionService } from '@/types';
import { api } from './apiConfig';

// 一般サブスクリプション取得関連API
// -----------------------------------------------------

// すべてのサブスクリプションを取得
export const fetchSubscriptions = async (): Promise<SubscriptionService[]> => {
  try {
    const response = await api.get('/subscription');

    // データ検証とフォールバック
    const data = response.data;

    // データが配列でない場合の処理
    if (!Array.isArray(data)) {
      console.warn('Subscription API returned non-array data:', data);

      // オブジェクトの中に配列が含まれている場合
      if (data && typeof data === 'object') {
        if (Array.isArray(data.subscriptions)) {
          return data.subscriptions;
        }
        if (Array.isArray(data.data)) {
          return data.data;
        }
        if (Array.isArray(data.items)) {
          return data.items;
        }
      }

      // フォールバック: 空配列を返す
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    // エラー時も空配列を返してクラッシュを防ぐ
    return [];
  }
};

// 特定の月のサブスクリプションを取得
export const fetchSubscriptionsByMonth = async (
  yearMonth: string
): Promise<SubscriptionService[]> => {
  try {
    const response = await api.get(`/subscription/month/${yearMonth}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subscriptions for month ${yearMonth}:`, error);
    throw error;
  }
};

// 特定の種別のサブスクリプションを取得
export const fetchSubscriptionsByType = async (type: string): Promise<SubscriptionService[]> => {
  try {
    const response = await api.get(`/subscription/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subscriptions of type ${type}:`, error);
    throw error;
  }
};

// 支払い方法でサブスクリプションをフィルタリング
export const fetchSubscriptionsByPaymentMethod = async (
  paymentMethod: string
): Promise<SubscriptionService[]> => {
  try {
    const response = await api.get(`/subscription/payment-method/${paymentMethod}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subscriptions with payment method ${paymentMethod}:`, error);
    throw error;
  }
};

// 金額関連API
// -----------------------------------------------------

// サブスクリプションの合計金額を取得
export const fetchTotalSubscriptionAmount = async (): Promise<number> => {
  try {
    const response = await api.get(`/subscription/total-amount`);
    return response.data.totalAmount;
  } catch (error) {
    console.error('Error fetching total subscription amount:', error);
    throw error;
  }
};

// 月ごとのサブスクリプション合計金額を取得
export const fetchMonthlyTotalAmount = async (): Promise<{ month: string; amount: number }[]> => {
  try {
    const response = await api.get(`/subscription/monthly-totals`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly total amounts:', error);
    throw error;
  }
};

// 一般サブスクリプション管理API
// -----------------------------------------------------

// サブスクリプションを新規追加
export const addSubscription = async (
  subscription: Omit<SubscriptionService, '_id'>
): Promise<SubscriptionService> => {
  try {
    const response = await api.post(`/subscription`, subscription);
    return response.data;
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
};

// サブスクリプションを更新
export const updateSubscription = async (
  id: string,
  subscription: Partial<Omit<SubscriptionService, '_id'>>
): Promise<SubscriptionService> => {
  try {
    const response = await api.put(`/subscription/${id}`, subscription);
    return response.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// サブスクリプションを削除
export const deleteSubscription = async (id: string): Promise<void> => {
  try {
    await api.delete(`/subscription/${id}`);
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

// サブスクリプションの確認ステータスを更新
export const updateSubscriptionCheckStatus = async (
  id: string,
  month: string,
  checked: boolean
): Promise<SubscriptionService> => {
  try {
    const response = await api.patch(`/subscription/${id}/check-status`, {
      month,
      checked,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating check status:', error);
    throw error;
  }
};

// エイリアス関数（互換性のため）
// -----------------------------------------------------
export const getAll = async () => {
  try {
    const subscriptions = await fetchSubscriptions();
    return { data: { subscriptions } };
  } catch (error) {
    console.error('Error fetching all subscriptions:', error);
    throw error;
  }
};

// デフォルトエクスポート
const subscriptionApi = {
  // 取得系
  fetchSubscriptions,
  fetchSubscriptionsByMonth,
  fetchSubscriptionsByType,
  fetchSubscriptionsByPaymentMethod,

  // 金額関連
  fetchTotalSubscriptionAmount,
  fetchMonthlyTotalAmount,

  // 管理系
  addSubscription,
  updateSubscription,
  deleteSubscription,
  updateSubscriptionCheckStatus,

  // エイリアス
  getAll,
  create: addSubscription,
  update: updateSubscription,
  delete: deleteSubscription,
};

export default subscriptionApi;
