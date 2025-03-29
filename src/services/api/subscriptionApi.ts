import { SubscriptionService } from '@/types';
import axios from 'axios';

// APIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// userSubscriptionエンドポイント - ここを変更
const SUBSCRIPTION_ENDPOINT = `${API_BASE_URL}/userSubscription`;

// APIクライアントのインスタンスを作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// サブスクリプションを削除
export const deleteSubscription = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${SUBSCRIPTION_ENDPOINT}/${id}`);
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
    const response = await apiClient.patch(`${SUBSCRIPTION_ENDPOINT}/${id}/check-status`, {
      month,
      checked,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating check status:', error);
    throw error;
  }
};

// 特定の月のサブスクリプションを取得
export const fetchSubscriptionsByMonth = async (yearMonth: string): Promise<SubscriptionService[]> => {
  try {
    const response = await apiClient.get(`${SUBSCRIPTION_ENDPOINT}/month/${yearMonth}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subscriptions for month ${yearMonth}:`, error);
    throw error;
  }
};

// 特定の種別のサブスクリプションを取得
export const fetchSubscriptionsByType = async (type: string): Promise<SubscriptionService[]> => {
  try {
    const response = await apiClient.get(`${SUBSCRIPTION_ENDPOINT}/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subscriptions of type ${type}:`, error);
    throw error;
  }
};

// 支払い方法でサブスクリプションをフィルタリング
export const fetchSubscriptionsByPaymentMethod = async (paymentMethod: string): Promise<SubscriptionService[]> => {
  try {
    const response = await apiClient.get(`${SUBSCRIPTION_ENDPOINT}/payment-method/${paymentMethod}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subscriptions with payment method ${paymentMethod}:`, error);
    throw error;
  }
};

// サブスクリプションの合計金額を取得
export const fetchTotalSubscriptionAmount = async (): Promise<number> => {
  try {
    const response = await apiClient.get(`${SUBSCRIPTION_ENDPOINT}/total-amount`);
    return response.data.totalAmount;
  } catch (error) {
    console.error('Error fetching total subscription amount:', error);
    throw error;
  }
};

// 月ごとのサブスクリプション合計金額を取得
export const fetchMonthlyTotalAmount = async (): Promise<{ month: string; amount: number }[]> => {
  try {
    const response = await apiClient.get(`${SUBSCRIPTION_ENDPOINT}/monthly-totals`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly total amounts:', error);
    throw error;
  }
};

// すべてのサブスクリプションを取得
export const fetchSubscriptions = async (): Promise<SubscriptionService[]> => {
  try {
    const response = await apiClient.get(SUBSCRIPTION_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

// すべてのサブスクリプションを取得する別名メソッド
export const getAll = async () => {
  try {
    const subscriptions = await fetchSubscriptions();
    return { data: { subscriptions } };
  } catch (error) {
    console.error('Error fetching all subscriptions:', error);
    throw error;
  }
};

// サブスクリプションを新規追加
export const addSubscription = async (subscription: Omit<SubscriptionService, '_id'>): Promise<SubscriptionService> => {
  try {
    const response = await apiClient.post(SUBSCRIPTION_ENDPOINT, subscription);
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
    const response = await apiClient.put(`${SUBSCRIPTION_ENDPOINT}/${id}`, subscription);
    return response.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// デフォルトエクスポート
const subscriptionApi = {
  fetchSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  updateSubscriptionCheckStatus,
  fetchSubscriptionsByMonth,
  fetchSubscriptionsByType,
  fetchSubscriptionsByPaymentMethod,
  fetchTotalSubscriptionAmount,
  fetchMonthlyTotalAmount,
  getAll,
  create: addSubscription,
  update: updateSubscription,
  delete: deleteSubscription,
};

export default subscriptionApi;