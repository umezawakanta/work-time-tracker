import axios from 'axios';
import { Subscription } from '@/types/subscription';

// APIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// userSubscriptionエンドポイント
const USER_SUBSCRIPTION_ENDPOINT = `${API_BASE_URL}/userSubscription`;

// APIクライアントのインスタンスを作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 特定ユーザーのサブスクリプション情報を取得
export const getUserSubscription = async (userId: string) => {
  try {
    const response = await apiClient.get(`${USER_SUBSCRIPTION_ENDPOINT}/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw error;
  }
};

// すべてのサブスクリプションを取得
export const fetchUserSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const response = await apiClient.get(USER_SUBSCRIPTION_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    throw error;
  }
};

// サブスクリプションを新規追加
export const addUserSubscription = async (subscription: Omit<Subscription, '_id'>): Promise<Subscription> => {
  try {
    const response = await apiClient.post(USER_SUBSCRIPTION_ENDPOINT, subscription);
    return response.data;
  } catch (error) {
    console.error('Error adding user subscription:', error);
    throw error;
  }
};

// サブスクリプションを更新
export const updateUserSubscription = async (
  id: string,
  subscription: Partial<Omit<Subscription, '_id'>>
): Promise<Subscription> => {
  try {
    const response = await apiClient.put(`${USER_SUBSCRIPTION_ENDPOINT}/${id}`, subscription);
    return response.data;
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

// サブスクリプションを削除
export const deleteUserSubscription = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${USER_SUBSCRIPTION_ENDPOINT}/${id}`);
  } catch (error) {
    console.error('Error deleting user subscription:', error);
    throw error;
  }
};

// サブスクリプションの確認ステータスを更新
export const updateSubscriptionCheckStatus = async (
  id: string,
  month: string,
  checked: boolean
): Promise<Subscription> => {
  try {
    const response = await apiClient.patch(`${USER_SUBSCRIPTION_ENDPOINT}/${id}/check-status`, {
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
export const fetchUserSubscriptionsByMonth = async (yearMonth: string): Promise<Subscription[]> => {
  try {
    const response = await apiClient.get(`${USER_SUBSCRIPTION_ENDPOINT}/month/${yearMonth}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subscriptions for month ${yearMonth}:`, error);
    throw error;
  }
};

// 特定の種別のサブスクリプションを取得
export const fetchUserSubscriptionsByType = async (type: string): Promise<Subscription[]> => {
  try {
    const response = await apiClient.get(`${USER_SUBSCRIPTION_ENDPOINT}/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subscriptions of type ${type}:`, error);
    throw error;
  }
};

// 支払い方法でサブスクリプションをフィルタリング
export const fetchUserSubscriptionsByPaymentMethod = async (paymentMethod: string): Promise<Subscription[]> => {
  try {
    const response = await apiClient.get(`${USER_SUBSCRIPTION_ENDPOINT}/payment-method/${paymentMethod}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subscriptions with payment method ${paymentMethod}:`, error);
    throw error;
  }
};

// サブスクリプションの合計金額を取得
export const fetchTotalSubscriptionAmount = async (): Promise<number> => {
  try {
    const response = await apiClient.get(`${USER_SUBSCRIPTION_ENDPOINT}/total-amount`);
    return response.data.totalAmount;
  } catch (error) {
    console.error('Error fetching total subscription amount:', error);
    throw error;
  }
};

// 月ごとのサブスクリプション合計金額を取得
export const fetchMonthlyTotalAmount = async (): Promise<{ month: string; amount: number }[]> => {
  try {
    const response = await apiClient.get(`${USER_SUBSCRIPTION_ENDPOINT}/monthly-totals`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly total amounts:', error);
    throw error;
  }
};

// デフォルトエクスポート
const userSubscriptionApi = {
  getUserSubscription,
  fetchUserSubscriptions,
  addUserSubscription,
  updateUserSubscription,
  deleteUserSubscription,
  updateSubscriptionCheckStatus,
  fetchUserSubscriptionsByMonth,
  fetchUserSubscriptionsByType,
  fetchUserSubscriptionsByPaymentMethod,
  fetchTotalSubscriptionAmount,
  fetchMonthlyTotalAmount,
};

export default userSubscriptionApi;