/**
 * AuthContext統合テスト（React特有の問題を修正）
 *
 * 修正した問題：
 * - setTimeout無限ループ
 * - タイムアウト問題
 * - 非同期状態管理
 * - React lifecycle issues
 * - Jest fake timers無限ループ
 */

// Mock the TokenManager first
const mockTokenManager = {
  isAuthenticated: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
  getSessionInfo: jest.fn(),
  getDebugInfo: jest.fn(),
  setRememberMe: jest.fn(),
};

// Mock dependencies first
jest.mock('@/services/api/authApi');
jest.mock('@/services/auth/TokenManager', () => ({
  TokenManager: {
    getInstance: jest.fn(() => mockTokenManager),
  },
  tokenManager: mockTokenManager,
}));
jest.mock('../../services/auth/TokenManager', () => ({
  TokenManager: {
    getInstance: jest.fn(() => mockTokenManager),
  },
  tokenManager: mockTokenManager,
}));
jest.mock('@/utils/logger');

// Mock React Hot Toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { TokenManager } from '../../services/auth/TokenManager';
import * as authApi from '../../services/api/authApi';
import { User } from '../../types';

// Mock authApi
const mockAuthApi = {
  checkAuth: jest.fn(),
  fetchUserData: jest.fn(),
  updateUserProfile: jest.fn(),
};

Object.assign(authApi, mockAuthApi);

// Mock user data
const mockUser: User = {
  id: 'test-user-id',
  _id: 'test-user-id',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  isAdmin: false,
  avatar: '',
};

const TestComponent: React.FC = () => {
  const {
    isAuthenticated,
    loading,
    user,
    fetchUser,
    updateProfile,
    refreshAuth,
    sessionExpired,
    sessionInfo,
  } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="loading-status">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user-name">{user?.name || 'no-user'}</div>
      <div data-testid="session-expired">{sessionExpired ? 'expired' : 'not-expired'}</div>
      <div data-testid="session-info">{JSON.stringify(sessionInfo)}</div>
      <button data-testid="fetch-user" onClick={fetchUser}>
        Fetch User
      </button>
      <button data-testid="refresh-auth" onClick={refreshAuth}>
        Refresh Auth
      </button>
      <button
        data-testid="update-profile"
        onClick={() => updateProfile({ name: 'Updated Name', email: 'updated@example.com' })}
      >
        Update Profile
      </button>
    </div>
  );
};

