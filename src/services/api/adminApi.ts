import { api } from './apiConfig';
import { User, UserNotification } from '@/types';

export interface AdminUser extends User {
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
  subscriptionStatus?: 'active' | 'canceled' | 'expired' | 'none';
  totalWorkHours?: number;
  totalAssets?: number;
  loginCount?: number;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalWorkHours: number;
  totalAssets: number;
  totalSubscriptions: number;
  revenueThisMonth: number;
}

export interface ActivityLog {
  _id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserManagementFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  subscriptionStatus?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ユーザー一覧取得
export const getUsers = async (
  filters?: UserManagementFilters
): Promise<{
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }

  const response = await api.get(`/admin/users?${params.toString()}`);
  return response.data;
};

// ユーザー詳細取得
export const getUserDetails = async (userId: string): Promise<AdminUser> => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

// ユーザー状態更新
export const updateUserStatus = async (
  userId: string,
  updates: {
    isActive?: boolean;
    role?: 'user' | 'admin' | 'moderator';
    notes?: string;
  }
): Promise<AdminUser> => {
  const response = await api.put(`/admin/users/${userId}/status`, updates);
  return response.data;
};

// ユーザー削除
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/admin/users/${userId}`);
};

// システム統計取得
export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// アクティビティログ取得
export const getActivityLogs = async (filters?: {
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{
  logs: ActivityLog[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }

  const response = await api.get(`/admin/activity-logs?${params.toString()}`);
  return response.data;
};

// 一括通知送信
export const sendBulkNotification = async (notification: {
  title: string;
  message: string;
  type: string;
  targetUsers?: string[]; // 空の場合は全ユーザー
  actionUrl?: string;
}): Promise<void> => {
  await api.post('/admin/notifications/bulk', notification);
};

// バックアップ作成
export const createBackup = async (): Promise<{ backupId: string; downloadUrl: string }> => {
  const response = await api.post('/admin/backup');
  return response.data;
};

// システム設定更新
export const updateSystemSettings = async (settings: {
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
  maxUsersPerPlan?: number;
  features?: {
    [key: string]: boolean;
  };
}): Promise<void> => {
  await api.put('/admin/settings', settings);
};
