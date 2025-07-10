import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { FirebaseAuthProvider } from '../FirebaseAuthContext';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { auth } from '../../config/firebase';

// Mock Firebase auth
jest.mock('@/config/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    updateProfile: jest.fn(),
    currentUser: null,
  },
}));

const mockAuth = auth as jest.Mocked<typeof auth>;

describe('FirebaseAuthContext', () => {
  const mockUser = {
    uid: 'test-firebase-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    emailVerified: true,
    updateProfile: jest.fn(),
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.currentUser = null;
  });

  describe('Provider初期化', () => {
    it('初期状態では認証されていない', () => {
      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return jest.fn(); // unsubscribe function
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('認証ユーザーがいる場合は初期化する', () => {
      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser as any);
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('初期ローディング状態を管理する', () => {
      let authCallback: ((user: any) => void) | null = null;

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        authCallback = callback;
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
      mockAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any);

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });

    it('ログインエラーを適切に処理する', async () => {
      const mockError = new Error('auth/invalid-credentials');
      mockAuth.signInWithEmailAndPassword.mockRejectedValue(mockError);

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.login('test@example.com', 'wrongpassword');
        });
      }).rejects.toThrow('auth/invalid-credentials');

      expect(result.current.error).toContain('credentials');
    });

    it('空の認証情報でエラーになる', async () => {
      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

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
      mockAuth.createUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      } as any);

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User');
      });

      expect(mockAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });

    it('登録時にプロフィールを更新する', async () => {
      const mockUserWithUpdate = {
        ...mockUser,
        updateProfile: jest.fn().mockResolvedValue(undefined),
      };

      mockAuth.createUserWithEmailAndPassword.mockResolvedValue({
        user: mockUserWithUpdate,
      } as any);

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User');
      });

      expect(mockUserWithUpdate.updateProfile).toHaveBeenCalledWith({
        displayName: 'Test User',
      });
    });

    it('重複メールアドレスでエラーになる', async () => {
      const mockError = new Error('auth/email-already-in-use');
      mockAuth.createUserWithEmailAndPassword.mockRejectedValue(mockError);

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
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
      mockAuth.signOut.mockResolvedValue();

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser as any);
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it('ログアウトエラーを適切に処理する', async () => {
      const mockError = new Error('Network error');
      mockAuth.signOut.mockRejectedValue(mockError);

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser as any);
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
      mockAuth.sendPasswordResetEmail.mockResolvedValue();

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(mockAuth.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('無効なメールアドレスでエラーになる', async () => {
      const mockError = new Error('auth/invalid-email');
      mockAuth.sendPasswordResetEmail.mockRejectedValue(mockError);

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
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

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUserWithUpdate as any);
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

      expect(mockUserWithUpdate.updateProfile).toHaveBeenCalledWith(profileData);
    });

    it('未認証時はプロフィール更新でエラーになる', async () => {
      mockAuth.currentUser = null;

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
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

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        authCallback = callback;
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

      expect(result.current.user).toEqual(mockUser);
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
      mockAuth.onAuthStateChanged.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useFirebaseAuth(), { wrapper });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('エラーハンドリング', () => {
    it('Firebase エラーコードを適切にメッセージに変換する', async () => {
      const testCases = [
        { code: 'auth/invalid-email', expectedMessage: 'メールアドレス' },
        { code: 'auth/user-disabled', expectedMessage: '無効' },
        { code: 'auth/user-not-found', expectedMessage: '見つかりません' },
        { code: 'auth/wrong-password', expectedMessage: 'パスワード' },
        { code: 'auth/weak-password', expectedMessage: '弱すぎます' },
        { code: 'auth/email-already-in-use', expectedMessage: '使用されています' },
      ];

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      for (const testCase of testCases) {
        const mockError = new Error(testCase.code);
        mockAuth.signInWithEmailAndPassword.mockRejectedValue(mockError);

        try {
          await act(async () => {
            await result.current.login('test@example.com', 'password');
          });
        } catch (error) {
          // Expected to throw
        }

        expect(result.current.error).toContain(testCase.expectedMessage);
      }
    });

    it('未知のエラーは汎用メッセージを表示する', async () => {
      const mockError = new Error('unknown-error');
      mockAuth.signInWithEmailAndPassword.mockRejectedValue(mockError);

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
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

      expect(result.current.error).toContain('エラーが発生');
    });

    it('成功後にエラー状態をクリアする', async () => {
      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

      // 最初にエラーを発生させる
      const mockError = new Error('auth/invalid-email');
      mockAuth.signInWithEmailAndPassword.mockRejectedValueOnce(mockError);

      try {
        await act(async () => {
          await result.current.login('test@example.com', 'password');
        });
      } catch (error) {
        // Expected to throw
      }

      expect(result.current.error).toBeTruthy();

      // 次に成功させる
      mockAuth.signInWithEmailAndPassword.mockResolvedValue({
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

      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser as any);
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
      mockAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
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
