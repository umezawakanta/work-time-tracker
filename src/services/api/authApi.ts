import { api } from './apiConfig';
import { USE_MOCK_DATA } from './apiConfig';
import { tokenManager } from '@/services/auth/TokenManager';
import { User } from '@/types';
import { AxiosError } from 'axios';

// Extend Window interface for custom properties
declare global {
  interface Window {
    __VITE_USE_MOCK_DATA__?: string;
    __API_CONNECTION_FAILED__?: boolean;
  }
}

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

    console.log('Register response:', response.data);

    if (response.data.accessToken && response.data.refreshToken) {
      // TokenManagerを使用してトークンを管理
      tokenManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.expiresIn || 3600, // デフォルト1時間
        response.data.refreshExpiresIn || 604800 // デフォルト7日
      );

      // ログアウトフラグをクリア
      sessionStorage.removeItem('user-logged-out');
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
    console.log('🔑 Login attempt started');
    console.log('  - Email:', email);
    console.log('  - Password length:', password.length);
    console.log('  - Remember Me:', rememberMe);
    console.log('  - API Base URL:', api.defaults.baseURL);

    const requestData = {
      email,
      password,
      rememberMe,
    };

    console.log('🚀 Sending login request...');
    const response = await api.post('/auth/login', requestData);

    console.log('✅ Login response received');
    console.log('  - Status:', response.status);
    console.log('  - Response data keys:', Object.keys(response.data));
    console.log('  - Has accessToken:', !!response.data.accessToken);
    console.log('  - Has refreshToken:', !!response.data.refreshToken);
    console.log('  - Has user:', !!response.data.user);

    // Handle new format with accessToken and refreshToken
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
      } else {
        tokenManager.setRememberMe(false);
      }

      // ログアウトフラグをクリア
      sessionStorage.removeItem('user-logged-out');

      return response.data;
    }

    // Legacy format fallback (single token field)
    if (response.data.token) {
      const expiresIn = 3600; // 1 hour
      const refreshExpiresIn = rememberMe ? 2592000 : 604800;

      tokenManager.setTokens(
        response.data.token, // accessTokenとして使用
        response.data.token, // refreshTokenも同じ値を使用（一時的）
        expiresIn,
        refreshExpiresIn
      );

      if (rememberMe) {
        tokenManager.setRememberMe(true);
      } else {
        tokenManager.setRememberMe(false);
      }

      // ログアウトフラグをクリア
      sessionStorage.removeItem('user-logged-out');

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

    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('❌ Login error occurred');
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('  - Error type:', error?.constructor?.name);
    console.error('  - Error message:', (error as Error)?.message);

    if (error instanceof AxiosError) {
      console.error('  - HTTP Status:', error.response?.status);
      console.error('  - Response data:', error.response?.data);
      console.error('  - Request URL:', error.config?.url);
      console.error('  - Request baseURL:', error.config?.baseURL);
      console.error('  - Error code:', error.code);
    }

    throw error;
  }
};

export const logout = async (): Promise<void> => {
  // TokenManagerを使用してクリーンアップ
  tokenManager.clearTokens();

  // API経由でセッション情報を削除
  try {
    await api.delete('/user/session');
    // 必要に応じて他の情報も削除
    // await api.delete('/user/activity');
    // await api.delete('/user/profile-cache');
  } catch (error) {
    console.error('Failed to clear session info from DB:', error);
    // 必要ならユーザーに通知
  }

  // 開発環境での自動認証を無効化するフラグを設定
  sessionStorage.setItem('user-logged-out', 'true');

  console.log('🚪 Logout completed - auto auth disabled');
};

export const checkAuth = async (): Promise<boolean> => {
  try {
    // モックモードの場合は常に認証成功
    if (USE_MOCK_DATA || window.__VITE_USE_MOCK_DATA__ === 'true') {
      console.log('🎭 Mock mode: Auth check always returns true');
      return true;
    }

    // TokenManagerで認証状態を確認
    if (!tokenManager.isAuthenticated()) {
      console.log('🔒 No valid local token');
      return false;
    }

    // サーバーサイドで認証状態を確認
    const token = await tokenManager.getAccessToken();
    if (!token) {
      console.log('🔒 No access token available');
      return false;
    }

    console.log('🔄 Checking auth with server...');

    // 開発環境では短いタイムアウトでサーバーチェック
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒タイムアウト

    try {
      const response = await api.get('/auth/check', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log('✅ Server auth check response:', response.data);
      return response.data.isAuthenticated;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error: unknown) {
    const err = error as Error & { response?: { status?: number; data?: unknown }; code?: string };
    console.error('❌ Auth check error:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      code: err.code,
    });

    // 開発環境でのタイムアウトやネットワークエラーの場合は認証状態を維持
    const isDev =
      process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' && window.__VITE_USE_MOCK_DATA__ === 'true');

    if (
      err.name === 'AbortError' ||
      err.code === 'ECONNREFUSED' ||
      err.code === 'NETWORK_ERROR' ||
      !err.response
    ) {
      // 開発環境でもトークンがある場合は実際の認証状態を確認
      if (isDev && tokenManager.isAuthenticated()) {
        console.log('⚠️ Network error but token exists - maintaining auth state (dev mode)');
        return true; // トークンがある場合のみ認証状態を維持
      }
      console.log('⚠️ Network error - auth state depends on token existence');
      return false;
    }

    // サーバーが明示的に認証エラーを返した場合のみクリア
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.log('🔒 Server rejected auth - clearing tokens');
      tokenManager.clearTokens();
    }

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
    console.log('🔄 Fetching user data from server...');
    const response = await api.get<{ user: User }>('/auth/user');
    console.log('✅ User data retrieved:', response.data.user?.email);

    // 環境変数による管理者権限の確認
    const userData = response.data.user;

    // 安全な環境変数取得
    const getEnvVar = (key: string): string | undefined => {
      // Jest環境ではprocess.envを優先
      if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
      }

      // Vite環境でのimport.meta.env（安全にアクセス）
      try {
        if (typeof globalThis !== 'undefined' && (globalThis as any).import?.meta?.env) {
          return (globalThis as any).import.meta.env[key];
        }
      } catch (e) {
        // import.metaが利用できない場合は無視
      }

      return undefined;
    };

    const adminEmails = getEnvVar('VITE_ADMIN_EMAILS')?.split(',') || [];

    if (adminEmails.includes(userData.email)) {
      userData.isAdmin = true;
      console.log('[Auth] Admin privileges granted for:', userData.email);
    }

    return userData;
  } catch (error) {
    console.error('Fetch user data error:', error);

    // ネットワークエラーの場合はエラーをそのまま投げる
    if (
      error instanceof Error &&
      (error.message.includes('ECONNREFUSED') ||
        error.message.includes('NETWORK_ERROR') ||
        error.message.includes('timeout'))
    ) {
      console.log('🔧 Network error detected');
      console.log(
        '💡 Tip: サーバーが停止している場合は `npm run dev` でサーバーを起動してください'
      );
    }

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

// 例: lastActivityを保存
export const saveLastActivity = async (timestamp: number): Promise<void> => {
  try {
    await api.post('/user/activity', { lastActivity: timestamp });
  } catch (error) {
    console.error('Failed to save last activity:', error);
  }
};

// 例: sessionPersistentを保存
export const saveSessionPersistent = async (persistent: boolean): Promise<void> => {
  try {
    await api.post('/user/session', { persistent });
  } catch (error) {
    console.error('Failed to save session persistent flag:', error);
  }
};