const renderWithAuthProvider = (component: React.ReactNode) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('AuthContext', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalWindow: Window & typeof globalThis;

  beforeAll(() => {
    originalEnv = process.env;
    originalWindow = global.window;

    // Use fake timers
    jest.useFakeTimers();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.window = originalWindow;
    jest.useRealTimers();
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset environment to test mode
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', configurable: true });
    Object.defineProperty(process.env, 'DEV', { value: 'false', configurable: true });
    Object.defineProperty(process.env, 'MODE', { value: 'test', configurable: true });
    Object.defineProperty(process.env, 'VITE_USE_MOCK_DATA', {
      value: 'false',
      configurable: true,
    });

    // Set up test environment window
    Object.defineProperty(global, 'window', {
      value: {
        ...originalWindow,
        location: {
          hostname: 'test.example.com',
          href: 'https://test.example.com',
          protocol: 'https:',
          pathname: '/',
          search: '',
          hash: '',
        },
        __VITE_USE_MOCK_DATA__: undefined,
        __API_CONNECTION_FAILED__: undefined,
        dispatchEvent: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    // Clear storage
    sessionStorage.clear();
    localStorage.clear();

    // Remove any logout flags
    sessionStorage.removeItem('user-logged-out');
    sessionStorage.removeItem('auth-init-shown');

    // Set up default mock returns
    mockTokenManager.isAuthenticated.mockReturnValue(false);
    mockTokenManager.getAccessToken.mockResolvedValue(null);
    mockTokenManager.getRefreshToken.mockReturnValue(null);
    mockTokenManager.setTokens.mockResolvedValue(undefined);
    mockTokenManager.clearTokens.mockResolvedValue(undefined);
    mockTokenManager.getSessionInfo.mockReturnValue({
      isAuthenticated: false,
      expiresAt: null,
      refreshExpiresAt: null,
      timeUntilExpiry: 0,
      timeUntilRefreshExpiry: 0,
    });
    mockTokenManager.getDebugInfo.mockReturnValue({
      hasTokens: false,
      isValid: false,
    });

    // Add console log to verify mocks are working
    console.log('🧪 Mock setup verification:', {
      isAuthenticated: mockTokenManager.isAuthenticated(),
      sessionInfo: mockTokenManager.getSessionInfo(),
    });

    // Set up API mocks
    mockAuthApi.checkAuth.mockResolvedValue(false);
    mockAuthApi.fetchUserData.mockResolvedValue(mockUser);
    mockAuthApi.updateUserProfile.mockResolvedValue(mockUser);

    // Clear timers
    jest.clearAllTimers();
  });

  describe('初期化', () => {
    it('should initialize with unauthenticated state', async () => {
      // Ensure test environment is properly set
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', configurable: true });
      Object.defineProperty(process.env, 'DEV', { value: 'false', configurable: true });
      Object.defineProperty(process.env, 'MODE', { value: 'test', configurable: true });

      // 確実にトークンなしの状態に設定
      mockTokenManager.isAuthenticated.mockReturnValue(false);
      mockTokenManager.getAccessToken.mockResolvedValue(null);
      mockAuthApi.checkAuth.mockResolvedValue(false);

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      // 短時間だけタイマーを進める（setTimeoutを処理）
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
          expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
        },
        { timeout: 3000 }
      );
    });

    it('should set loading state initially', async () => {
      // Ensure test environment
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', configurable: true });
      Object.defineProperty(process.env, 'DEV', { value: 'false', configurable: true });
      Object.defineProperty(process.env, 'MODE', { value: 'test', configurable: true });

      // Set up for production-like behavior to test loading
      Object.defineProperty(global, 'window', {
        value: {
          ...global.window,
          location: {
            hostname: 'production.example.com',
            href: 'https://production.example.com',
            protocol: 'https:',
            pathname: '/',
            search: '',
            hash: '',
          },
        },
        writable: true,
        configurable: true,
      });

      // トークンが有効な状態に設定（認証チェックが実行されるように）
      mockTokenManager.isAuthenticated.mockReturnValue(true);

      // API呼び出しを遅延させる
      let resolveAuth: (value: boolean) => void;
      let resolveUser: (value: any) => void;

      const authPromise = new Promise<boolean>((resolve) => {
        resolveAuth = resolve;
      });
      const userPromise = new Promise<any>((resolve) => {
        resolveUser = resolve;
      });

      mockAuthApi.checkAuth.mockReturnValue(authPromise);
      mockAuthApi.fetchUserData.mockReturnValue(userPromise);

      // コンポーネントをレンダリング（遅延なし）
      renderWithAuthProvider(<TestComponent />);

      // 初期ローディング状態を確認（レンダリング直後）
      expect(screen.getByTestId('loading-status')).toHaveTextContent('loading');

      // API解決（Promise.resolve()でマイクロタスクキューに追加）
      await act(async () => {
        resolveAuth!(true);
        await Promise.resolve(); // マイクロタスク処理
      });

      await act(async () => {
        resolveUser!(mockUser);
        await Promise.resolve(); // マイクロタスク処理
      });

      // ローディング完了を確認
      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 }
      );
    }, 15000);
  });

  describe('認証フロー', () => {
    it('should restore authentication from valid token', async () => {
      // 有効なトークンが存在する状態をモック
      mockTokenManager.isAuthenticated.mockReturnValue(true);
      mockTokenManager.getAccessToken.mockResolvedValue('valid-token');
      mockAuthApi.checkAuth.mockResolvedValue(true);
      mockAuthApi.fetchUserData.mockResolvedValue(mockUser);

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      // 短時間だけタイマーを進める
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
          expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
        },
        { timeout: 3000 }
      );

      expect(mockAuthApi.checkAuth).toHaveBeenCalled();
      expect(mockAuthApi.fetchUserData).toHaveBeenCalled();
    });

    it('should handle auth check failure', async () => {
      // ローカルトークンは有効だがサーバー認証に失敗する場合
      mockTokenManager.isAuthenticated.mockReturnValue(true);
      mockTokenManager.getAccessToken.mockResolvedValue('valid-token');
      mockAuthApi.checkAuth.mockResolvedValue(false);

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
          expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
        },
        { timeout: 3000 }
      );
    });

    it('should handle network errors gracefully', async () => {
      // ローカルトークンが有効でネットワークエラーが発生する場合
      mockTokenManager.isAuthenticated.mockReturnValue(true);
      mockTokenManager.getAccessToken.mockResolvedValue('valid-token');
      mockAuthApi.checkAuth.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
        },
        { timeout: 3000 }
      );

      // ネットワークエラーでもローカルトークンが有効なら認証状態を維持
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    it('should handle user fetch errors', async () => {
      // 認証は成功するがユーザー情報取得に失敗する場合
      mockTokenManager.isAuthenticated.mockReturnValue(true);
      mockTokenManager.getAccessToken.mockResolvedValue('valid-token');
      mockAuthApi.checkAuth.mockResolvedValue(true);
      mockAuthApi.fetchUserData.mockRejectedValue(new Error('User fetch failed'));

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
          expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
        },
        { timeout: 3000 }
      );
    });
  });

  describe('イベント処理', () => {
    it('should handle token expiration events', async () => {
      mockTokenManager.isAuthenticated.mockReturnValue(true);
      mockAuthApi.checkAuth.mockResolvedValue(true);
      mockAuthApi.fetchUserData.mockResolvedValue(mockUser);

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // 初期認証状態を確認
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // トークン期限切れイベントを発火
      await act(async () => {
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
          expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
        },
        { timeout: 3000 }
      );
    });

    it('should update session info periodically', async () => {
      const mockSessionInfo = {
        isAuthenticated: true,
        expiresAt: new Date(Date.now() + 3600000),
        refreshExpiresAt: new Date(Date.now() + 604800000),
        timeUntilExpiry: 3600,
        timeUntilRefreshExpiry: 604800,
      };

      mockTokenManager.getSessionInfo.mockReturnValue(mockSessionInfo);

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      // セッション情報更新のタイマーを進める（30秒）
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });

      // セッション情報の更新が呼ばれることを確認
      await waitFor(() => {
        expect(mockTokenManager.getSessionInfo).toHaveBeenCalled();
      });
    });
  });

  describe('ユーザー操作', () => {
    it('should handle profile update successfully', async () => {
      mockTokenManager.isAuthenticated.mockReturnValue(true);
      mockAuthApi.checkAuth.mockResolvedValue(true);
      mockAuthApi.fetchUserData.mockResolvedValue(mockUser);

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // 認証状態になるまで待つ
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // プロフィール更新をトリガー
      await act(async () => {
        fireEvent.click(screen.getByTestId('update-profile'));
      });

      await waitFor(() => {
        expect(mockAuthApi.updateUserProfile).toHaveBeenCalledWith({
          name: 'Updated Name',
          email: 'updated@example.com',
        });
      });
    });

    it('should handle profile update failure', async () => {
      // エラー出力を抑制
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        mockTokenManager.isAuthenticated.mockReturnValue(true);
        mockAuthApi.checkAuth.mockResolvedValue(true);
        mockAuthApi.fetchUserData.mockResolvedValue(mockUser);
        mockAuthApi.updateUserProfile.mockRejectedValue(new Error('Update failed'));

        await act(async () => {
          renderWithAuthProvider(<TestComponent />);
        });

        await act(async () => {
          jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        });

        // プロフィール更新をトリガー（エラーが発生することを期待）
        await act(async () => {
          fireEvent.click(screen.getByTestId('update-profile'));
        });

        // API呼び出しがされることを確認
        await waitFor(() => {
          expect(mockAuthApi.updateUserProfile).toHaveBeenCalledWith({
            name: 'Updated Name',
            email: 'updated@example.com',
          });
        });

        // エラー後も認証状態は維持される
        await waitFor(() => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        });
      } finally {
        // スパイを復元
        errorSpy.mockRestore();
      }
    });

    it('should handle refresh auth successfully', async () => {
      mockTokenManager.isAuthenticated.mockReturnValue(true);
      mockAuthApi.checkAuth.mockResolvedValue(true);
      mockAuthApi.fetchUserData.mockResolvedValue(mockUser);

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // 初期化でのAPI呼び出し回数をリセット
      jest.clearAllMocks();

      // モックを再設定（clearAllMocks後に必要）
      mockTokenManager.isAuthenticated.mockReturnValue(true);
      mockTokenManager.getAccessToken.mockResolvedValue('mock-access-token');
      mockAuthApi.checkAuth.mockResolvedValue(true);
      mockAuthApi.fetchUserData.mockResolvedValue(mockUser);

      // リフレッシュをトリガー
      await act(async () => {
        fireEvent.click(screen.getByTestId('refresh-auth'));
      });

      await waitFor(
        () => {
          expect(mockAuthApi.checkAuth).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('development mode', () => {
    beforeEach(() => {
      // Clear previous test state and set development environment specifically for this test
      jest.clearAllMocks();
      jest.clearAllTimers();

      // Clear storage
      sessionStorage.clear();
      localStorage.clear();

      // Set development environment
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
      Object.defineProperty(process.env, 'DEV', { value: 'true', configurable: true });
      Object.defineProperty(process.env, 'MODE', { value: 'development', configurable: true });

      // Set localhost hostname
      Object.defineProperty(global, 'window', {
        value: {
          ...global.window,
          location: {
            hostname: 'localhost',
            href: 'http://localhost:3000',
            protocol: 'http:',
            pathname: '/',
            search: '',
            hash: '',
          },
        },
        writable: true,
        configurable: true,
      });

      // Token manager should return false (no valid token)
      mockTokenManager.isAuthenticated.mockReturnValue(false);
      mockTokenManager.getSessionInfo.mockReturnValue({
        isAuthenticated: false,
        expiresAt: null,
        refreshExpiresAt: null,
        timeUntilExpiry: 0,
        timeUntilRefreshExpiry: 0,
      });
      mockTokenManager.getDebugInfo.mockReturnValue({
        hasTokens: false,
        isValid: false,
      });

      // API should return false (not authenticated)
      mockAuthApi.checkAuth.mockResolvedValue(false);
      mockAuthApi.fetchUserData.mockResolvedValue(mockUser);
    });

    afterEach(() => {
      // Reset environment back to test mode
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', configurable: true });
      Object.defineProperty(process.env, 'DEV', { value: 'false', configurable: true });
      Object.defineProperty(process.env, 'MODE', { value: 'test', configurable: true });

      Object.defineProperty(global, 'window', {
        value: {
          ...global.window,
          location: {
            hostname: 'test.example.com',
            href: 'https://test.example.com',
            protocol: 'https:',
            pathname: '/',
            search: '',
            hash: '',
          },
        },
        writable: true,
        configurable: true,
      });
    });

    it('should enable fast auth mode in development', async () => {
      // ログアウト状態をクリア（開発モードの条件）
      sessionStorage.clear();
      sessionStorage.removeItem('user-logged-out');
      localStorage.clear();

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      // より長い時間待つ（開発モードの初期化）
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
          // In development mode with localhost and no logout flag, should get fast auth
          // which creates "Demo User (Dev)", not "Demo User (No Token)"
          expect(screen.getByTestId('user-name')).toHaveTextContent('Demo User (Dev)');
        },
        { timeout: 5000 }
      );

      // 開発環境ではAPI呼び出しをスキップ
      expect(mockAuthApi.checkAuth).not.toHaveBeenCalled();
    });
  });

  describe('session expiration handling', () => {
    it('should handle session expiration gracefully', async () => {
      mockTokenManager.isAuthenticated.mockReturnValue(true);
      mockAuthApi.checkAuth.mockResolvedValue(true);
      mockAuthApi.fetchUserData.mockResolvedValue(mockUser);

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // セッション期限切れを発火
      await act(async () => {
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        },
        { timeout: 3000 }
      );
    });
  });
});
