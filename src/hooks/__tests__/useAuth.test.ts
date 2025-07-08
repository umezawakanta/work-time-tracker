import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { useAuth } from '../useAuth';
import AuthContext from '@/context/AuthContext';

// Mock AuthContext
const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  name: 'Test User',
  username: 'testuser'
};

const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  resetPassword: jest.fn(),
  updateProfile: jest.fn(),
  checkAuthStatus: jest.fn(),
  refreshToken: jest.fn()
};

const MockAuthProvider = ({ children, value = mockAuthContext }: { children: ReactNode; value?: any }) => (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('正常な動作', () => {
    it('AuthProviderから認証コンテキストを取得できる', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <MockAuthProvider>{children}</MockAuthProvider>
      });

      expect(result.current).toEqual(mockAuthContext);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('認証されていないユーザーのコンテキストを取得できる', () => {
      const unauthenticatedContext = {
        ...mockAuthContext,
        user: null,
        isAuthenticated: false
      };

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <MockAuthProvider value={unauthenticatedContext}>{children}</MockAuthProvider>
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('ローディング状態のコンテキストを取得できる', () => {
      const loadingContext = {
        ...mockAuthContext,
        isLoading: true,
        user: null,
        isAuthenticated: false
      };

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <MockAuthProvider value={loadingContext}>{children}</MockAuthProvider>
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
    });
  });

  describe('エラーハンドリング', () => {
    it('AuthProviderなしで使用した場合にエラーが発生する', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('undefinedコンテキストの場合にエラーが発生する', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth(), {
          wrapper: ({ children }) => <MockAuthProvider value={undefined}>{children}</MockAuthProvider>
        });
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('型安全性', () => {
    it('返り値の型が正しい', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <MockAuthProvider>{children}</MockAuthProvider>
      });

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.resetPassword).toBe('function');
      expect(typeof result.current.updateProfile).toBe('function');
      expect(typeof result.current.checkAuthStatus).toBe('function');
      expect(typeof result.current.refreshToken).toBe('function');
      expect(typeof result.current.isAuthenticated).toBe('boolean');
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('userオブジェクトの型が正しい', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <MockAuthProvider>{children}</MockAuthProvider>
      });

      const user = result.current.user;
      if (user) {
        expect(typeof user.uid).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(typeof user.name).toBe('string');
        expect(typeof user.username).toBe('string');
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
        wrapper: ({ children }) => <MockAuthProvider>{children}</MockAuthProvider>
      });

      const initialCount = renderCount;
      rerender();
      
      expect(renderCount).toBe(initialCount);
    });

    it('コンテキスト値が変更された場合は再レンダリングされる', () => {
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        useAuth();
        return null;
      };

      const { rerender } = renderHook(() => <TestComponent />, {
        wrapper: ({ children }) => <MockAuthProvider>{children}</MockAuthProvider>,
        initialProps: { value: mockAuthContext }
      });

      const initialCount = renderCount;
      
      rerender({
        value: { ...mockAuthContext, isLoading: true }
      });
      
      expect(renderCount).toBeGreaterThan(initialCount);
    });
  });
}); 