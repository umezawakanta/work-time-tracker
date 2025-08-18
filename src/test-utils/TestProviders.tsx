/**
 * 🧪 テスト用プロバイダー
 * テスト環境で使用する統一プロバイダーコンポーネント
 */

import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthContext, { AuthProvider } from '../context/AuthContext';
import { store } from '../store';

interface TestProvidersProps {
  children: React.ReactNode;
  initialEntries?: string[];
}

/**
 * 全てのプロバイダーを含むテスト用ラッパーコンポーネント
 */
export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  initialEntries = ['/'],
}) => {
  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </MemoryRouter>
    </Provider>
  );
};

/**
 * AuthProviderのみのテスト用ラッパー（軽量版）
 */
export const AuthTestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

/**
 * Redux + Auth の組み合わせテスト用ラッパー
 */
export const ReduxAuthTestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
};

/**
 * モックユーザー付きのAuthProviderラッパー
 */
export const MockAuthProvider: React.FC<{
  children: React.ReactNode;
  isAuthenticated?: boolean;
  user?: any;
  isAdmin?: boolean;
}> = ({ children, isAuthenticated = true, user = null, isAdmin = false }) => {
  const mockUser = user || {
    id: 'test-user-id',
    _id: 'test-user-mongo-id',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    isAdmin,
    avatar: '',
  };

  const mockContextValue = {
    isAuthenticated,
    setIsAuthenticated: jest.fn(),
    loading: false,
    user: isAuthenticated ? mockUser : null,
    setUser: jest.fn(),
    fetchUser: async (): Promise<void> => {},
    updateProfile: async (_data: { name: string; email: string }): Promise<void> => {},
    sessionExpired: false,
    refreshAuth: async (): Promise<void> => {},
    sessionInfo: {
      isAuthenticated,
      expiresAt: new Date(Date.now() + 3600000), // 1時間後
      refreshExpiresAt: new Date(Date.now() + 7200000), // 2時間後
      timeUntilExpiry: 3600,
      timeUntilRefreshExpiry: 7200,
    },
  };

  return <AuthContext.Provider value={mockContextValue}>{children}</AuthContext.Provider>;
};
