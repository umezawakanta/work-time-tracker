import axios from 'axios';
import { CustomPaymentMethodData, UserSubscription } from '@/types';

// APIのベースURL
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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
export const fetchUserSubscriptions = async (): Promise<UserSubscription[]> => {
    try {
        const response = await apiClient.get(USER_SUBSCRIPTION_ENDPOINT);
        return response.data;
    } catch (error) {
        console.error('Error fetching user subscriptions:', error);
        throw error;
    }
};

// サブスクリプションを新規追加
export const addUserSubscription = async (subscription: Omit<UserSubscription, '_id'>): Promise<UserSubscription> => {
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
    subscription: Partial<Omit<UserSubscription, '_id'>>
): Promise<UserSubscription> => {
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
): Promise<UserSubscription> => {
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
export const fetchUserSubscriptionsByMonth = async (yearMonth: string): Promise<UserSubscription[]> => {
    try {
        const response = await apiClient.get(`${USER_SUBSCRIPTION_ENDPOINT}/month/${yearMonth}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching subscriptions for month ${yearMonth}:`, error);
        throw error;
    }
};

// 特定の種別のサブスクリプションを取得
export const fetchUserSubscriptionsByType = async (type: string): Promise<UserSubscription[]> => {
    try {
        const response = await apiClient.get(`${USER_SUBSCRIPTION_ENDPOINT}/type/${type}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching subscriptions of type ${type}:`, error);
        throw error;
    }
};

// 支払い方法でサブスクリプションをフィルタリング
export const fetchUserSubscriptionsByPaymentMethod = async (paymentMethod: string): Promise<UserSubscription[]> => {
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

// ユーザーサブスクリプションの作成
export const createUserSubscription = async (subscriptionData: {
    userId: string;
    planId: string;
    status: 'active' | 'canceled' | 'expired';
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
}) => {
    try {
        const response = await apiClient.post(USER_SUBSCRIPTION_ENDPOINT, subscriptionData);
        return response.data;
    } catch (error) {
        console.error('Error creating user subscription:', error);
        throw error;
    }
};

// 自動更新の設定変更
export const updateAutoRenewal = async (id: string, cancelAtPeriodEnd: boolean) => {
    try {
        const response = await apiClient.patch(`${USER_SUBSCRIPTION_ENDPOINT}/${id}/cancel`, {
            cancelAtPeriodEnd
        });
        return response.data;
    } catch (error) {
        console.error('Error updating auto renewal:', error);
        throw error;
    }
};

// 支払い情報の更新
export const updatePaymentMethod = async (userId: string, paymentMethodData: CustomPaymentMethodData) => {
    try {
        const response = await apiClient.post(`${USER_SUBSCRIPTION_ENDPOINT}/payment-method`, {
            userId,
            paymentMethod: paymentMethodData
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
        const response = await apiClient.get(`${USER_SUBSCRIPTION_ENDPOINT}/invoices/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching invoice history:', error);
        throw error;
    }
};

// プランの変更を予約
export const scheduleSubscriptionChange = async (id: string, newPlanId: string, changeDate: Date) => {
    try {
        const response = await apiClient.post(`${USER_SUBSCRIPTION_ENDPOINT}/${id}/schedule-change`, {
            newPlanId,
            changeDate
        });
        return response.data;
    } catch (error) {
        console.error('Error scheduling subscription change:', error);
        throw error;
    }
};

// サブスクリプション解約
export const cancelSubscription = async (id: string, reason?: string) => {
    try {
        const response = await apiClient.post(`${USER_SUBSCRIPTION_ENDPOINT}/${id}/cancel-immediately`, {
            reason
        });
        return response.data;
    } catch (error) {
        console.error('Error canceling subscription:', error);
        throw error;
    }
};

// 解約後の復活
export const reactivateSubscription = async (id: string) => {
    try {
        const response = await apiClient.post(`${USER_SUBSCRIPTION_ENDPOINT}/${id}/reactivate`);
        return response.data;
    } catch (error) {
        console.error('Error reactivating subscription:', error);
        throw error;
    }
};

// デフォルトのエクスポートに関数を追加
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
    createUserSubscription,
    updateAutoRenewal,
    updatePaymentMethod,
    getInvoiceHistory,
    scheduleSubscriptionChange,
    cancelSubscription,
    reactivateSubscription,
};

export default userSubscriptionApi;