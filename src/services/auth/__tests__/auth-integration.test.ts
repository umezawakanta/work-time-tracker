/**
 * 認証システム統合テストスイート
 *
 * このファイルは認証システム全体のテストを統合し、
 * クロステストとE2Eシナリオを提供します。
 */

// Mock Firebase BEFORE importing anything
jest.mock('@/config/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    updateProfile: jest.fn(),
    onAuthStateChanged: jest.fn(),
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
}));

// Mock Firebase Auth functions
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  signInWithPopup: jest.fn(),
  onAuthStateChanged: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
}));

// Mock Firebase Firestore functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ _methodName: 'serverTimestamp' })),
  Timestamp: jest.fn().mockImplementation((seconds = 0, nanoseconds = 0) => ({
    seconds,
    nanoseconds,
    toDate: () => new Date(seconds * 1000),
  })),
}));

// Mock API
jest.mock('@/services/api/apiConfig', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

// Mock auth API
jest.mock('@/services/api/authApi', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  checkAuth: jest.fn(),
  refreshToken: jest.fn(),
}));

import AuthService from '../AuthService';
import { TokenManager } from '../TokenManager';
import { api } from '../../api/apiConfig';
import * as authApi from '../../api/authApi';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Type the mocked functions
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<
  typeof createUserWithEmailAndPassword
>;
const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<
  typeof signInWithEmailAndPassword
>;
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockSendPasswordResetEmail = sendPasswordResetEmail as jest.MockedFunction<
  typeof sendPasswordResetEmail
>;
const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>;

const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockServerTimestamp = serverTimestamp as jest.MockedFunction<typeof serverTimestamp>;

