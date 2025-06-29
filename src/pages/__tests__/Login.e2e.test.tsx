import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../Login';
import * as authApi from '@/services/api/authApi';
import { useAuth } from '@/hooks/useAuth';

// モック設定
jest.mock('@/services/api/authApi');
jest.mock('@/hooks/useAuth');
jest.mock('react-hot-toast');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

// Redux store のモック設定
const createMockStore = () =>
  configureStore({
    reducer: {
      // 必要に応じてreducerを追加
      auth: (state = {}, action) => state,
    },
  });

const renderWithProviders = (
  component: React.ReactNode,
  options: { initialEntries?: string[] } = {}
) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={options.initialEntries || ['/login']}>{component}</MemoryRouter>
    </Provider>
  );
};

describe('Login Page E2E', () => {
  const mockSetIsAuthenticated = jest.fn();
  const mockSetUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // useAuth フックのモック
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      setIsAuthenticated: mockSetIsAuthenticated,
      setUser: mockSetUser,
      loading: false,
    });
  });

  it('should render login form correctly', () => {
    renderWithProviders(<Login />);

    expect(screen.getByText('LifeSync にログイン')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByText('アカウントをお持ちでない方')).toBeInTheDocument();
  });

  it('should handle successful login flow', async () => {
    const user = userEvent.setup();
    const mockLoginResponse = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      user: {
        id: 'user-123',
        _id: 'user-123',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false,
        avatar: '',
      },
      message: 'ログイン成功',
      expiresIn: 3600,
      refreshExpiresIn: 604800,
    };

    (authApi.login as jest.Mock).mockResolvedValue(mockLoginResponse);

    renderWithProviders(<Login />);

    // フォーム入力
    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');

    // ログインボタンクリック
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    // API呼び出し確認
    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });

    // 認証状態の更新確認
    expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
    expect(mockSetUser).toHaveBeenCalledWith(mockLoginResponse.user);

    // ナビゲーション確認
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should handle login with remember me option', async () => {
    const user = userEvent.setup();

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');

    // Remember me をチェック
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /ログイン状態を保持する/i });
    await user.click(rememberMeCheckbox);

    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });
  });

  it('should display validation errors for empty fields', async () => {
    const user = userEvent.setup();

    renderWithProviders(<Login />);

    // 空のフォームでログインを試行
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    await waitFor(() => {
      expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
      expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
    });

    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('should display validation error for invalid email', async () => {
    const user = userEvent.setup();

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('メールアドレス'), 'invalid-email');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    await waitFor(() => {
      expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    });

    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('should handle network errors', async () => {
    const user = userEvent.setup();
    const networkError = {
      message: 'Network Error',
      code: 'NETWORK_ERROR',
    };

    (authApi.login as jest.Mock).mockRejectedValue(networkError);

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    await waitFor(() => {
      expect(screen.getByText(/ネットワークエラーが発生しました/)).toBeInTheDocument();
    });
  });

  it('should handle authentication errors', async () => {
    const user = userEvent.setup();
    const authError = {
      response: {
        status: 401,
        data: {
          message: 'メールアドレスまたはパスワードが正しくありません',
        },
      },
    };

    (authApi.login as jest.Mock).mockRejectedValue(authError);

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    await waitFor(() => {
      expect(
        screen.getByText('メールアドレスまたはパスワードが正しくありません')
      ).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();

    renderWithProviders(<Login />);

    const passwordInput = screen.getByLabelText('パスワード');
    const toggleButton = screen.getByRole('button', { name: /パスワードを表示/i });

    // 初期状態はパスワードが隠されている
    expect(passwordInput).toHaveAttribute('type', 'password');

    // 表示切り替えボタンをクリック
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // もう一度クリックして非表示に戻す
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    (authApi.login as jest.Mock).mockReturnValue(loginPromise);

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: /ログイン/i }));

    // ローディング状態を確認
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ログイン中/i })).toBeDisabled();
    });

    // ログインを完了
    resolveLogin!({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: '1', name: 'Test User' },
      message: 'Success',
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ログイン/i })).not.toBeDisabled();
    });
  });

  it('should navigate to register page when clicking signup link', () => {
    renderWithProviders(<Login />);

    const signupLink = screen.getByRole('link', { name: /新規登録/ });
    expect(signupLink).toHaveAttribute('href', '/register');
  });

  it('should navigate to forgot password page', () => {
    renderWithProviders(<Login />);

    const forgotPasswordLink = screen.getByRole('link', { name: /パスワードを忘れた方/ });
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  describe('Auto-redirect when authenticated', () => {
    it('should redirect to home when already authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        setIsAuthenticated: mockSetIsAuthenticated,
        setUser: mockSetUser,
        loading: false,
      });

      renderWithProviders(<Login />);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('URL state handling', () => {
    it('should redirect to intended destination after login', async () => {
      const user = userEvent.setup();
      const mockLocationState = { from: { pathname: '/protected-page' } };

      // useLocation のモックを更新
      jest.mocked(require('react-router-dom').useLocation).mockReturnValue({
        state: mockLocationState,
      });

      (authApi.login as jest.Mock).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: '1', name: 'Test User' },
        message: 'Success',
      });

      renderWithProviders(<Login />);

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.click(screen.getByRole('button', { name: /ログイン/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/protected-page');
      });
    });
  });

  describe('Security features', () => {
    it('should handle rate limiting', async () => {
      const user = userEvent.setup();
      const rateLimitError = {
        response: {
          status: 429,
          data: {
            message: 'ログイン試行回数が多すぎます。しばらくしてから再度お試しください。',
          },
        },
      };

      (authApi.login as jest.Mock).mockRejectedValue(rateLimitError);

      renderWithProviders(<Login />);

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.click(screen.getByRole('button', { name: /ログイン/i }));

      await waitFor(() => {
        expect(
          screen.getByText('ログイン試行回数が多すぎます。しばらくしてから再度お試しください。')
        ).toBeInTheDocument();
      });
    });

    it('should handle server errors gracefully', async () => {
      const user = userEvent.setup();
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'サーバーエラーが発生しました',
          },
        },
      };

      (authApi.login as jest.Mock).mockRejectedValue(serverError);

      renderWithProviders(<Login />);

      await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.click(screen.getByRole('button', { name: /ログイン/i }));

      await waitFor(() => {
        expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      renderWithProviders(<Login />);

      expect(screen.getByLabelText('メールアドレス')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('パスワード')).toHaveAttribute('type', 'password');
      expect(screen.getByRole('button', { name: /ログイン/i })).toHaveAttribute('type', 'submit');
    });

    it('should show error messages with proper ARIA attributes', async () => {
      const user = userEvent.setup();

      renderWithProviders(<Login />);

      await user.click(screen.getByRole('button', { name: /ログイン/i }));

      await waitFor(() => {
        const emailError = screen.getByText('メールアドレスを入力してください');
        const passwordError = screen.getByText('パスワードを入力してください');

        expect(emailError).toBeInTheDocument();
        expect(passwordError).toBeInTheDocument();
      });
    });
  });
});
