import { api } from './apiConfig';
import { tokenManager } from '@/services/auth/TokenManager';
import { User } from '@/types';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  message: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
}

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', userData);

    if (response.data.accessToken && response.data.refreshToken) {
      // TokenManagerを使用してトークンを管理
      tokenManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.expiresIn || 3600, // デフォルト1時間
        response.data.refreshExpiresIn || 604800 // デフォルト7日
      );
    }

    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
      rememberMe,
    });

    // 既存のtoken形式に対応
    if (response.data.token) {
      // 単純なtokenをaccessTokenとして扱う
      const expiresIn = 3600; // 1時間
      const refreshExpiresIn = rememberMe ? 2592000 : 604800;

      tokenManager.setTokens(
        response.data.token, // accessTokenとして使用
        response.data.token, // refreshTokenも同じ値を使用（一時的）
        expiresIn,
        refreshExpiresIn
      );

      if (rememberMe) {
        tokenManager.setRememberMe(true);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      // AuthResponse形式に変換
      return {
        accessToken: response.data.token,
        refreshToken: response.data.token,
        user: response.data.user,
        message: 'ログインに成功しました',
        expiresIn,
        refreshExpiresIn,
      };
    }

    // 新しい形式のレスポンス（推奨）
    if (response.data.accessToken && response.data.refreshToken) {
      const expiresIn = response.data.expiresIn || 3600;
      const refreshExpiresIn = response.data.refreshExpiresIn || (rememberMe ? 2592000 : 604800);

      tokenManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        expiresIn,
        refreshExpiresIn
      );

      if (rememberMe) {
        tokenManager.setRememberMe(true);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = (): void => {
  // TokenManagerを使用してクリーンアップ
  tokenManager.clearTokens();

  // 追加のローカルストレージクリーンアップ
  localStorage.removeItem('user');
  localStorage.removeItem('lastActivity');
  localStorage.removeItem('sessionPersistent');
};

export const checkAuth = async (): Promise<boolean> => {
  try {
    // TokenManagerで認証状態を確認
    if (!tokenManager.isAuthenticated()) {
      return false;
    }

    // サーバーサイドで認証状態を確認
    const token = await tokenManager.getAccessToken();
    if (!token) {
      return false;
    }

    const response = await api.get('/auth/check');
    return response.data.isAuthenticated;
  } catch (error) {
    console.error('Auth check error:', error);
    tokenManager.clearTokens();
    return false;
  }
};

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get<{ user: User }>('/auth/profile');
    return response.data.user;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData: {
  name: string;
  email: string;
}): Promise<User> => {
  try {
    const token = await tokenManager.getAccessToken();
    if (!token) {
      throw new Error('認証トークンがありません');
    }

    const response = await api.put<{ user: User }>('/auth/profile', userData);
    return response.data.user;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

export const fetchUserData = async (): Promise<User> => {
  try {
    const response = await api.get<{ user: User }>('/auth/user');

    // 環境変数による管理者権限の確認
    const userData = response.data.user;
    const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(',') || [];

    if (adminEmails.includes(userData.email)) {
      userData.isAdmin = true;
      console.log('[Auth] Admin privileges granted for:', userData.email);
    }

    return userData;
  } catch (error) {
    console.error('Fetch user data error:', error);
    throw error;
  }
};

// パスワードリセット関連の機能
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/auth/password-reset', { email });
    return response.data;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

export const verifyResetToken = async (token: string): Promise<{ valid: boolean }> => {
  try {
    const response = await api.post<{ valid: boolean }>('/auth/password-reset/verify', { token });
    return response.data;
  } catch (error) {
    console.error('Verify reset token error:', error);
    throw error;
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/auth/password-reset/confirm', {
      token,
      password: newPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// トークンリフレッシュ機能
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.data.accessToken && response.data.refreshToken) {
      tokenManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.expiresIn || 3600,
        response.data.refreshExpiresIn || 604800
      );
    }

    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    tokenManager.clearTokens();
    throw error;
  }
};

// パスワード変更機能
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const token = await tokenManager.getAccessToken();
    if (!token) {
      throw new Error('認証トークンがありません');
    }

    const response = await api.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });

    return response.data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

// メール認証関連
export const resendVerificationEmail = async (): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/auth/resend-verification');
    return response.data;
  } catch (error) {
    console.error('Resend verification email error:', error);
    throw error;
  }
};

export const verifyEmail = async (token: string): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/auth/verify-email', { token });
    return response.data;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

// 自分自身を管理者にする（初回セットアップ用）
export const promoteToAdmin = async (): Promise<User> => {
  try {
    const response = await api.post<{ user: User; message: string }>('/auth/promote-admin');
    console.log('Promote to admin response:', response.data);
    return response.data.user;
  } catch (error) {
    console.error('Promote to admin error:', error);
    throw error;
  }
};

// セッション情報の取得
export const getSessionInfo = () => {
  return tokenManager.getSessionInfo();
};

// デバッグ用
export const getAuthDebugInfo = () => {
  return tokenManager.getDebugInfo();
};
