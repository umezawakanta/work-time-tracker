import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { FirebaseAuthProvider } from '../FirebaseAuthContext';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Firebase config
const mockAuth = {
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  currentUser: null,
  _getRecaptchaConfig: jest.fn(),
};

jest.mock('@/config/firebase', () => ({
  auth: mockAuth,
  isFirebaseEnabled: true,
}));

// Mock firebase/auth functions
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockSendPasswordResetEmail = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockUpdateProfile = jest.fn();

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  onAuthStateChanged: mockOnAuthStateChanged,
  updateProfile: mockUpdateProfile,
}));

describe('FirebaseAuthContext', () => {
  const mockUser = {
    uid: 'test-firebase-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    emailVerified: true,
    updateProfile: jest.fn(),
    getIdToken: jest.fn().mockResolvedValue('mock-token'),
    getIdTokenResult: jest.fn().mockResolvedValue({ token: 'mock-token' }),
    reload: jest.fn(),
    toJSON: jest.fn(),
    delete: jest.fn(),
    isAnonymous: false,
    metadata: {
      creationTime: '2023-01-01T00:00:00.000Z',
      lastSignInTime: '2023-01-01T00:00:00.000Z',
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.currentUser = null;

    // Clear all Firebase function mocks
    mockSignInWithEmailAndPassword.mockClear();
    mockCreateUserWithEmailAndPassword.mockClear();
    mockSignOut.mockClear();
    mockSendPasswordResetEmail.mockClear();
    mockOnAuthStateChanged.mockClear();
    mockUpdateProfile.mockClear();

    // Reset user mock methods
    mockUser.updateProfile.mockClear();
    mockUser.getIdToken.mockClear();
    mockUser.getIdTokenResult.mockClear();
  });

  describe('Provider初期化', () => {
    it('初期状態では認証されていない', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn(); // unsubscribe function
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('認証ユーザーがいる場合は初期化する', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(mockUser as any);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      expect(result.current.user).toEqual(
        expect.objectContaining({
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL,
          emailVerified: mockUser.emailVerified,
        })
      );
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('初期ローディング状態を管理する', () => {
      let authCallback: ((user: any) => void) | null = null;

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          authCallback = callback;
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      // 初期状態はローディング
      expect(result.current.isLoading).toBe(true);

      // 認証状態の確定後はローディング終了
      act(() => {
        authCallback?.(null);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('ログイン機能', () => {
    it('正常にログインできる', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      );
    });

    it('ログインエラーを適切に処理する', async () => {
      const mockError = new Error('auth/invalid-credentials');
      mockSignInWithEmailAndPassword.mockRejectedValue(mockError);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.login('test@example.com', 'wrongpassword');
        });
      }).rejects.toThrow('auth/invalid-credentials');

      expect(result.current.error).toBe('auth/invalid-credentials');
    });

    it('空の認証情報でエラーになる', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const mockError = new Error('auth/missing-email');
      mockSignInWithEmailAndPassword.mockRejectedValue(mockError);

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.login('', '');
        });
      }).rejects.toThrow();
    });
  });

  describe('ユーザー登録機能', () => {
    it('正常にユーザー登録できる', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User');
      });

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      );
    });

    it('登録時にプロフィールを更新する', async () => {
      const mockUserWithUpdate = {
        ...mockUser,
        updateProfile: jest.fn().mockResolvedValue(undefined),
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUserWithUpdate,
      } as any);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User');
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUserWithUpdate, {
        displayName: 'Test User',
      });
    });

    it('重複メールアドレスでエラーになる', async () => {
      const mockError = new Error('auth/email-already-in-use');
      mockCreateUserWithEmailAndPassword.mockRejectedValue(mockError);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.register('test@example.com', 'password123', 'Test User');
        });
      }).rejects.toThrow('auth/email-already-in-use');
    });
  });

  describe('ログアウト機能', () => {
    it('正常にログアウトできる', async () => {
      mockSignOut.mockResolvedValue(undefined);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(mockUser as any);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
    });

    it('ログアウトエラーを適切に処理する', async () => {
      const mockError = new Error('Network error');
      mockSignOut.mockRejectedValue(mockError);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(mockUser as any);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.logout();
        });
      }).rejects.toThrow('Network error');
    });
  });

  describe('パスワードリセット機能', () => {
    it('パスワードリセットメールを送信できる', async () => {
      mockSendPasswordResetEmail.mockResolvedValue(undefined);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, 'test@example.com');
    });

    it('無効なメールアドレスでエラーになる', async () => {
      const mockError = new Error('auth/invalid-email');
      mockSendPasswordResetEmail.mockRejectedValue(mockError);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.resetPassword('invalid-email');
        });
      }).rejects.toThrow('auth/invalid-email');
    });
  });

  describe('プロフィール更新機能', () => {
    it('ユーザープロフィールを更新できる', async () => {
      const mockUserWithUpdate = {
        ...mockUser,
        updateProfile: jest.fn().mockResolvedValue(undefined),
      };

      mockAuth.currentUser = mockUserWithUpdate as any;
      mockUpdateProfile.mockResolvedValue(undefined);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(mockUserWithUpdate as any);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      const profileData = {
        displayName: 'Updated Name',
        photoURL: 'https://example.com/new-photo.jpg',
      };

      await act(async () => {
        await result.current.updateProfile(profileData);
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUserWithUpdate, profileData);
    });

    it('未認証時はプロフィール更新でエラーになる', async () => {
      mockAuth.currentUser = null;

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.updateProfile({ displayName: 'Test' });
        });
      }).rejects.toThrow('User not authenticated');
    });
  });

  describe('認証状態変化の監視', () => {
    it('ユーザーの認証状態変化を適切に追跡する', () => {
      let authCallback: ((user: any) => void) | null = null;

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          authCallback = callback;
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      // 初期状態（未認証）
      act(() => {
        authCallback?.(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      // ログイン状態に変化
      act(() => {
        authCallback?.(mockUser);
      });

      expect(result.current.user).toEqual(
        expect.objectContaining({
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL,
          emailVerified: mockUser.emailVerified,
        })
      );
      expect(result.current.isAuthenticated).toBe(true);

      // ログアウト状態に変化
      act(() => {
        authCallback?.(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('クリーンアップ時に認証監視を解除する', () => {
      const mockUnsubscribe = jest.fn();
      mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useFirebaseAuth(), { wrapper });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('エラーハンドリング', () => {
    it('Firebase エラーコードを適切にメッセージに変換する', async () => {
      const testCases = [
        { code: 'auth/invalid-email', expectedMessage: 'auth/invalid-email' },
        { code: 'auth/user-disabled', expectedMessage: 'auth/user-disabled' },
        { code: 'auth/user-not-found', expectedMessage: 'auth/user-not-found' },
        { code: 'auth/wrong-password', expectedMessage: 'auth/wrong-password' },
        { code: 'auth/weak-password', expectedMessage: 'auth/weak-password' },
        { code: 'auth/email-already-in-use', expectedMessage: 'auth/email-already-in-use' },
      ];

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      for (const testCase of testCases) {
        const mockError = new Error(testCase.code);
        mockSignInWithEmailAndPassword.mockRejectedValue(mockError);

        try {
          await act(async () => {
            await result.current.login('test@example.com', 'password');
          });
        } catch (error) {
          // Expected to throw
        }

        expect(result.current.error).toBe(testCase.expectedMessage);
      }
    });

    it('未知のエラーは汎用メッセージを表示する', async () => {
      const mockError = new Error('unknown-error');
      mockSignInWithEmailAndPassword.mockRejectedValue(mockError);

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      try {
        await act(async () => {
          await result.current.login('test@example.com', 'password');
        });
      } catch (error) {
        // Expected to throw
      }

      expect(result.current.error).toBe('unknown-error');
    });

    it('成功後にエラー状態をクリアする', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      // 最初にエラーを発生させる
      const mockError = new Error('auth/invalid-email');
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(mockError);

      try {
        await act(async () => {
          await result.current.login('test@example.com', 'password');
        });
      } catch (error) {
        // Expected to throw
      }

      expect(result.current.error).toBe('auth/invalid-email');

      // 次に成功させる
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any);

      await act(async () => {
        await result.current.login('test@example.com', 'correctpassword');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Context外使用エラー', () => {
    it('Provider外でhookを使用するとエラーになる', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useFirebaseAuth());
      }).toThrow('useFirebaseAuth must be used within a FirebaseAuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('パフォーマンス最適化', () => {
    it('同じ認証状態では再レンダリングされない', () => {
      let renderCount = 0;

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(mockUser as any);
        }
        return jest.fn();
      });

      const TestComponent = () => {
        renderCount++;
        useFirebaseAuth();
        return null;
      };

      const { rerender } = renderHook(() => <TestComponent />, { wrapper });

      const initialCount = renderCount;
      rerender();

      expect(renderCount).toBe(initialCount);
    });

    it('関数インスタンスが安定している', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return jest.fn();
      });

      const { result, rerender } = renderHook(() => useFirebaseAuth(), { wrapper });

      const initialLogin = result.current.login;
      const initialLogout = result.current.logout;
      const initialRegister = result.current.register;

      rerender();

      expect(result.current.login).toBe(initialLogin);
      expect(result.current.logout).toBe(initialLogout);
      expect(result.current.register).toBe(initialRegister);
    });
  });
});
