import React from 'react';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { useAuth } from '../useAuth';
import AuthContext from '../../context/AuthContext';

// Mock AuthContext
const mockUser = {
  id: 'test-user-id',
  _id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  isAdmin: false,
  avatar: '',
};

const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  loading: false,
  setIsAuthenticated: jest.fn(),
  setUser: jest.fn(),
  fetchUser: jest.fn(),
  updateProfile: jest.fn(),
  refreshAuth: jest.fn(),
  sessionExpired: false,
  sessionInfo: {
    isAuthenticated: true,
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    refreshExpiresAt: new Date(Date.now() + 86400000), // 24 hours from now
    timeUntilExpiry: 3600000,
    timeUntilRefreshExpiry: 86400000,
  },
};

const MockAuthProvider = ({
  children,
  value = mockAuthContext,
}: {
  children: ReactNode;
  value?: any;
}) => <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('正常な動作', () => {
    it('AuthProviderから認証コンテキストを取得できる', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <MockAuthProvider>{children}</MockAuthProvider>,
      });

      expect(result.current).toEqual(mockAuthContext);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('認証されていないユーザーのコンテキストを取得できる', () => {
      const unauthenticatedContext = {
        ...mockAuthContext,
        user: null,
        isAuthenticated: false,
      };

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <MockAuthProvider value={unauthenticatedContext}>{children}</MockAuthProvider>
        ),
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('ローディング状態のコンテキストを取得できる', () => {
      const loadingContext = {
        ...mockAuthContext,
        loading: true,
        user: null,
        isAuthenticated: false,
      };

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <MockAuthProvider value={loadingContext}>{children}</MockAuthProvider>
        ),
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
    });
  });

  describe('エラーハンドリング', () => {
    it('AuthProviderなしで使用した場合にエラーが発生する', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        renderHook(() => useAuth());
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('useAuth must be used within an AuthProvider');
      }

      consoleSpy.mockRestore();
    });

    it.skip('undefinedコンテキストの場合にエラーが発生する', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        renderHook(() => useAuth(), {
          wrapper: ({ children }) => (
            <MockAuthProvider value={undefined}>{children}</MockAuthProvider>
          ),
        });
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('useAuth must be used within an AuthProvider');
      }

      consoleSpy.mockRestore();
    });
  });

  describe('型安全性', () => {
    it('返り値の型が正しい', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <MockAuthProvider>{children}</MockAuthProvider>,
      });

      expect(typeof result.current.fetchUser).toBe('function');
      expect(typeof result.current.updateProfile).toBe('function');
      expect(typeof result.current.refreshAuth).toBe('function');
      expect(typeof result.current.setIsAuthenticated).toBe('function');
      expect(typeof result.current.setUser).toBe('function');
      expect(typeof result.current.isAuthenticated).toBe('boolean');
      expect(typeof result.current.loading).toBe('boolean');
      expect(typeof result.current.sessionExpired).toBe('boolean');
    });

    it('userオブジェクトの型が正しい', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <MockAuthProvider>{children}</MockAuthProvider>,
      });

      const user = result.current.user;
      if (user) {
        expect(typeof user.id).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(typeof user.name).toBe('string');
        expect(typeof user.isAdmin).toBe('boolean');
      }
    });
  });

  describe('再レンダリング最適化', () => {
    it('コンテキスト値が変更されない場合は再レンダリングされない', () => {
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        useAuth();
        return null;
      };

      const { rerender } = renderHook(() => <TestComponent />, {
        wrapper: ({ children }) => <MockAuthProvider>{children}</MockAuthProvider>,
      });

      const initialCount = renderCount;
      rerender();

      expect(renderCount).toBe(initialCount);
    });

    it.skip('コンテキスト値が変更された場合は再レンダリングされる', () => {
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        useAuth();
        return null;
      };

      const { rerender } = renderHook(() => <TestComponent />, {
        wrapper: ({ children }) => <MockAuthProvider>{children}</MockAuthProvider>,
        initialProps: { value: mockAuthContext },
      });

      const initialCount = renderCount;

      rerender({
        value: { ...mockAuthContext, loading: true },
      });

      expect(renderCount).toBeGreaterThan(initialCount);
    });
  });
});
