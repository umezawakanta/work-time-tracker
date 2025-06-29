import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '@/hooks/useAuth';
import * as authApi from '@/services/api/authApi';
import { tokenManager } from '@/services/auth/TokenManager';

// コンソールログを抑制
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// モック設定
jest.mock('@/services/api/authApi');
jest.mock('@/services/auth/TokenManager');
jest.mock('@/utils/logger');
jest.mock('react-hot-toast');

// setTimeout のモック
const mockSetTimeout = jest.fn((callback, delay) => {
  return setTimeout(callback, delay);
});

const mockClearTimeout = jest.fn();

beforeAll(() => {
  global.setTimeout = mockSetTimeout as any;
  global.clearTimeout = mockClearTimeout as any;
});

// テスト用コンポーネント
const TestComponent: React.FC = () => {
  const { isAuthenticated, loading, user, fetchUser, refreshAuth, updateProfile } = useAuth();

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
    jest.clearAllMocks();
    mockSetTimeout.mockClear();
    mockClearTimeout.mockClear();

    // TokenManagerのモック設定
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(false);
    (tokenManager.getSessionInfo as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      expiresAt: null,
      refreshExpiresAt: null,
      timeUntilExpiry: 0,
      timeUntilRefreshExpiry: 0,
    });

    // APIのモック設定
    (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
    (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    (authApi.updateUserProfile as jest.Mock).mockResolvedValue({
      ...mockUser,
      name: 'Updated Name',
      email: 'updated@example.com',
    });

    // 環境変数をクリア
    delete window.__VITE_USE_MOCK_DATA__;
    delete window.__API_CONNECTION_FAILED__;

    // 本番環境に設定（開発モードの自動認証を無効化）
    process.env.NODE_ENV = 'test';
  });

  it('should initialize with unauthenticated state', async () => {
    await act(async () => {
      renderWithAuthProvider(<TestComponent />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
    });
  });

  it('should set loading state during initialization', async () => {
    // ローディング状態をキャプチャするため、API解決を遅延
    let resolveAuth: (value: boolean) => void;
    const authPromise = new Promise<boolean>((resolve) => {
      resolveAuth = resolve;
    });
    (authApi.checkAuth as jest.Mock).mockReturnValue(authPromise);

    await act(async () => {
      renderWithAuthProvider(<TestComponent />);
    });

    // 初期状態ではローディング中
    expect(screen.getByTestId('loading-status')).toHaveTextContent('loading');

    // API解決を実行
    await act(async () => {
      resolveAuth!(true);
      await authPromise;
    });

    // ローディング完了を待つ
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
    });
  });

  it('should restore authentication from valid token', async () => {
    // 有効なトークンが存在する状態をモック
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
    (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);

    await act(async () => {
      renderWithAuthProvider(<TestComponent />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });

    expect(authApi.checkAuth).toHaveBeenCalled();
    expect(authApi.fetchUserData).toHaveBeenCalled();
  });

  it('should handle auth check failure', async () => {
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authApi.checkAuth as jest.Mock).mockResolvedValue(false);

    await act(async () => {
      renderWithAuthProvider(<TestComponent />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
    });
  });

  it('should handle network errors gracefully', async () => {
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authApi.checkAuth as jest.Mock).mockRejectedValue(new Error('Network error'));

    await act(async () => {
      renderWithAuthProvider(<TestComponent />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
    });

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

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
    });
  });

  it('should handle token expiration events', async () => {
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
    (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);

    await act(async () => {
      renderWithAuthProvider(<TestComponent />);
    });

    // 初期認証状態を確認
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // トークン期限切れイベントを発火
    await act(async () => {
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
    });
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

    // セッション情報の更新が呼ばれることを確認
    await waitFor(() => {
      expect(tokenManager.getSessionInfo).toHaveBeenCalled();
    });
  });

  it('should handle profile update successfully', async () => {
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
    (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);

    await act(async () => {
      renderWithAuthProvider(<TestComponent />);
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
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
    (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);
    (authApi.updateUserProfile as jest.Mock).mockRejectedValue(new Error('Update failed'));

    await act(async () => {
      renderWithAuthProvider(<TestComponent />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('update-profile'));
    });

    await waitFor(() => {
      expect(authApi.updateUserProfile).toHaveBeenCalled();
    });

    // エラーハンドリングが適切に行われることを確認
    // （実際の実装に応じてアサーションを調整）
  });

  it('should handle refresh auth successfully', async () => {
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authApi.checkAuth as jest.Mock).mockResolvedValue(true);
    (authApi.fetchUserData as jest.Mock).mockResolvedValue(mockUser);

    await act(async () => {
      renderWithAuthProvider(<TestComponent />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // 初期化でのAPI呼び出し回数をリセット
    jest.clearAllMocks();

    // リフレッシュをトリガー
    await act(async () => {
      fireEvent.click(screen.getByTestId('refresh-auth'));
    });

    await waitFor(() => {
      expect(authApi.checkAuth).toHaveBeenCalledTimes(1); // リフレッシュでの呼び出し
    });
  });

  describe('development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalHostname = window.location.hostname;

    beforeAll(() => {
      process.env.NODE_ENV = 'development';
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          hostname: 'localhost',
        },
        writable: true,
      });
    });

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          hostname: originalHostname,
        },
        writable: true,
      });
    });

    it('should enable fast auth mode in development', async () => {
      await act(async () => {
        renderWithAuthProvider(<TestComponent />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Demo User (Dev)');
      });

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

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // ユーザーアクティビティをシミュレート
      await act(async () => {
        fireEvent.mouseDown(document);
      });

      // アクティビティタイマーが設定されることを確認
      expect(mockSetTimeout).toHaveBeenCalled();
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

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // セッション期限切れを通知
      await act(async () => {
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });
  });
});
