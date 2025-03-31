// src/services/api/notificationApi.ts
import { AxiosResponse } from 'axios';
import { api } from './apiConfig';
import { UserNotification } from '@/types';

// レスポンスの型定義
interface NotificationApiResponse {
  message: string;
  notification: UserNotification;
}

interface NotificationsApiResponse {
  message: string;
  notifications: UserNotification[];
}

// 通知設定の型定義
interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  types: {
    reminder: boolean;
    report: boolean;
    alert: boolean;
    success: boolean;
    system: boolean;
  };
}

/**
 * ユーザーの通知一覧を取得する
 * @param userId ユーザーID
 * @returns 通知一覧
 */
export const getUserNotifications = async (userId: string): Promise<AxiosResponse<UserNotification[]>> => {
  try {
    const response = await api.get<UserNotification[]>(`/notifications/user/${userId}`);
    return response;
  } catch (error) {
    console.error('通知取得エラー:', error);
    throw error;
  }
};

/**
 * 未読の通知数を取得する
 * @param userId ユーザーID
 * @returns 未読通知数
 */
export const getUnreadNotificationsCount = async (userId: string): Promise<AxiosResponse<{ count: number }>> => {
  try {
    const response = await api.get<{ count: number }>(`/notifications/user/${userId}/unread-count`);
    return response;
  } catch (error) {
    console.error('未読通知数取得エラー:', error);
    throw error;
  }
};

/**
 * 特定の通知を既読にする
 * @param notificationId 通知ID
 * @returns 更新された通知
 */
export const markNotificationAsRead = async (notificationId: number): Promise<AxiosResponse<NotificationApiResponse>> => {
  try {
    const response = await api.patch<NotificationApiResponse>(`/notifications/${notificationId}/read`);
    return response;
  } catch (error) {
    console.error('通知既読エラー:', error);
    throw error;
  }
};

/**
 * ユーザーのすべての通知を既読にする
 * @param userId ユーザーID
 * @returns 操作結果
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<AxiosResponse<NotificationsApiResponse>> => {
  try {
    const response = await api.patch<NotificationsApiResponse>(`/notifications/user/${userId}/read-all`);
    return response;
  } catch (error) {
    console.error('全通知既読エラー:', error);
    throw error;
  }
};

/**
 * 通知を削除する
 * @param notificationId 通知ID
 * @returns 操作結果
 */
export const deleteNotification = async (notificationId: number): Promise<AxiosResponse<{ message: string }>> => {
  try {
    const response = await api.delete<{ message: string }>(`/notifications/${notificationId}`);
    return response;
  } catch (error) {
    console.error('通知削除エラー:', error);
    throw error;
  }
};

/**
 * ユーザーのすべての通知を削除する
 * @param userId ユーザーID
 * @returns 操作結果
 */
export const deleteAllNotifications = async (userId: string): Promise<AxiosResponse<{ message: string }>> => {
  try {
    const response = await api.delete<{ message: string }>(`/notifications/user/${userId}`);
    return response;
  } catch (error) {
    console.error('全通知削除エラー:', error);
    throw error;
  }
};

/**
 * 通知設定を取得する
 * @param userId ユーザーID
 * @returns 通知設定
 */
export const getNotificationSettings = async (userId: string): Promise<AxiosResponse<NotificationSettings>> => {
  try {
    const response = await api.get<NotificationSettings>(`/notifications/settings/${userId}`);
    return response;
  } catch (error) {
    console.error('通知設定取得エラー:', error);
    throw error;
  }
};

/**
 * 通知設定を更新する
 * @param userId ユーザーID
 * @param settings 更新する設定
 * @returns 更新された設定
 */
export const updateNotificationSettings = async (userId: string, settings: Partial<NotificationSettings>): Promise<AxiosResponse<NotificationSettings>> => {
  try {
    const response = await api.patch<NotificationSettings>(`/notifications/settings/${userId}`, settings);
    return response;
  } catch (error) {
    console.error('通知設定更新エラー:', error);
    throw error;
  }
};

// デフォルトのエクスポート
const notificationApi = {
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationSettings,
  updateNotificationSettings
};

export default notificationApi;