describe('Authentication System Integration', () => {
  let tokenManager: TokenManager;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up Firebase mocks
    mockOnAuthStateChanged.mockImplementation(() => jest.fn());
    mockServerTimestamp.mockReturnValue({ _methodName: 'serverTimestamp' } as any);
    mockDoc.mockReturnValue({ path: 'users/test-uid' } as any);

    // Mock successful Firebase auth responses
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      emailVerified: true,
      metadata: {
        creationTime: '2024-01-01T00:00:00Z',
        lastSignInTime: '2024-01-01T00:00:00Z',
      },
    };

    const mockUserCredential = { user: mockUser };

    mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential as any);
    mockSignInWithEmailAndPassword.mockResolvedValue(mockUserCredential as any);
    mockSignInWithPopup.mockResolvedValue(mockUserCredential as any);
    mockSignOut.mockResolvedValue(undefined);
    mockSendPasswordResetEmail.mockResolvedValue(undefined);
    mockUpdateProfile.mockResolvedValue(undefined);

    // Mock Firestore responses
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        email: 'test@example.com',
        displayName: 'Test User',
        isPremium: false,
        subscriptionStatus: 'free',
        createdAt: { seconds: 1704067200, nanoseconds: 0 },
        lastLoginAt: { seconds: 1704067200, nanoseconds: 0 },
        preferences: {
          theme: 'system',
          language: 'ja',
          timezone: 'Asia/Tokyo',
          notifications: {
            email: true,
            push: true,
            daily: true,
            weekly: true,
          },
        },
      }),
    } as any);

    mockSetDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);

    // Set up API mocks
    (api.post as jest.Mock).mockResolvedValue({ data: {} });
    (api.get as jest.Mock).mockResolvedValue({ data: {} });
    (api.put as jest.Mock).mockResolvedValue({ data: {} });
    (api.delete as jest.Mock).mockResolvedValue({ data: {} });

    // Set up auth API mocks
    (authApi.login as jest.Mock).mockResolvedValue({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      user: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
      },
    });

    // 本番環境をシミュレート
    process.env.NODE_ENV = 'production';
    Object.defineProperty(window, 'location', {
      value: { hostname: 'myapp.vercel.app' },
      writable: true,
    });

    tokenManager = TokenManager.getInstance();
  });

  describe('Complete Authentication Flow', () => {
    it.skip('should complete full sign up -> login -> token refresh -> logout cycle', async () => {
      // 1. ユーザー登録
      const signUpResult = await AuthService.signUp(
        'newuser@example.com',
        'password123',
        'New User'
      );

      expect(signUpResult.error).toBeNull();
      expect(signUpResult.user).toBeDefined();
      expect(signUpResult.user?.email).toBe('test@example.com'); // Using mock user email

      // 2. ログイン
      const loginResult = await AuthService.signIn('newuser@example.com', 'password123');

      expect(loginResult.error).toBeNull();
      expect(loginResult.user).toBeDefined();

      // 3. TokenManagerでトークンを設定
      await tokenManager.setTokens('access-token', 'refresh-token', 3600, 604800);

      expect(tokenManager.isAuthenticated()).toBe(true);

      // 4. トークンリフレッシュ
      (api.post as jest.Mock).mockResolvedValue({
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
          refreshExpiresIn: 604800,
        },
      });

      const newToken = await tokenManager.getAccessToken();
      expect(newToken).toBe('new-access-token');

      // 5. ログアウト
      await AuthService.signOut();
      await tokenManager.clearTokens();

      expect(tokenManager.isAuthenticated()).toBe(false);
    });

    it.skip('should handle authentication with Google OAuth', async () => {
      // Google認証フロー
      const googleResult = await AuthService.signInWithGoogle();

      expect(googleResult.error).toBeNull();
      expect(googleResult.user).toBeDefined();

      // トークン設定
      await tokenManager.setTokens('google-access-token', 'google-refresh-token');

      expect(tokenManager.isAuthenticated()).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it.skip('should handle token expiration gracefully across components', async () => {
      // 期限切れトークンを設定
      await tokenManager.setTokens('expired-token', 'expired-refresh', -1, -1);

      expect(tokenManager.isAuthenticated()).toBe(false);

      // 認証エラーに対する適切な処理
      const accessToken = await tokenManager.getAccessToken();
      expect(accessToken).toBeNull();
    });

    it.skip('should handle network failures across auth components', async () => {
      // ネットワークエラーをシミュレート
      (api.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      // AuthServiceでのネットワークエラー処理
      mockSignInWithEmailAndPassword.mockRejectedValue(new Error('Network error'));
      const loginResult = await AuthService.signIn('test@example.com', 'password123');
      expect(loginResult.error).toBeDefined();
      expect(loginResult.error?.code).toBe('UNKNOWN_ERROR');

      // TokenManagerでのネットワークエラー処理
      await expect(tokenManager.setTokens('token', 'refresh')).resolves.toBeUndefined(); // エラーを投げずに継続
    });
  });

  describe('Security Integration', () => {
    it.skip('should maintain security across all auth components', async () => {
      // セキュアなパスワードリセットフロー
      const resetResult = await AuthService.resetPassword('user@example.com');
      expect(resetResult).toBeNull(); // 成功

      // トークンの安全な管理
      await tokenManager.setTokens('secure-token', 'secure-refresh');

      const sessionInfo = tokenManager.getSessionInfo();
      expect(sessionInfo.isAuthenticated).toBe(true);
      expect(sessionInfo.expiresAt).toBeInstanceOf(Date);
    });

    it.skip('should handle multiple concurrent authentication requests', async () => {
      await tokenManager.setTokens('concurrent-token', 'concurrent-refresh', -1, -1); // 期限切れ

      // 複数の同時リフレッシュリクエスト
      (api.post as jest.Mock).mockResolvedValue({
        data: {
          accessToken: 'refreshed-token',
          refreshToken: 'refreshed-refresh',
          expiresIn: 3600,
          refreshExpiresIn: 604800,
        },
      });

      const promises = [
        tokenManager.getAccessToken(),
        tokenManager.getAccessToken(),
        tokenManager.getAccessToken(),
      ];

      const results = await Promise.all(promises);

      // すべて同じ新しいトークンを返す
      results.forEach((result) => {
        expect(result).toBe('refreshed-token');
      });
    });
  });

  describe('Performance Integration', () => {
    it.skip('should handle authentication operations within acceptable time limits', async () => {
      const startTime = Date.now();

      // 認証操作のパフォーマンステスト
      const loginResult = await AuthService.signIn('perf@example.com', 'password123');

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 1秒以内に完了することを確認
      expect(duration).toBeLessThan(1000);
      expect(loginResult).toBeDefined();
    });

    it.skip('should efficiently manage token storage operations', async () => {
      const startTime = Date.now();

      await tokenManager.setTokens('perf-token', 'perf-refresh');

      const midTime = Date.now();
      const token = await tokenManager.getAccessToken();

      const endTime = Date.now();

      expect(midTime - startTime).toBeLessThan(100); // セット操作は100ms以内
      expect(endTime - midTime).toBeLessThan(50); // ゲット操作は50ms以内
      expect(token).toBe('perf-token');
    });
  });

  describe('State Management Integration', () => {
    it.skip('should maintain consistent state across auth components', async () => {
      // 初期状態
      expect(tokenManager.isAuthenticated()).toBe(false);
      expect(AuthService.getCurrentUser()).toBeNull();

      // 認証後の状態
      const loginResult = await AuthService.signIn('state@example.com', 'password123');
      expect(loginResult.user).toBeDefined();

      await tokenManager.setTokens('state-token', 'state-refresh');

      expect(tokenManager.isAuthenticated()).toBe(true);

      // ログアウト後の状態
      await AuthService.signOut();
      await tokenManager.clearTokens();

      expect(tokenManager.isAuthenticated()).toBe(false);
    });
  });

  describe('Edge Cases Integration', () => {
    it.skip('should handle rapid login/logout cycles', async () => {
      for (let i = 0; i < 5; i++) {
        // ログイン
        const loginResult = await AuthService.signIn(`user${i}@example.com`, 'password123');
        expect(loginResult.user).toBeDefined();

        await tokenManager.setTokens(`token-${i}`, `refresh-${i}`);
        expect(tokenManager.isAuthenticated()).toBe(true);

        // ログアウト
        await AuthService.signOut();
        await tokenManager.clearTokens();
        expect(tokenManager.isAuthenticated()).toBe(false);
      }
    });

    it.skip('should handle malformed server responses', async () => {
      // 不正なレスポンス形式
      (api.post as jest.Mock).mockResolvedValue({
        data: { invalid: 'structure' },
      });

      await expect(
        tokenManager.setTokens('malformed-token', 'malformed-refresh')
      ).resolves.toBeUndefined();

      // システムは継続して動作する
      expect(tokenManager.isAuthenticated()).toBe(true);
    });
  });

  describe('API Integration', () => {
    it.skip('should integrate properly with authApi module', async () => {
      const result = await authApi.login({
        email: 'api@example.com',
        password: 'password123',
        rememberMe: false,
      });

      expect(result.accessToken).toBe('test-token');
      expect(result.user.name).toBe('Test User');

      // TokenManagerとの統合
      await tokenManager.setTokens(result.accessToken, result.refreshToken);

      expect(tokenManager.isAuthenticated()).toBe(true);
    });
  });

  describe('Development vs Production Behavior', () => {
    it.skip('should behave differently in development environment', () => {
      // 開発環境設定
      process.env.NODE_ENV = 'development';
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });

      const devTokenManager = TokenManager.getInstance();

      // 開発環境では異なる動作をする
      expect(devTokenManager.isAuthenticated()).toBe(false);
    });

    it.skip('should enable full functionality in production environment', () => {
      // 本番環境設定
      process.env.NODE_ENV = 'production';
      Object.defineProperty(window, 'location', {
        value: { hostname: 'myapp.vercel.app' },
        writable: true,
      });

      const prodTokenManager = TokenManager.getInstance();

      // 本番環境では完全な機能が有効
      expect(prodTokenManager).toBeDefined();
    });
  });
});
