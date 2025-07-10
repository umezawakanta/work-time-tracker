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

import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/useAuth';
import * as authApi from '../../services/api/authApi';
import { tokenManager } from '../../services/auth/TokenManager';

// Jest fake timersを使用
jest.useFakeTimers();

// コンソールログを抑制
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// モック設定
jest.mock('../../services/api/authApi');
jest.mock('../../services/auth/TokenManager');
jest.mock('@/utils/logger');
jest.mock('react-hot-toast');

// テスト用コンポーネント
const TestComponent: React.FC = () => {
  const authContext = useAuth();

  // テスト環境ではAuthProviderでラップされているので非null
  // @ts-ignore
  const { isAuthenticated, loading, user, fetchUser, refreshAuth, updateProfile } = authContext;

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="loading-status">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user-name">{user?.name || 'no-user'}</div>
      <button onClick={fetchUser} data-testid="fetch-user">
        Fetch User
      </button>
      <button onClick={refreshAuth} data-testid="refresh-auth">
        Refresh Auth
      </button>
      <button
        onClick={() => updateProfile({ name: 'Updated Name', email: 'updated@example.com' })}
        data-testid="update-profile"
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
  const mockUser = {
    id: 'test-user-id',
    _id: 'test-user-id',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    isAdmin: false,
    avatar: '',
  };

  beforeEach(() => {
    // すべてのモックをクリア
    jest.clearAllMocks();
    jest.clearAllTimers();

    // TokenManagerのモック設定
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(false);
    (tokenManager.getSessionInfo as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      expiresAt: null,
      refreshExpiresAt: null,
      timeUntilExpiry: 0,
      timeUntilRefreshExpiry: 0,
    });
    (tokenManager.getDebugInfo as jest.Mock).mockReturnValue({
      hasTokens: false,
      isValid: false,
    });
    (tokenManager.clearTokens as jest.Mock).mockImplementation(() => {});

    // APIのモック設定（即座に解決される）
    (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
    (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    (authApi.updateUserProfile as jest.Mock).mockResolvedValue({
      ...mockUser,
      name: 'Updated Name',
      email: 'updated@example.com',
    });

    // 環境変数をクリア
    delete process.env.VITE_USE_MOCK_DATA;
    delete process.env.VITE_API_CONNECTION_FAILED;
    delete process.env.VITE_SKIP_AUTH;

    // テスト環境に設定
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true,
      configurable: true,
    });

    // セッションストレージをクリア
    sessionStorage.clear();
    localStorage.clear();

    // Window プロパティをクリア
    delete window.__VITE_USE_MOCK_DATA__;
    delete window.__API_CONNECTION_FAILED__;
  });

  afterEach(() => {
    // タイマーを慎重にクリア
    act(() => {
      jest.clearAllTimers();
    });
  });

  describe('初期化', () => {
    it('should initialize with unauthenticated state', async () => {
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
      // トークンが有効な状態に設定（認証チェックが実行されるように）
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);

      // 開発環境のファストパスを無効化
      Object.defineProperty(window, 'location', {
        value: { ...window.location, hostname: 'production.example.com' },
        writable: true,
      });

      // テスト環境モードを無効化
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      // API呼び出しを遅延させる
      let resolveAuth: (value: boolean) => void;
      let resolveUser: (value: any) => void;

      const authPromise = new Promise<boolean>((resolve) => {
        resolveAuth = resolve;
      });
      const userPromise = new Promise<any>((resolve) => {
        resolveUser = resolve;
      });

      (authApi.checkAuth as jest.Mock).mockReturnValue(authPromise);
      (authApi.fetchUserData as jest.Mock).mockReturnValue(userPromise);

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

      // 環境を元に戻す
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'test',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'location', {
        value: { ...window.location, hostname: 'localhost' },
        writable: true,
      });
    }, 15000);
  });

  describe('認証フロー', () => {
    it('should restore authentication from valid token', async () => {
      // 有効なトークンが存在する状態をモック
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
      (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);

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

      expect(authApi.checkAuth).toHaveBeenCalled();
      expect(authApi.fetchUserData).toHaveBeenCalled();
    });

    it('should handle auth check failure', async () => {
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authApi.checkAuth as jest.Mock).mockResolvedValue(false);

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
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authApi.checkAuth as jest.Mock).mockRejectedValue(new Error('Network error'));

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
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
      (authApi.fetchUserData as jest.Mock).mockRejectedValue(new Error('User fetch failed'));

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
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
      (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);

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

      (tokenManager.getSessionInfo as jest.Mock).mockReturnValue(mockSessionInfo);

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      // セッション情報更新のタイマーを進める（30秒）
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });

      // セッション情報の更新が呼ばれることを確認
      await waitFor(() => {
        expect(tokenManager.getSessionInfo).toHaveBeenCalled();
      });
    });
  });

  describe('ユーザー操作', () => {
    it('should handle profile update successfully', async () => {
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
      (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);

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
        expect(authApi.updateUserProfile).toHaveBeenCalledWith({
          name: 'Updated Name',
          email: 'updated@example.com',
        });
      });
    });

    it('should handle profile update failure', async () => {
      // エラー出力を抑制
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
        (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
        (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
        (authApi.updateUserProfile as jest.Mock).mockRejectedValue(new Error('Update failed'));

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
          expect(authApi.updateUserProfile).toHaveBeenCalledWith({
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
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
      (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);

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
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
      (tokenManager.getAccessToken as jest.Mock).mockResolvedValue('mock-access-token');
      (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
      (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);

      // リフレッシュをトリガー
      await act(async () => {
        fireEvent.click(screen.getByTestId('refresh-auth'));
      });

      await waitFor(
        () => {
          expect(authApi.checkAuth).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('development mode', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
      // window.locationのモック
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          hostname: 'localhost',
        },
        writable: true,
      });
    });

    afterAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it('should enable fast auth mode in development', async () => {
      console.log('🐛 Starting development mode test...');

      // Mock tokenManager to return false consistently (no token)
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(false);
      (tokenManager.getSessionInfo as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        expiresAt: null,
        refreshExpiresAt: null,
        timeUntilExpiry: 0,
        timeUntilRefreshExpiry: 0,
      });
      (tokenManager.getDebugInfo as jest.Mock).mockReturnValue({});

      // Clear all API mocks to prevent unwanted calls
      jest.clearAllMocks();

      // Re-setup mocks after clearing
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(false);
      (tokenManager.getSessionInfo as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        expiresAt: null,
        refreshExpiresAt: null,
        timeUntilExpiry: 0,
        timeUntilRefreshExpiry: 0,
      });
      (tokenManager.getDebugInfo as jest.Mock).mockReturnValue({});

      // 開発環境モードを確実に設定
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process.env, 'MODE', {
        value: 'development',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process.env, 'DEV', {
        value: 'true',
        writable: true,
        configurable: true,
      });

      // Ensure window.location is localhost
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          hostname: 'localhost',
          href: 'http://localhost:3000',
        },
        writable: true,
      });

      // ログアウト状態をクリア（開発モードの条件）
      sessionStorage.clear();
      sessionStorage.removeItem('user-logged-out');
      localStorage.clear();

      // デバッグ情報を追加
      console.log('🐛 Test Environment Check:', {
        NODE_ENV: process.env.NODE_ENV,
        MODE: process.env.MODE,
        DEV: process.env.DEV,
        hostname: window.location.hostname,
        userLoggedOut: sessionStorage.getItem('user-logged-out'),
        tokenValid: tokenManager.isAuthenticated(),
      });

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      // より長い時間待つ（開発モードの初期化）
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      console.log('🐛 After initialization, checking state...');
      const authStatus = screen.getByTestId('auth-status').textContent;
      const userName = screen.getByTestId('user-name').textContent;
      const loadingStatus = screen.getByTestId('loading-status').textContent;

      console.log('🐛 Current State:', { authStatus, userName, loadingStatus });

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
          // In development mode with no token, it should create "Demo User (Dev)" not "Demo User (No Token)"
          // because the fast auth mode takes precedence
          expect(screen.getByTestId('user-name')).toHaveTextContent('Demo User (Dev)');
        },
        { timeout: 5000 }
      );

      // 開発環境ではAPI呼び出しをスキップ
      expect(authApi.checkAuth).not.toHaveBeenCalled();
    });
  });

  describe('activity monitoring', () => {
    it('should monitor user activity when authenticated', async () => {
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
      (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // ユーザーアクティビティをシミュレート
      await act(async () => {
        fireEvent.mouseDown(document);
        jest.advanceTimersByTime(100);
      });

      // タイマーが設定されていることを確認
      expect(jest.getTimerCount()).toBeGreaterThan(0);
    });
  });

  describe('session expiration handling', () => {
    it('should handle session expiration gracefully', async () => {
      (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
      (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);

      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // セッション期限切れを通知
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
